import express from "express";
import { Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../utils/validate-request";
import { BadRequestError } from "../utils/errors/bad-request-error";
import { User } from "../models/user-model";
import { Email } from "../utils/email";
import SESEmailer from "../utils/send-email";
import jwt from "jsonwebtoken";

const router = express.Router();

router.put(
  "/api/auth/sendverification",
  [body("email").isEmail().withMessage("Email must be valid")],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;

    //encrypt the email
    const encryptedEmail = await Email.encryptEmail(email);

    // check if Email is already in use.
    const existingUser = await User.findOne({
      email: encryptedEmail,
    });

    if (!existingUser) {
      throw new BadRequestError("User not found");
    }

    if (existingUser.isVerified) {
      throw new BadRequestError("User was verified");
    }

    const verificationToken = jwt.sign(
      {
        _id: existingUser._id,
      },
      process.env.VERIFY_KEY!
    );

    existingUser.verificationToken = verificationToken;
    await existingUser.save();

    // Send Account Verification Email
    const emailer = new SESEmailer();

    const emailParams = {
      recipientEmail: email,
      subject: "Account Verification Link",
      content: "Hello, plase click the following link to activate your account! \n"+process.env.DOMAIN!+"/api/auth/verify?token=" + verificationToken,
    };

    emailer
      .sendEmail(emailParams)
      .then(() => console.log("Email sent successfully."))
      .catch((error) => console.error("Error:", error));

    res.status(200).send(existingUser);
    //res.status(201).send("sign up success!");
  }
);

export { router as SendVerificationRouter };
