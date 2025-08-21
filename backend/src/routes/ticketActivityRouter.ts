import { Router } from "express";
import { createactivity, getActivitiesbytId, getAllActivitiesByuser, DelActivitybyId } from "../controllers/ticketActivityController.ts";
import authMiddleware from "../middleware/Authmiddleware.ts";

const router = Router();

router.post('/:ticket_id', authMiddleware, createactivity)
router.get('/:ticket_id', authMiddleware, getActivitiesbytId)
router.get('/user/:ticket_id', authMiddleware, getAllActivitiesByuser)
router.delete('/:ticket_id/:activity_id', authMiddleware, DelActivitybyId)

export default router;
