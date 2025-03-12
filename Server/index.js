import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";
import DbCon from "./libs/db.js";
import AuthRoutes from './routes/auth.routes.js';
import memoryBookRoutes from './routes/memoryBookRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import predictedEmotion from './routes/PredictedEmotion.js';
import blogRoutes from "./routes/blogRoutes.js";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 5000;
dotenv.config();

const corsOptions = {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
};

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
DbCon();

// Apply middleware in the correct order
app.use(cors(corsOptions)); // CORS middleware must be added before routes
app.use(express.urlencoded({ extended: true }));
app.use(express.json());    // JSON middleware must also be applied before routes
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_KEY, // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: false, maxAge: 3600000 } // Use `secure: true` in production with HTTPS
}));

app.use('/auth', AuthRoutes);
app.use("/api/blogs", blogRoutes);
app.use('/api/memory-books', memoryBookRoutes); // Route for memory book actions (e.g., create, delete, rename)
app.use('/api/memory-books', memoryRoutes);
app.use("/pets", predictedEmotion); // Define routes after middleware


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});