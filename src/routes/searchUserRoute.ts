import express from "express";
import { searchUser } from "../controllers/searchUser.controller.js";
import { protect } from "../middleware/auth.middleware.js";
const route = express.Router()

route.post('/user',  searchUser)
export default route