const express = require("express");
const router = express.Router();
const SupportRequest = require("../models/SupportRequest");
const { Parser } = require("json2csv");

// =========================================================
// 1. POST: SUBMIT FORM DATA, SAVE TO DB & SEND EMAIL ALERTS
// =========================================================
router.post("/", async (req, res) => {
  try {
    const { name, contact, category, message } = req.body;

    // Validation guard clause
    if (!category || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // 1. Save data directly to MongoDB Atlas
    const supportRequest = new SupportRequest({
      name: name || "Anonymous Student",
      contact: contact || "Not Provided",
      category,
      message,
    });

    await supportRequest.save();

    // 2. Dispatch automated email alert via Brevo API
    const emailPayload = {
      sender: {
        name: "SAHYOG Support",
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          email: process.env.SUPPORT_RECEIVER,
        },
      ],
      subject: `❤️ New SAHYOG Help Request [${category}]`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ef4444; margin-top: 0;">❤️ New Student Support Request</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
          <p><b>Name / Alias:</b> ${name || "Anonymous Student"}</p>
          <p><b>Provided Contact Info:</b> ${contact || "Not Provided"}</p>
          <p><b>Problem Space:</b> <span style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${category}</span></p>
          
          <h3 style="color: #0f172a; margin-top: 20px;">Elaborated Situation Description:</h3>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; line-height: 1.6; border-left: 4px solid #ef4444; white-space: pre-wrap;">
            ${message}
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
            Submitted securely through the SAHYOG Help Portal
          </p>
        </div>
      `,
    };

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    return res.status(200).json({
      success: true,
      message: "Support request submitted successfully",
    });
  } catch (error) {
    console.error("Support Request Process Fault:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit request",
    });
  }
});

// =========================================================
// 2. GET: DOWNLOAD ENTIRE LOG SHEET AS EXCEL-READY CSV
// =========================================================
router.get("/download-sheet", async (req, res) => {
  try {
    const requests = await SupportRequest.find().sort({ createdAt: -1 }).lean();

    if (!requests || requests.length === 0) {
      return res.status(404).send(
        `<div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>No Submissions Found</h2>
          <p>There are no recorded help requests in MongoDB to compile yet.</p>
         </div>`
      );
    }

    const fields = ["_id", "name", "contact", "category", "message", "createdAt"];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(requests);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=Sahyog_Support_Submissions.csv");
    
    return res.status(200).send(csvData);
  } catch (error) {
    console.error("CSV Generation Crash:", error);
    return res.status(500).send("Critical error compiling your data sheet.");
  }
});

module.exports = router;