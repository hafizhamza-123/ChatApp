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

// Upload Message (Image / File / Audio)
const uploadMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
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

    let fileType = "file";
    const mimeType = req.file.mimetype.toLowerCase();
    const fileName = req.file.originalname.toLowerCase();
    const ext = fileName.split(".").pop();

    if (mimeType.startsWith("image/")) {
      fileType = "image";
    } else if (mimeType.startsWith("audio/") || ["mp3", "wav", "m4a", "aac", "flac", "ogg", "wma"].includes(ext)) {
      fileType = "audio";
    } else if (mimeType.startsWith("video/") || ["mp4", "avi", "mov", "mkv", "flv", "wmv", "webm"].includes(ext)) {
      fileType = "video";
    } else if (["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
      fileType = "document";
    }

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
        fileUrl: req.file.path,       
        publicId: req.file.filename,   
        fileName: req.file.originalname,
        fileType
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
      message: "File uploaded successfully",
      data: message
    });

  } catch (error) {
    console.error("Upload message error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark messages as delivered when user opens chat
const markMessagesAsDelivered = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Verify user is a member of the chat
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

    // Find all unread messages in this chat (excluding user's own messages)
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        senderId: { not: userId },
        reads: {
          none: {
            userId
          }
        }
      },
      select: {
        id: true
      }
    });

    if (messages.length === 0) {
      return res.json({
        success: true,
        message: "No messages to mark as delivered",
        data: { markedCount: 0 }
      });
    }

    // Create delivery records for all unread messages
    const deliveryRecords = messages.map(msg => ({
      messageId: msg.id,
      userId,
      deliveredAt: new Date(),
      readAt: new Date() // Initially set readAt same as deliveredAt
    }));

    await prisma.messageRead.createMany({
      data: deliveryRecords
    });

    return res.json({
      success: true,
      message: "Messages marked as delivered",
      data: { markedCount: messages.length }
    });

  } catch (error) {
    console.error("Mark messages as delivered error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Mark messages as read (when user actually views them)
const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { messageIds } = req.body; // Optional: specific message IDs to mark as read

    // Verify user is a member of the chat
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

    // Build where clause for messages
    const messageWhere = {
      chatId,
      senderId: { not: userId },
      reads: {
        some: {
          userId // Only messages that have been delivered
        }
      }
    };

    // If specific message IDs provided, filter by them
    if (messageIds && messageIds.length > 0) {
      messageWhere.id = { in: messageIds };
    }

    // Update read status for delivered messages
    const updated = await prisma.messageRead.updateMany({
      where: {
        userId,
        message: messageWhere
      },
      data: {
        readAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: "Messages marked as read",
      data: { updatedCount: updated.count }
    });

  } catch (error) {
    console.error("Mark messages as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get read receipts for specific messages
const getMessageReadReceipts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    // Get the message and verify access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        chat: {
          include: {
            members: {
              where: { userId },
              select: { userId: true }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Verify user is a member of the chat
    if (message.chat.members.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Get read receipts for this message
    const readReceipts = await prisma.messageRead.findMany({
      where: {
        messageId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        readAt: 'asc'
      }
    });

    // Get total members count in the chat
    const totalMembers = await prisma.chatMember.count({
      where: {
        chatId: message.chatId
      }
    });

    // Calculate statistics
    const deliveredCount = readReceipts.length;
    const readCount = readReceipts.filter(r => r.readAt).length;

    return res.json({
      success: true,
      data: {
        messageId,
        totalMembers,
        deliveredCount,
        readCount,
        receipts: readReceipts
      }
    });

  } catch (error) {
    console.error("Get message read receipts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get unread messages with their read status
const getMessagesWithReadStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { limit = 50 } = req.query;

    // Verify user is a member of the chat
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

    // Get messages with read status
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        reads: {
          where: {
            userId
          },
          select: {
            deliveredAt: true,
            readAt: true
          }
        }
      },
      orderBy: { createdAt: "asc" },
      take: parseInt(limit)
    });

    // Enhance messages with read status
    const enhancedMessages = messages.map(message => ({
      ...message,
      readStatus: message.senderId === userId ? 'sent' : // Own messages
        message.reads.length === 0 ? 'sent' : // Not delivered
        message.reads[0].readAt ? 'read' : // Read
        'delivered' // Delivered but not read
    }));

    return res.json({
      success: true,
      data: enhancedMessages
    });

  } catch (error) {
    console.error("Get messages with read status error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Get chat read summary (for chat list)
const getChatReadSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    // Verify user is a member of the chat
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

    // Get total members count
    const totalMembers = await prisma.chatMember.count({
      where: { chatId }
    });

    // Get the last message in the chat
    const lastMessage = await prisma.message.findFirst({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      include: {
        reads: {
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

    // Get unread count for user
    const unreadCount = await prisma.message.count({
      where: {
        chatId,
        senderId: { not: userId },
        reads: {
          none: {
            userId
          }
        }
      }
    });

    return res.json({
      success: true,
      data: {
        chatId,
        totalMembers,
        unreadCount,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          readCount: lastMessage.reads.length,
          readBy: lastMessage.reads.map(r => r.user)
        } : null
      }
    });

  } catch (error) {
    console.error("Get chat read summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export {
  getAllMessages,
  createMessage,
  getUnreadCount,
  uploadMessage,
  markMessagesAsDelivered,
  markMessagesAsRead,
  getMessageReadReceipts,
  getMessagesWithReadStatus,
  getChatReadSummary
};

