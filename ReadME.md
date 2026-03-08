# ChatApp - Real-Time Messaging Platform

A modern, full-stack chat application enabling seamless real-time communication with direct and group messaging, media sharing, and robust authentication. Built with React, Node.js, Express, Prisma, MongoDB, and Socket.IO, it delivers a professional, scalable, and secure chat experience.

---

## 📸 Snapshots

<img width="959" height="438" alt="image" src="https://github.com/user-attachments/assets/c68c0d13-cfcf-413e-8207-30cd88e4c400" />
<img width="960" height="442" alt="image" src="https://github.com/user-attachments/assets/7e046d3c-8e34-4b51-a0a0-72fca0662ed6" />
<img width="954" height="439" alt="image" src="https://github.com/user-attachments/assets/9642f761-ba52-4e06-9db0-6966bbb97eba" />
<img width="959" height="440" alt="image" src="https://github.com/user-attachments/assets/49438345-11f4-436c-a8a9-f8405731fa43" />

---

## 🚀 Features

### Authentication & Security
- User registration, login, and email verification
- JWT-based authentication (7-day expiry)
- Secure password hashing (bcryptjs)
- Protected routes and logout

### Real-Time Messaging
- Instant message delivery (Socket.IO)
- Typing indicators and online/offline status
- Real-time user presence in chats
- Persistent message history

### Chat Management
- Direct (1:1) and group chats
- Group creation with member management
- Searchable chat list and chat deletion
- Last message preview

### Media & File Sharing
- Images: JPEG, PNG, WebP (inline preview)
- Videos: MP4, MOV, AVI, MKV, FLV, WMV, WebM
- Audio: MP3, WAV, M4A, AAC, FLAC, OGG
- Documents: PDF, DOC(X), TXT, XLS(X), PPT(X)
- Cloudinary integration for secure file hosting
- Optimized media sizing and compression

### User Experience
- Responsive UI (Tailwind CSS)
- Real-time user list with search
- Group creation modal with multi-select
- Message timestamps (localized)
- Online status indicators
- Smooth scrolling, auto-focus on new messages

---

## 📁 Folder Structure

```
chatApp/
├── Client/                  # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── ProfileModal.jsx
│   │   │   └── chat/
│   │   │       ├── ChatHeader.jsx
│   │   │       ├── ChatMessages.jsx
│   │   │       ├── ChatSidebar.jsx
│   │   │       ├── EmptyChatState.jsx
│   │   │       ├── GroupModal.jsx
│   │   │       ├── MessageInput.jsx
│   │   │       └── utils/
│   │   │           ├── chatHelpers.js
│   │   │           └── fileHelpers.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── chat/
│   │   │       └── useChatController.js
│   │   ├── pages/
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── VerifyOtp.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── index.html
│
└── Server/                  # Express Backend
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── config/
    │   │   ├── cloundinary.js
    │   │   └── connectToDatabase.js
    │   ├── controllers/
    │   │   ├── chat.controller.js
    │   │   ├── message.controller.js
    │   │   └── user.controller.js
    │   ├── Middlewares/
    │   │   ├── authMiddleware.js
    │   │   └── upload.js
    │   ├── routes/
    │   │   ├── chat.route.js
    │   │   ├── index.route.js
    │   │   ├── message.route.js
    │   │   └── user.route.js
    │   └── utils/
    │       ├── helpers.js
    │       └── mailer.js
    ├── prismaClient.js
    ├── app.js
    └── package.json
```

---

## 🛠 Tech Stack

| Layer           | Technologies                                                      |
|-----------------|-------------------------------------------------------------------|
| **Frontend**    | React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios           |
| **Backend**     | Node.js, Express 5, Prisma ORM, Socket.IO 4, MongoDB              |
| **Database**    | MongoDB (with Prisma ORM)                                         |
| **File Storage**| Cloudinary (media & docs hosting)                                 |
| **Auth**        | JWT (jsonwebtoken), bcryptjs                                      |
| **Real-Time**   | Socket.IO (WebSocket)                                             |
| **Dev Tools**   | Vite, nodemon, ESLint                                             |
| **UI/Icons**    | React Icons, Lucide React                                         |

