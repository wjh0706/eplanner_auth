// import express from 'express';
// import passport from 'passport';
// import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
// import { BadRequestError } from '../utils/errors/bad-request-error';
// import { User } from '../models/user-model';
// import { Email } from "../utils/email";
// import jwt from 'jsonwebtoken';
// import { Password } from "../utils/password";

// const router = express.Router();

// // Passport configuration
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: '1039548241933-5fvl39vo8ejc7ih599hmv2gvu0q2jfpp.apps.googleusercontent.com',
//       clientSecret: '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',
//       callbackURL: 'http://3.91.67.221.nip.io/api/auth/user',
//     },
//     async (accessToken, refreshToken, profile: Profile, done) => {
//       try {
//         const req = (done as any).req;
//         const email = profile.emails ? profile.emails[0]?.value : null;
//         const hashedDefaultPassword = await Password.toHash('defaultpwd0');
//         if (!email) {
//             // Handle the case where the user's email is not available
//             //throw new BadRequestError('User email not available');
//             return done(null, false, { message: 'User email not available' });
//           }
//           const encryptedEmail = await Email.encryptEmail(email);
//         // Check if the user is already registered
//         console.log(email)
//         let user = await User.findOne({ email: encryptedEmail});

//         if (!user) {
//           // If the user is not registered, sign them up with a default password
//           user = new User({
//             email: encryptedEmail,
//             password: hashedDefaultPassword,
//             isVerified: true,
//             // Additional fields you want to save from the Google profile
//           });

//           await user.save();
//         }

//         // Log in the user
//         const JWT = jwt.sign({
//           _id: user._id,
//           email: user.email
//       },
//           process.env.JWT_KEY!
//       )

//       req.session = {
//           jwt: JWT
//       }
//         return done(null, user);
//       } catch (error) {
//         throw new BadRequestError('User email not available');
//       }
//     }
//   )
// );

// // // Serialize and deserialize user
// // passport.serializeUser((user, done) => {
// //   done(null, user._id);
// // });

// // passport.deserializeUser(async (id, done) => {
// //   const user = await User.findById(id);
// //   done(null, user);
// // });

// // Google SSO routes
// router.get('/auth/google', (req, res, next) => {
//   // Attach req to the done callback for access in the passport strategy
//   passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
// });

// router.get(
//   '/auth/google/callback',
//   passport.authenticate('google', { failureRedirect: 'https://google.com' }),
//   (req, res) => {
//     // Access req here as it is part of the route handler
//     const jwtToken = req.session!.jwt;

//     // Successful authentication, redirect to a page or send a response
//     res.redirect('api/auth/user');
//   }
// );

// export { router as GoogleAuthRouter };

import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import jwt from "jsonwebtoken";

// Create an Express router
const router = express.Router();

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1039548241933-5fvl39vo8ejc7ih599hmv2gvu0q2jfpp.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://3.91.67.221.nip.io/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Save the user's profile in the session
      return done(null, profile);
    }
  )
);

// Serialize user to store in the session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

// Initialize Passport and restore authentication state if available from the session
router.use(passport.initialize());
router.use(passport.session());

// Define the Google authentication route
router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Define the Google callback route
router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    // Successful authentication, redirect to a success page or handle it accordingly
    res.redirect("/");
  }
);

// Define a route to get the user's email after authentication
router.get(
  "/api/auth/getemail",
  (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Extract the email from the user's profile
    const email = (req.user as Profile)?.emails?.[0]?.value;

    if (!email) {
      return res.status(400).json({ error: "Email not found in user profile" });
    }

    // Generate a JWT token with the user's email
    const token = jwt.sign({ email }, process.env.JWT_KEY!, {
      expiresIn: "1h",
    });

    // Respond with the user's email in the token
    res.json({ email, token });
  }
);

export { router as GoogleAuthRouter };
