// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const fetch = require("node-fetch");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(bodyParser.json());

// Set up multer to store files in the "uploads/" folder
const upload = multer({ dest: "uploads/" });

// In-memory greeting tracker
const greetedUsers = {};

// Get API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL_NAME = "gemini-1.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
const HF_API_TOKEN = process.env.HUGGING_FACE_API_KEY;
const CORE_API_KEY = process.env.CORE_API_KEY;

// Initialize Gemini AI with error handling
let genAI;
try {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not found in environment variables");
  }
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
} catch (error) {
  console.error("Error initializing Gemini AI:", error);
}

// Helper function to delay execution (for rate limiting)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to validate API keys
const validateAPIKeys = () => {
  const missingKeys = [];
  if (!GEMINI_API_KEY) missingKeys.push('GEMINI_API_KEY');
  if (!HF_API_TOKEN) missingKeys.push('HUGGING_FACE_API_KEY');
  return missingKeys;
};

// Helper function to retry failed requests
const retryRequest = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Helper function to extract DOI from various URL formats
function extractDOI(url) {
    if (!url) return null;
    
    // Try to match DOI patterns
    const doiPatterns = [
        /doi\.org\/([^\/\s]+\/[^\/\s]+)$/,
        /doi:\s*([^\/\s]+\/[^\/\s]+)/,
        /([^\/\s]+\/[^\/\s]+)$/
    ];

    for (const pattern of doiPatterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
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

// Basic chat endpoint with improved error handling
app.post("/api/chat", async (req, res) => {
  const { userId, message } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: "Valid message is required." });
  }

  try {
    if (!genAI) {
      throw new Error("AI service not properly initialized");
    }

    console.log("Received message:", message);

    // Use the Gemini AI client with gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
    
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini API response:", text);

    const botReply = formatBotResponse(text);
    return res.json({ reply: botReply });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ 
      error: "Failed to process request", 
      details: error.message,
      timestamp: new Date().toISOString()
    });
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

    // Use the Gemini AI client with gemini-1.5-flash for PDF processing
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL_NAME });
    const combined = `${message}\n\nPDF Content:\n${pdfText}`;
    
    const result = await model.generateContent(combined);
    const response = await result.response;
    const text = response.text();
    
    const botReply = formatBotResponse(text);
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
  try {
    const { userId, prompt } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Validate API keys
    const missingKeys = validateAPIKeys();
    if (missingKeys.length > 0) {
      return res.status(500).json({ 
        error: `Missing required API keys: ${missingKeys.join(', ')}`,
        reply: formatBotResponse("<p>Sorry, image generation is currently unavailable due to missing API configuration.</p>")
      });
    }

    // Generate enhanced prompt using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const promptResult = await model.generateContent(`Create a detailed image generation prompt based on this idea: "${prompt}". 
      Focus on visual details, style, and atmosphere while keeping the core concept. 
      Keep it under 75 words and make it suitable for image generation.`);
    const enhancedPrompt = promptResult.response.text();
    
    console.log("Enhanced prompt:", enhancedPrompt);

    // Call Hugging Face API with retry mechanism
    const imageResponse = await retryRequest(async () => {
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
            options: {
              wait_for_model: true,
              use_cache: false
            }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      return response;
    });

    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${base64String}`;

    const responseHTML = `
      <div>
        <p>I've generated this image based on your prompt:</p>
        <img src="${imageUrl}" alt="Generated image" style="width: 100%; max-width: 512px; border-radius: 8px; margin: 15px 0;" />
        <p><em>Enhanced prompt used: ${enhancedPrompt}</em></p>
      </div>
    `;

    return res.json({
      reply: formatBotResponse(responseHTML),
      imageUrl: imageUrl,
      success: true
    });

  } catch (error) {
    console.error("Error in image generation:", error);
    
    let errorMessage = "Sorry, I encountered an error while generating the image.";
    if (error.message.includes("429")) {
      errorMessage = "The image generation service is currently busy. Please try again in a few moments.";
    } else if (error.message.includes("503")) {
      errorMessage = "The image generation service is temporarily unavailable. Please try again later.";
    }

    return res.status(500).json({
      error: "Image generation failed",
      reply: formatBotResponse(`<p>${errorMessage}</p><p><em>Technical details: ${error.message}</em></p>`),
      success: false
    });
  }
});

