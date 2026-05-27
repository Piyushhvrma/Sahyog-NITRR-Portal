const express = require("express");
const https = require("https"); 

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
      path: "/openai/v1/chat/completions", // ✅ FIXED: Added required /openai prefix segment
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    // Execute direct streaming handshake with Groq Cloud Core
    const apiRequest = () => {
      return new Promise((resolve, reject) => {
        const request = https.request(options, (response) => {
          let chunkData = "";
          response.on("data", (chunk) => { chunkData += chunk; });
          response.on("end", () => { 
            try {
              const parsedData = JSON.parse(chunkData);
              resolve(parsedData);
            } catch (parseError) {
              reject(new Error(`JSON Parse Failure: ${chunkData.substring(0, 100)}`));
            }
          });
        });

        request.on("error", (error) => { reject(error); });
        request.write(postData);
        request.end();
      });
    };

    const groqResponse = await apiRequest();
    
    // CHECK FOR API ERROR OBJECT
    if (groqResponse?.error) {
      return res.status(200).json({
        success: true,
        reply: `❌ Groq API Rejection: [${groqResponse.error.code || "NO_CODE"}] -> ${groqResponse.error.message}`,
      });
    }

    // Process and return the message content payload cleanly
    const reply = groqResponse?.choices?.[0]?.message?.content;

    if (reply) {
      return res.status(200).json({
        success: true,
        reply,
      });
    } else {
      return res.status(200).json({
        success: true,
        reply: `⚠️ Unexpected Payload Structure: ${JSON.stringify(groqResponse)}`,
      });
    }

  } catch (error) {
    console.error("Groq Native Engine Error:", error.message);
    return res.status(500).json({
      success: false,
      reply: `🚨 Server Crash Trace: ${error.message}`,
    });
  }
});

module.exports = router;