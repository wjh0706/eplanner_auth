import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import { User } from '../models/user-model';
import { Email } from '../utils/email';
import { Password } from '../utils/password';

const router = express.Router();

router.delete(
  '/api/auth/delete',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').trim().isLength({ min: 8, max: 20 }).withMessage('Password must be between 8 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Encrypt the email
    const encryptedEmail = await Email.encryptEmail(email);
    // Check if the user exists and credentials are correct
    const user = await User.findOne({
      email: encryptedEmail,
    });

    if (!user) {
      throw new BadRequestError('User Not exists');
    }

    const passwordMatch = await Password.compare(user.password, password);

    if (!passwordMatch) {
      throw new BadRequestError('Invalid Credentials');
    }

    // Perform the deletion
    await User.findByIdAndDelete(user._id);

    res.status(200).send({ message: 'Account deleted successfully' });
  }
);

export { router as DeleteRouter };
