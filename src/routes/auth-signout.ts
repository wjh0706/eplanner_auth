import express from 'express';
import { Request, Response } from 'express';
import session, { SessionData } from 'express-session';

// Define a custom interface for session data
interface MySession extends SessionData {
  user?: {
    _id: string;
    email: string;
  };
}

const router = express.Router();

router.post('/api/auth/signout', (req: Request & { session: MySession }, res: Response) => {
  // Clear the user information from the session
  req.session.user = undefined;

  res.status(200).send({ message: 'Sign-out successful' });
});

export { router as SignOutRouter };
