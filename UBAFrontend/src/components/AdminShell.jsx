import { Outlet } from 'react-router-dom';
import AdminLayout from './AdminLayout';

export default function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
