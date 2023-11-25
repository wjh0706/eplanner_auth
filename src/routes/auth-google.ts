import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import session, { SessionData } from "express-session";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { v4 as uuid } from "uuid";
import { Email } from "../utils/email";
import { User } from "../models/user-model";
import { Password } from "../utils/password";

const router = express.Router();
interface MySession extends SessionData {
  user?: {
    _id: string;
    email: string;
  };
}
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

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

router.use(passport.initialize());
router.use(passport.session());

router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

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
router.post(
  "/api/auth/getemail",
  async (
    req: Request & { session: MySession },
    res: Response,
    next: NextFunction
  ) => {
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Extract the user from the session
    const user = req.user as {
      profile: Profile;
      accessToken: string;
      refreshToken: string;
    };

    // Now you can access properties without TypeScript complaining
    const email = user?.profile?.emails?.[0]?.value;

    if (!email) {
      return res.status(400).json({ error: "Email not found in user profile" });
    }

    const encryptedEmail = await Email.encryptEmail(email);

    // check if Email is already in use.
    const userExists = await User.findOne({
      email: encryptedEmail,
    });
    if (userExists) {
      req.session.user = {
        _id: userExists._id,
        email: userExists.email,
      };
      const user = req.session.user as MySession["user"];
      res.status(200).send(userExists);
    } else {
      const hashedPassword = await Password.toHash("DefaultPwd1");
      const user = new User({
        email: encryptedEmail,
        password: hashedPassword,
        isVerified: true,
      });
      await user.save();
      res.status(201).send(user);
    }

    // Respond with the user's email
    //res.json({ email });
    res.redirect("/api/auth/user");
  }
);

export { router as GoogleAuthRouter };
