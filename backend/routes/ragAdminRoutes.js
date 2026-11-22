const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");
const rag = require("../services/ragClient.service");

const router = express.Router();
const guard = [
  jwtAuth,
  requireRole("admin", "superadmin"),
];

function fail(res, error) {
  const status =
    error instanceof rag.RagUnavailableError
      ? 502
      : 500;
  return res.status(status).json({
    message: "Knowledge service error",
    detail:
      process.env.NODE_ENV === "production"
        ? undefined
        : error.message,
  });
}

router.get(
  "/health",
  guard,
  async (_req, res) => {
    try {
      return res.json(await rag.health());
    } catch (error) {
      return fail(res, error);
    }
  }
);

router.get(
  "/stats",
  guard,
  async (_req, res) => {
    try {
      return res.json(await rag.getStats());
    } catch (error) {
      return fail(res, error);
    }
  }
);

router.get(
  "/documents",
  guard,
  async (req, res) => {
    try {
      const {
        status,
        approved,
        q,
        limit,
        skip,
      } = req.query;
      return res.json(
        await rag.listDocuments({
          status,
          approved,
          q,
          limit,
          skip,
        })
      );
    } catch (error) {
      return fail(res, error);
    }
  }
);

router.patch(
  "/documents/:fileId/approval",
  guard,
  async (req, res) => {
    try {
      if (
        typeof req.body.approved !== "boolean"
      ) {
        return res.status(400).json({
          message:
            '"approved" must be boolean',
        });
      }
      return res.json(
        await rag.setApproval(
          req.params.fileId,
          req.body.approved
        )
      );
    } catch (error) {
      return fail(res, error);
    }
  }
);

module.exports = router;
