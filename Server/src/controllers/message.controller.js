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

    // Detect file type based on MIME type and extension
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
        fileUrl: req.file.path,        // Cloudinary secure_url
        publicId: req.file.filename,   // Cloudinary public_id
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


export {
  getAllMessages,
  createMessage,
  getUnreadCount,
  uploadMessage
};
