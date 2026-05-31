import express from 'express'
import { authController } from '../controllers/auth.controller.js'
import passport from 'passport'
import type { Response,Request } from 'express'
import { generateToken } from '../utils/jwt.js'
import { tokenCookie } from '../utils/setTokenCookie.js'
const route = express.Router()

route.post("/login", authController.login)
route.post('/signup', authController.signUp)
route.post("/verify-email", authController.verifyEmail)
route.post("/forgot-password", authController.forgotPassword)
route.post("/reset-password", authController.resetPassword)
route.get('/google', passport.authenticate('google',{scope:['profile','email']}))
route.get('/google/callback', passport.authenticate('google',{ session:false , failureRedirect:'/login',}),
(req:Request ,res:Response )=>{
    const user = req.user as any
    const token = generateToken(user?._id.toString()!)

    res.cookie("token",token,{
        httpOnly:true ,
         secure:process.env.NODE_ENV === "production",
         maxAge:1000*60*60*24*7,
         sameSite:'lax'
    })
    res.redirect("http://localhost:5173")
}
)
route.post("/logout", tokenCookie.clearCookie)

export default route

