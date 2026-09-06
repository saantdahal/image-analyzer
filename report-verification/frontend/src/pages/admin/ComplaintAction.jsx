import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  downloadComplaintReport,
  getComplaintById,
  reviewComplaint,
} from "../../services/complaintService";
import { toast } from "react-toastify";

const STATUS_BADGE = {
  pending: "badge-pending",
  under_review: "badge-review",
  forwarded: "badge-forwarded",
  closed: "badge-closed",
  rejected: "badge-rejected",
  approved: "badge-approved",
};

const INITIAL_FORM = {
  remarks: "",
  approved: null,
};

const ReadField = ({ label, value }) => (
  <div>
    <label
      className="form-label"
      style={{
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "var(--color-text-muted)",
      }}
    >
      {label}
    </label>
    <div
      style={{
        background: "var(--color-surface-2)",
        color: "var(--color-text-primary)",
        minHeight: 38,
        padding: "6px 12px",
        borderRadius: 6,
        borderLeft: "3px solid var(--color-border)",
        fontSize: "0.925rem",
        display: "flex",
        alignItems: "center",
      }}
    >
      {value || <span style={{ color: "var(--color-text-muted)" }}>—</span>}
    </div>
  </div>
);

export default function ComplaintAction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getComplaintById(id)
      .then((data) => setComplaint(data))
      .catch((err) => toast.error(err.message || "Failed to load complaint"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async (decision) => {
    if (!remarks.trim()) {
      toast.error("Please enter remarks before submitting a decision");
      return;
    }
    setSubmitting(true);
    try {
      await reviewComplaint(id, { decision, remarks });
      toast.success(
        `Complaint ${decision === "approve" ? "approved" : "rejected"}`,
      );
      navigate("/admin/complaints");
    } catch (err) {
      toast.error(err.message || "Review failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: 300 }}
      >
        <span
          className="spinner-border"
          style={{ color: "var(--color-primary)" }}
        />
      </div>
    );
  }

  if (!complaint) {
    return (
      <div
        className="text-center py-5"
        style={{ color: "var(--color-text-muted)" }}
      >
        Complaint not found.
      </div>
    );
  }

  const c = complaint;
  const alreadyReviewed = ["approved", "rejected", "closed"].includes(c.status);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadComplaintReport(id);
    } catch (err) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fade-in">
      <style>{`
        .btn.btn-success.btn-approve:hover:not(:disabled) {
          background-color: #FFFFFF !important;
          border-color: #cdcdcd !important;
          color:#146c43 !important;
        }
        .btn.btn-danger.btn-reject:hover:not(:disabled) {
          background-color: #FFF !important;
          border-color: #cdcdcd !important;
          color: #b02a37 !important;
        }
      `}</style>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h5
            className="fw-semibold mb-0"
            style={{ color: "var(--color-text-primary)" }}
          >
            Admin Review Form
          </h5>
          <small
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Complaint #{c.id}
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${STATUS_BADGE[c.status] ?? "badge-closed"}`}>
            {c.status?.replace("_", " ")}
          </span>
          {(c?.status === "approved" || c?.status === "rejected") && (
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <i className="ti ti-download" />
              )}
              Download Report
            </button>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate("/admin/complaints")}
          >
            <i className="ti ti-arrow-left me-1" /> Back
          </button>
        </div>
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
                <ReadField label="Complaint Title" value={c.title} />
              </div>
              <div className="col-md-6">
                {c.tags.map((item) => (
                  <ReadField label="Category" value={item.name} />
                ))}
              </div>
              <div className="col-md-6">
                <ReadField
                  label="Incident Date"
                  value={
                    c?.incident_date
                      ? new Date(c.incident_date).toLocaleDateString()
                      : ""
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={4}
                  readOnly
                  value={c.description ?? ""}
                  style={{
                    background: "var(--color-surface-2)",
                    resize: "none",
                  }}
                />
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
            <div className="row g-3">
              <div className="col-md-4">
                <ReadField
                  label="First Name"
                  value={c?.victim.victim_first_name}
                />
              </div>
              <div className="col-md-4">
                <ReadField
                  label="Middle Name"
                  value={c?.victim.victim_middle_name}
                />
              </div>
              <div className="col-md-4">
                <ReadField
                  label="Last Name"
                  value={c?.victim.victim_last_name}
                />
              </div>
              <div className="col-md-6">
                <ReadField
                  label="Phone Number"
                  value={c?.victim.phone_number}
                />
              </div>
              <div className="col-md-6">
                <ReadField
                  label="Relation to Victim"
                  value={c?.relationToVictim}
                />
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
                <ReadField label="Platform" value={c.suspect.crime_location} />
              </div>
              <div className="col-md-4">
                <ReadField
                  label="Full Name / Username"
                  value={c.suspect.name}
                />
              </div>
              <div className="col-md-5">
                <ReadField label="Profile URL" value={c.suspectProfileUrl} />
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
            {c.evidence.image_url ? (
              <a
                href={c.evidence.image_url}
                target="_blank"
                rel="noreferrer"
                className="d-block text-decoration-none position-relative overflow-hidden rounded"
                style={{
                  width: "100%",
                  maxWidth: 320,
                  aspectRatio: "16/9",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  transition: "border-color var(--transition)",
                }}
              >
                <img
                  src={c.evidence.image_url}
                  alt="evidence"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                >
                  <i
                    className="ti ti-zoom-in"
                    style={{ color: "#fff", fontSize: 28 }}
                  />
                </div>
              </a>
            ) : (
              <span
                style={{
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                }}
              >
                No evidence uploaded
              </span>
            )}
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-info-circle me-2" />
            Additional Information
          </div>
          <div className="card-body">
            <textarea
              className="form-control"
              rows={3}
              readOnly
              value={c.additionalInfo ?? ""}
              style={{ background: "var(--color-surface-2)", resize: "none" }}
            />
          </div>
        </div>

        <div className="card mb-3">
          <div className="card-header">
            <i className="ti ti-id-badge me-2" />
            Reporter Information
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <ReadField label="First Name" value={c?.reporter.first_name} />
              </div>
              <div className="col-md-4">
                <ReadField
                  label="Middle Name"
                  value={c?.reporter?.middle_name}
                />
              </div>
              <div className="col-md-4">
                <ReadField label="Last Name" value={c?.reporter?.last_name} />
              </div>
              <div className="col-md-6">
                <ReadField
                  label="Phone Number"
                  value={c?.reporter?.phone_number}
                />
              </div>
            </div>
          </div>
        </div>

        {c.ai_analysis.confidence && (
          <div className="card mb-3">
            <div className="card-header">
              <i className="ti ti-brain me-2" />
              AI Analysis Report
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">AI Verdict</label>
                  <div>
                    <span
                      className={`badge ${
                        c.ai_analysis.verdict === "Likely Manipulated"
                          ? "badge-rejected"
                          : "badge-approved"
                      }`}
                    >
                      {c.ai_analysis.verdict}
                    </span>
                  </div>
                </div>
                <div className="col-md-4">
                  <ReadField
                    label="Confidence Score"
                    value={
                      c.ai_analysis.confidence
                        ? `${c.ai_analysis.confidence}%`
                        : ""
                    }
                  />
                </div>
                <div className="col-md-4">
                  <ReadField
                    label="LBP Score"
                    value={c.ai_analysis.lbp_score}
                  />
                </div>
                <div className="col-12">
                  <ReadField
                    label="Recommended Decision"
                    value={c.ai_analysis.recommended_decision}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card mb-4">
          <div className="card-header">
            <i className="ti ti-gavel me-2" />
            Review Decision
          </div>
          <div className="card-body">
            {alreadyReviewed ? (
              <div>
                <div
                  className="d-flex align-items-center gap-2 mb-2"
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                  }}
                >
                  <i
                    className="ti ti-circle-check"
                    style={{ color: "var(--color-approved)" }}
                  />
                  This complaint has already been reviewed.
                </div>

                {c?.status && (
                  <span
                    className={`mb-2 badge ${STATUS_BADGE[c.status] ?? "badge-closed"}`}
                  >
                    {c.status?.replace("_", " ")}
                  </span>
                )}

                {c?.comments[0]?.body && (
                  <div
                    className="d-flex gap-2"
                    style={{
                      borderLeft: "3px solid var(--color-approved)",
                      background: "var(--color-surface-subtle, #f8f9fa)",
                      borderRadius: "0.375rem",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <i
                      className="ti ti-quote"
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "1rem",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-text-primary, #212529)",
                      }}
                    >
                      {c.comments[0].body}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    Remarks{" "}
                    <span style={{ color: "var(--color-rejected)" }}>*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter your review remarks..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success btn-approve d-flex align-items-center gap-2"
                    onClick={() => handleDecision("approve")}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="ti ti-circle-check" />
                    )}
                    Approve
                  </button>
                  <button
                    className="btn btn-danger btn-reject d-flex align-items-center gap-2"
                    onClick={() => handleDecision("reject")}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" />
                    ) : (
                      <i className="ti ti-circle-x" />
                    )}
                    Disapprove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
