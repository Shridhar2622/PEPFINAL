const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
    constructor() {
        this.io = null;
    }

    init(server) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',')
            : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"];

        this.io = socketIo(server, {
            cors: {
                origin: allowedOrigins,
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        this.io.use(async (socket, next) => {
            try {
                // 1. Get token from cookies or auth header
                let token = null;
                if (socket.handshake.headers.cookie) {
                    const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
                        const [key, value] = cookie.trim().split('=');
                        acc[key] = value;
                        return acc;
                    }, {});
                    token = cookies.jwt;
                }

                if (!token && socket.handshake.auth && socket.handshake.auth.token) {
                    token = socket.handshake.auth.token;
                }

                if (!token) return next(new Error('Authentication error'));

                // 2. Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);

                if (!user) return next(new Error('User not found'));

                // 3. Attach user to socket
                socket.user = user;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            console.log(`Socket connected: ${socket.user.name} (${socket.user.id})`);

            // Join a private room for the user
            socket.join(`user:${socket.user.id}`);

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.user.name}`);
            });
        });

        return this.io;
    }

    getIo() {
        if (!this.io) {
            throw new Error("Socket.io not initialized!");
        }
        return this.io;
    }

    emitToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }
}

module.exports = new SocketService();
