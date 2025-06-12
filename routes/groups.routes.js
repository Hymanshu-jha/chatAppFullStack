import express from 'express';

import { createGroup } from '../controllers/groups.controllers';

const groupRouter = express.Router();
groupRouter.post('/createGroup', createGroup);
export default groupRouter;