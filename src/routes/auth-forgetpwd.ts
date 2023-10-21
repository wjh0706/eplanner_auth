import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import { User } from '../models/user-model';
import { Email } from "../utils/email";
import {sendEmail} from "../utils/send_email";
import jwt from 'jsonwebtoken';


const router = express.Router();

router.put(
  '/api/auth/forgetpwd',
  [
    body('email').isEmail().withMessage('Email must be valid'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    //encrypt the email
    const encryptedEmail = await Email.encryptEmail(email)

    // check if Email is already in use.
    const user = await User.findOne({
          email: encryptedEmail
    })


    if (!user || !user.isVerified) {
      throw new BadRequestError('Verified User Not Found');
    }
    
    const verificationToken = jwt.sign({ 
       _id:user._id,
    }, process.env.VERIFY_KEY!);

    user.verificationToken = verificationToken;

    // Send a verification email
    // TO-DO
    // const to = 'recipient@example.com';
    // const subject = 'Test Email';
    // const text = 'This is a test email sent from my application.';
    // const html = '<p>This is a <strong>test email</strong> sent from my application.</p>';

    // sendEmail(to, subject, text, html)
    //   .then(() => {
    // console.log('Email sent successfully');
    // })
    // .catch((error) => {
    // console.error('Email sending error:', error);
    // });
    res.status(200).send(user);
    //res.status(201).send("Reset pwd link sent successfully!");
  }
);

export { router as ForgetPasswordRouter };