---

## 🔧 Environment Configuration

### Server Environment (.env)

```ini
# Server
PORT=3001
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/chatapp"

# JWT Secret (use a strong, random string in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Client Environment (.env or .env.local)

```ini
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

**Important Notes:**
- Vite automatically prefixes environment variables with `VITE_` for client-side exposure
- Never commit `.env` files to version control
- In production, use environment variables from your hosting platform (Heroku, Vercel, AWS, etc.)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account (free tier available at cloudinary.com)
- Git

### Installation Steps

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url> chatapp
   cd chatapp
   ```

2. **Setup Server**
   ```bash
   cd Server
   npm install
   
   # Create .env file with configuration from section above
   # Configure DATABASE_URL, JWT_SECRET, Cloudinary credentials
   
   # Run database migrations (if schema changes)
   npx prisma migrate dev --name init
   
   # Start development server
   npm run dev
   ```
   Server runs on: `http://localhost:3001`

3. **Setup Client** (in new terminal)
   ```bash
   cd Client
   npm install
   
   # Create .env.local with VITE variables
   
   # Start development server
   npm run dev
   ```
   Client runs on: `http://localhost:5173`

4. **Access the Application**
   - Open browser to `http://localhost:5173`
   - Register a new account or login
   - Start chatting!

---

## 📡 API Endpoints Reference

### Authentication Endpoints

| Endpoint | Method | Auth | Request Body | Description |
|----------|--------|------|--------------|-------------|
| `/api/users/register` | POST | ❌ | `{email, username, password}` | Create new user account |
| `/api/users/login` | POST | ❌ | `{email, password}` | Authenticate and receive JWT token |
| `/api/users/logout` | POST | ✅ | Empty | Logout and invalidate session |

### User Endpoints

| Endpoint | Method | Auth | Query Params | Description |
|----------|--------|------|--------------|-------------|
| `/api/users/profile` | GET | ✅ | None | Get current authenticated user profile |
| `/api/users/all` | GET | ✅ | `search=` (optional) | List all users except current, with search filter |

### Chat Endpoints

| Endpoint | Method | Auth | Request Body | Description |
|----------|--------|------|--------------|-------------|
| `/api/chats` | GET | ✅ | None | Fetch all chats for current user |
| `/api/chats/direct` | POST | ✅ | `{userId}` | Create or fetch direct chat with user |
| `/api/chats/group` | POST | ✅ | `{name, userIds[]}` | Create new group chat |
| `/api/chats/:chatId` | GET | ✅ | None | Get specific chat with all messages |
| `/api/chats/:chatId` | DELETE | ✅ | None | Delete chat (member only) |

### Message Endpoints

| Endpoint | Method | Auth | Request Body | Description |
|----------|--------|------|--------------|-------------|
| `/api/messages/:chatId` | GET | ✅ | Query: `limit=50` | Fetch messages from chat |
| `/api/messages/create/:chatId` | POST | ✅ | `{content}` | Send text message to chat |
| `/api/messages/upload/:chatId` | POST | ✅ | FormData: `file` | Upload and send file to chat |
| `/api/messages/:chatId/unread-count` | GET | ✅ | None | Get count of unread messages |

**Authentication Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Supported File Types for Upload:**
- Images: JPG, PNG, JPEG, WebP
- Videos: MP4, AVI, MOV, MKV, FLV, WMV, WebM
- Audio: MP3, WAV, M4A, AAC, FLAC, OGG
- Documents: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX

---

## 🔌 WebSocket Events (Socket.IO)

Real-time communication is handled through Socket.IO. The server expects a JWT token in the connection auth.

### Client Events (Client → Server)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_chat` | `{username, userId}` | Register user in real-time system on connection |
| `join_room` | `room` (e.g., `chat:60f7b3d4e9b8c1a2b3c4d5e6`) | Subscribe to specific chat room |
| `send_message` | `{senderId, text, fileUrl?, fileType?, fileName?, timestamp, room}` | Send text or media message to room |
| `typing` | `{room, isTyping}` | Emit typing status to room |

