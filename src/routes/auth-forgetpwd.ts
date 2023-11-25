import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import { User } from '../models/user-model';
import { Email } from "../utils/email";
import SESEmailer from "../utils/send-email";
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

    // Send Account Verification Email
    const emailer = new SESEmailer();

    const emailParams = {
      recipientEmail: email,
      subject: "Password Reset Link",
      content: "Hello, plase click the following link to reset your password! \n"+process.env.DOMAIN!+"api/auth/resetpwd?token=" + verificationToken,
    };

    emailer
      .sendEmail(emailParams)
      .then(() => console.log("Email sent successfully."))
      .catch((error) => console.error("Error:", error));
    res.status(200).send(user);
    //res.status(201).send("Reset pwd link sent successfully!");
  }
);

export { router as ForgetPasswordRouter };