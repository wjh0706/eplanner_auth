import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError } from "./errors/not-found-error";
// Server endpoints import 
import { UserRouter } from './routes/auth-user';
import { SingUpRouter } from './routes/auth-signup';
import { VerifyRouter } from './routes/auth-verify';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: false // To be configured later since JEST uses HTTP instead of HTTPS
    })
);
// User Errorhandler middleware

// Server Routes
app.use(UserRouter);
app.use(SingUpRouter);
app.use(VerifyRouter);

app.all('*', async () => {
    throw new NotFoundError();
})

export { app }
