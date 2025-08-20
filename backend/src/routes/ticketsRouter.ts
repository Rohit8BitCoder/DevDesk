
import { Router } from "express";
import { TicketController } from "../controllers/ticketController.ts";
import authMiddleware from "../middleware/Authmiddleware.ts";
import { validateTicketData, validateTicketUpdate } from "../middleware/validateTicket.ts";

const router = Router();

router.post("/projects/:project_id/tickets", authMiddleware, validateTicketData, TicketController.create);
router.get("/projects/:project_id/tickets", authMiddleware, TicketController.getAll);
router.get("/tickets/:ticket_id", authMiddleware, TicketController.getOne);
router.patch("/tickets/:ticket_id", authMiddleware, validateTicketUpdate, TicketController.update);
router.delete("/tickets/:ticket_id", authMiddleware, TicketController.remove);

export default router;


