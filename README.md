# Pigeon Chat

A modern, real-time chat application built with Node.js, Express, React, and Socket.io. Pigeon Chat offers a comprehensive messaging experience with voice calls, file sharing, and friendship management.

## Features

### Authentication & Security

- User registration and login
- Email verification system
- Google OAuth integration
- Password change functionality
- JWT-based authentication
- Rate limiting and security middleware

### Real-time Messaging

- Instant messaging with Socket.io
- Group chat support
- Message history and pagination
- Emoji picker support
- File attachments and media sharing
- Online user status

### Voice Calls

- One-on-one voice calls
- Group voice calls

### Social Features

- Friend system (add, remove, block)
- Friend requests management
- User search and discovery

### Additional Features

- File upload and sharing
- Responsive design with Tailwind CSS
- Infinite scroll for messages
- Toast notifications
- Lightbox for media viewing
- Image optimization with Cloudinary

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.io
- **Authentication:** JWT, Google OAuth
- **File Upload:** Multer, Cloudinary
- **Validation:** Zod
- **Security:** Helmet, CORS, Rate Limiting
- **Email:** Nodemailer

### Frontend

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** React Icons
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Real-time:** Socket.io Client
- **UI Components:** Custom components with React hooks

## Project Structure

```
pigeon-chat/
├── backend/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── schemas/           # Validation schemas
│   ├── utils/             # Utility functions
│   └── uploads/           # File storage
│
└── frontend/
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── contexts/      # React contexts
    │   ├── hooks/         # Custom hooks
    │   ├── pages/         # Page components
    │   ├── reducers/      # State reducers
    │   └── utils/         # Helper functions
    └── public/            # Static assets
```

## Quick Start

### Prerequisites

- Node.js
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for file uploads)
- Google OAuth credentials (optional)

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ldblckrs-258/pigeon-chat.git
   cd pigeon-chat/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory:

   ```env
   PORT=3001
   ATLAS_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ORIGIN=http://localhost:3000

   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id

   # Server URI for auto-reload (Production)
   SERVER_URI=your_deployed_server_url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd ../frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the frontend directory:

   ```env
   VITE_CLIENT_PORT=3000
   VITE_SERVER_URI=http://localhost:3001
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user
- `PUT /auth/password` - Change password
- `PUT /auth/info` - Update profile
- `POST /auth/google` - Google OAuth login
- `GET /auth/verify` - Verify email
- `POST /auth/resend-verification` - Resend verification email

### Chat & Messages

- `GET /chats` - Get user chats
- `POST /chats` - Create new chat
- `GET /chats/:id/messages` - Get chat messages
- `POST /messages` - Send message
- `DELETE /messages/:id` - Delete message

### Friends

- `GET /friendships` - Get friends list
- `POST /friendships/request` - Send friend request
- `PUT /friendships/:id/accept` - Accept friend request
- `DELETE /friendships/:id` - Remove friend

### Users & Tools

- `GET /users/search` - Search users
- `POST /tools/upload` - Upload files
- `GET /calls/ice-servers` - Get ICE servers for WebRTC

## 🔌 Socket.io Events

### Connection Management

- `online` - User comes online
- `getOnlineUsers` - Broadcast online users

### Messaging

- `sendMessage` - Send new message
- `newMessage` - Receive new message
- `messageDeleted` - Message deletion notification

### File Transfer

- `requestFileTransfer` - Request file transfer
- `acceptFileTransfer` - Accept file transfer
- `rejectFileTransfer` - Reject file transfer
- `fileTransferProgress` - Transfer progress update

### Voice Calls

- `makeCall` - Initiate voice call
- `answerCall` - Answer incoming call
- `rejectCall` - Reject incoming call
- `endCall` - End active call
- `offer`, `answer`, `ice-candidate` - WebRTC signaling

### Friendship

- `friendRequestSent` - Friend request notification
- `friendRequestAccepted` - Friend request accepted
- `friendRemoved` - Friend removal notification

## Author

**ldblckrs-258**

- GitHub: [@ldblckrs-258](https://github.com/ldblckrs-258)
- Repository: [pigeon-chat](https://github.com/ldblckrs-258/pigeon-chat)

---

If you find this project useful, please consider giving it a star on GitHub!
