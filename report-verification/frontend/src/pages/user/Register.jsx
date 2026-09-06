import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
// import { setCredentials } from "../../features/auth/authSlice";
import { registerUser } from "../../services/authService";

import { toast } from "react-toastify";
import useErrors from "../../hooks/useErrors";
import { registerValidationSchema } from "../../form_validations/authValidationSchema";

const INITIAL = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  permanentAddress: "",
  email: "",
  phone: "",
  citizenshipNumber: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState(INITIAL);
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

    const isValid = await validateForm(registerValidationSchema, form);
    if (!isValid) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("first_name", form.firstName);
      formData.append("middle_name", form.middleName ?? "");
      formData.append("last_name", form.lastName);
      formData.append("citizenship_number", form.citizenshipNumber);
      formData.append("gender", form.gender);
      formData.append("phone_number", form.phone);

      await registerUser(formData);
      toast.success("Account created! Please log in.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed");
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
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Sign up to access the system</p>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 700,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div className="card">
            <div className="card-header">
              <i className="ti ti-user me-2" />
              Personal Information
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name <span className="text-danger">*</span> </label>
                  <input
                    name="firstName"
                    className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input
                    name="middleName"
                    className={`form-control ${errors.middleName ? "is-invalid" : ""}`}
                    value={form.middleName}
                    onChange={handleChange}
                  />
                  {errors.middleName && (
                    <div className="invalid-feedback">{errors.middleName}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name <span className="text-danger">*</span></label>
                  <input
                    name="lastName"
                    className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label d-block">Gender <span className="text-danger">*</span></label>
                  <div className="d-flex gap-4">
                    {["Male", "Female", "Other"].map((g) => (
                      <div className="form-check" key={g}>
                        <input
                          className={`form-check-input ${errors.gender ? "is-invalid" : ""}`}
                          type="radio"
                          name="gender"
                          id={`gender-${g}`}
                          value={g.toLowerCase()}
                          checked={form.gender === g.toLowerCase()}
                          onChange={handleChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`gender-${g}`}
                        >
                          {g}
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.gender && (
                    <div className="invalid-feedback d-block">
                      {errors.gender}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Permanent Address <span className="text-danger">*</span></label>
                  <input
                    name="permanentAddress"
                    className={`form-control ${errors.permanentAddress ? "is-invalid" : ""}`}
                    value={form.permanentAddress}
                    onChange={handleChange}
                    required
                  />
                  {errors.permanentAddress && (
                    <div className="invalid-feedback">
                      {errors.permanentAddress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="ti ti-address-book me-2" />
              Contact Information
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Email Address <span className="text-danger">*</span></label>
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
                  <label className="form-label">Phone Number <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    placeholder="98XXXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="ti ti-lock me-2" />
              Account Information
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Citizenship Number <span className="text-danger">*</span></label>
                  <input
                    name="citizenshipNumber"
                    className={`form-control ${errors.citizenshipNumber ? "is-invalid" : ""}`}
                    placeholder="XX-XX-XX-XXXXX"
                    value={form.citizenshipNumber}
                    onChange={handleChange}
                    required
                  />
                  {errors.citizenshipNumber && (
                    <div className="invalid-feedback">
                      {errors.citizenshipNumber}
                    </div>
                  )}
                </div>

                <div className="col-12" />

                <div className="col-md-6">
                  <label className="form-label">Password <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
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

                <div className="col-md-6">
                  <label className="form-label">Confirm Password <span className="text-danger">*</span></label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="auth-actions">
            <button
              className="btn auth-btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Creating account...
                </>
              ) : (
                <>
                  <i className="ti ti-user-plus me-2" />
                  Register
                </>
              )}
            </button>
            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: var(--color-bg);
          display: flex;
          flex-direction: column;
        }

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

        .auth-center {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.5rem 1rem;
          gap: 1.5rem;
        }

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

        .auth-actions {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
          width: 100%;
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
