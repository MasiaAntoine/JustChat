import { Request, Response } from "express";
import { User } from "../models/User.js";
import { Chat } from "../models/Chat.js";
import { tryCatch } from "../utils/tryCatch.js";
import { IChat } from "../types/IChat.js";
import { AppError } from "../utils/AppError.js";
import { IErrorCode } from "../types/IErrorCode.js";
import { IStatusCode } from "../types/IStatusCode.js";
import { chatDeleted } from "../hub/hubEvent.js";

const MESSAGES_PAGE_SIZE = 10;

export const getChatController = async (
  req: Request<{}, {}, {}, { userId: string; otherUserId: string; limit?: string; before?: string }>,
  res: Response<{ chat: IChat; hasMore: boolean }>
): Promise<void> => {
  let chat: IChat;
  const { userId, otherUserId, limit: limitParam, before: beforeParam } = req.query;
  const limit = Math.min(Math.max(1, parseInt(limitParam || String(MESSAGES_PAGE_SIZE), 10) || MESSAGES_PAGE_SIZE), 50);
  const beforeDate = beforeParam ? new Date(beforeParam) : null;
  if (beforeDate && Number.isNaN(beforeDate.getTime())) throw new AppError(IErrorCode.UNEXCPECTED_ERROR, "Invalid before date", IStatusCode.BAD_REQUEST);

  const getUsersAsync = [userId, otherUserId].map((id) => User.findOne({ _id: id }).select("+conversationIds"));
  const users = await Promise.all(getUsersAsync);
  const [user1, user2] = users;

  if (!user1 || !user2)
    throw new AppError(IErrorCode.USERS_NOT_FOUND, "Cannot get users to chat", IStatusCode.NOT_FOUND);

  const conversationId = user1.conversationIds.filter((id: string) => user2.conversationIds.includes(id))[0];
  if (conversationId) {
    const chatDoc = await Chat.findOne({ _id: conversationId }).lean();
    if (!chatDoc) throw new AppError(IErrorCode.NO_CHAT_FOUND, "Cannot get Chat infos", IStatusCode.NOT_FOUND);
    const messages = (chatDoc.messages || []) as IChat["messages"];
    const sorted = [...messages].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let slice: IChat["messages"];
    let hasMore: boolean;
    if (beforeDate) {
      const older = sorted.filter((m) => new Date(m.date).getTime() < beforeDate.getTime());
      slice = older.slice(-limit);
      hasMore = older.length > limit;
    } else {
      slice = sorted.slice(-limit);
      hasMore = sorted.length > limit;
    }
    chat = { _id: chatDoc._id.toString(), createdAt: chatDoc.createdAt, messages: slice };
    res.status(IStatusCode.OK).json({ chat, hasMore });
    return;
  }

  chat = await Chat.create({ createdAt: Date.now(), messages: [] });
  if (!chat) throw new AppError(IErrorCode.CANNOT_CREATE_CHAT, "Cannot create Chat", IStatusCode.BAD_REQUEST);
  users.forEach((user) => {
    user?.conversationIds.push(chat._id);
    user?.save();
  });
  res.status(IStatusCode.OK).json({ chat: { _id: chat._id, createdAt: chat.createdAt, messages: chat.messages }, hasMore: false });
};

export const getChat = tryCatch(getChatController);

export const deleteChatController = async (
  req: Request<{}, {}, {}, { userId: string; otherUserId: string }>,
  res: Response
): Promise<void> => {
  const { userId, otherUserId } = req.query;
  if (!userId || !otherUserId)
    throw new AppError(IErrorCode.UNEXCPECTED_ERROR, "userId and otherUserId required", IStatusCode.BAD_REQUEST);

  const getUsersAsync = [userId, otherUserId].map((id) => User.findOne({ _id: id }).select("+conversationIds"));
  const users = await Promise.all(getUsersAsync);
  const [user1, user2] = users;

  if (!user1 || !user2)
    throw new AppError(IErrorCode.USERS_NOT_FOUND, "Cannot get users", IStatusCode.NOT_FOUND);

  const conversationId = user1.conversationIds.filter((id: string) => user2.conversationIds.includes(id))[0];
  if (!conversationId) {
    res.status(IStatusCode.OK).json({ deleted: true });
    return;
  }

  const chatDoc = await Chat.findById(conversationId);
  if (!chatDoc) {
    res.status(IStatusCode.OK).json({ deleted: true });
    return;
  }

  chatDoc.messages = [];
  await chatDoc.save();
  chatDeleted(userId, otherUserId);
  res.status(IStatusCode.OK).json({ deleted: true });
};

export const deleteChat = tryCatch(deleteChatController);
