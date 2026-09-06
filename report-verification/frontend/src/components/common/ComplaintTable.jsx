import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "./Pagination";

const STATUS_BADGE = {
  pending: "badge-pending",
  ongoing: "badge-review",
  approved: "badge-approved",
  rejected: "badge-rejected",
};

const STATUSES = ["pending", "ongoing", "approved", "rejected"];
const CATEGORIES = [
  "Cyberbullying",
  "Online Harassment",
  "Identity Theft",
  "Financial Fraud",
  "Hacking",
  "Child Exploitation",
  "Sextortion",
  "Fake News / Misinformation",
  "Other",
];

const PAGE_SIZE = 10;

export default function ComplaintTable({ fetchFn, actionLabel, actionPath }) {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
    category: "",
    search: "",
    aiFlagged: "",
  });
  const [applied, setApplied] = useState(filters);

  const load = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const data = await fetchFn({ ...params, page, page_size: PAGE_SIZE });
        setComplaints(data.results ?? []);
        setCount(data.count ?? 0);
      } catch (err) {
        toast.error(err.message || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, page],
  );

  useEffect(() => {
    load(applied);
  }, [applied, page]);

  const applyFilters = () => {
    setPage(1);
    setApplied({ ...filters });
  };

  const clearFilters = () => {
    const empty = {
      fromDate: "",
      toDate: "",
      status: "",
      category: "",
      search: "",
      aiFlagged: "",
    };
    setFilters(empty);
    setApplied(empty);
    setPage(1);
  };

  return (
    <div className="fade-in">
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-sm-6 col-lg-2">
              <label className="form-label">From date</label>
              <input
                type="date"
                className="form-control"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, fromDate: e.target.value }))
                }
              />
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label">To date</label>
              <input
                type="date"
                className="form-control"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, toDate: e.target.value }))
                }
              />
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, category: e.target.value }))
                }
              >
                <option value="">All</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-sm-6 col-lg-2">
              <label className="form-label">AI verdict</label>
              <select
                className="form-select"
                value={filters.aiFlagged}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, aiFlagged: e.target.value }))
                }
              >
                <option value="">All</option>
                <option value="true">AI manipulated</option>
                <option value="false">Authentic</option>
              </select>
            </div>
            <div className="col-lg-2 d-flex gap-2">
              <button
                className="btn btn-primary btn-sm flex-grow-1"
                onClick={applyFilters}
              >
                <i className="ti ti-filter me-1" /> Filter
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={clearFilters}
              >
                <i className="ti ti-x" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body pb-0">
          <div className="d-flex justify-content-end">
            <div className="input-group" style={{ maxWidth: 260 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
              <button className="btn btn-primary" onClick={applyFilters}>
                <i className="ti ti-search" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card-body p-0 mt-3">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Title</th>
                  <th>Incident Date</th>
                  <th>Category</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
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
                      className="text-center py-5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <i
                        className="ti ti-inbox d-block mb-2"
                        style={{ fontSize: 32 }}
                      />
                      No complaints found
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
                      <td style={{ maxWidth: 200 }} className="text-truncate">
                        {c.title}
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
                      {/* <td>{c.category}</td> */}
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
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString()
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
                          onClick={() => navigate(`${actionPath}/${c.id}`)}
                        >
                          {actionLabel}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            count={count}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
