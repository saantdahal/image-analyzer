import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../../features/auth/authSlice";
import { logoutUser } from "../../services/authService";

const USER_NAV = [
  { to: "/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { to: "/submit-complaint", icon: "ti-plus", label: "Report a Cybercrime" },
  { to: "/my-complaints", icon: "ti-files", label: "My Complaints" },
  { to: "/profile", icon: "ti-user-circle", label: "Profile" },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
  { to: "/admin/complaints", icon: "ti-files", label: "Complaints" },
  { to: "/admin/profile", icon: "ti-user-circle", label: "Profile" },
];

const Sidebar = ({ role = "user", complaintCount }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const navItems = role === "admin" ? ADMIN_NAV : USER_NAV;
  const subtitle = role === "admin" ? "Admin Panel" : "For Safe Online Space";

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className="d-flex flex-column border-end"
      style={{
        width: "var(--sidebar-width)",
        minHeight: "100vh",
        background: "var(--color-surface)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <div className="d-flex align-items-start gap-2 p-3 pb-2">
        <div
          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded"
          style={{ width: 34, height: 34, background: "#1a3a5c", marginTop: 2 }}
        >
          <i
            className="ti ti-shield-check"
            style={{ fontSize: 18, color: "#fff" }}
          />
        </div>
        <div>
          <div
            className="fw-bold"
            style={{
              fontSize: "0.8rem",
              lineHeight: 1.3,
              color: "var(--color-text-primary)",
            }}
          >
            AI Based
            <br />
            Cybercrime Reporting System
          </div>
          <div
            style={{
              fontSize: "0.68rem",
              color: "var(--color-text-secondary)",
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <hr
        className="mx-3 my-0"
        style={{ borderColor: "var(--color-border)" }}
      />

      <nav className="d-flex flex-column gap-1 p-2 flex-grow-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to.endsWith("dashboard")}
            className={({ isActive }) =>
              `sidebar-nav-link${isActive ? " active" : ""}`
            }
          >
            <i
              className={`ti ${icon}`}
              style={{ fontSize: 17, flexShrink: 0 }}
            />
            <span className="flex-grow-1">{label}</span>
            {label === "Complaints" && complaintCount != null && (
              <span
                className="badge rounded-pill"
                style={{
                  background: "var(--color-primary-dim)",
                  color: "var(--color-primary)",
                  fontSize: "0.65rem",
                }}
              >
                {complaintCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <hr
        className="mx-3 my-0"
        style={{ borderColor: "var(--color-border)" }}
      />

      <div className="p-3">
        <NavLink
          to={role === "admin" ? "/admin/profile" : "/profile"}
          className="d-flex align-items-center gap-2 mb-2 text-decoration-none rounded p-1"
          style={({ isActive }) => ({
            background: isActive ? "var(--color-primary-dim)" : "transparent",
            transition: "background var(--transition)",
          })}
        >
          <div
            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-semibold"
            style={{
              width: 32,
              height: 32,
              background:
                role === "admin"
                  ? "rgba(26,58,92,0.1)"
                  : "var(--color-surface-3)",
              border: `1px solid ${role === "admin" ? "#1a3a5c" : "var(--color-border)"}`,
              fontSize: 13,
              color:
                role === "admin" ? "#1a3a5c" : "var(--color-text-secondary)",
            }}
          >
            {user?.first_name?.charAt(0)?.toUpperCase() ??
              (role === "admin" ? "A" : "U")}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div
              className="fw-semibold text-truncate"
              style={{ fontSize: "0.8rem", color: "var(--color-text-primary)" }}
            >
              {[user?.first_name, user?.middle_name, user?.last_name]
                .filter(Boolean)
                .join(" ") || (role === "admin" ? "Admin" : "User")}
            </div>
            <div
              className="text-truncate"
              style={{
                fontSize: "0.68rem",
                color: "var(--color-text-secondary)",
              }}
            >
              {user?.email ?? ""}
            </div>
          </div>
          <i
            className="ti ti-chevron-right ms-auto flex-shrink-0"
            style={{ fontSize: 13, color: "var(--color-text-muted)" }}
          />
        </NavLink>

        <button
          onClick={handleLogout}
          className="btn btn-outline-secondary w-100 d-flex align-items-center gap-2"
          style={{ fontSize: "0.8rem", padding: "0.4rem 0.75rem" }}
        >
          <i className="ti ti-logout" style={{ fontSize: 15 }} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
