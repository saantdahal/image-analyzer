import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';

function UserLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar role="user" />
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
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2e7d32' }} />
            System operational
          </div>
        </header>
        <div className="flex-grow-1 p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default UserLayout;