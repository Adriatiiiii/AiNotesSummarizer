require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const { OpenAI } = require("openai");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const openai = new OpenAI({
baseURL: "https://openrouter.ai/api/v1",
apiKey: process.env.OPENROUTER_API_KEY,
defaultHeaders: {
"HTTP-Referer": "http://localhost:3000",
"X-Title": "AI Note App",
}
});
const DEFAULT_MODEL = "openrouter/free";
const parseFile = async (req, res) => {
const filePath = req.file?.path;
try {
if (!req.file) {
return res.status(400).json({ error: "Nuk u ngarkua asnjë skedar." });
}
console.log("📄 Duke procesuar skedarin:", req.file.originalname);
const fileType = req.file.mimetype;
let extractedText = "";
if (fileType === "application/pdf") {
const dataBuffer = fs.readFileSync(filePath);
const parser = new PDFParse({ data: dataBuffer });
const result = await parser.getText();
extractedText = result.text;
} else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
const dataBuffer = fs.readFileSync(filePath);
const result = await mammoth.extractRawText({ buffer: dataBuffer });
extractedText = result.value;
} else if (fileType === "text/plain") {
extractedText = fs.readFileSync(filePath, "utf-8");
} else {
return res.status(400).json({ error: "Lloji i skedarit nuk mbështetet: " + fileType });
}
if (!extractedText || extractedText.trim().length === 0) {
return res.status(400).json({ error: "Nuk u gjet asnjë tekst në këtë skedar." });
}
res.json({ text: extractedText });
} catch (error) {
console.error("❌ Gabim gjatë leximit:", error);
res.status(500).json({ error: "Dështoi leximi i skedarit.", details: error.message });
} finally {
if (filePath && fs.existsSync(filePath)) {
try { fs.unlinkSync(filePath); } catch (err) { console.error("EBUSY cleaning up:", err); }
}
}
};
const summarizeText = async (req, res) => {
const { text, detailLevel } = req.body;
if (!text) return res.status(400).json({ error: "Nuk u dha asnjë tekst." });
try {
const prompt = `
Përmbledh tekstin e mëposhtëm në gjuhën SHQIPE (Albanian).
Niveli i detajeve: ${detailLevel || 'normal'}.
Gjenero një objekt JSON ku çdo fushë duhet të jetë në gjuhën SHQIPE:
- short_summary: Një përmbledhje me 2-3 fjali.
- detailed_summary: Një përmbledhje gjithëpërfshirëse.
- bullet_points: Një listë me pikat kryesore.
- key_concepts: Një listë me terma të rëndësishëm dhe shpjegimet e tyre.
- keywords: Një listë me 5-10 fjalë kyçe.
- highlights: Një listë me 3-5 fjalitë më të rëndësishme.

Teksti: ${text}
`;
const response = await openai.chat.completions.create({
model: DEFAULT_MODEL,
messages: [{ role: "user", content: prompt }],
response_format: { type: "json_object" }
});
const result = JSON.parse(response.choices[0].message.content);
res.json(result);
} catch (error) {
console.error("AI Error:", error);
res.status(500).json({ error: "Gjenerimi me AI dështoi: " + error.message });
}
};
const generateFlashcards = async (req, res) => {
const { text, count } = req.body;
if (!text) return res.status(400).json({ error: "Nuk u dha asnjë tekst." });
try {
const prompt = `
Gjenero ${count || 5} karta studimi (flashcards) nga teksti i mëposhtëm në gjuhën SHQIPE.
Formatoni daljen si një objekt JSON me një fushë "flashcards" që përmban një listë objektesh, secili me fushat "question" dhe "answer" në SHQIP.

Teksti: ${text}
`;
const response = await openai.chat.completions.create({
model: DEFAULT_MODEL,
messages: [{ role: "user", content: prompt }],
response_format: { type: "json_object" }
});
const result = JSON.parse(response.choices[0].message.content);
res.json(result);
} catch (error) {
console.error("AI Error:", error);
res.status(500).json({ error: "Gjenerimi i flashcards dështoi: " + error.message });
}
};
// Multiple free models to try - if one is rate-limited (429), try the next
const CHAT_MODELS = [
"meta-llama/llama-3.3-70b-instruct:free",
"qwen/qwen3-235b-a22b:free",
"openrouter/free"
];
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const chatWithNote = async (req, res) => {
const { message, context, history } = req.body;
if (!message) return res.status(400).json({ error: "Nuk u dha asnjë mesazh." });
const truncatedContext = context?.slice(0, 3000) || "";
const limitedHistory = (history || []).slice(-4);

// Detect English: need at least 2 common English words
const engWords = ["what","how","why","when","where","who","the","is","are","was","were","do","does","can","could","will","would","have","has","had","explain","tell","describe","summarize","help","please","about"];
const lowMsg = message.toLowerCase();
const isEnglish = engWords.filter(w => new RegExp(`\\b${w}\\b`).test(lowMsg)).length >= 2;
const systemPrompt = isEnglish
? `You are a study assistant. RULES: 1) Answer ONLY in English. 2) Answer ONLY based on the text below - do NOT use outside knowledge. 3) If the answer is not in the text, say "This information is not in the notes." 4) Be brief (2-3 sentences max).\n\nSTUDENT NOTES:\n${truncatedContext}`
: `Ti je asistent studimi. RREGULLA: 1) Përgjigju VETËM në SHQIP - ASNJËHERË anglisht. 2) Përgjigju VETËM bazuar në tekstin më poshtë - MOS përdor njohuri të jashtme. 3) Nëse përgjigja nuk gjendet në tekst, thuaj "Kjo informacion nuk gjendet në shënime." 4) Ji i shkurtër (2-3 fjali max).\n\nSHËNIMET E STUDENTIT:\n${truncatedContext}`;
const langTag = isEnglish ? "[EN]" : "[SHQ]";
const messages = [
{ role: "system", content: systemPrompt },
...limitedHistory,
{ role: "user", content: `${langTag} ${message}` }
];
// Try each model in order; skip to next on 429
for (let i = 0; i < CHAT_MODELS.length; i++) {
try {
console.log(`🤖 Trying model: ${CHAT_MODELS[i]}`);
const response = await openai.chat.completions.create({
model: CHAT_MODELS[i],
messages: messages,
max_tokens: 300,
temperature: 0.2
});
return res.json({ reply: response.choices[0].message.content });
} catch (error) {
const status = error?.status || error?.response?.status;
console.error(`❌ Model ${CHAT_MODELS[i]} failed (${status}): ${error?.message}`);

if (status === 429 && i < CHAT_MODELS.length - 1) {
// Rate limited - wait 1 second then try next model
console.log(`⚠️ Rate limited, waiting 1s then trying next model...`);
await delay(1000);
continue;
}

// If last model or non-429 error
if (i === CHAT_MODELS.length - 1) {
if (status === 429) {
return res.status(429).json({
error: "Keni dërguar shumë mesazhe. Prisni 30 sekonda dhe provoni përsëri."
});
}
return res.status(500).json({
error: "Biseda me AI dështoi. Provoni përsëri pas pak."
});
}
}
}
};
module.exports = {
parseFile,
summarizeText,
generateFlashcards,
chatWithNote
};
