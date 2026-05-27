const express = require("express");
const axios = require("axios"); // ✅ Swapped to stable Axios

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ✅ FIXED: Axios structure handles cross-origin cloud API handshakes perfectly on Render
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are SAHYOG AI Assistant for NIT Raipur students.

Behave:
- supportive
- empathetic
- helpful
- student friendly
- emotionally calm
- motivational

Help students with:
- stress
- academics
- emotional support
- loneliness
- career confusion
- coding guidance
- productivity
- hostel issues

Keep responses practical and supportive.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    // ✅ FIXED: Axios data parsing layer reads headers automatically
    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "Sorry, I could not respond.";

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    // This logs the full error trace to your Render panel console for absolute clarity
    console.error("Groq AI Error Trace:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "AI request failed",
    });
  }
});

module.exports = router;