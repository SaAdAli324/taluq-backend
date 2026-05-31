import express from 'express';
import dotenv from 'dotenv'
dotenv.config()
import http from 'http'
import { Server } from 'socket.io';
import passport from 'passport';
import { initializeSocket } from './socket/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'

import connectDB from './config/db.js';
import { globalErrorHandler } from './middleware/error.middleWare.js';
import morgan from 'morgan';
import logger from './utils/logger.js';
import helmet from 'helmet';
import './config/passport.js'
import authRoute from './routes/authRoutes.js'
import profileRoute from './routes/profileRoutes.js'
import searchUserRoute from './routes/searchUserRoute.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoute from './routes/messagesRoute.js'
import { connectRedis } from './config/redis.js';


const app: express.Application = express();
const server = http.createServer(app)
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(helmet())
const allowedOrigins = ["http://localhost:5173"];
if (process.env.FRONTEND_URL) {
    const envOrigins = process.env.FRONTEND_URL.split(",")
        .map(url => url.trim().replace(/\/$/, ""));
    allowedOrigins.push(...envOrigins);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
initializeSocket(io)
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}
app.set("io", io);


const PORT = process.env.PORT || 5000

app.use(passport.initialize())
app.use('/api/auth', authRoute)
app.use('/api/get', profileRoute)
app.use('/api/search', searchUserRoute)
app.use('/api/conversation', conversationRoutes)
app.use('/api/messages',messageRoute)



app.use(globalErrorHandler)
const startServer =async ()=>{
   await connectDB()
   await connectRedis()
   server.listen(PORT, () => {
    logger.info(`server running on ${PORT}`)
})
}

startServer()