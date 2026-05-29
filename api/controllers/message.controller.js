import { Messages } from "../models/message.schema.js";

export const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const messages = await Messages.find({ chats: chatId })
            .populate("sender", "username email")
            .populate("chats");

        return res.status(200).json(messages);
    } catch (err) {
        return res.status(500).json({
            message: err.message,
        });
    }
};
