import { Router } from "express"
import authMiddleware from "../middleware/Authmiddleware.ts";
import { getprojectbyUser, getProjectsbyId, creatProject, updateProject, deleteProject } from "../controllers/projectController.ts";
import asyncHandler from "../utils/asyncHandler.ts";
const router = Router();

router.get('/', authMiddleware, asyncHandler(getprojectbyUser))
router.get('/:P_id', asyncHandler(getProjectsbyId))
router.post('/', authMiddleware, asyncHandler(creatProject))
router.patch('/:P_id', authMiddleware, asyncHandler(updateProject))
router.delete('/:P_id', authMiddleware, asyncHandler(deleteProject))

export default router;
