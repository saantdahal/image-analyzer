import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintById,
  downloadComplaintReport,
} from "../../services/complaintService";
import { toast } from "react-toastify";

const STATUS_BADGE = {
  pending: "badge-pending",
  ongoing: "badge-review",
  approved: "badge-approved",
  rejected: "badge-rejected",
  closed: "badge-closed",
};

// const STATUS_STEPS = ["pending", "ongoing", "approved"];

const STATUS_STEPS = ["pending", "ongoing", "resolved"];

const STATUS_TO_STEP = {
  pending: 0,
  ongoing: 1,
  approved: 2,
  rejected: 2,
  closed: 2,
};

const InfoRow = ({ label, value }) => (
  <div
    className="d-flex justify-content-between align-items-center py-2"
    style={{ borderBottom: "1px solid var(--color-border)" }}
  >
    <small style={{ color: "var(--color-text-secondary)" }}>{label}</small>
    <span
      style={{
        fontSize: "0.875rem",
        color: "var(--color-text-primary)",
        fontWeight: 500,
      }}
    >
      {value ?? <span style={{ color: "var(--color-text-muted)" }}>—</span>}
    </span>
  </div>
);

export default function ComplaintTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getComplaintById(id)
      .then(setComplaint)
      .catch((err) => toast.error(err.message || "Failed to load complaint"))
      .finally(() => setLoading(false));
  }, [id]);

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
  // const stepIndex = STATUS_STEPS.indexOf(c.status);

  const stepIndex = STATUS_TO_STEP[complaint?.status] ?? 0;
  const isRejected = c?.status === "rejected";

  return (
    <div className="fade-in">
      <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h5
            className="fw-semibold mb-0"
            style={{ color: "var(--color-text-primary)" }}
          >
            Complaint Tracking
          </h5>
          <small
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {c?.title}
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/my-complaints")}
          >
            <i className="ti ti-arrow-left me-1" /> Back
          </button>
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
        </div>
      </div>

      {/* ── Status timeline ── */}
      <div className="d-flex align-items-center gap-0 w-100 pb-4">
        {STATUS_STEPS.map((step, i) => {
          const done = i <= stepIndex;
          const isLastStep = i === STATUS_STEPS.length - 1;
          const label = isLastStep && isRejected ? "rejected" : step;

          return (
            <React.Fragment key={step}>
              <div
                className="d-flex flex-column align-items-center flex-shrink-0"
                style={{ minWidth: 80 }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 32,
                    height: 32,
                    background:
                      isRejected && isLastStep && done
                        ? "var(--color-rejected)"
                        : done
                          ? "var(--color-primary)"
                          : "var(--color-surface-3)",
                    border: `2px solid ${
                      isRejected && isLastStep && done
                        ? "var(--color-rejected)"
                        : done
                          ? "var(--color-primary)"
                          : "var(--color-border)"
                    }`,
                    color: done ? "#fff" : "var(--color-text-muted)",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  <i
                    className={`ti ${isRejected && isLastStep && done ? "ti-x" : done ? "ti-check" : "ti-point"}`}
                  />
                </div>
                <small
                  className="mt-1 text-center"
                  style={{
                    fontSize: "0.65rem",
                    color:
                      isRejected && isLastStep && done
                        ? "var(--color-rejected)"
                        : done
                          ? "var(--color-primary)"
                          : "var(--color-text-muted)",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label.replace("_", " ")}
                </small>
              </div>

              {!isLastStep && (
                <div
                  className="flex-grow-1"
                  style={{
                    height: 2,
                    background:
                      i < stepIndex
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                    marginBottom: 20,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--color-primary)",
                  flexShrink: 0,
                }}
              />
              Complaint Summary
            </div>
            <div className="card-body">
              <InfoRow
                label="Complaint ID"
                value={
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    #{c.id}
                  </span>
                }
              />
              <InfoRow
                label="Current Status"
                value={
                  <span
                    className={`badge ${STATUS_BADGE[c?.status] ?? "badge-closed"}`}
                  >
                    {c.status?.replace("_", " ")}
                  </span>
                }
              />
              <InfoRow
                label="Submitted"
                value={new Date(c.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              />
              <InfoRow label="Category" value={c.category} />
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--color-border)",
                  flexShrink: 0,
                }}
              />
              Complaint Details
            </div>
            <div className="card-body">
              <InfoRow label="Title" value={c.title} />
              <InfoRow
                label="Incident Date"
                value={
                  c.incident_date
                    ? new Date(c.incident_date).toLocaleDateString()
                    : null
                }
              />
              <InfoRow label="Platform" value={c.suspect.crime_location} />
              <div className="pt-2">
                <small style={{ color: "var(--color-text-secondary)" }}>
                  Description
                </small>
                <p
                  className="mt-1 mb-0"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.6,
                  }}
                >
                  {c.description ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--color-border)",
                  flexShrink: 0,
                }}
              />
              Evidence Submitted
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
                  {/* hover overlay */}
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
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-header d-flex align-items-center gap-2">
              <div
                className="rounded-circle"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--color-border)",
                  flexShrink: 0,
                }}
              />
              AI Analysis Results
            </div>
            <div className="card-body">
              {c.ai_analysis.confidence ? (
                <>
                  <InfoRow
                    label="Verdict"
                    value={
                      <span
                        className={`badge ${
                          c.ai_analysis.verdict === "Likely Manipulated"
                            ? "badge-rejected"
                            : "badge-approved"
                        }`}
                      >
                        {c?.ai_analysis.verdict}
                      </span>
                    }
                  />
                  <InfoRow
                    label="Confidence Score"
                    value={
                      c.ai_analysis.confidence
                        ? `${c.ai_analysis.confidence}%`
                        : null
                    }
                  />
                  <InfoRow label="LBP Score" value={c.ai_analysis.lbp_score} />
                </>
              ) : (
                <span
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Analysis pending — will appear after review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex align-items-center gap-2">
          <div
            className="rounded-circle"
            style={{
              width: 10,
              height: 10,
              background: "var(--color-border)",
              flexShrink: 0,
            }}
          />
          Admin Review
        </div>
        <div className="card-body">
          {c.comments.length > 0 ? (
            <>
              <InfoRow
                label="Decision"
                value={
                  <span
                    className={`badge ${STATUS_BADGE[c.status] ?? "badge-closed"}`}
                  >
                    {c.status?.replace("_", " ")}
                  </span>
                }
              />
              <div className="pt-2">
                <small style={{ color: "var(--color-text-secondary)" }}>
                  Remarks
                </small>
                <p
                  className="mt-1 mb-0"
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--color-text-primary)",
                    lineHeight: 1.6,
                  }}
                >
                  {c.comments[0].body}
                </p>
              </div>
            </>
          ) : (
            <span
              style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
            >
              No review yet — your complaint is being processed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
