// import express, { Request, Response } from 'express';
// import { currentUser } from '../utils/current-user';

// const router = express.Router();

// router.get('/api/auth/user', currentUser, (req: Request, res: Response) => {

//     res.send({ currentUser: req. currentUser || null })
// })

// export { router as UserRouter };
import express from 'express';
import { Request, Response } from 'express';
import { User } from '../models/user-model';
import { SessionData } from 'express-session';

// Define a custom interface for session data
interface MySession extends SessionData {
  user?: {
    _id: string;
    email: string;
  };
}

const router = express.Router();

router.get('/api/auth/user', async (req: Request & { session: MySession }, res: Response) => {
  // Check if user is authenticated
  if (!req.session || !req.session.user) {
    // User is not authenticated
    return res.status(401).send({ message: 'Unauthorized' });
  }

  // User is authenticated, retrieve user details
  const { _id, email } = req.session.user;

  // Fetch additional user data from the database if needed
  const currentUser = await User.findById(_id);

  if (!currentUser) {
    return res.status(404).send({ message: 'User not found' });
  }

  // Return user details
  res.status(200).send({ _id: currentUser._id, email: currentUser.email });
});

export { router as UserRouter };

