import express, { Request, Response } from 'express';
import { currentUser } from '../utils/current-user';

const router = express.Router();

router.get('/api/auth/user', currentUser, (req: Request, res: Response) => {

    res.send({ currentUser: req. currentUser || null })
})

export { router as UserRouter };