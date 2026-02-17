import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import { IMessage } from "../types/IMessage.js";
import { ISocketEvent } from "../types/ISocketEvent.js";
import { IUser } from "../types/IUser.js";
import WebSocket from "ws";
import { encryptMessage } from "../utils/encryption.js";

let clients: { userId: string; client: WebSocket }[] = [];

/**
 * Remove a client from the list when their socket closes (disconnect, refresh, etc.)
 * Notifies other clients and updates DB so they see the user as offline.
 */
export const removeClientBySocket = async (ws: WebSocket): Promise<void> => {
  const entry = clients.find((item) => item.client === ws);
  if (entry) {
    clients = clients.filter((item) => item.client !== ws);
    const userDoc = await User.findById(entry.userId).select("name email pictureId _id").lean();
    const userPayload = userDoc ? { ...userDoc, online: false } : ({ _id: entry.userId } as IUser);
    await userIsDisconnected(userPayload as IUser);
  }
};

/**
 * This function is used to handle user connection
 * @param {WebSocket} ws - Websocket event
 * @param {IUser} user - Concerned user
 * @returns {Promise<void>}
 */
export const userIsConnected = async (ws: WebSocket, user: IUser): Promise<void> => {
  const { _id } = user;
  if (!_id) return;
  // Replace existing entry if user reconnects (e.g. after refresh)
  clients = clients.filter((item) => item.userId !== _id);
  clients.push({ userId: _id, client: ws });
  await User.findOneAndUpdate({ _id }, { online: true });
  const event = { type: ISocketEvent.USER_IS_CONNECTED, data: { ...user, online: true } };
  sendToClient(event, "ALL");
};

/**
 * This function is used to handle user diconnection
 * @param {IUser} user - Concerned user
 * @returns {Promise<void>}
 */
export const userIsDisconnected = async (user: IUser): Promise<void> => {
  const { _id } = user;
  if (!_id) return;
  clients = clients.filter((item) => item.userId !== _id);
  await User.findOneAndUpdate({ _id }, { online: false });
  const event = { type: ISocketEvent.USER_IS_DISCONNECTED, data: user };
  sendToClient(event, "ALL");
};

/**
 * This function is used to handle user update
 * @param {IUser} user - Concerned user
 * @returns {void}
 */
export const userUpdate = (user: IUser): void => {
  const { _id } = user;
  if (!_id) return;
  const filterCaller = clients.filter((item) => item.userId !== _id);
  const userIds = filterCaller.map((item) => item.userId);
  const event = { type: ISocketEvent.USER_UDPATE, data: user };
  sendToClient(event, userIds);
};

/**
 * This function is used to handle user delete account
 * @param {IUser} user - Concerned user
 * @returns {void}
 */
export const userDelete = (user: IUser): void => {
  const { _id } = user;
  if (!_id) return;
  const filterCaller = clients.filter((item) => item.userId !== _id);
  const userIds = filterCaller.map((item) => item.userId);
  const event = { type: ISocketEvent.USER_DELETE, data: user };
  sendToClient(event, userIds);
};

/**
 * This function is used to handle send message between 2 users
 * @param {IMessage} message - Message informations
 * @returns {Promise<void>}
 */
export const sendMessage = async (message: IMessage): Promise<void> => {
  const chat = await Chat.findOne({ _id: message.conversationId });
  if (!chat) return;
  delete message["conversationId"];
  const { content, image } = encryptMessage({ content: message.content, image: message.image });
  const messageToStore: IMessage = {
    ...message,
    content,
    ...(image !== undefined && { image }),
  };
  chat.messages.push(messageToStore);
  chat.save();
  const event = { type: ISocketEvent.SEND_MESSAGE, data: message };
  sendToClient(event, [message.receiver]);
};

/**
 * Notify both participants that the conversation was deleted (messages cleared).
 * @param userId - First user id
 * @param otherUserId - Second user id
 */
export const chatDeleted = (userId: string, otherUserId: string): void => {
  const event = { type: ISocketEvent.CHAT_DELETED, data: { userId, otherUserId } };
  sendToClient(event, [userId, otherUserId]);
};

/**
 * This function is used to send events to concerned users
 * @param {{ type: ISocketEvent; data: unknown }} evt - Event type and associated datas
 * @param {string[] | "ALL"} target - To know who we should notify
 * @returns {void}
 */
const sendToClient = (evt: { type: ISocketEvent; data: unknown }, target: string[] | "ALL"): void => {
  let clientsToSend: WebSocket[] = [];
  if (target === "ALL") {
    clientsToSend = clients.map((item) => item.client);
  } else {
    const getIds = clients.filter((item) => target.includes(item.userId));
    clientsToSend = getIds.map((item) => item.client);
  }
  clientsToSend.forEach((c) => {
    if (c.readyState !== 1) return;
    c.send(JSON.stringify(evt));
  });
};
