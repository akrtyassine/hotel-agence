pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        disableResume()
    }

    environment {
        IMAGE_BACKEND         = "hotel-agence-backend:${BUILD_NUMBER}"
        IMAGE_FRONTEND        = "hotel-agence-frontend:${BUILD_NUMBER}"
        IMAGE_BACKEND_LATEST  = "hotel-agence-backend:latest"
        IMAGE_FRONTEND_LATEST = "hotel-agence-frontend:latest"
        COMPOSE_PROJECT_NAME  = "hoteldevops"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Clonage du dépôt'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('hotelagencebackend-master') {
                    bat 'call gradlew.bat clean bootJar --no-daemon'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('Modern-Booking-master') {
                    bat '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Tests') {
            steps {
                dir('hotelagencebackend-master') {
                    bat 'call gradlew.bat test --no-daemon'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    docker build -t %IMAGE_BACKEND% -t %IMAGE_BACKEND_LATEST% hotelagencebackend-master
                    docker build -t %IMAGE_FRONTEND% -t %IMAGE_FRONTEND_LATEST% Modern-Booking-master
                '''
            }
        }

        stage('Start Services') {
            steps {
                bat '''
                    docker compose down --remove-orphans
                    docker compose up -d
                '''
            }
        }

        stage('Wait For DB') {
            steps {
                powershell '''
                    Write-Host "⏳ Attente que MySQL soit healthy..."
                    $max = 30
                    for ($i = 1; $i -le $max; $i++) {
                        $status = docker inspect --format="{{.State.Health.Status}}" hoteldevops-db-1 2>$null
                        Write-Host "  [$i/$max] DB status: $status"
                        if ($status -eq "healthy") {
                            Write-Host "✅ MySQL prêt !"
                            exit 0
                        }
                        if ($i -eq $max) {
                            Write-Host "❌ MySQL n'a pas démarré dans les temps — logs :"
                            docker logs hoteldevops-db-1 2>&1
                            exit 1
                        }
                        Start-Sleep -Seconds 5
                    }
                '''
            }
        }

        stage('Wait For Backend') {
            steps {
                powershell '''
                    Write-Host "⏳ Attente que le Backend réponde..."
                    $max = 60
                    for ($i = 1; $i -le $max; $i++) {
                        try {
                            $r = Invoke-WebRequest -Uri "http://localhost:8082" `
                                -UseBasicParsing -TimeoutSec 5
                            if ($r.StatusCode -lt 500) {
                                Write-Host "✅ Backend prêt ! (HTTP $($r.StatusCode))"
                                exit 0
                            }
                        } catch {
                            # 401/403 = backend up mais sécurisé = OK
                            $code = $_.Exception.Response.StatusCode.value__
                            if ($code -ge 400 -and $code -lt 500) {
                                Write-Host "✅ Backend prêt ! (HTTP $code)"
                                exit 0
                            }
                            Write-Host "  [$i/$max] Backend pas encore prêt... ($($_.Exception.Message))"
                        }
                        if ($i -eq $max) {
                            Write-Host "❌ Backend n'a pas démarré dans les temps — logs :"
                            docker logs hoteldevops-backend-1 2>&1
                            exit 1
                        }
                        Start-Sleep -Seconds 5
                    }
                '''
            }
        }

        stage('Health Check') {
            steps {
                powershell '''
                    Write-Host "=== Containers ==="
                    docker ps

                    Write-Host "=== Backend Check ==="
                    try {
                        $r = Invoke-WebRequest -Uri "http://localhost:8082" `
                            -UseBasicParsing -TimeoutSec 15
                        Write-Host "✅ Backend OK (HTTP $($r.StatusCode))"
                    } catch {
                        $code = $_.Exception.Response.StatusCode.value__
                        if ($code -ge 400 -and $code -lt 500) {
                            Write-Host "✅ Backend OK (HTTP $code - sécurisé)"
                        } else {
                            Write-Host "❌ Backend indisponible"
                            docker logs hoteldevops-backend-1 2>&1
                            exit 1
                        }
                    }

                    Write-Host "=== Frontend Check ==="
                    try {
                        $r = Invoke-WebRequest -Uri "http://localhost:4000" `
                            -UseBasicParsing -TimeoutSec 15
                        Write-Host "✅ Frontend OK (HTTP $($r.StatusCode))"
                    } catch {
                        Write-Host "❌ Frontend indisponible"
                        docker logs hoteldevops-frontend-1 2>&1
                        exit 1
                    }
                '''
            }
        }

        stage('Reports') {
            steps {
                bat '''
                    echo ===== Versions =====
                    java -version
                    docker --version
                    git --version
                    node --version
                    npm --version

                    echo ===== Images Docker =====
                    docker images | findstr hotel-agence

                    echo ===== Containers actifs =====
                    docker ps
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline exécuté avec succès !'
        }

        failure {
            echo '❌ Pipeline échoué — collecte des logs'
            powershell '''
                Write-Host "=== Containers ==="
                docker ps -a
                Write-Host "=== DB Logs ==="
                docker logs hoteldevops-db-1 2>&1
                Write-Host "=== Backend Logs ==="
                docker logs hoteldevops-backend-1 2>&1
                Write-Host "=== Frontend Logs ==="
                docker logs hoteldevops-frontend-1 2>&1
                exit 0
            '''
        }

        always {
            echo '🧹 Nettoyage Docker'
            bat 'docker compose down --remove-orphans'
        }

        cleanup {
            deleteDir()
        }
    }
}