console.log("CWD:", process.cwd());
console.log("__dirname:", __dirname);
require("dotenv").config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log(`Serveri po punon ne portin ${PORT}`);
});
