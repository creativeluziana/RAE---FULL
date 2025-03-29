// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up multer to store files in the "uploads/" folder
const upload = multer({ dest: "uploads/" });

// In-memory greeting tracker
const greetedUsers = {};

// Gemini key from .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not defined in environment variables");
  process.exit(1);
}
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Hugging Face API token for image generation
const HF_API_TOKEN = process.env.HF_API_TOKEN;
if (!HF_API_TOKEN) {
  console.error("HF_API_TOKEN is not defined in environment variables");
  process.exit(1);
}

// Utility: Format bold/lists
const formatBotResponse = (response) => {
  const bolded = response.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  const lines = bolded.split(/\n+/);
  let out = "";
  let inOl = false;
  let inUl = false;

  lines.forEach((line) => {
    const trim = line.trim();
    if (/^\d+\.\s/.test(trim)) {
      if (!inOl) { out += "<ol>"; inOl = true; }
      const content = trim.replace(/^\d+\.\s*/, "");
      out += `<li>${content}</li>`;
    } else if (/^[*-]\s/.test(trim)) {
      if (!inUl) { out += "<ul>"; inUl = true; }
      const content = trim.replace(/^[*-]\s*/, "");
      out += `<li>${content}</li>`;
    } else {
      if (inOl) { out += "</ol>"; inOl = false; }
      if (inUl) { out += "</ul>"; inUl = false; }
      out += `<p>${trim}</p>`;
    }
  });

  if (inOl) out += "</ol>";
  if (inUl) out += "</ul>";
  return out;
};

// Check server
app.get("/", (_req, res) => {
  res.send("Server is running!");
});

// ----------------------
// 1) Chat Endpoint
// ----------------------
app.post("/api/chat", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    // Simple greeting logic
    const lowerMsg = message.toLowerCase();
    if ((lowerMsg.includes("hello") || lowerMsg.includes("hii")) && !greetedUsers[userId]) {
      greetedUsers[userId] = true;
      const styledGreeting = `
        <div style="font-family: Orbitron, sans-serif; color: #0061f2; font-size: 1.5rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
          Welcome to RAE!!
        </div>
        <p style="margin: 0;">How can I assist you today?</p>
      `;
      return res.json({ reply: styledGreeting });
    }

    // IMPORTANT: pass entire conversation as-is (no extra "User:" prefix)
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    const data = await response.json();
    let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    botReply = formatBotResponse(botReply);
    return res.json({ reply: botReply });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Failed to connect to Gemini API." });
  }
});

// ----------------------
// 2) PDF Chat Endpoint
// ----------------------
app.post("/api/chat/pdf", upload.single("pdf"), async (req, res) => {
  const { userId, message } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  try {
    if (!req.file) {
      return res.json({ reply: "No PDF file uploaded. Please upload a PDF." });
    }
    const pdfPath = req.file.path;
    const pdfParse = require("pdf-parse");
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = pdfData.text || "";

    fs.unlinkSync(pdfPath); // remove file

    if (!pdfText.trim()) {
      return res.status(400).json({ error: "No text extracted from the PDF." });
    }

    // Combine conversation + PDF content
    const combined = `${message}\n\nPDF Content:\n${pdfText}`;
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: combined }],
          },
        ],
      }),
    });

    const data = await response.json();
    let botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.";
    botReply = formatBotResponse(botReply);
    return res.json({ reply: botReply });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return res.status(500).json({ error: "Failed to process PDF." });
  }
});

// ----------------------
// 3) Image Endpoint
// ----------------------
app.post("/api/chat/image", upload.single("image"), async (req, res) => {
  console.log("Reached /api/chat/image");
  try {
    if (!req.file) {
      console.log("No file uploaded.");
      return res.status(400).json({ reply: "No image file uploaded." });
    }
    console.log("Received image file:", req.file.originalname);

    // Dummy analysis
    const analysis = "Dummy image analysis: The image is nice.";

    // Cleanup
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error removing uploaded file:", err);
    });

    return res.json({ reply: analysis });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return res.status(500).json({ reply: "An error occurred during image analysis." });
  }
});

// ----------------------
// 4) Image Generation Endpoint 
// ----------------------
app.post("/api/chat/image-gen", async (req, res) => {
  const { userId, prompt } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  
  try {
    // First generate a detailed version of the prompt with Gemini
    const geminiProUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`;
    
    const promptResponse = await fetch(geminiProUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `Create a highly detailed image generation prompt based on this basic idea: "${prompt}". 
                      Enhance it with artistic details, lighting, style, atmosphere, but keep the core idea.
                      Keep it to a maximum of 75 words.` }
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      }),
    });
    
    const promptData = await promptResponse.json();
    const enhancedPrompt = promptData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    
    // Use Hugging Face's Stable Diffusion API to generate the image
    console.log("Generating image with prompt:", enhancedPrompt);
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face error: ${response.status} ${response.statusText}`);
    }

    // The model returns raw binary data, so read it as an arrayBuffer
    const arrayBuffer = await response.arrayBuffer();

    // Convert raw bytes to base64
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    // Create a data URL for the image
    const imageUrl = `data:image/png;base64,${base64String}`;
    
    // Create response HTML
    const responseHTML = `
      <div>
        <p>I've generated this image based on your prompt:</p>
        <img src="${imageUrl}" alt="Generated image" style="width: 100%; max-width: 512px; border-radius: 8px; margin: 15px 0;" />
        <p><em>Prompt used: ${enhancedPrompt}</em></p>
      </div>
    `;
    
    return res.json({ 
      reply: formatBotResponse(responseHTML),
      imageUrl: imageUrl 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ 
      error: "Failed to generate image.",
      reply: formatBotResponse(`<p>Sorry, I encountered an error while generating the image: ${error.message}</p>`)
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
