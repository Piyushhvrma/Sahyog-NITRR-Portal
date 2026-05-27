const express = require("express");
const https = require("https"); // ✅ Built-in core module. No installation required!

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

    // Structure the raw payload exactly how Groq's engine needs it
    const postData = JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are SAHYOG AI Assistant for NIT Raipur students.
Behave: supportive, empathetic, helpful, student friendly, emotionally calm, motivational.
Help students with: stress, academics, emotional support, loneliness, career confusion, coding guidance, productivity, hostel issues.
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
    });

    // Configure secure network parameters 
    const options = {
      hostname: "api.groq.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    // Execute direct streaming handshake with Groq Cloud Core
    const apiRequest = () => {
      return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
          let chunkData = "";
          response.on("data", (chunk) => { chunkData += chunk; });
          response.on("end", () => { resolve(JSON.parse(chunkData)); });
        });

        request.on("error", (error) => { reject(error); });
        request.write(postData);
        request.end();
      });
    };

    const groqResponse = await apiRequest();
    
    const reply =
      groqResponse?.choices?.[0]?.message?.content ||
      "Sorry, I could not process that response.";

    res.status(200).json({
      success: true,
      reply,
    });

  } catch (error) {
    console.error("Groq Native Engine Error:", error.message);
    res.status(500).json({
      success: false,
      message: "AI request failed",
    });
  }
});

module.exports = router;