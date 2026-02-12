import prisma from "../../prismaClient.js";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../utils/helpers.js";

const registerUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, username and password are required"
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        isOnline: false,
        lastSeen: new Date()
      },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        isOnline: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        avatar: true,
        isOnline: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isOnline: true,
        lastSeen: new Date()
      }
    });

    const token = generateToken(user.id, user.email);

    delete user.password;

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { search } = req.query;

    const where = {
      id: { not: currentUserId },
      ...(search && {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching users"
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile"
    });
  }
};

const logoutUser = async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      isOnline: false,
      lastSeen: new Date(),
    },
  });

  res.json({ success: true, message: "Logged out" });
};


export {
  registerUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  logoutUser
};
