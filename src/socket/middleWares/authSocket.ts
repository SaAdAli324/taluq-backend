import jwt from "jsonwebtoken"
import { User } from "../../models/user.model.js"
import type { Socket } from "socket.io"
import cookie from 'cookie'
export const authSocket = async (socket:Socket , next:(err?:Error)=> void) => {
  try{
    let token = socket.handshake.auth?.token || socket.handshake.query?.token
    
    if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie)
        token = cookies.token
    }

    if (!token) {
      return next(new Error("token not found"))
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
