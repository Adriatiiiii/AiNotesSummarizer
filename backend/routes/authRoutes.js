const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
// 1. REGISTER - Krijimi i llogarisë së re
router.post('/register', async (req, res) => {
const { email, password, displayName } = req.body;
if (!email || !password) {
return res.status(400).json({ error: "Email dhe fjalëkalimi kërkohen!" });
}
try {
const { data, error } = await supabase.auth.signUp({
email,
password,
options: {
data: {
display_name: displayName, // Ky kalon te tabela 'profiles' përmes trigger-it
},
},
});
if (error) throw error;
res.status(200).json({
message: 'Përdoruesi u krijua! Kontrollo email-in për konfirmim.',
user: data.user
});
} catch (error) {
res.status(400).json({ error: error.message });
}
});
// 2. LOGIN - Kyçja në llogari
router.post('/login', async (req, res) => {
const { email, password } = req.body;
if (!email || !password) {
return res.status(400).json({ error: "Email dhe fjalëkalimi kërkohen!" });
}
try {
const { data, error } = await supabase.auth.signInWithPassword({
email,
password,
});
if (error) throw error;
// Tani marrim edhe rolin nga tabela 'profiles' për ta dërguar te Frontendi
const { data: profile } = await supabase
.from('profiles')
.select('role')
.eq('id', data.user.id)
.single();
res.status(200).json({
message: 'Mirëseerdhët!',
session: data.session,
user: {
...data.user,
role: profile?.role || 'student' // Kthejmë rolin (default student)
}
});
} catch (error) {
console.error("❌ Login error:", error.message);
res.status(401).json({ error: error.message });
}
});
// 3. FORGOT PASSWORD
router.post('/reset-password', async (req, res) => {
const { email } = req.body;
if (!email) {
return res.status(400).json({ error: "Email-i kërkohet!" });
}
try {
const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/update-password`,
});
if (error) throw error;
res.status(200).json({ message: "Email-i për resetim u dërgua me sukses." });
} catch (error) {
console.error("❌ Reset password error:", error.message);
res.status(400).json({ error: error.message });
}
});
// 4. UPDATE PASSWORD
router.post('/update-password', async (req, res) => {
const { password } = req.body;
try {
const { error } = await supabase.auth.updateUser({
password: password
});
if (error) throw error;
res.status(200).json({ message: "Fjalëkalimi u përditësua!" });
} catch (error) {
console.error("❌ Update password error:", error.message);
res.status(400).json({ error: error.message });
}
});
// 5. LOGOUT - Dalja nga llogaria
router.post('/logout', async (req, res) => {
try {
const { error } = await supabase.auth.signOut();
if (error) throw error;
res.status(200).json({ message: "U çloguat me sukses!" });
} catch (error) {
console.error("❌ Logout error:", error.message);
res.status(400).json({ error: error.message });
}
});
module.exports = router;
