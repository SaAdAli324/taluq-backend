import passport from "passport";
import { Strategy as GoogleStrategy, type Profile, type VerifyCallback } from "passport-google-oauth20";
import { User } from "../models/user.model.js";

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ["email", "profile"]
},

async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        const email = profile.emails?.[0]?.value ?? "";
        const photo = profile.photos?.[0]?.value ?? "";

        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })

        if (user) {
            let userUpdated = false;
            if (!user.googleId) {
                user.googleId = profile.id;
                userUpdated = true;
            }
            if (!user.isVerified) {
                user.isVerified = true;
                userUpdated = true;
            }
            if (userUpdated) {
                await user.save();
            }
            return done(null, user)
        }

        user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            profilePic: photo,
            isVerified: true
        })
        done(null, user)
    } catch (err) {
        done(err as Error)
    }
}
))