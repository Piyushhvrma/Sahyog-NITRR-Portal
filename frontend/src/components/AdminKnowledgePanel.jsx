import { useCallback, useEffect, useState } from "react";
import {
  getKnowledgeStats,
  listKnowledgeDocuments,
  setDocumentApproval,
} from "../api/rag.api";

const STATUS_FILTERS = [
  "",
  "indexed",
  "failed",
  "pending",
  "duplicate",
  "deleted",
];

export default function AdminKnowledgePanel() {
  const [stats, setStats] = useState(null);
  const [docs, setDocs] = useState({
    total: 0,
    items: [],
  });
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextStats, nextDocs] =
        await Promise.all([
          getKnowledgeStats(),
          listKnowledgeDocuments({
            status: status || undefined,
            q: query || undefined,
            limit: 100,
          }),
        ]);
      setStats(nextStats);
      setDocs(nextDocs);
    } catch (loadError) {
      setError(
        loadError.message ||
          "Could not reach the knowledge service."
      );
    } finally {
      setLoading(false);
    }
  }, [status, query]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleApproval = async (document) => {
    setBusyId(document.document_id);
    try {
      await setDocumentApproval(
        document.document_id,
        !document.approved
      );
      await load();
    } catch (updateError) {
      setError(
        updateError.message ||
          "Document update failed."
      );
    } finally {
      setBusyId(null);
    }
  };

  const cards = stats
    ? [
        ["Total", stats.total_documents],
        ["Indexed", stats.indexed_documents],
        ["Approved", stats.approved_documents],
        ["Disabled", stats.disabled_documents],
        ["Failed", stats.failed_documents],
        ["Chunks", stats.total_chunks],
      ]
    : [];

  return (
    <section className="rag-admin">
      <header className="rag-admin-head">
        <h2>College Knowledge Base</h2>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="rag-admin-error" role="alert">
          {error}
        </div>
      )}

      {cards.length > 0 && (
        <div className="rag-admin-stats">
          {cards.map(([label, value]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      )}

      {stats?.last_sync && (
        <p className="rag-admin-sync">
          Last ingestion: <b>{stats.last_sync.status}</b>
          {stats.last_sync.finished_at
            ? ` · ${new Date(stats.last_sync.finished_at).toLocaleString()}`
            : ""}
          {stats.embedding_model
            ? ` · ${stats.embedding_model} (${stats.embedding_dimensions}d)`
            : ""}
        </p>
      )}

      <p className="rag-admin-note">
        New documents are ingested through the local Drive CLI
        using <code>python -m scripts.sync_drive</code>.
        This panel monitors documents and enables or disables approved knowledge.
      </p>

      <div className="rag-admin-filters">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
        >
          {STATUS_FILTERS.map((item) => (
            <option key={item} value={item}>
              {item || "All statuses"}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search file name…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="rag-admin-tablewrap">
        <table className="rag-admin-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Folder</th>
              <th>Status</th>
              <th>Chunks</th>
              <th>Student access</th>
            </tr>
          </thead>
          <tbody>
            {docs.items.length === 0 && !loading && (
              <tr>
                <td colSpan="5">No documents found.</td>
              </tr>
            )}
            {docs.items.map((document) => (
              <tr key={document.document_id}>
                <td title={document.error || ""}>
                  {document.file_name}
                  {document.error ? " ⚠️" : ""}
                </td>
                <td>{document.folder_path || "/"}</td>
                <td>{document.status}</td>
                <td>{document.chunk_count}</td>
                <td>
                  {document.status === "indexed" ? (
                    <button
                      type="button"
                      onClick={() => toggleApproval(document)}
                      disabled={busyId === document.document_id}
                    >
                      {document.approved
                        ? "Enabled — disable"
                        : "Disabled — enable"}
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rag-admin-count">
        Showing {docs.items.length} of {docs.total}
      </p>
    </section>
  );
}
