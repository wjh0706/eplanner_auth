import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user-model';
import { Password } from "../utils/password";
import jwt from 'jsonwebtoken';

const router = express.Router();

// Verification route to handle the verification token
router.post('/api/auth/verify',  [
  body('password')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Password must not be empty.'),
], validateRequest, async (req: Request, res: Response) => {
    const token = req.query.token as string;
    
    const { password } = req.body;

    if (!token) {
      return new BadRequestError('Null Token');
    }
  
    try {
      const payload: any = jwt.verify(token, process.env.VERIFY_KEY!);
  
      // Find the user by id and update the isVerified field
      const user = await User.findOne({ _id: payload._id });
  
      if (!user) {
        throw new BadRequestError('Invalid Token');
      }

      if (user.isVerified) {
        throw new BadRequestError('Already Verified!');
      }
      
      const passwordMatch = await Password.compare(user.password, password);

      if(!passwordMatch){
        throw new BadRequestError('Invalid Credentials');
      }

      user.isVerified = true;
      user.verificationToken = '';
      await user.save();
  
      res.status(200).send('Email verification successful');
    } catch (error) {
        throw error;
    }
  });

  export { router as VerifyRouter };