// Endpoint for paper summarization
app.post("/api/summarize", async (req, res) => {
    const { title, authors, year, link } = req.body;
    
    try {
        let abstract = null;
        let source = null;
        let paperDetails = null;

        // Configure axios request with timeout and retry logic
        const axiosConfig = {
            timeout: 10000,
            retry: 3,
            retryDelay: (retryCount) => {
                return retryCount * 2000;
            }
        };

        // Try to get paper details from Semantic Scholar with retry
        const fetchFromSemanticScholar = async (retries = 0) => {
            try {
                const searchResponse = await axios.get(
                    `https://api.semanticscholar.org/graph/v1/paper/search`, {
                    ...axiosConfig,
                    params: {
                        query: title,
                        fields: 'paperId,title,abstract,year,authors,citationCount',
                        limit: 5
                    }
                });
                return searchResponse;
            } catch (error) {
                if (retries < axiosConfig.retry && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
                    console.log(`Retry attempt ${retries + 1} for paper search`);
                    await new Promise(resolve => setTimeout(resolve, axiosConfig.retryDelay(retries)));
                    return fetchFromSemanticScholar(retries + 1);
                }
                throw error;
            }
        };

        try {
            const searchResponse = await fetchFromSemanticScholar();
            const papers = searchResponse.data?.data || [];
            const matchingPaper = papers.find(p => {
                const titleMatch = p.title.toLowerCase() === title.toLowerCase();
                const yearMatch = p.year === parseInt(year);
                return titleMatch && yearMatch;
            }) || papers[0];

            if (matchingPaper?.paperId) {
                const paperResponse = await axios.get(
                    `https://api.semanticscholar.org/graph/v1/paper/${matchingPaper.paperId}`, {
                    ...axiosConfig,
                    params: {
                        fields: 'title,abstract,year,authors,citationCount,venue,publicationVenue,openAccessPdf'
                    }
                });

                if (paperResponse.data) {
                    paperDetails = paperResponse.data;
                    if (paperDetails.abstract) {
                        abstract = paperDetails.abstract;
                        source = "Semantic Scholar";
                    }
                }
            }
        } catch (error) {
            console.log("Semantic Scholar fetch failed:", error.message);
        }

        if (abstract) {
            const formattedResponse = `📑 OFFICIAL ABSTRACT

${abstract}

---
Paper Details:
• Title: ${paperDetails.title}
• Authors: ${paperDetails.authors?.map(a => a.name).join(", ")}
• Year: ${paperDetails.year}
${paperDetails.venue ? `• Venue: ${paperDetails.venue}` : ''}
${paperDetails.citationCount ? `• Citations: ${paperDetails.citationCount}` : ''}
${paperDetails.openAccessPdf ? `\n🔓 Open Access PDF available at: ${paperDetails.openAccessPdf.url}` : ''}

Source: Semantic Scholar
Retrieved: ${new Date().toLocaleDateString()}`;

            res.json({ 
                summary: formattedResponse,
                success: true 
            });
            return;
        }

        // If no abstract found, use Gemini for analysis
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Analyze this research paper:
Title: "${title}"
Year: ${year}
Authors: ${authors}

Please provide a structured analysis in the following format:

📌 RESEARCH OVERVIEW
• Field of Study:
• Main Research Question:
• Key Objectives:

🔍 POTENTIAL METHODOLOGY
• Likely Research Methods:
• Possible Data Sources:
• Expected Approach:

💡 EXPECTED CONTRIBUTIONS
• Potential Findings:
• Likely Impact:
• Applications:

Note: This is an AI analysis based on the paper's metadata as the full text was not accessible.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiAnalysis = response.text();

        res.json({ 
            summary: `⚠️ ABSTRACT NOT AVAILABLE

We could not retrieve the official abstract for this paper. Below is an AI-generated analysis based on the available metadata:

${aiAnalysis}

---
Paper Details:
• Title: ${title}
• Authors: ${authors}
• Year: ${year}
• Note: This is an AI-generated analysis, not the official abstract.
• Last Updated: ${new Date().toLocaleDateString()}`,
            success: true
        });

    } catch (error) {
        console.error("Error in summarization endpoint:", error);
        const errorMessage = error.response?.status === 504 
            ? "The paper service is temporarily unavailable. Please try again in a moment."
            : "Failed to retrieve or generate summary. Please try again later.";
            
        res.status(error.response?.status || 500).json({ 
            error: errorMessage,
            details: error.message,
            success: false
        });
    }
});

