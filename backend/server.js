require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');

const app = express();

// ── DB Connection ──────────────────────────────────
connectDB();

// ── Core Middleware ────────────────────────────────
app.use(cors({
    origin: "https://library-book-booking-system.vercel.app/"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Files ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../client')));

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// ── API Routes (MVC) ───────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/books',        require('./routes/bookRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));

// ── Health Check ───────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Library API is running' });
});

// ── Global Error Handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// ── Start Server ───────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\nServer running → http://localhost:${PORT}`);
  console.log(`DB: ${process.env.MONGO_URI}`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}\n`);
});