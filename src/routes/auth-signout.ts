import express, { Request, Response } from 'express';
import session from 'express-session';

const router = express.Router();

// Use the express-session middleware
router.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);

router.get('/api/auth/signout', (req: Request, res: Response) => {
  // Destroy the session to sign out the user
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.clearCookie('your-session-cookie-name'); // Clear the session cookie
    res.send({});
  });
});

export { router as SignOutRouter };
