import prisma from "../../prismaClient.js";

// Create Direct Chat
const createDirectChat = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (currentUserId === userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot create chat with yourself"
      });
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: {
              in: [currentUserId, userId]
            }
          },
          some: { userId: currentUserId },
          some: { userId: userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (existingChat) {
      return res.json({
        success: true,
        message: "Direct chat already exists",
        data: existingChat
      });
    }

    const chat = await prisma.chat.create({
      data: {
        isGroup: false,
        members: {
          create: [
            { userId: currentUserId },
            { userId }
          ]
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Direct chat created",
      data: chat
    });

  } catch (error) {
    console.error("Create direct chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Create Group Chat
const createGroupChat = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { name, userIds } = req.body;

    if (!name || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name and users are required"
      });
    }

    const uniqueUserIds = [...new Set([currentUserId, ...userIds])];

    const chat = await prisma.chat.create({
      data: {
        isGroup: true,
        name,
        members: {
          create: uniqueUserIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: "Group chat created",
      data: chat
    });

  } catch (error) {
    console.error("Create group chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Fetch User Chats
const fetchUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return res.json({
      success: true,
      data: chats
    });

  } catch (error) {
    console.error("Fetch chats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get Chat by ID
const getChatById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                isOnline: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "Access denied or chat not found"
      });
    }

    return res.json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error("Get chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Delete chat 
const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Check if user is member of chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: { userId }
        }
      }
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: "Chat not found or access denied"
      });
    }

    // Delete chat
    await prisma.chat.delete({
      where: { id: chatId }
    });

    return res.json({
      success: true,
      message: "Chat deleted successfully"
    });

  } catch (error) {
    console.error("Delete chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export {
  createDirectChat,
  createGroupChat,
  fetchUserChats,
  getChatById,
  deleteChat
};
