import express from 'express';
import { Request, Response } from 'express';
import { User } from '../models/user-model';

const router = express.Router();

router.get('/api/auth/all', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const skip = (page - 1) * pageSize;

  try {
    const users = await User.find()
      .skip(skip)
      .limit(pageSize);

    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / pageSize);

    res.status(200).json({
      users,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export { router as AllUsersRouter };
