import express from "express";
import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../utils/validate-request";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { User } from "../models/user-model";
import { Password } from "../utils/password";
import jwt from "jsonwebtoken";
import SNSPusher from "../utils/push-sns"; // Import the SNSPusher module


const router = express.Router();

const snsPusher = new SNSPusher(); // Create an instance of SNSPusher

// Verification route to handle the verification token
router.put(
  "/api/auth/resetpwd",
  [
    body("password")
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be between 8 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const token = req.query.token as string;

    const { password } = req.body;

    //hash the pwd
    const hashedPassword = await Password.toHash(password);

    if (!token) {
      return new BadRequestError("Null Token");
    }

    try {
      const payload: any = jwt.verify(token, process.env.VERIFY_KEY!);

      // Find the user by id and update the isVerified field
      const user = await User.findOne({ _id: payload._id });

      if (!user) {
        throw new BadRequestError("Invalid Token");
      }

      if (!user.isVerified) {
        throw new BadRequestError("Unverified User!");
      }

      user.set({ verificationToken: undefined });
      user.password = hashedPassword;
      await user.save();
      // Define the SNS topic ARN and message
      const snsTopicArn = "arn:aws:sns:us-east-1:530906741223:pwdreset"; // replace with your SNS topic ARN
      const snsMessage = {
        eventType: "passwordReset",
        userId: user._id,
        userEmail: user.email,
      };

      // Use SNSPusher to push the event to SNS
      await snsPusher.pushEventToSNS(snsTopicArn, snsMessage);
      res.status(200).send(user);
      //res.status(200).send('Password reset is successful!');
    } catch (error) {
      throw error;
    }
  }
);

export { router as ResetPasswordRouter };
