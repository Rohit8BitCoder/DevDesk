
import express from "express";
import dotenv from "dotenv";
import authRouters from "./routes/auth.ts";
import authProfiles from "./routes/profile.ts";
import authprojects from "./routes/projects.ts";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouters);
app.use("/api/v1/profiles", authProfiles);
app.use("/api/v1/projects", authprojects);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);


