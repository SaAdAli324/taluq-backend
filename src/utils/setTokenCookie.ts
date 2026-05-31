import type { Response, Request } from "express";

export const tokenCookie= {
   setCookie:(res: Response , token: string)=>{ res.cookie("token", token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"lax",
        maxAge: 30 * 24 * 60 * 60 * 1000
    })
    },
    clearCookie:(req: Request, res:Response )=>{
        res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            sameSite:"lax"

        })
        res.json({message:"logout successfull", success:true})
    }
}