import express from 'express';
import { body } from "express-validator";
import { Password } from "../utils/password";
import { validateRequest } from '../utils/validate-request';
import { BadRequestError } from '../utils/errors/bad-request-error';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { User } from "../models/user-model";
import {Email} from "../utils/email";

const router = express.Router();

router.post('/api/auth/signin', [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body;

        //encrypt the email
        const encryptedEmail = await Email.encryptEmail(email)

        const existingUser = await User.findOne({
            email: encryptedEmail
        })

        if(!existingUser){
            throw new BadRequestError('Invalid Credentials')
        }

        const passwordMatch = await Password.compare(existingUser.password, password);

        if(!passwordMatch){
            throw new BadRequestError('Invalid Credentials');
        }

        if(!existingUser.isVerified){
            throw new BadRequestError('Unverified Account!');
        }

        const JWT = jwt.sign({
            _id: existingUser._id,
            email: existingUser.email
        }, 
            process.env.JWT_KEY!
        )

        req.session.jwt = JWT;
        
        res.status(200).send(existingUser);
        //res.status(200).send("sign in success!");
    }
)

export { router as SignInRouter };

