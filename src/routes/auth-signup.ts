import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user-model';
import {Email} from "../utils/email";
import jwt from 'jsonwebtoken';


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
    const encryptedEmail = await Email.encryptEmail(email)

    // check if Email is already in use.
    const userExists = await User.findOne({
          email: encryptedEmail
    })


    if (userExists) {
      throw new BadRequestError('User already exists');
    }
    
    const user = new User({
      email: encryptedEmail,
      password: password,
    });

    await user.save()
    
    const verificationToken = jwt.sign({ 
       _id:user._id,
    }, process.env.VERIFY_KEY!);


    user.verificationToken = verificationToken;
    await user.save(); 

    // Send a verification email
    // TO-DO
    //sendVerificationEmail(email, JWTverificationToken);

    //dev implmentation
    res.status(201).send(user);
  }
);

export { router as SingUpRouter };
