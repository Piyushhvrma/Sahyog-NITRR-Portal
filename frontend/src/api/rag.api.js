import { apiRequest } from "./client";

export const getKnowledgeStats = () =>
  apiRequest("/api/admin/rag/stats");

export const listKnowledgeDocuments = (params = {}) => {
  const query = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  ).toString();

  return apiRequest(
    `/api/admin/rag/documents${query ? `?${query}` : ""}`
  );
};

export const setDocumentApproval = (fileId, approved) =>
  apiRequest(
    `/api/admin/rag/documents/${encodeURIComponent(fileId)}/approval`,
    {
      method: "PATCH",
      body: { approved },
    }
  );
