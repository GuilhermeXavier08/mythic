// src/app/admin/layout.tsx
import AdminGuard from "@/components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Qualquer página dentro de /admin/* será protegida por este guarda
    <AdminGuard>
      {children}
    </AdminGuard>
  );
}