import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { getDashboardStats } from '../../services/complaintService';

function AdminLayout() {
  const [complaintCount, setComplaintCount] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then(s => setComplaintCount(s?.total ?? null))
      .catch(() => {});
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar role="admin" complaintCount={complaintCount} />
      <main
        className="d-flex flex-column flex-grow-1"
        style={{ marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}
      >
        <header
          className="d-flex align-items-center border-bottom px-4"
          style={{
            height: 'var(--topbar-height)',
            background: 'var(--color-surface)',
            position: 'sticky', top: 0, zIndex: 50,
          }}
        >
          <div className="ms-auto d-flex align-items-center gap-2"
            style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <i className="ti ti-shield-lock" style={{ fontSize: 14, color: '#1a3a5c' }} />
            Admin session
          </div>
        </header>
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;