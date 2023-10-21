import express from 'express';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { BadRequestError } from '../errors/bad-request-error';
import { User } from '../models/user-model';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Verification route to handle the verification token
router.get('/api/auth/verify', async (req: Request, res: Response) => {
    const token = req.query.token as string; // Type assertion to ensure token is a string
    
    if (!token) {
      return res.status(400).send('null token');
    }
  
    try {
      const payload: any = jwt.verify(token, process.env.VERIFY_KEY!);

      console.log(payload._id)
  
      // Find the user by email and update the isVerified field
      const user = await User.findOne({ _id: payload._id });
  
      if (!user) {
        throw new BadRequestError('User not found');
      }

      if (user.isVerified) {
        throw new BadRequestError('Already Verified!');
      }
  
      user.isVerified = true;
      user.verificationToken = '';
      await user.save();
  
      res.send('Email verification successful');
    } catch (error) {
      console.log(error)
      throw res.status(400).send('Invalid token');
    }
  });

  export { router as VerifyRouter };