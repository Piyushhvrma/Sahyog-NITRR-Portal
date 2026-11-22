import { useState } from "react";

export default function SourceCitations({ sources }) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="rag-sources">
      <button
        type="button"
        className="rag-sources-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        Sources ({sources.length}) {open ? "▲" : "▼"}
      </button>

      {open && (
        <ol className="rag-sources-list">
          {sources.map((source) => (
            <li key={source.id} className="rag-sources-item">
              <span>[{source.id}]</span>{" "}
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.documentName}
                </a>
              ) : (
                <strong>{source.documentName}</strong>
              )}
              {source.pageNumber ? (
                <span> · page {source.pageNumber}</span>
              ) : null}
              {source.sectionHeading ? (
                <span> · {source.sectionHeading}</span>
              ) : null}
              {source.snippet ? (
                <div className="rag-source-snippet">
                  {source.snippet}…
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
