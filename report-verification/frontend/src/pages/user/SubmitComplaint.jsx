import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { submitComplaint, getTags } from "../../services/complaintService";
import { toast } from "react-toastify";
import useErrors from "../../hooks/useErrors";
import { complaintValidationSchema } from "../../form_validations/complaintValidationSchema";
import Select from "react-select";

const PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Twitter/X",
  "YouTube",
  "WhatsApp",
  "Telegram",
  "Other",
];

const INITIAL = {
  title: "",
  incidentDate: "",
  description: "",
  isVictim: false,
  victimFirstName: "",
  victimMiddleName: "",
  victimLastName: "",
  victimPhone: "",
  relationToVictim: "",
  suspectPlatform: "Facebook",
  suspectName: "",
  suspectProfileUrl: "",
  tagIds: [],
  keepConfidential: false,
  confirmAccurate: false,
};

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(INITIAL);
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const { errors, resetErrors, validateForm, clearFieldError, setFieldError } =
    useErrors();

  useEffect(() => {
    getTags()
      .then((res) => setTags(res.results))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "isVictim" && checked
        ? {
            victimFirstName: (user?.first_name ?? ""),
            victimMiddleName: (user?.middle_name ?? ""),
            victimLastName: (user?.last_name ?? ""),
            victimPhone: (user?.phone ?? ""),
            relationToVictim: "Self",
          }
        : {}),
      ...(name === "isVictim" && !checked
        ? {
            victimFirstName: "",
            victimMiddleName: "",
            victimLastName: "",
            victimPhone: "",
            relationToVictim: "",
          }
        : {}),
    }));
    clearFieldError(name);
  };

  const toggleTag = (id) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
    clearFieldError("tagIds");
  };

  const setEvidence = (f) => {
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) {
      toast.warning("JPEG / PNG only");
      return;
    }
    if (f.size > 15 * 1024 * 1024) {
      toast.warning("Max file size is 15 MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    setEvidence(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    resetErrors();

    const isValid = await validateForm(complaintValidationSchema, form);
    if (!isValid) return;

    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setFieldError("file", "Evidence must be a JPEG or PNG image.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setFieldError("file", "Evidence image must be under 15 MB.");
        return;
      }
    }

    setLoading(true);
    try {
      await submitComplaint(form, file);
      toast.success("Complaint submitted successfully");
      navigate("/my-complaints");
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedTagObjects = tags.filter((tag) => form.tagIds.includes(tag.id));

  const handleTagsChange = (selectedOptions) => {
  setForm((prev) => ({
    ...prev,
    tagIds: selectedOptions ? selectedOptions.map((tag) => tag.id) : [],
  }));
};

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h5
          className="fw-semibold mb-0"
          style={{ color: "var(--color-text-primary)" }}
        >
          Report a Cybercrime
        </h5>
        <small
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Fill in all sections accurately. Your report will be reviewed by
          authorities.
        </small>
      </div>

      <div style={{ maxWidth: 780 }}>
        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-file-description me-2" />
            Complaint Information
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">
                  Complaint Title <span className="text-danger">*</span>
                </label>
                <input
                  name="title"
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  placeholder="Brief title of the incident"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && (
                  <div className="invalid-feedback">{errors.title}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">Category / Tags</label>
                <div className="d-flex flex-wrap gap-2">
                  <Select
                    name="crimeTags"
                    options={tags}
                    value={selectedTagObjects}
                    onChange={handleTagsChange}
                    placeholder="Select Crime Tags"
                    classNamePrefix="react-select"
                    className={`${errors.tagIds ? "is-invalid" : ""}`}
                    isClearable
                    isMulti
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.id}
                  />
                  {tags?.length === 0 && (
                    <small style={{ color: "var(--color-text-muted)" }}>
                      Loading categories...
                    </small>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Incident Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="incidentDate"
                  className={`form-control ${errors.incidentDate ? "is-invalid" : ""}`}
                  value={form.incidentDate}
                  onChange={handleChange}
                />
                {errors.incidentDate && (
                  <div className="invalid-feedback">{errors.incidentDate}</div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  className={`form-control ${errors.description ? "is-invalid" : ""}`}
                  rows={4}
                  placeholder="Describe the incident in detail..."
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-user me-2" />
            Victim Information
          </div>
          <div className="card-body">
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                name="isVictim"
                id="isVictim"
                checked={form.isVictim}
                onChange={handleChange}
              />
              <label
                className="form-check-label fw-semibold"
                htmlFor="isVictim"
                style={{ color: "var(--color-text-primary)" }}
              >
                I am the victim
              </label>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">
                  First Name <span className="text-danger">*</span>
                </label>
                <input
                  name="victimFirstName"
                  className={`form-control ${errors.victimFirstName ? "is-invalid" : ""}`}
                  value={form.victimFirstName}
                  onChange={handleChange}
                  readOnly={form.isVictim}
                />
                {errors.victimFirstName && (
                  <div className="invalid-feedback">
                    {errors.victimFirstName}
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <label className="form-label">Middle Name</label>
                <input
                  name="victimMiddleName"
                  className="form-control"
                  value={form.victimMiddleName}
                  onChange={handleChange}
                  readOnly={form.isVictim}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Last Name <span className="text-danger">*</span>
                </label>
                <input
                  name="victimLastName"
                  className={`form-control ${errors.victimLastName ? "is-invalid" : ""}`}
                  value={form.victimLastName}
                  onChange={handleChange}
                  readOnly={form.isVictim}
                />
                {errors.victimLastName && (
                  <div className="invalid-feedback">
                    {errors.victimLastName}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  name="victimPhone"
                  className={`form-control ${errors.victimPhone ? "is-invalid" : ""}`}
                  placeholder="98XXXXXXXX"
                  value={form.victimPhone}
                  onChange={handleChange}
                  readOnly={form.isVictim}
                />
                {errors.victimPhone && (
                  <div className="invalid-feedback">{errors.victimPhone}</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Relation to Victim <span className="text-danger">*</span>
                </label>
                <input
                  name="relationToVictim"
                  className={`form-control ${errors.relationToVictim ? "is-invalid" : ""}`}
                  placeholder="e.g. Parent, Friend, Self"
                  value={form.relationToVictim}
                  onChange={handleChange}
                  readOnly={form.isVictim}
                />
                {errors.relationToVictim && (
                  <div className="invalid-feedback">
                    {errors.relationToVictim}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-user-x me-2" />
            Suspect Information
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Platform</label>
                <select
                  name="suspectPlatform"
                  className="form-select"
                  value={form.suspectPlatform}
                  onChange={handleChange}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Full Name / Username</label>
                <input
                  name="suspectName"
                  className={`form-control ${errors.suspectName ? "is-invalid" : ""}`}
                  placeholder="Known name or username"
                  value={form.suspectName}
                  onChange={handleChange}
                />
                {errors.suspectName && (
                  <div className="invalid-feedback">{errors.suspectName}</div>
                )}
              </div>

              <div className="col-md-5">
                <label className="form-label">Profile URL</label>
                <input
                  name="suspectProfileUrl"
                  className={`form-control ${errors.suspectProfileUrl ? "is-invalid" : ""}`}
                  placeholder="https://..."
                  value={form.suspectProfileUrl}
                  onChange={handleChange}
                />
                {errors.suspectProfileUrl && (
                  <div className="invalid-feedback">
                    {errors.suspectProfileUrl}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-photo me-2" />
            Evidence
          </div>
          <div className="card-body">
            <div className="row g-3 align-items-start">
              <div className="col-md-6">
                {preview ? (
                  <div
                    className="position-relative rounded overflow-hidden"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <img
                      src={preview}
                      alt="evidence"
                      style={{
                        width: "100%",
                        maxHeight: 200,
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                      className="position-absolute top-0 end-0 border-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: 28,
                        height: 28,
                        background: "var(--color-rejected)",
                        color: "#fff",
                        cursor: "pointer",
                        borderRadius: "0 0 0 6px",
                      }}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    className="d-flex flex-column align-items-center justify-content-center gap-2 rounded"
                    style={{
                      border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border)"}`,
                      background: dragging
                        ? "var(--color-primary-dim)"
                        : "var(--color-surface-2)",
                      minHeight: 140,
                      cursor: "pointer",
                      transition: "all var(--transition)",
                      padding: "1.5rem",
                    }}
                  >
                    <i
                      className="ti ti-cloud-upload"
                      style={{
                        fontSize: 32,
                        color: dragging
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)",
                      }}
                    />
                    <div className="text-center">
                      <div
                        className="fw-semibold"
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        Drag & drop or click to upload
                      </div>
                      <small style={{ color: "var(--color-text-muted)" }}>
                        JPEG / PNG · Max 15 MB
                      </small>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="d-none"
                  onChange={(e) => setEvidence(e.target.files[0])}
                />
                {errors.file && (
                  <div className="invalid-feedback d-block mt-1">
                    {errors.file}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <ul
                  className="mb-0"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    lineHeight: 2,
                  }}
                >
                  <li>JPEG / PNG format only</li>
                  <li>Maximum size 15 MB</li>
                  <li>One image — screenshot or photo of incident</li>
                  <li>Image will be analysed by AI for manipulation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <i className="ti ti-lock me-2" />
            Privacy
          </div>
          <div className="card-body d-flex flex-column gap-2">
            <div className="form-check">
              <input
                className={`form-check-input ${errors.confirmAccurate ? "is-invalid" : ""}`}
                type="checkbox"
                id="confirmAccurate"
                name="confirmAccurate"
                checked={form.confirmAccurate}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="confirmAccurate">
                I confirm that the information provided is accurate to the best
                of my knowledge. <span className="text-danger">*</span>
              </label>
              {errors.confirmAccurate && (
                <div className="invalid-feedback d-block">
                  {errors.confirmAccurate}
                </div>
              )}
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="keepConfidential"
                name="keepConfidential"
                checked={form.keepConfidential}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="keepConfidential">
                Keep my identity confidential
              </label>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" />{" "}
                Submitting...
              </>
            ) : (
              <>
                <i className="ti ti-send" /> Submit Report
              </>
            )}
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/my-complaints")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
