import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import { User } from '../models/user-model';
import { Email } from "../utils/email";
import { Password } from "../utils/password";

const router = express.Router();

router.post(
  '/api/auth/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('Password must be between 8 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //encrypt the email
    const encryptedEmail = await Email.encryptEmail(email);

    //hash the pwd
    const hashedPassword = await Password.toHash(password);

    // check if Email is already in use.
    const userExists = await User.findOne({
          email: encryptedEmail
    })


    if (userExists) {
      throw new BadRequestError('User already exists');
    }
    
    const user = new User({
      email: encryptedEmail,
      password: hashedPassword,
    });

    await user.save()

    res.status(201).send(user);
    //res.status(201).send("sign up success!");
  }
);

export { router as SingUpRouter };
