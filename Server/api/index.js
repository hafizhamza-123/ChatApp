import dotenv from "dotenv";
import createApp from "../src/createApp.js";
import connectToDatabase from "../src/config/connectToDatabase.js";
import validateEnv from "../src/config/validateEnv.js";

dotenv.config();
validateEnv();

const app = createApp();

let hasConnectedToDatabase = false;

app.use(async (_req, res, next) => {
  if (!hasConnectedToDatabase) {
    await connectToDatabase();
    hasConnectedToDatabase = true;
  }
  next();
});

export default app;
