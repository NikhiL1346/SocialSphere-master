import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { getFollowers, getFollowing } from '../controllers/connection.controller.js';


const router = express.Router();

router.get("/followers/:username", protectRoute, getFollowers);
router.get("/following/:username", protectRoute, getFollowing);

export default router;