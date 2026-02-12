import prisma from "../../prismaClient.js";

const connectToDatabase = async () => {
    try{
        await prisma.$connect();
        console.log("Connected to Database Successfully");
    }
    catch(error){
        console.error("Database connection failed:", error);
    }
}

export default connectToDatabase;