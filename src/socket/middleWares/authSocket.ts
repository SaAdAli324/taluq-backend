import jwt from "jsonwebtoken"
import { User } from "../../models/user.model.js"
import type { Socket } from "socket.io"
import cookie from 'cookie'
export const authSocket = async (socket:Socket , next:(err?:Error)=> void) => {
  try{
    const cookieHeader = socket.handshake.headers.cookie
    console.log(cookieHeader , 'this is the token');
    
    if(!cookieHeader){
        return next(new Error("Authentication failed"))
    }
    const cookies = cookie.parse(cookieHeader)
    const token = cookies.token
    if (!token) {
      return next(new Error("token not found in cookie"))
    }
    const decodedToken = jwt.verify(token , process.env.JWT_SECRET! as string) as {_id:string}
    const user = await User.findById(decodedToken._id).select("-password")

    if (!user) {
        return next(new Error("user not found"))
    }
    socket.data.user=user
    next()
  }catch(err){
    next(new Error("Authentication failed"))
  }
}
