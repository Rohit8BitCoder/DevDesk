import { Router } from "express";
import { CreateProfile, getProfile, getProfilebyId, updateProfie, deleteProfile } from "../controllers/profileController.ts";
import Authmiddleware from "../middleware/Authmiddleware.ts";
import asyncHandler from "../utils/asyncHandler.ts";

const router = Router();

router.post('/', Authmiddleware, asyncHandler(CreateProfile))
router.get('/', asyncHandler(getProfile))
router.get('/:id', Authmiddleware, asyncHandler(getProfilebyId));
router.patch('/:id', Authmiddleware, asyncHandler(updateProfie));
router.delete('/:id', Authmiddleware, asyncHandler(deleteProfile))


export default router;

