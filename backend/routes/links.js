const express = require("express");
const router = express.Router();

const Link = require("../models/Link");
const jwtAuth = require("../middleware/jwtAuth");
const requireRole = require("../middleware/roleAuth");

router.get("/", async (req, res) => {
  try {
    const { year, branch, semester } = req.query;

    const filter = {};
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;

    const links = await Link.find(filter).sort({ uploadedAt: -1 });

    res.json({ links });
  } catch (error) {
    console.error("Fetch links error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post(
  "/upload",
  jwtAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const { title, branch, year, semester, url } = req.body;

      if (!title || !branch || !year || !semester || !url) {
        return res.status(400).json({
          message: "All fields are required.",
        });
      }

      const newLink = new Link({
        title,
        branch,
        year,
        semester,
        url,
      });

      await newLink.save();

      res.status(201).json({
        message: "Link uploaded successfully!",
        link: newLink,
      });
    } catch (error) {
      console.error("Upload link error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

router.delete(
  "/:id",
  jwtAuth,
  requireRole("admin", "superadmin"),
  async (req, res) => {
    try {
      const link = await Link.findById(req.params.id);

      if (!link) {
        return res.status(404).json({ message: "Link not found" });
      }

      await Link.findByIdAndDelete(req.params.id);

      res.json({
        success: true,
        message: "Link deleted successfully",
      });
    } catch (error) {
      console.error("Delete link error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

module.exports = router;