import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser, updateUser } from "../../features/auth/authSlice";
import { getProfile, updateProfile } from "../../services/authService";
import { toast } from "react-toastify";

export default function Profile() {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    citizenship_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) =>
        setForm({
          first_name: data.first_name ?? "",
          middle_name: data.middle_name ?? "",
          last_name: data.last_name ?? "",
          email: data.email ?? "",
          phone_number: data.phone_number ?? "",
          citizenship_number: data.citizenship_number ?? "",
        }),
      )
      .catch((err) => toast.error(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      dispatch(updateUser(updated));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    [form.first_name, form.last_name]
      .filter(Boolean)
      .map((n) => n[0].toUpperCase())
      .join("") ||
    currentUser?.email?.[0]?.toUpperCase() ||
    "U";

  const role = currentUser?.role ?? "user";

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h5
          className="fw-semibold mb-0"
          style={{ color: "var(--color-text-primary)" }}
        >
          Profile
        </h5>
        <small
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Manage your account information
        </small>
      </div>

      <div style={{ maxWidth: 680 }}>
        {/* ── Avatar + role card ── */}
        <div className="card mb-3">
          <div className="card-body d-flex align-items-center gap-3 p-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle fw-bold flex-shrink-0"
              style={{
                width: 56,
                height: 56,
                fontSize: "1.2rem",
                background:
                  role === "admin"
                    ? "rgba(26,58,92,0.1)"
                    : "var(--color-surface-3)",
                border: `2px solid ${role === "admin" ? "#1a3a5c" : "var(--color-border)"}`,
                color:
                  role === "admin" ? "#1a3a5c" : "var(--color-text-secondary)",
              }}
            >
              {loading ? "—" : initials}
            </div>
            <div>
              <div
                className="fw-semibold"
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: "0.95rem",
                }}
              >
                {loading
                  ? "—"
                  : `${form.first_name} ${form.last_name}`.trim() || "User"}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                {form.email}
              </div>
              <span
                className="badge mt-1"
                style={{
                  background:
                    role === "admin"
                      ? "rgba(26,58,92,0.1)"
                      : "var(--color-surface-3)",
                  color:
                    role === "admin"
                      ? "#1a3a5c"
                      : "var(--color-text-secondary)",
                  fontSize: "0.65rem",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* ── Personal information ── */}
        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-user me-2" />
            Personal Information
          </div>
          <div className="card-body">
            {loading ? (
              <div className="row g-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-md-6">
                    <div className="placeholder-glow">
                      <span
                        className="placeholder col-4 mb-1 d-block"
                        style={{ height: 12 }}
                      />
                      <span
                        className="placeholder col-12"
                        style={{ height: 36 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">First Name</label>
                  <input
                    name="first_name"
                    className="form-control"
                    value={form.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Middle Name</label>
                  <input
                    name="middle_name"
                    className="form-control"
                    value={form.middle_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Last Name</label>
                  <input
                    name="last_name"
                    className="form-control"
                    value={form.last_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone Number</label>
                  <input
                    name="phone_number"
                    className="form-control"
                    value={form.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Citizenship Number</label>
                  <input
                    name="citizenship_number"
                    className="form-control"
                    value={form.citizenship_number}
                    onChange={handleChange}
                    readOnly={role === "user"}
                    style={
                      role === "user"
                        ? {
                            background: "var(--color-surface-2)",
                            cursor: "not-allowed",
                          }
                        : {}
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email Address</label>
                  <input
                    name="email"
                    className="form-control"
                    value={form.email}
                    readOnly
                    style={{
                      background: "var(--color-surface-2)",
                      cursor: "not-allowed",
                    }}
                  />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={saving || loading}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" />{" "}
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="ti ti-device-floppy" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
