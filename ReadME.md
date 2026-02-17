# ChatApp - Real-Time Chat Application

A professional-grade full-stack real-time messaging platform built with modern web technologies. ChatApp enables seamless communication through direct and group chats with rich media support, featuring instant message delivery, real-time typing indicators, and comprehensive user presence tracking.

---

## 🚀 Core Features

### Authentication & Security
- User registration and login with email validation
- JWT-based authentication with 7-day token expiry
- Secure password hashing using bcryptjs
- Token-based request authorization for protected endpoints
- Logout functionality with state invalidation

### Real-Time Messaging
- Instant message delivery via Socket.IO WebSocket
- Real-time typing indicators
- Online/offline user status tracking
- User presence in active chat rooms
- Message history with persistence

### Chat Management
- **Direct Messaging**: One-on-one private conversations
- **Group Chats**: Multi-member group conversations with member management
- Searchable chat list with instant filter
- Chat deletion capability
- Last message preview in chat list

### Media Sharing
- **Image Support**: JPEG, PNG, WebP with inline preview
- **Video Support**: MP4, MOV, AVI, MKV, FLV, WMV, WebM with player controls
- **Audio Support**: MP3, WAV, M4A, AAC, FLAC, OGG with audio player
- **Document Support**: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX
- **Cloud Storage**: Cloudinary integration for secure file hosting
- Optimized media sizing and compression

### User Experience
- Responsive modern UI with Tailwind CSS
- Real-time user list with search functionality
- Group creation modal with multi-select member picker
- Message timestamps with localized formatting
- Visual online status indicators
- Smooth scrolling and auto-focus on latest messages

---

## 📁 Project Structure

```
chatApp/
├── Client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # HTTP client with auth interceptors
│   │   ├── components/
│   │   │   └── Chat.jsx            # Main chat interface component
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication state management
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   └── Register.jsx        # Registration page
│   │   ├── App.jsx                 # Route definitions & Socket setup
│   │   └── main.jsx                # Application entry point
│   ├── package.json
│   ├── vite.config.js              # Vite configuration
│   └── index.html
│
└── Server/                          # Express Backend
    ├── src/
    │   ├── config/
    │   │   ├── cloundinary.js       # Cloudinary file upload config
    │   │   └── connectToDatabase.js # MongoDB connection setup
    │   ├── controllers/
    │   │   ├── user.controller.js   # User auth & profile logic
    │   │   ├── chat.controller.js   # Chat CRUD operations
    │   │   └── message.controller.js # Message & file upload logic
    │   ├── middlewares/
    │   │   ├── authMiddleware.js    # JWT verification
    │   │   └── upload.js            # Multer + Cloudinary setup
    │   ├── routes/
    │   │   ├── index.route.js       # Route aggregator
    │   │   ├── user.route.js        # User endpoints
    │   │   ├── chat.route.js        # Chat endpoints
    │   │   └── message.route.js     # Message endpoints
    │   └── utils/
    │       └── helpers.js           # Password hashing & JWT utilities
    ├── prisma/
    │   └── schema.prisma            # Data models (User, Chat, Message)
    ├── prismaClient.js              # Prisma client instance
    ├── app.js                       # Express app with Socket.IO server
    └── package.json
```

---

## 🛠 Tech Stack

| Layer      | Technologies                                                        |
|------------|---------------------------------------------------------------------|
| **Frontend** | React 19, React Router 7, Vite 7, Tailwind CSS 4, Axios             |
| **Backend** | Node.js, Express 5, Prisma ORM, Socket.IO 4, MongoDB                |
| **Database** | MongoDB (with Prisma for ORM)                                       |
| **File Storage** | Cloudinary (image, video, audio, document hosting)                 |
| **Authentication** | JWT (jsonwebtoken), bcryptjs (password hashing)                    |
| **Real-Time** | Socket.IO (WebSocket protocol for instant communication)            |
| **Development** | Vite, nodemon, ESLint                                               |
| **Icons & UI** | React Icons, Lucide React                                           |

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

## � Quick Start Guide

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


**Built with ❤️ using React + Node.js**
