import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectUserRole,
} from "../../features/auth/authSlice";

const STATS = [
  { value: "98.61%", label: "Detection accuracy" },
  { value: "98.78%", label: "Precision" },
  { value: "99.79%", label: "AUC-ROC" },
];

const FEATURES = [
  {
    icon: "ti-brain",
    title: "AI Evidence Analysis",
    desc: "Detects image manipulation using LBP scoring and densenet121 model.",
  },
  {
    icon: "ti-map-pin",
    title: "Real-Time Tracking",
    desc: "Track your case at every stage from submission to resolution.",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(role === "admin" ? "/admin/dashboard" : "/dashboard", {
        replace: true,
      });
    }
  }, [isAuthenticated, role, navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="hero-root min-vh-100 d-flex flex-column bg-body">
      {/* Nav */}
      <nav className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="hero-brand-icon d-flex align-items-center justify-content-center rounded-2 text-white">
            <i className="ti ti-shield-check" aria-hidden="true" />
          </div>
          <div>
            <div className="fw-semibold small">AI Based</div>
            <div className="text-muted" style={{ fontSize: "10px" }}>
              Cybercrime Reporting System
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
          <button
            className="btn btn-sm hero-btn-primary"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Body */}
      <div className="container py-5" style={{ maxWidth: "820px" }}>
        <div className="d-inline-flex align-items-center gap-2 text-muted small mb-3 hero-mono">
          <span className="hero-dot rounded-circle" />
          AI Based · Cybercrime Reporting System
        </div>

        <h1 className="fw-semibold mb-3 hero-title">
          Cybercrime Complaint
          <br />
          Reporting System
        </h1>
        <p
          className="text-muted mb-4"
          style={{ maxWidth: "540px", lineHeight: 1.75 }}
        >
          Submit cybercrime complaints securely. Our AI-assisted platform
          analyses evidence and let's you track reports.
        </p>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className="btn btn-lg hero-btn-primary d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/register")}
          >
            <i className="ti ti-file-plus" aria-hidden="true" />
            File a Complaint
          </button>
          <button
            className="btn btn-outline-secondary btn-lg d-inline-flex align-items-center gap-2"
            onClick={() => navigate("/login")}
          >
            <i className="ti ti-search" aria-hidden="true" />
            Track Complaint
          </button>
        </div>

        <div className="row g-2 mb-4">
          {STATS.map((s, i) => (
            <div key={i} className="col-4">
              <div className="card h-100 border">
                <div className="card-body py-3 px-3">
                  <div
                    className="fw-medium hero-mono"
                    style={{ fontSize: "1.4rem" }}
                  >
                    {s.value}
                  </div>
                  <div className="text-muted small">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="mb-4" />

        <div className="row g-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="col-md-6">
              <div className="d-flex gap-2 align-items-start">
                <div className="hero-feature-icon d-flex align-items-center justify-content-center rounded-2 border flex-shrink-0">
                  <i className={`ti ${f.icon}`} aria-hidden="true" />
                </div>
                <div>
                  <div className="fw-semibold small mb-1">{f.title}</div>
                  <div
                    className="text-muted"
                    style={{ fontSize: "0.76rem", lineHeight: 1.55 }}
                  >
                    {f.desc}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center pt-4 mt-4 border-top text-muted small flex-wrap gap-2">
          <span>© 2025 BIT</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=DM+Sans:wght@300;400;500;600&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css');

        .hero-root { font-family: var(--font-body, 'DM Sans', sans-serif); }
        .hero-mono { font-family: var(--font-mono, 'IBM Plex Mono', monospace); }

        .hero-brand-icon, .hero-feature-icon { width: 34px; height: 34px; font-size: 17px; }
        .hero-brand-icon { background: #1a3a5c; }
        .hero-feature-icon { color: #1a3a5c; }

        .hero-dot { width: 7px; height: 7px; background: #2e7d32; display: inline-block; }

        .hero-title { font-size: clamp(2rem, 5vw, 2.8rem); letter-spacing: -0.025em; line-height: 1.2; }

        .hero-btn-primary { background: #1a3a5c; color: #fff; border: none; }
        .hero-btn-primary:hover { background: #224a73; color: #fff; }
      `}</style>
    </div>
  );
};

export default Hero;
