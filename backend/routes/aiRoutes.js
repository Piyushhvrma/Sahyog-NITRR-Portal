const express = require("express");
const https = require("https");

const jwtAuth = require("../middleware/jwtAuth");

const {
  aiLimiter,
} = require("../middleware/rateLimiters");

const router = express.Router();

const MAX_MESSAGE_LENGTH = 2000;
const MAX_RESPONSE_SIZE = 1024 * 1024;
const GROQ_TIMEOUT_MS = 25 * 1000;

const requestGroq = (postData) => {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.groq.com",
        path: "/openai/v1/chat/completions",
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Bearer ${process.env.GROQ_API_KEY}`,

          "User-Agent":
            "SAHYOG-NIT-Raipur-Portal",

          "Content-Length":
            Buffer.byteLength(postData),
        },
      },

      (response) => {
        let responseBody = "";
        let responseSize = 0;

        response.on("data", (chunk) => {
          responseSize += chunk.length;

          if (
            responseSize >
            MAX_RESPONSE_SIZE
          ) {
            request.destroy(
              new Error(
                "Groq response exceeded allowed size."
              )
            );

            return;
          }

          responseBody += chunk;
        });

        response.on("end", () => {
          let parsedData;

          try {
            parsedData = JSON.parse(
              responseBody
            );
          } catch {
            return reject(
              new Error(
                "Invalid response received from AI provider."
              )
            );
          }

          if (
            response.statusCode < 200 ||
            response.statusCode >= 300
          ) {
            const providerError =
              new Error(
                "AI provider rejected the request."
              );

            providerError.statusCode =
              response.statusCode;

            providerError.providerCode =
              parsedData?.error?.code;

            return reject(providerError);
          }

          return resolve(parsedData);
        });
      }
    );

    request.setTimeout(
      GROQ_TIMEOUT_MS,
      () => {
        request.destroy(
          new Error(
            "AI provider request timed out."
          )
        );
      }
    );

    request.on("error", reject);

    request.write(postData);
    request.end();
  });
};

router.post(
  "/chat",
  jwtAuth,
  aiLimiter,

  async (req, res) => {
    try {
      if (!process.env.GROQ_API_KEY) {
        console.error(
          "AI configuration error: GROQ_API_KEY is missing."
        );

        return res.status(503).json({
          success: false,

          reply:
            "The AI assistant is temporarily unavailable. Please try again later.",
        });
      }

      const message =
        typeof req.body?.message ===
        "string"
          ? req.body.message.trim()
          : "";

      if (!message) {
        return res.status(400).json({
          success: false,

          message:
            "Message is required.",

          reply:
            "Please enter a message before sending.",
        });
      }

      if (
        message.length >
        MAX_MESSAGE_LENGTH
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`,

          reply:
            "Your message is too long. Please shorten it and try again.",
        });
      }

      const postData = JSON.stringify({
        model:
          "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",

            content: `
You are SAHYOG AI Assistant for students of NIT Raipur.

Your role:
- Be supportive, calm, respectful and student-friendly.
- Help with academic planning, coding guidance, productivity, career confusion, hostel adjustment, loneliness and everyday college concerns.
- Give practical, clear and concise suggestions.
- Never claim to be a doctor, counsellor, emergency service or replacement for professional support.
- Do not diagnose medical or mental-health conditions.
- If a student appears to be in immediate danger or describes self-harm, suicide, violence, abuse or a medical emergency, encourage them to contact local emergency services, trusted faculty, family, campus authorities or qualified professionals immediately.
- Do not ask for passwords, banking information, OTPs or unnecessary sensitive personal data.
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

      const groqResponse =
        await requestGroq(postData);

      const reply =
        groqResponse?.choices?.[0]
          ?.message?.content;

      if (
        typeof reply !== "string" ||
        !reply.trim()
      ) {
        console.error(
          "Groq returned an unexpected response structure."
        );

        return res.status(502).json({
          success: false,

          reply:
            "I could not generate a response right now. Please try again.",
        });
      }

      return res.status(200).json({
        success: true,
        reply: reply.trim(),
      });
    } catch (error) {
      console.error(
        "SAHYOG AI request failed:",
        {
          message: error.message,

          statusCode:
            error.statusCode || null,

          providerCode:
            error.providerCode || null,

          userId:
            req.user?.id || null,
        }
      );

      if (
        error.message.includes(
          "timed out"
        )
      ) {
        return res.status(504).json({
          success: false,

          reply:
            "The AI assistant is taking longer than expected. Please try again.",
        });
      }

      if (
        error.statusCode === 429
      ) {
        return res.status(503).json({
          success: false,

          reply:
            "The AI assistant is currently busy. Please try again shortly.",
        });
      }

      return res.status(502).json({
        success: false,

        reply:
          "I could not connect right now. Please try again later.",
      });
    }
  }
);

module.exports = router;