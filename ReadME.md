# ChatApp

A full-stack real-time chat application built with React (front-end) and Node.js/Express (back-end). It supports user authentication, direct and group chats, message history, typing indicators, online status tracking, and real-time communication via Socket.IO.

---

## 🚀 Features

- **User Authentication** (register, login, logout)
- **JWT-based security** with token refresh handling
- **Real-time chat** with Socket.IO (join rooms, broadcast messages)
- **Direct & Group Chats** with member management
- **Message history** with pagination/limit support
- **Typing indicators** and **online/offline status**
- **Searchable chat list**
- **User listing and profile fetching**
- Backend persistence using **Prisma ORM** with **MongoDB**
- Frontend built with **React**, **Vite**, **Tailwind CSS**

---

## 📁 Project Structure

```
chatApp/
├── Client/            # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/           # Axios configuration
│   │   ├── components/    # Chat UI component
│   │   ├── context/       # Auth context provider
│   │   ├── pages/         # Login & Register pages
│   │   └── App.jsx        # Route definitions & socket setup
│   ├── package.json
│   └── vite.config.js
└── Server/            # Express backend
    ├── src/
    │   ├── config/        # database & cloudinary config
    │   ├── controllers/   # business logic (users, chats, messages)
    │   ├── middlewares/   # auth & upload helpers
    │   ├── routes/        # express routers
    │   └── utils/         # helpers (hashing, JWT)
    ├── prisma/            # Prisma schema
    ├── prismaClient.js    # Prisma client instance
    ├── app.js             # entry point with Socket.IO setup
    └── package.json
```

---

## 🛠 Tech Stack

| Layer      | Technologies & Libraries                                 |
|------------|----------------------------------------------------------|
| Frontend   | React, React Router, Vite, Tailwind CSS, Axios, Socket.IO client |
| Backend    | Node.js, Express, Prisma, MongoDB (via Prisma), Socket.IO |
| Auth       | JWT, bcryptjs                                             |
| Dev Tools  | nodemon, eslint, Vite                                    |

---

## 🔧 Environment Variables

Create a `.env` file in the `Server` directory with the following keys:

```ini
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL="your_mongo_connection_string"
JWT_SECRET="a_strong_secret"

# Optional (used for file upload)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

And in the `Client` directory, a `.env` (Vite) or package setting:

```ini
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

> **Note:** Vite prefixes environment variables with `VITE_`.

---

## 🛠 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url> chatApp
   cd chatApp
   ```

2. **Install dependencies**
   - **Server**
     ```bash
     cd Server
     npm install
     ```

   - **Client**
     ```bash
     cd ../Client
     npm install
     ```

3. **Configure database**
   - Ensure `DATABASE_URL` points to a MongoDB instance (local or cloud).
   - Run Prisma commands if you modify the schema:
     ```bash
     cd Server
     npx prisma migrate dev --name init
     ```
     (The project uses Mongo so migrations are mostly a no-op but the command seeds the _prisma_migrations table.)

4. **Start development servers**
   - Backend (from `Server` folder):
     ```bash
     npm run dev
     ```
   - Frontend (from `Client` folder):
     ```bash
     npm run dev
     ```

5. **Access the app**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

---

## 📡 API Endpoints

All API routes are prefixed with `/api`.

### **Users**

| Route                | Method | Auth   | Description                        |
|----------------------|--------|--------|------------------------------------|
| `/users/register`    | POST   | No     | Register new user                  |
| `/users/login`       | POST   | No     | Login and receive JWT              |
| `/users/logout`      | POST   | Yes    | Logout (invalidate state)          |
| `/users/all`         | GET    | Yes    | List other users (query `?search=`)|
| `/users/profile`     | GET    | Yes    | Get current user profile           |

### **Chats**

| Route                     | Method | Auth | Description                         |
|---------------------------|--------|------|-------------------------------------|
| `/chats/direct`           | POST   | Yes  | Create or fetch direct chat        |
| `/chats/group`            | POST   | Yes  | Create group chat                  |
| `/chats/`                 | GET    | Yes  | Get all chats the user belongs to  |
| `/chats/:chatId`          | GET    | Yes  | Get a single chat with messages    |
| `/chats/:chatId`          | DELETE | Yes  | Delete a chat (if member)         |

### **Messages**

| Route                             | Method | Auth | Description                         |
|-----------------------------------|--------|------|-------------------------------------|
| `/messages/:chatId`              | GET    | Yes  | Fetch messages for chat (limit query param) |
| `/messages/create/:chatId`       | POST   | Yes  | Send new message to chat            |
| `/messages/:chatId/unread-count` | GET    | Yes  | Get unread message count (basic)    |

> **Authentication:** Bearer token in `Authorization` header.

---

## 🔌 Socket.IO Events

The application uses WebSockets for real-time features. Connect the client with the JWT token in `auth` option.

| Event         | Direction | Payload                                                        | Description                               |
|---------------|-----------|----------------------------------------------------------------|-------------------------------------------|
| `join_chat`   | client    | `{ username, userId }`                                         | Notify server when user connects          |
| `user_joined` | server    | `{ username, userId, activeUsers }`                            | Broadcast when a user joins               |
| `join_room`   | client    | `room` (e.g. `chat:<id>`)                                      | Join specific chat room                   |
| `send_message`| client    | `{ senderId, text, timestamp?, room }`                         | Send message to room                      |
| `receive_message`| server | message object                                                 | Clients in room receive new message       |
| `typing`      | client    | `{ room, isTyping }`                                           | Emit typing state                         |
| `user_typing` | server    | `{ userId, username, isTyping }`                               | Notify others a user is typing            |
| `disconnect`  | server    | N/A                                                            | User disconnected                         |

---

## 🧪 Testing & Linting

- **Frontend lint**: `npm run lint` inside `Client`
- Add tests as needed (currently none).

---

## 📦 Production Build

1. Build frontend:
   ```bash
   cd Client
   npm run build
   ```
2. Serve static output via any server or integrate with Express.
3. Start backend with `npm start`.

---

## ✅ Notes & Tips

- The backend uses Prisma with MongoDB. You can switch to another database by editing `schema.prisma` and updating `DATABASE_URL`.
- The upload middleware and Cloudinary config are included for future avatar or file uploads but are not currently wired into routes.
- For token refresh, the frontend axios setup anticipates a `/auth/refresh-token` endpoint; implement if adding refresh tokens.

---

## 💡 Future Enhancements

- Add push notifications
- Implement pagination for chats/messages
- Upload avatars and files
- Improve UI/UX (dark mode, emojis, etc.)

---

## 📚 License

This project is provided as-is. Feel free to adapt and extend for your needs.

---

Happy coding! 🎉
