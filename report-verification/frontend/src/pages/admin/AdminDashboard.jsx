import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../features/auth/authSlice";
import {
  getDashboardStats,
  getAdminComplaints,
} from "../../services/complaintService";
import { toast } from "react-toastify";

const STAT_CARDS = [
  { key: "total", label: "Total Complaints", icon: "ti-files" },
  { key: "pending", label: "pending", icon: "ti-eye" },
  { key: "ongoing", label: "ongoing", icon: "ti-send" },
  { key: "closed", label: "Closed", icon: "ti-circle-check" },
];

const STATUS_BADGE = {
  pending: "badge-pending",
  ongoing: "badge-review",
  closed: "badge-closed",
  rejected: "badge-rejected",
  approved: "badge-approved",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [statsResult, complaintsResult] = await Promise.allSettled([
          getDashboardStats(),
          getAdminComplaints({ limit: 5 }),
        ]);

        if (statsResult.status === "fulfilled") {
          setStats(statsResult.value);
        } else {
          console.error("Stats failed:", statsResult.reason);
        }

        if (complaintsResult.status === "fulfilled") {
          setComplaints(complaintsResult.value.results ?? []);
        } else {
          console.error("Complaints failed:", complaintsResult.reason);
          toast.error("Failed to load complaints");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="fade-in">
      <div className="mb-4">
        <h5
          className="fw-semibold mb-0"
          style={{ color: "var(--color-text-primary)" }}
        >
          Dashboard
        </h5>
        <small
          style={{
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {today}
        </small>
      </div>

      <div className="row g-3 mb-4">
        {STAT_CARDS.map(({ key, label, icon }) => (
          <div className="col-6 col-xl-3" key={key}>
            <div className="card h-100">
              <div className="card-body d-flex flex-column gap-2 p-3">
                <div className="d-flex align-items-center justify-content-between">
                  <small style={{ color: "var(--color-text-secondary)" }}>
                    {label}
                  </small>
                  <i
                    className={`ti ${icon}`}
                    style={{ fontSize: 18, color: "var(--color-primary)" }}
                  />
                </div>
                {loading ? (
                  <div className="placeholder-glow">
                    <span className="placeholder col-4" />
                  </div>
                ) : (
                  <span
                    className="fw-bold"
                    style={{
                      fontSize: "2rem",
                      color: "var(--color-text-primary)",
                      lineHeight: 1.1,
                    }}
                  >
                    {stats?.[key] ?? 0}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span>Recent Reports</span>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => navigate("/admin/complaints")}
          >
            View all
          </button>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Incident Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j}>
                          <div className="placeholder-glow">
                            <span className="placeholder col-8" />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : complaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      No complaints yet
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.78rem",
                          }}
                        >
                          #{c.id}
                        </span>
                      </td>
                      <td style={{ maxWidth: 180 }} className="text-truncate">
                        {c.title}
                      </td>
                      {/* <td>{c?.tags[0]?.name || '-'}</td> */}
                      <td>
                        {Array.isArray(c.tags) &&
                          c.tags.length > 0 &&
                          c.tags.map((tag, index) => (
                            <span key={index}>{tag.name}</span>
                          ))}
                      </td>
                      <td
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {/* {new Date(c.created_at).toLocaleDateString()} */}
                        {c.incident_date
                          ? new Date(c.incident_date).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`badge ${STATUS_BADGE[c.status] ?? "badge-closed"}`}
                        >
                          {c.status?.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/admin/complaints/${c.id}`)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
