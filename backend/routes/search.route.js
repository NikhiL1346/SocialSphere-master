import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getSearchResults } from '../controllers/search.controller.js';

const router = express.Router();

router.get('/:query' , protectRoute, getSearchResults);

export default router;