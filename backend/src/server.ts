
import express from "express";
import dotenv from "dotenv";
import authRouters from "./routes/auth.ts";
import authProfiles from "./routes/profile.ts";

dotenv.config();
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouters);
app.use("/api/v1/profiles", authProfiles);

app.listen(3000, () =>
  console.log("Server running on http://localhost:3000")
);


