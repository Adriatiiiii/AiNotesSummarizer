const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
parseFile,
summarizeText,
generateFlashcards,
chatWithNote
} = require("../controllers/aiController");
// Multer setup for temporary file storage
const upload = multer({ dest: "uploads/" });
router.post("/parse-file", upload.single("file"), parseFile);
router.post("/summarize", summarizeText);
router.post("/flashcards", generateFlashcards);
router.post("/chat", chatWithNote);
module.exports = router;
