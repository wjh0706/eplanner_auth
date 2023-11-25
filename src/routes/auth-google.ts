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

// import express, { Request, Response, NextFunction } from "express";
// import passport from "passport";
// import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
// import jwt from "jsonwebtoken";
// interface User {
//   profile: Profile;
//   accessToken: string;
//   refreshToken: string;
// }

// // Create an Express router
// const router = express.Router();

// // Passport configuration
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID:
//         "1039548241933-5fvl39vo8ejc7ih599hmv2gvu0q2jfpp.apps.googleusercontent.com",
//       clientSecret: "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",
//       callbackURL: "http://3.84.8.12.nip.io/api/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       return done(null, { profile, accessToken, refreshToken });
//     }
//   )
// );

// // Initialize Passport
// router.use(passport.initialize());

// // Define the Google authentication route
// router.get(
//   "/api/auth/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// // Define the Google callback route
// router.get(
//   "/api/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req: Request, res: Response) => {
//     // Successful authentication, create JWT and set it in the session
//     const user: User = req.user as User; // Type assertion to User
//     const JWT = jwt.sign(user, process.env.JWT_KEY!);

//     // Set the JWT in the session
//     req.session = {
//       jwt: JWT,
//     };

//     // Redirect or respond as needed
//     res.redirect("/api/auth/getemail");
//   }
// );

// // Define a route to get the user's email after authentication
// router.get(
//   "/api/auth/getemail",
//   (req: Request, res: Response, next: NextFunction) => {
//     // Check if the user is authenticated
//     if (!req.isAuthenticated()) {
//       return res.status(401).json({ error: "Not authenticated" });
//     }

//     // Extract the user from the session
//     const token = req.session?.jwt;
//     const decodedToken = jwt.verify(token, process.env.JWT_KEY!) as User;

//     // Extract the email from the user's profile
//     const email = decodedToken?.profile?.emails?.[0]?.value;

//     if (!email) {
//       return res.status(400).json({ error: "Email not found in user profile" });
//     }

//     // Respond with the user's email
//     res.json({ email, token });
//   }
// );

// export { router as GoogleAuthRouter };

import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { v4 as uuid } from 'uuid'; 

const router = express.Router();

// Configure session middleware
router.use(
  session({
    secret: "your-secret-key", // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    rolling: true, // Add this line
    genid: (req) => {
      return uuid(); // Use a library like `uuid` to generate unique session IDs
    },
  })
);

// Passport configuration
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "1039548241933-5fvl39vo8ejc7ih599hmv2gvu0q2jfpp.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "http://3.84.8.12.nip.io/api/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // Do not create JWT or session here
      return done(null, { profile, accessToken, refreshToken });
    }
  )
);

router.use(passport.initialize());
router.use(passport.session());

router.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback route
router.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req: Request, res: Response) => {
    // Successful authentication
    res.redirect("/api/auth/getemail");
  }
);

// Get user's email route
router.get(
  "/api/auth/getemail",
  (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Extract the user from the session
    const user = req.user as { profile: Profile; accessToken: string; refreshToken: string };

    // Now you can access properties without TypeScript complaining
    const email = user?.profile?.emails?.[0]?.value;

    if (!email) {
      return res.status(400).json({ error: "Email not found in user profile" });
    }

    // Respond with the user's email
    res.json({ email });
  }
);

export { router as GoogleAuthRouter };