import { createClient } from "redis";
import logger from "../utils/logger.js";
import dotenv from 'dotenv'
dotenv.config()
const redisClient = createClient({
    url:process.env.REDIS_URL as string
})

redisClient.on("error",(err)=> logger.error('Redis client error',err))
redisClient.on("connect",()=> logger.info("redis server connected"))

export const connectRedis = async()=>{
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect()
        }
    } catch (error) {
        logger.error("redis connection error in catch block",error)
    }
}

export default redisClient