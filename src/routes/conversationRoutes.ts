import express from 'express'
import { conversationController } from '../controllers/conversation.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const route = express.Router()

route.get("/get" , protect, conversationController.getConversation)
route.post('/add' , protect, conversationController.addConversation)
route.delete("/delete/:conversationId" ,protect, conversationController.deleteConversation)
// route.put('/update', protect, conversationController.updateConversation)

export default route