### Server Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `user_joined` | `{username, userId, activeUsers[]}` | Broadcast when user connects |
| `receive_message` | `{senderId, text, fileUrl?, fileType?, fileName?, timestamp, room}` | Receive new message in subscribed room |
| `user_typing` | `{userId, username, isTyping}` | Receive typing indicator from user |
| `user_left` | `{username, userId, activeUsers[]}` | Broadcast when user disconnects |

### Connection Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: localStorage.getItem('token')
  }
});

socket.emit('join_chat', { username: 'John', userId: '123' });
socket.on('receive_message', (message) => {
  console.log('New message:', message);
});
```

---

## 🧪 Testing & Linting

- **Frontend lint**: `npm run lint` inside `Client`
- Add tests as needed (currently none).

---

## 📦 Build & Deployment

### Production Build

**Frontend:**
```bash
cd Client
npm run build
# Creates optimized build in 'dist' folder
npm run preview  # Test production build locally
```

**Backend:**
```bash
cd Server
npm run start    # Runs 'node app.js'
```

### Docker Deployment (Optional)

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine as backend
WORKDIR /app
COPY Server/ .
RUN npm install
EXPOSE 3001
CMD ["npm", "run", "start"]

FROM node:18-alpine as frontend-build
WORKDIR /app
COPY Client/ .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
COPY --from=backend /app /app/backend
EXPOSE 80 3001
```

### Deployment Platforms

**Recommended Options:**
- **Backend**: Heroku, Railway, Render, AWS EC2, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas (cloud)
- **File Storage**: Cloudinary (already integrated)

### Production Checklist

- [ ] Set `NODE_ENV=production` in backend
- [ ] Use strong, unique `JWT_SECRET`
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Monitor application logs and errors
- [ ] Implement rate limiting on API endpoints
- [ ] Enable compression and caching

---

## 🔐 Security Best Practices

- **Password Security**: Passwords hashed with bcryptjs (salt rounds: 10)
- **JWT Security**: Tokens expire after 7 days; implement refresh tokens for extended sessions
- **CORS Configuration**: Restricted to whitelisted client domains
- **Input Validation**: Sanitize and validate all user inputs
- **File Upload Security**: Validate file types on server side; use Cloudinary for hosting
- **Environment Variables**: Never commit secrets; use environment-specific configs
- **HTTPS**: Always use HTTPS in production
- **Rate Limiting**: Implement on authentication endpoints to prevent brute force

## 🧪 Development & Testing

### Available Scripts

**Server:**
```bash
npm run dev      # Start with nodemon (auto-reload)
npm run start    # Production start
```

**Client:**
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Debugging

**Backend**: Use `console.log` or connect with VS Code debugger
**Frontend**: Use browser DevTools, Redux DevTools (if added)

## 📝 Database Schema

The application uses three main models via Prisma ORM:

**User Model**
- Authentication (email, username, password)
- Profile (avatar, online status, lastSeen)
- Relations to chats and messages

**Chat Model**
- Group flag and name
- Members collection (ChatMember join table)
- Message history

**Message Model**
- Text content or file metadata (fileUrl, fileType, fileName)
- Sender and chat relations
- Timestamps for ordering

See `Server/prisma/schema.prisma` for complete schema definition.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. See `LICENSE` file for details.

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Check MongoDB is running or Atlas cluster is accessible
- Ensure IP is whitelisted in MongoDB Atlas

**Cloudinary Upload Errors**
- Verify credentials are correct in `.env`
- Check file size limits (default: 100MB)
- Ensure account isn't over storage quota

**Socket Connection Issues**
- Confirm both client and server are running
- Check browser console for CORS errors
- Verify `VITE_SOCKET_URL` matches server address


**Built with ❤️ using React, Node.js, Express, Prisma, and Socket.IO**
