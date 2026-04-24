import prisma from "../../prismaClient.js";

let connectionPromise = null;

const connectToDatabase = async () => {
  if (!connectionPromise) {
    connectionPromise = prisma.$connect();
  }

  try {
    await connectionPromise;
    console.log("Connected to Database Successfully");
  } catch (error) {
    connectionPromise = null;
    console.error("Database connection failed:", error);
    throw error;
  }
};

export default connectToDatabase;
