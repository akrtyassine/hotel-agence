# Hotel Agency Frontend

## Project Description

Hotel Agency Frontend is a comprehensive web application built with Angular 21 for managing hotel agencies, reservations, and related services. The application provides two main interfaces:

- **Admin Dashboard**: Full management system for hotels, agencies, reservations, clients, reviews, promotions, and user administration
- **Client Portal**: User-friendly interface for clients to browse hotels, make reservations, and manage their bookings

This is a modern, fully-functional single-page application (SPA) with server-side rendering (SSR) support.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (version 10 or higher) - Comes with Node.js
- **Git** - [Download Git](https://git-scm.com/)

You can verify your installations by running:

```bash
node --version
npm --version
git --version
```

## Getting Started

### 1. Download the Project

Clone the repository to your local machine:

```bash
git clone <repository-url>
cd hotelagencefrontend
```

Or if you have a zip file, extract it and navigate to the project directory.

### 2. Install Dependencies

Install all required packages and dependencies using npm:

```bash
npm install
```

This command reads the `package.json` file and downloads all necessary packages into the `node_modules` folder. This may take a few minutes depending on your internet connection.

### 3. Run the Development Server

Start the local development server:

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

Once the server is running, open your browser and navigate to:

```
http://localhost:4200/
```

The application will automatically reload whenever you modify any source files.

## Available Commands

### Development

```bash
npm start          # Start the development server on http://localhost:4200
ng serve           # Alternative way to start the development server
```

### Building for Production

```bash
npm run build      # Build the project for production
```

The compiled output will be stored in the `dist/` directory. The production build is optimized for performance and speed.

### Running Tests

```bash
npm test           # Run unit tests with Vitest
ng test            # Alternative way to run tests
```

### Other Useful Commands

```bash
ng generate component component-name  # Generate a new component
ng generate service service-name      # Generate a new service
ng generate --help                    # View all available schematics
npm run watch                         # Watch mode for development builds
```

## Project Structure

```
src/
├── app/
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components (login/register)
│   ├── core/           # Core services, models, and guards
│   ├── pages/          # Main page components
│   └── shared/         # Shared components (header, footer, etc.)
├── main.ts            # Application entry point
└── styles.css         # Global styles
```

## Key Technologies

- **Angular 21**: Modern web application framework
- **TypeScript**: Strong-typed JavaScript
- **RxJS**: Reactive programming library
- **Express.js**: Server-side rendering support
- **Vitest**: Unit testing framework
- **Angular SSR**: Server-side rendering for improved performance

## Troubleshooting

### Port 4200 is already in use

If port 4200 is already in use, you can specify a different port:

```bash
ng serve --port 4300
```

### Dependencies installation fails

Clear the npm cache and try again:

```bash
npm cache clean --force
npm install
```

### Module not found errors

Make sure all dependencies are installed:

```bash
npm install
```

Then restart the development server.

## Additional Resources

- [Angular Documentation](https://angular.dev/)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