// Helper function to fetch from Semantic Scholar
const fetchSemanticScholarPapers = async (query, maxResults = 10) => {
    try {
        const axiosConfig = {
            timeout: 10000,
            retry: 3,
            retryDelay: (retryCount) => {
                return retryCount * 2000;
            }
        };

        // Fetch with retry logic
        const fetchWithRetry = async (retries = 0) => {
            try {
                const response = await axios.get(
                    `https://api.semanticscholar.org/graph/v1/paper/search`, {
                    ...axiosConfig,
                    params: {
                        query: query,
                        fields: 'title,abstract,year,authors,citationCount,url,venue',
                        limit: maxResults
                    }
                });
                return response;
            } catch (error) {
                if (retries < axiosConfig.retry && (error.code === 'ECONNABORTED' || error.response?.status === 504)) {
                    console.log(`Retry attempt ${retries + 1} for Semantic Scholar API`);
                    await new Promise(resolve => setTimeout(resolve, axiosConfig.retryDelay(retries)));
                    return fetchWithRetry(retries + 1);
                }
                throw error;
            }
        };

        const response = await fetchWithRetry();
        return response.data.data.map(paper => ({
            title: paper.title,
            authors: paper.authors?.map(a => a.name).join(", ") || "Unknown",
            year: paper.year || "Unknown",
            abstract: paper.abstract,
            citations: paper.citationCount || 0,
            venue: paper.venue,
            link: paper.url,
            source: 'Semantic Scholar'
        }));
    } catch (error) {
        console.error('Error fetching from Semantic Scholar:', error);
        return [];
    }
};

// Helper function to fetch from arXiv
const fetchArXivPapers = async (query, maxResults = 10) => {
    try {
        const encodedQuery = encodeURIComponent(query.replace(/\s+/g, '+'));
        const response = await axios.get(
            `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`,
            { timeout: 10000 }
        );

        const papers = [];
        const xmlData = response.data;
        
        // Basic XML parsing
        const entries = xmlData.split('<entry>').slice(1);
        for (const entry of entries) {
            const title = entry.match(/<title>(.*?)<\/title>/s)?.[1]?.trim() || '';
            const abstract = entry.match(/<summary>(.*?)<\/summary>/s)?.[1]?.trim() || '';
            const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || '';
            const year = new Date(published).getFullYear();
            const authors = entry.match(/<author>(.*?)<\/author>/g)?.map(
                author => author.match(/<name>(.*?)<\/name>/)?.[1] || ''
            ).join(', ') || '';
            const link = entry.match(/<id>(.*?)<\/id>/)?.[1] || '';

            papers.push({
                title,
                abstract,
                year,
                authors,
                link,
                source: 'arXiv',
                venue: 'arXiv'
            });
        }
        return papers;
    } catch (error) {
        console.error('Error fetching from arXiv:', error);
        return [];
    }
};

// Helper function to fetch from CORE
const fetchCorePapers = async (query, maxResults = 10) => {
    if (!CORE_API_KEY) {
        console.log('CORE API key not configured');
        return [];
    }

    try {
        const response = await axios.get(
            'https://api.core.ac.uk/v3/search/works', {
            params: {
                q: query,
                limit: maxResults,
                offset: 0,
                scroll: true
            },
            headers: {
                'Authorization': `Bearer ${CORE_API_KEY}`
            },
            timeout: 10000
        });

        return response.data.results.map(paper => ({
            title: paper.title || 'Untitled',
            authors: paper.authors?.map(a => a.name).join(', ') || 'Unknown',
            year: paper.yearPublished,
            abstract: paper.abstract,
            link: paper.downloadUrl || (paper.doi ? `https://doi.org/${paper.doi}` : null),
            source: 'CORE',
            venue: paper.publisher || 'CORE'
        }));
    } catch (error) {
        console.error('Error fetching from CORE:', error);
        return [];
    }
};

