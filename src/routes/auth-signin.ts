import express from 'express';
import { body } from 'express-validator';
import { Password } from '../utils/password';
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import { Request, Response } from 'express';
import { User } from '../models/user-model';
import { Email } from '../utils/email';
import session, { SessionData } from 'express-session';

// Define a custom interface for session data
interface MySession extends SessionData {
  user?: {
    _id: string;
    email: string;
  };
}

const router = express.Router();

// Use express-session middleware with custom session type
router.use(
  session({
    secret: 'your-secret-key', // Change this to a secret key for session encryption
    resave: false,
    saveUninitialized: false,
  })
);

router.post(
  '/api/auth/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().notEmpty().withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request & { session: MySession }, res: Response) => {
    const { email, password } = req.body;

    // encrypt the email
    const encryptedEmail = await Email.encryptEmail(email);

    const existingUser = await User.findOne({
      email: encryptedEmail,
    });

    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }

    const passwordMatch = await Password.compare(existingUser.password, password);

    if (!passwordMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    if (!existingUser.isVerified) {
      throw new BadRequestError('Unverified Account!');
    }

    // Set user information in the session
    req.session.user = {
      _id: existingUser._id,
      email: existingUser.email,
    };

    // Use type assertion to tell TypeScript that 'user' exists on the session
    const user = req.session.user as MySession['user'];

    res.status(200).send(existingUser);
  }
);

export { router as SignInRouter };
