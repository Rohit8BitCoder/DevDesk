import { Router } from "express";
import authMiddleware from "../middleware/Authmiddleware.ts";
import { createComment, getcommentbyticketId, getallCommentbyUserId, DeleteCommentbyId, } from "../controllers/ticketCommentController.ts";
const router = Router();

router.post('/:ticket_id', authMiddleware, createComment)
router.get('/:ticket_id', authMiddleware, getcommentbyticketId)
router.get('/:ticket_id/user', authMiddleware, getallCommentbyUserId)
router.delete('/:ticket_id/:comment_id', authMiddleware, DeleteCommentbyId)

export default router;

