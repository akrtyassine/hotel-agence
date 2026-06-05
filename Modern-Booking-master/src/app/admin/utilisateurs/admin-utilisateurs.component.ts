import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ClientService } from '../../core/services/client.service';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Client } from '../../core/models/client.model';
import { Admin } from '../../core/models/admin.model';
import { createPagination } from '../shared/pagination.util';

type ActiveTab = 'clients' | 'agents';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-utilisateurs.component.html'
})
export class AdminUtilisateursComponent implements OnInit {
  private clientService = inject(ClientService);
  private adminService = inject(AdminService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  activeTab = signal<ActiveTab>('clients');
  loading = signal(true);

  // Clients
  clients = signal<Client[]>([]);
  clientSearch = signal('');
  showClientModal = signal(false);
  editingClient = signal<Client | null>(null);
  deleteClientId = signal<number | null>(null);

  filteredClients = computed(() => {
    const q = this.clientSearch().toLowerCase();
    return this.clients().filter(c =>
      !q || c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q)
    );
  });

  clientPagination = createPagination(this.filteredClients);

  clientForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-]{8,}$/)]],
    password: [''],
  });

  // Agents (admins with role=AGENT)
  agents = signal<Admin[]>([]);
  agentSearch = signal('');
  showAgentModal = signal(false);
  editingAgent = signal<Admin | null>(null);
  deleteAgentId = signal<number | null>(null);
  showPassword = signal(false);

  filteredAgents = computed(() => {
    const q = this.agentSearch().toLowerCase();
    return this.agents().filter(a =>
      !q || a.username.toLowerCase().includes(q)
    );
  });

  agentPagination = createPagination(this.filteredAgents);

  updateClientSearch(query: string): void { this.clientSearch.set(query); this.clientPagination.reset(); }
  updateAgentSearch(query: string): void { this.agentSearch.set(query); this.agentPagination.reset(); }

  agentForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    forkJoin({
      clients: this.clientService.getAll(),
      agents: this.adminService.getAgents(),
    }).subscribe({
      next: ({ clients, agents }) => {
        this.clients.set(clients);
        this.agents.set(agents);
        this.loading.set(false);
      },
      error: () => { this.toast.error('Erreur lors du chargement.'); this.loading.set(false); }
    });
  }

  // ── Client CRUD ──
  openAddClient(): void {
    this.editingClient.set(null);
    this.clientForm.reset();
    this.clientForm.get('password')!.setValidators([Validators.required, Validators.minLength(6)]);
    this.clientForm.get('password')!.updateValueAndValidity();
    this.showClientModal.set(true);
  }
  openEditClient(c: Client): void {
    this.editingClient.set(c);
    this.clientForm.patchValue({ ...c, password: '' });
    this.clientForm.get('password')!.clearValidators();
    this.clientForm.get('password')!.updateValueAndValidity();
    this.showClientModal.set(true);
  }
  closeClientModal(): void { this.showClientModal.set(false); this.editingClient.set(null); }

  saveClient(): void {
    if (this.clientForm.invalid) { this.clientForm.markAllAsTouched(); return; }
    const raw = this.clientForm.value;
    const editing = this.editingClient();
    if (editing) {
      const data: Client = { fullName: raw.fullName!, email: raw.email!, phone: raw.phone! };
      if (raw.password) data.password = raw.password;
      this.clientService.update(editing.id!, data).subscribe({
        next: u => { this.clients.update(l => l.map(c => c.id === u.id ? u : c)); this.toast.success('Client modifié !'); this.closeClientModal(); },
        error: () => this.toast.error('Erreur modification.')
      });
    } else {
      this.clientService.create(raw as Client).subscribe({
        next: created => { this.clients.update(l => [...l, created]); this.toast.success('Client créé !'); this.closeClientModal(); },
        error: () => this.toast.error('Erreur création.')
      });
    }
  }

  removeClient(id: number): void {
    this.clientService.delete(id).subscribe({
      next: () => { this.clients.update(l => l.filter(c => c.id !== id)); this.toast.success('Client supprimé.'); this.deleteClientId.set(null); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }

  // ── Agent CRUD ──
  openAddAgent(): void {
    this.editingAgent.set(null);
    this.agentForm.reset();
    this.agentForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.agentForm.get('password')?.updateValueAndValidity();
    this.showPassword.set(false);
    this.showAgentModal.set(true);
  }

  openEditAgent(a: Admin): void {
    this.editingAgent.set(a);
    this.agentForm.patchValue({ username: a.username, password: '' });
    this.agentForm.get('password')?.clearValidators();
    this.agentForm.get('password')?.updateValueAndValidity();
    this.showPassword.set(false);
    this.showAgentModal.set(true);
  }

  closeAgentModal(): void { this.showAgentModal.set(false); this.editingAgent.set(null); }

  saveAgent(): void {
    if (this.agentForm.invalid) { this.agentForm.markAllAsTouched(); return; }
    const v = this.agentForm.value;
    const editing = this.editingAgent();
    const data: Partial<Admin> = { username: v.username!, role: 'AGENT' };
    if (v.password) data.password = v.password;

    if (editing) {
      this.adminService.update(editing.id!, data).subscribe({
        next: u => { this.agents.update(l => l.map(a => a.id === u.id ? u : a)); this.toast.success('Agent modifié !'); this.closeAgentModal(); },
        error: () => this.toast.error('Erreur modification.')
      });
    } else {
      this.adminService.create(data).subscribe({
        next: created => { this.agents.update(l => [...l, created]); this.toast.success('Agent créé !'); this.closeAgentModal(); },
        error: () => this.toast.error('Erreur création.')
      });
    }
  }

  removeAgent(id: number): void {
    this.adminService.delete(id).subscribe({
      next: () => { this.agents.update(l => l.filter(a => a.id !== id)); this.toast.success('Agent supprimé.'); this.deleteAgentId.set(null); },
      error: () => this.toast.error('Erreur suppression.')
    });
  }
}
