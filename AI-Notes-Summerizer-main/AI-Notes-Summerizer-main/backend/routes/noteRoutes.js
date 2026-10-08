const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
// Merr të gjitha shënimet me përmbledhjet e tyre
router.get('/my-notes', async (req, res) => {
const userId = req.user.id; // Supozojmë se ke një middleware që nxjerr userin nga token
const { data, error } = await supabase
.from('notes')
.select('*, summaries(*)')
.eq('user_id', userId)
.order('created_at', { ascending: false });
if (error) return res.status(400).json({ error: error.message });
res.json(data);
});
// Merr numrin e flashcards
router.get('/flashcard-count', async (req, res) => {
const userId = req.user.id;
const { count, error } = await supabase
.from('flashcards')
.select('*', { count: 'exact', head: true })
.eq('user_id', userId);
if (error) return res.status(400).json({ error: error.message });
res.json({ count });
});
module.exports = router;
