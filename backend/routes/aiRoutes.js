const express = require("express");

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

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
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
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I could not respond.";

    res.status(200).json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("Groq AI Error:", error);

    res.status(500).json({
      success: false,
      message: "AI request failed",
    });
  }
});

module.exports = router;