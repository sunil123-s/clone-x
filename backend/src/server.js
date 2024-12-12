import express from "express"
import authRoutes from './routes/authRoutes.js'
import dotenv from "dotenv"
import userRoutes from "./routes/userRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import cors from "cors";
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


dotenv.config();

const app = express()
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
app.use('/uploads',express.static(path.join(__dirname,'./public/uploads')))
app.use("/api/auth", authRoutes)
app.use('/api/user', userRoutes)
app.use("/api/post",postRoutes)
app.use("/api/notification",notificationRoutes)

const __dirname1 = path.resolve();

if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname1,"/frontend/dist")))
  app.get("*", (req,res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"))
  })
}

app.listen(8000,() => {console.log("server is running on PORT 8000")})