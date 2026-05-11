# Front-End Technical Architecture - SIMPEG

## 1. Overview

SIMPEG (Sistem Informasi Kepegawaian) is a modern HRIS (Human Resource Information System) dashboard designed for monitoring employee promotions (Kenaikan Pangkat), Periodic Salary Increases (KGB), document approvals, and automated reminders.

## 2. Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React framework with SSR support)
- **Library**: React 19
- **Routing**: [TanStack Router](https://tanstack.com/router) (Type-safe, file-based routing)
- **State Management**:
  - **Server State**: [TanStack Query](https://tanstack.com/query) (React Query)
  - **Global/UI State**: React Context API (Auth, Mobile Sidebar)
- **Styling**: Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **Forms**: React Hook Form + Zod (Validation)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Targeted for Cloudflare (Wrangler/Wrangler.jsonc)

## 3. Architecture Patterns

### Routing & Layout

- **File-based Routing**: Located in `src/routes/`.
- **Root Route**: `src/routes/__root.tsx` handles the base HTML shell, global providers (QueryClient, Auth), and global UI elements (Toaster).
- **Nested Layouts**: Uses TanStack Router's nested routing. The `app-shell.tsx` component provides the common sidebar/topbar layout for protected routes.

### State Management

- **Server State**: Managed via `@tanstack/react-query`. Currently uses mock data from `src/lib/simpeg-data.ts`.
- **Authentication**: `AuthProvider` in `src/lib/auth-context.tsx` manages user session using `localStorage`. It supports three roles: `admin`, `pegawai`, and `pimpinan`.

### Data Layer

- **Mock Data**: Centralized in `src/lib/simpeg-data.ts`.
- **Types**: Strongly typed interfaces for `User`, `Pegawai`, `Approval`, and `RiwayatItem`.

## 4. Directory Structure

```text
src/
├── components/          # Reusable UI components
│   ├── ui/              # Shadcn/ui (Radix primitives)
│   ├── app-shell.tsx    # Main layout wrapper
│   ├── app-sidebar.tsx  # Navigation sidebar
│   └── topbar.tsx       # Top navigation bar
├── hooks/               # Custom React hooks (e.g., use-mobile)
├── lib/                 # Core logic and utilities
│   ├── auth-context.tsx # Auth provider and hook
│   ├── simpeg-data.ts   # Mock data and business logic
│   └── utils.ts         # Utility functions (cn, etc.)
├── routes/              # TanStack Router pages/routes
│   ├── __root.tsx       # Root configuration
│   ├── dashboard.tsx    # Main dashboard
│   ├── pegawai.tsx      # Employee management
│   └── ...
├── styles.css           # Global Tailwind styles
├── router.tsx           # Router instance creation
├── server.ts            # TanStack Start server entry
└── start.ts             # TanStack Start client entry
```

## 5. Core Features

1. **Role-Based Access Control (RBAC)**: Different views/actions for Admin, Pegawai, and Pimpinan.
2. **Dashboard Analytics**: Overview of employee stats (KGB, Pangkat, Total Employees).
3. **Employee Lifecycle Tracking**: Monitoring TMT Pangkat and TMT KGB.
4. **Approval System**: Workflow for document approvals.
5. **Reminders**: Automated tracking for upcoming events.

## 6. Proposed Revisions (Pending)

_This section is reserved for updates based on review._
