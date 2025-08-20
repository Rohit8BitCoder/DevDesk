
import express from "express";
import dotenv from "dotenv";
import authRouters from "./routes/authRouter.ts";
import authProfiles from "./routes/profileRouter.ts";
import authprojects from "./routes/projectsRouter.ts";
import ticketsRouter from "./routes/ticketsRouter.ts";
import ticketcommentsRouter from "./routes/ticketCommentsRouter.ts";
import ticketActionRouter from "./routes/ticketActivityRouter.ts"
dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouters);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);
app.use("/api/v1", ticketsRouter);
app.use("/api/v1", ticketcommentsRouter)
app.use("/api/v1", ticketActionRouter)
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


