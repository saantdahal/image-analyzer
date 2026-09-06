import { useState } from "react";
import { useNavigate, Link, data } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../features/auth/authSlice";
import { loginUser } from "../../services/authService";
import { toast } from "react-toastify";
import useErrors from "../../hooks/useErrors";
import { loginValidationSchema } from "../../form_validations/authValidationSchema";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { errors, resetErrors, validateForm, clearFieldError } = useErrors();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    resetErrors();

    const isValid = await validateForm(loginValidationSchema, form);
    if (!isValid) return;

    setLoading(true);
    try {
      const data = await loginUser({
        email: form.email,
        password: form.password,
      });
      dispatch(setCredentials(data));
      toast.success("Welcome back!");
      navigate(
        data.user?.role === "admin" ? "/admin/dashboard" : "/dashboard",
        { replace: true },
      );
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-icon">
          <i className="ti ti-shield-check" />
        </div>
        <div>
          <div className="auth-brand-name">AI Based</div>
          <div className="auth-brand-sub">Cybercrime Reporting System</div>
        </div>
      </div>

      <div className="auth-center">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Login to securely access the system</p>
        </div>

        <div className="card auth-card">
          <div className="card-header">
            <i className="ti ti-user-circle me-2" />
            Account Information
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="example@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <div className="col-md-6">
                <label className="form-label">Password</label>
                <div className="input-group">
                  <input
                    type={showPw ? "text" : "password"}
                    name="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-group-text auth-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    <i className={`ti ${showPw ? "ti-eye-off" : "ti-eye"}`} />
                  </button>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="auth-actions">
          <button
            className="btn auth-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing in...
              </>
            ) : (
              <>
                <i className="ti ti-login me-2" />
                Login
              </>
            )}
          </button>
          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: var(--color-bg);
          display: flex;
          flex-direction: column;
        }

        /* Brand bar */
        .auth-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-surface);
        }

        .auth-brand-icon {
          width: 32px; height: 32px;
          background: #1a3a5c;
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; color: #fff;
        }

        .auth-brand-name {
          font-size: 13px; font-weight: 600;
          color: var(--color-text-primary);
          letter-spacing: 0.01em;
        }

        .auth-brand-sub {
          font-size: 10px;
          color: var(--color-text-secondary);
          letter-spacing: 0.03em;
        }

        /* Center area */
        .auth-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          gap: 1.5rem;
        }

        /* Header text */
        .auth-header { text-align: center; }

        .auth-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 0.35rem;
          letter-spacing: -0.02em;
        }

        .auth-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        /* Card */
        .auth-card {
          width: 100%;
          max-width: 580px;
        }

        /* Password toggle */
        .auth-pw-toggle {
          background: var(--color-surface-3) !important;
          border: 1px solid var(--color-border) !important;
          border-left: none !important;
          color: var(--color-text-secondary) !important;
          cursor: pointer;
        }

        .auth-pw-toggle:hover {
          color: var(--color-text-primary) !important;
        }

        /* Actions */
        .auth-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
          width: 100%;
          max-width: 580px;
        }

        .auth-btn-primary {
          width: 100%;
          background: #1a3a5c;
          color: #fff;
          border: none;
          padding: 0.65rem 1.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
          transition: background var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-btn-primary:hover:not(:disabled) {
          background: #224a73;
          color: #fff;
        }

        .auth-btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-switch {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .auth-link {
          color: #3a7bd5;
          font-weight: 600;
          text-decoration: none;
        }

        .auth-link:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
