import { Messages } from "../api/models/message.schema.js";
import { Chats } from "../api/models/chat.schema.js";

// userId -> socketId mapping
const onlineUsers = new Map();

export const getOnlineUsers = () => onlineUsers;

export const setupSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // Client sends userId after login — we map it and auto-join all chat rooms
        socket.on("setup", async (userId) => {
            if (!userId) return;

            onlineUsers.set(userId, socket.id);
            socket.userId = userId;
            console.log(`User ${userId} registered with socket ${socket.id}`);

            // Auto-join all chat rooms this user belongs to
            try {
                const userChats = await Chats.find({
                    users: { $elemMatch: { $eq: userId } },
                });
                userChats.forEach((chat) => {
                    socket.join(chat._id.toString());
                });
                console.log(`User ${userId} auto-joined ${userChats.length} chat rooms`);
            } catch (err) {
                console.error("Error auto-joining rooms:", err.message);
            }

            // Notify others that this user is online
            socket.broadcast.emit("user-online", userId);

            // Send online users list to the newly connected user
            socket.emit("online-users", Array.from(onlineUsers.keys()));
        });

        // Join a specific chat room (called when user opens a chat)
        socket.on("join-chat", (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log(`Socket ${socket.id} joined chat room ${chatId}`);
        });

        // Send message — save to DB and broadcast to room
        socket.on("send_message", async (data) => {
            try {
                const { sender, content, chatId } = data;

                let newMessage = await Messages.create({
                    sender,
                    content,
                    chats: chatId,
                });
                newMessage = await newMessage.populate("sender", "username email");
                newMessage = await newMessage.populate("chats");

                await Chats.findByIdAndUpdate(chatId, {
                    latestMessage: newMessage._id,
                });

                // Broadcast to everyone in the chat room (including sender)
                io.to(chatId).emit("recieve-message", newMessage);
            } catch (err) {
                console.error("send_message error:", err.message);
            }
        });

        // Typing indicators
        socket.on("typing", (chatId) => {
            socket.to(chatId).emit("typing", {
                chatId,
                userId: socket.userId,
            });
        });

        socket.on("stop-typing", (chatId) => {
            socket.to(chatId).emit("stop-typing", {
                chatId,
                userId: socket.userId,
            });
        });

        // When a new group is created, make all member sockets join the room
        socket.on("new-group-created", (chatData) => {
            if (!chatData || !chatData.users) return;
            chatData.users.forEach((user) => {
                const memberId = user._id || user;
                const memberSocketId = onlineUsers.get(memberId.toString());
                if (memberSocketId) {
                    const memberSocket = io.sockets.sockets.get(memberSocketId);
                    if (memberSocket) {
                        memberSocket.join(chatData._id.toString());
                    }
                }
            });
        });

        // Disconnect cleanup
        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.delete(socket.userId);
                socket.broadcast.emit("user-offline", socket.userId);
                console.log(`User ${socket.userId} disconnected`);
            } else {
                console.log(`Socket ${socket.id} disconnected (no userId)`);
            }
        });
    });
};