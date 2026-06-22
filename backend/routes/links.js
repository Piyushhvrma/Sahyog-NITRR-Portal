const express = require('express');
const router = express.Router();

// --- THIS IS THE FIX ---
// 1. Import the model with the correct case (assuming 'Link.js')
const Link = require('../models/Link');
// 2. Destructure the import to get the function, not the object
const { adminAuth } = require('../middleware/auth');
// --- END FIX ---

router.get('/', async (req, res) => {
  try {
    const { year, branch, semester } = req.query;
    const filter = {};
    if (year) filter.year = year;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = semester;
    const links = await Link.find(filter).sort({ uploadedAt: -1 });
    res.json({ links });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// This route will now work because 'adminAuth' is a function
router.post('/upload', adminAuth, async (req, res) => {
  try {
    const { title, branch, year, semester, url } = req.body;
    const newLink = new Link({ title, branch, year, semester, url });
    await newLink.save();
    res.status(201).json({ message: 'Link uploaded successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/links/:id - Admin deletes a PYQ/Note link
router.delete("/:id", adminAuth, async (req, res) => {
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
    console.error("Link Delete Error:", error);
    res.status(500).json({ message: "Server Error while deleting link" });
  }
});

module.exports = router;