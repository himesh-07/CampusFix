import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");

const CATEGORIES = ["Electrical", "Wi-Fi", "Furniture", "Washroom", "Other"];
const FILTERS = ["All", "Pending", "In Progress", "Resolved"];

const EMPTY_FORM = {
  building: "",
  room: "",
  category: "Electrical",
  description: ""
};

async function readResponse(res) {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

/* ---------- Inline Icons ---------- */

function CategoryIcon({ category }) {
  switch (category) {
    case "Electrical":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );

    case "Wi-Fi":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
      );

    case "Furniture":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
          <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
          <path d="M5 18v2" />
          <path d="M19 18v2" />
        </svg>
      );

    case "Washroom":
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
        </svg>
      );

    default:
      return (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
  }
}

/* ---------- Header ---------- */


function Header({ total, open, resolved, apiStatus }) {
  return (
    <header className="hero" 
  >
      <div className="hero-inner">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            C
          </span>
          <span className="brand-name">CampusFix</span>
         
        </div>

        <div className="hero-grid">
          <div>
            <h1>Something broken on campus? Tell us where.</h1>
            <p>
              Report a maintenance issue in under a minute and track it until
              it is resolved.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <strong>{total}</strong>
              <span>Total reported</span>
            </div>

            <div className="stat-card">
              <strong>{open}</strong>
              <span>Still open</span>
            </div>

            <div className="stat-card accent">
              <strong>{resolved}</strong>
              <span>Fixed</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Complaint Form ---------- */

function ComplaintForm({
  form,
  onChange,
  onCategorySelect,
  onSubmit,
  submitting,
  message,
  isError
}) {
  return (
    <section className="panel form-panel">
      <div className="form-header">
        <h2>Report an issue</h2>
        <p>Provide the exact location so technicians can find it fast.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <label className="field">
            <span className="field-label">Building / Block</span>
            <input
              name="building"
              placeholder="e.g. Library, CSE Block"
              value={form.building}
              onChange={onChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Room No.</span>
            <input
              name="room"
              placeholder="e.g. 204"
              value={form.room}
              onChange={onChange}
              required
            />
          </label>
        </div>

        <div className="field">
          <span className="field-label">Category</span>

          <div
            className="category-grid"
            role="radiogroup"
            aria-label="Issue category"
          >
            {CATEGORIES.map((category) => {
              const selected = form.category === category;

              return (
                <button
                  type="button"
                  key={category}
                  role="radio"
                  aria-checked={selected}
                  className={`cat-pill ${selected ? "selected" : ""}`}
                  onClick={() => onCategorySelect(category)}
                >
                  <CategoryIcon category={category} />
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <label className="field">
          <span className="field-label">What is the problem?</span>
          <textarea
            name="description"
            placeholder="Describe what is broken, flickering, leaking, or offline..."
            value={form.description}
            onChange={onChange}
            required
          />
        </label>

        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Submitting report...
            </>
          ) : (
            "Submit complaint"
          )}
        </button>
      </form>

      {message && (
        <p
          className={`form-message ${isError ? "error" : "success"}`}
          role="status"
        >
          {message}
        </p>
      )}
    </section>
  );
}

/* ---------- Complaint Card ---------- */

function ComplaintCard({ complaint, onUpdate, updating }) {
  const {
    complaint_id,
    category,
    building,
    room,
    description,
    status,
    resolution_note
  } = complaint;

  const [resolving, setResolving] = useState(false);
  const [noteInput, setNoteInput] = useState("");

  const currentStatus = status || "Pending";
  const statusSlug = currentStatus.replace(/\s+/g, "-").toLowerCase();
  const categorySlug = (category || "Other").toLowerCase();

  function handleActionClick() {
    if (currentStatus === "Pending") {
      onUpdate(complaint_id, "In Progress");
    } else if (currentStatus === "In Progress") {
      setResolving(true);
    }
  }

  function handleResolveSubmit(e) {
    e.preventDefault();

    const note = noteInput.trim();

    if (!note) return;

    onUpdate(complaint_id, "Resolved", note);
    setResolving(false);
    setNoteInput("");
  }

  return (
    <article className="card">
      <div className="card-top">
        <span className={`chip chip-${categorySlug}`}>
          <CategoryIcon category={category} />
          {category || "Other"}
        </span>

        <span className={`badge status-${statusSlug}`}>
          <span className="badge-dot" aria-hidden="true" />
          {currentStatus}
        </span>
      </div>

      <div className="card-location">
        <h3>{building}</h3>
        <span className="where">Room {room}</span>
      </div>

      <p className="desc">{description}</p>

      {resolution_note && (
        <p className="note">
          <strong>Resolution note:</strong> {resolution_note}
        </p>
      )}

      {resolving && (
        <form className="resolve-box" onSubmit={handleResolveSubmit}>
          <input
            type="text"
            placeholder="Enter what was fixed..."
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            required
            autoFocus
          />

          <div className="resolve-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setResolving(false);
                setNoteInput("");
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-action resolve"
              disabled={updating || !noteInput.trim()}
            >
              {updating ? "Saving..." : "Confirm fixed"}
            </button>
          </div>
        </form>
      )}

      <div className="card-bottom">
        <span className="id">#{complaint_id}</span>

        {currentStatus !== "Resolved" && !resolving && (
          <button
            type="button"
            className={`btn-action ${
              currentStatus === "Pending" ? "start" : "resolve"
            }`}
            disabled={updating}
            onClick={handleActionClick}
          >
            {updating ? (
              <span className="spinner dark" aria-hidden="true" />
            ) : currentStatus === "Pending" ? (
              "Start work"
            ) : (
              "Mark resolved"
            )}
          </button>
        )}
      </div>
    </article>
  );
}

/* ---------- Loading Skeleton ---------- */

function SkeletonList() {
  return (
    <>
      {[1, 2, 3].map((number) => (
        <div className="card skeleton" key={number} aria-hidden="true">
          <div className="sk-line short" />
          <div className="sk-line" />
          <div className="sk-line" />
        </div>
      ))}
    </>
  );
}

/* ---------- Main App ---------- */

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const loadComplaints = useCallback(async () => {
    if (!API) {
      setIsError(true);
      setMessage("API URL is missing. Check VITE_API_URL in your .env file.");
      setLoadingList(false);
      return;
    }

    try {
      const res = await fetch(API);
      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data.error || `Could not load complaints (HTTP ${res.status}).`
        );
      }

      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      setIsError(true);
      setMessage(
        err.message === "Failed to fetch"
          ? "Could not connect to the API. Check the Function URL and CORS settings."
          : err.message || "Could not load complaints."
      );
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  function change(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  }

  function selectCategory(category) {
    setForm((previous) => ({
      ...previous,
      category
    }));
  }

  async function submit(e) {
    e.preventDefault();

    if (!API) {
      setIsError(true);
      setMessage("API URL is missing. Check VITE_API_URL in your .env file.");
      return;
    }

    setSubmitting(true);
    setIsError(false);
    setMessage("");

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data.error || `Submission failed (HTTP ${res.status}).`
        );
      }

      setForm(EMPTY_FORM);
      setIsError(false);
      setMessage(
        data.complaint_id
          ? `Complaint submitted! Tracking ID: ${data.complaint_id}`
          : "Complaint submitted successfully."
      );

      await loadComplaints();
    } catch (err) {
      setIsError(true);
      setMessage(
        err.message === "Failed to fetch"
          ? "Could not connect to the API. Check the Function URL and CORS settings."
          : err.message || "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status, note = "") {
    if (!API) {
      setIsError(true);
      setMessage("API URL is missing. Check VITE_API_URL in your .env file.");
      return;
    }

    setUpdatingId(id);
    setIsError(false);
    setMessage("");

    try {
      const res = await fetch(API, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complaint_id: id,
          status,
          resolution_note: note
        })
      });

      const data = await readResponse(res);

      if (!res.ok) {
        throw new Error(
          data.error || `Could not update complaint (HTTP ${res.status}).`
        );
      }

      setIsError(false);
      setMessage("Complaint status updated.");
      await loadComplaints();
    } catch (err) {
      setIsError(true);
      setApiStatus("disconnected");
      setMessage(
        err.message === "Failed to fetch"
          ? "Could not connect to the API. Check the Function URL and CORS settings."
          : err.message || "Unable to update complaint status."
      );
    } finally {
      setUpdatingId(null);
      setLoadingList(false);
    }
  }

  const counts = useMemo(() => {
    const result = {
      All: complaints.length
    };

    FILTERS.slice(1).forEach((status) => {
      result[status] = complaints.filter(
        (complaint) => (complaint.status || "Pending") === status
      ).length;
    });

    return result;
  }, [complaints]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesStatus =
        filter === "All" ||
        (complaint.status || "Pending") === filter;

      const matchesSearch =
        !query ||
        (complaint.building || "").toLowerCase().includes(query) ||
        (complaint.room || "").toLowerCase().includes(query) ||
        (complaint.description || "").toLowerCase().includes(query) ||
        (complaint.category || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [complaints, filter, search]);

  return (
    <>
      <Header
        total={counts.All}
        open={counts.All - (counts.Resolved || 0)}
        resolved={counts.Resolved || 0}
      />

      <main className="layout">
        <ComplaintForm
          form={form}
          onChange={change}
          onCategorySelect={selectCategory}
          onSubmit={submit}
          submitting={submitting}
          message={message}
          isError={isError}
        />

        <section className="list-panel">
          <div className="list-head">
            <h2>Campus complaints</h2>
          </div>

          <div className="toolbar">
            <div
              className="filters"
              role="tablist"
              aria-label="Filter by status"
            >
              {FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={filter === status}
                  className={`filter ${
                    filter === status ? "active" : ""
                  }`}
                  onClick={() => setFilter(status)}
                >
                  {status} <span>{counts[status] || 0}</span>
                </button>
              ))}
            </div>

            <div className="search-box">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="search"
                placeholder="Search block, room, issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search complaints"
              />
            </div>
          </div>

          {loadingList ? (
            <SkeletonList />
          ) : visible.length === 0 ? (
            <div className="empty">
              <div className="empty-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>

              <p>No matching complaints</p>

              <span>
                {search
                  ? "Try clearing your search filter."
                  : filter === "All"
                  ? "Use the form on the left to report the first issue."
                  : `No complaints are currently marked "${filter}".`}
              </span>
            </div>
          ) : (
            visible.map((complaint) => (
              <ComplaintCard
                key={complaint.complaint_id}
                complaint={complaint}
                onUpdate={updateStatus}
                updating={updatingId === complaint.complaint_id}
              />
            ))
          )}
        </section>
      </main>
    </>
  );
}