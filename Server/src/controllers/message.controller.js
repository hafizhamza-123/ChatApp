import prisma from "../../prismaClient.js";

// Get All Messages
const getAllMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    const isMember = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId
      }
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take: parseInt(limit)
    });

    return res.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Create Message
const createMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const isMember = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId
      }
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: message
    });

  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get Unread Count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const isMember = await prisma.chatMember.findFirst({
      where: {
        chatId,
        userId
      }
    });

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const count = await prisma.message.count({
      where: {
        chatId,
        senderId: { not: userId }
      }
    });

    return res.json({
      success: true,
      data: {
        unreadCount: count
      }
    });

  } catch (error) {
    console.error("Unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export {
  getAllMessages,
  createMessage,
  getUnreadCount
};
