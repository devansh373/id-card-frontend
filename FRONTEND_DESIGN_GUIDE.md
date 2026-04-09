# Frontend Design Guide: School ID Card Printing System

This document provides a comprehensive blueprint for building the frontend of the School ID Card Printing System.

## 1. Technical Stack & Architecture

### **Core Stack**
- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Lucide Icons)
- **State Management**:
  - **Server State**: [TanStack Query (React Query) v5](https://tanstack.com/query/latest)
  - **Client State**: [Zustand](https://docs.pmnd.rs/zustand) (for Auth and UI state)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Data Tables**: [TanStack Table v8](https://tanstack.com/table/latest)

### **Key Utilities**
- **Networking**: [Axios](https://axios-http.com/) (configured with `withCredentials: true` for HTTP-only cookies).
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (for smooth transitions and loading states).

---

## 2. Design System & Aesthetics

### **The "Premium ERP" Look**
- **Color Palette**:
  - **Primary**: Indigo/Deep Blue (`#1E293B` to `#334155`)
  - **Accent**: Emerald/Teal (`#10B981`)
  - **Warning**: Amber (`#F59E0B`)
  - **Danger**: Rose (`#F43F5E`)
- **Typography**: Inter or Outfit
- **UI Details**: Subtle borders, soft shadows, rounded corners, Glassmorphism.

---

## 3. Role-Based Information Architecture

### **A. SUPER_ADMIN**
- Dashboard: High-level stats.
- School Management: CRUD Schools, ImageKit config.
- User Management: All users.
- Vendor Onboarding.

### **B. SCHOOL_ADMIN**
- Dashboard: School stats.
- School Profile: Logos, templates, signatures.
- Academic Setup: Classes and Sections.

### **C. TEACHER**
- Dashboard: Class view.
- Student Management: CRUD, Bulk import, Photo upload.

### **D. VENDOR**
- Dashboard: Print orders.
- Print Queue: Download PDFs, Status management.

---

## 4. Core User Flows
1. **Authentication**: JWT in HTTP-only cookies, password change force.
2. **Bulk Generation**: Student checklist -> backend render -> ImageKit upload.
3. **PDF Printing**: A4/A3, Mirror Alignment for back sides.

---

## 5. Folder Structure
/app
  /(auth)
  /(dashboard)
/components
  /ui
  /shared
/features
  /auth
  /schools
  /students
  /id-cards
/lib
  /api
/store
/hooks
/types

---

## 6. Execution Rules
- Co-locate feature logic in `/features`.
- Global error handling via Axios interceptors.
- Suspense boundaries & Skeleton loaders.
- Strict TypeScript (no `any`).
