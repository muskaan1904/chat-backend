import { Chats } from "../models/chat.schema.js";
import { Messages } from "../models/message.schema.js";

export const createChat = async (req, res, next) => {
  try {
    let { users, isGroupChat, chatName } = req.body;
    const loggedinUser = req.user.id;
    if (!users || users.length === 0) {
      return res.status(400).json({
        message: "Users are required",
      });
    }

    // private chats
    if (!isGroupChat) {
      users.push(loggedinUser);
      let chatExist = await Chats.findOne({
        isGroupChat: false,
        users: {
          $all: users,
        },
        $expr: {
          $eq: [{ $size: "$users" }, 2],
        },
      })
        .populate("users", "-password")
        .populate("latestMessage");

      if (chatExist) {
        return res.status(200).json(chatExist);
      }

      // if chat does not exist ---- create it
      const chat = await Chats.create({
        chatName: "private_Chat",
        isGroupChat: false,
        users,
      });

      const newChat = await Chats.findById(chat._id).populate(
        "users",
        "-password",
      );
      return res.status(201).json(newChat);
    }

    // group chats:
    users.push(loggedinUser);
    const groupchat = await Chats.create({
      chatName: chatName || "group_Chat",
      isGroupChat: true,
      users,
      groupAdmin: loggedinUser,
    });
    const newGroupChat = await Chats.findById(groupchat._id).populate(
      "users",
      "-password",
    );
    return res.status(201).json(newGroupChat);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// get all chats for logged-in user
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chats.find({
      users: { $elemMatch: { $eq: req.user.id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    return res.status(200).json(chats);
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// add members to group
export const addToGroup = async (req, res) => {
  try {
    const { chatId, userIds } = req.body;

    if (!chatId || !userIds || userIds.length === 0) {
      return res.status(400).json({ message: "chatId and userIds are required" });
    }

    const chat = await Chats.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    const updated = await Chats.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: { $each: userIds } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// remove member from group (admin removes, or user leaves)
export const removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const loggedinUser = req.user.id;

    if (!chatId || !userId) {
      return res.status(400).json({ message: "chatId and userId are required" });
    }

    const chat = await Chats.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    // only admin or the user themselves can remove
    if (chat.groupAdmin.toString() !== loggedinUser && userId !== loggedinUser) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    const updated = await Chats.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// rename group
export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    if (!chatId || !chatName) {
      return res.status(400).json({ message: "chatId and chatName are required" });
    }

    const chat = await Chats.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }

    // only admin can rename
    if (chat.groupAdmin.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only admin can rename group" });
    }

    const updated = await Chats.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
