import express from 'express';
import { signup , signin , refresh , logout, getUserList } from '../controllers/users.controllers.js';
import multer from 'multer';
import authorized from '../middlewares/authorized.middlewares.js';
const upload = multer();

const userRouter = express.Router();


userRouter.post('/signup', upload.none() , signup);
userRouter.post('/signin', upload.none() , signin);
//me route to prevent logout from refreshing react page by setting global setLogin after checking cookies
userRouter.post('/logout' , logout);
userRouter.get('/refresh', refresh);
userRouter.get('/getUserList/:name', authorized , getUserList);


export default userRouter;