// Modified research papers endpoint to fetch from multiple sources
app.get("/api/research", async (req, res) => {
    const { field, page = 1, limit = 5, year } = req.query;
    const offset = (page - 1) * limit;
    const maxResultsPerSource = 20; // Fetch more results to allow for filtering

    try {
        console.log('Fetching papers for query:', field);
        
        // Fetch papers from multiple sources in parallel
        const [semanticScholarPapers, arXivPapers, corePapers] = await Promise.allSettled([
            fetchSemanticScholarPapers(field, maxResultsPerSource),
            fetchArXivPapers(field, maxResultsPerSource),
            fetchCorePapers(field, maxResultsPerSource)
        ]);

        // Combine results from all sources
        let allPapers = [
            ...(semanticScholarPapers.status === 'fulfilled' ? semanticScholarPapers.value : []),
            ...(arXivPapers.status === 'fulfilled' ? arXivPapers.value : []),
            ...(corePapers.status === 'fulfilled' ? corePapers.value : [])
        ];

        console.log(`Found papers - Semantic Scholar: ${semanticScholarPapers.status === 'fulfilled' ? semanticScholarPapers.value.length : 0}, arXiv: ${arXivPapers.status === 'fulfilled' ? arXivPapers.value.length : 0}, CORE: ${corePapers.status === 'fulfilled' ? corePapers.value.length : 0}`);

        // Filter by year if specified
        if (year) {
            allPapers = allPapers.filter(paper => paper.year === parseInt(year));
        }

        // Remove duplicates based on title similarity
        const uniquePapers = allPapers.reduce((acc, current) => {
            const duplicate = acc.find(paper => 
                paper.title.toLowerCase().replace(/[^\w\s]/g, '') === 
                current.title.toLowerCase().replace(/[^\w\s]/g, '')
            );
            if (!duplicate) {
                acc.push(current);
            }
            return acc;
        }, []);

        // Sort by year (newest first) and then by citations if available
        uniquePapers.sort((a, b) => {
            if (a.year !== b.year) {
                return (b.year || 0) - (a.year || 0);
            }
            return (b.citations || 0) - (a.citations || 0);
        });

        // Calculate total pages
        const totalPages = Math.ceil(uniquePapers.length / limit);

        // Get the papers for the current page
        const paginatedPapers = uniquePapers.slice(offset, offset + limit);

        res.json({
            papers: paginatedPapers,
            totalPages,
            currentPage: parseInt(page),
            success: true,
            sources: {
                semanticScholar: semanticScholarPapers.status === 'fulfilled',
                arXiv: arXivPapers.status === 'fulfilled',
                core: corePapers.status === 'fulfilled'
            },
            totalResults: uniquePapers.length
        });

    } catch (error) {
        console.error("Error fetching research papers:", error);
        const errorMessage = error.response?.status === 504 
            ? "Some research services are temporarily unavailable. Showing partial results."
            : "Failed to fetch some papers. Showing available results.";
            
        res.status(200).json({ 
            papers: [],
            error: errorMessage,
            details: error.message,
            success: false
        });
    }
});

// Fetch papers from multiple sources
app.get("/api/papers", async (req, res) => {
    const field = req.query.field;
    if (!field) {
        return res.status(400).json({ error: "Research field is required" });
    }

    try {
        // Use the same fetchSemanticScholarPapers function for consistency
        const papers = await fetchSemanticScholarPapers(field, 50);
        res.json({ 
            papers,
            success: true,
            totalResults: papers.length
        });
    } catch (error) {
        console.error("Error fetching papers:", error);
        res.status(500).json({ 
            error: "Failed to fetch papers",
            success: false
        });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
