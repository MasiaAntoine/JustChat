import axios from "axios";
import { tryCatch } from "../../utils/tryCatch";
import { IChat } from "../IChat";
import { isAuthenticate } from "../config/isAuthenticate";
import {
  LOCAL_ROUTE,
  CHAT_MESSAGES_INITIAL_LIMIT,
  CHAT_MESSAGES_LOAD_MORE_LIMIT,
} from "../../const/const";

export type ChatPageResponse = { chat: IChat; hasMore: boolean };

const getChatPageAction = async ({
  queryKey,
  pageParam,
}: {
  queryKey: string[];
  pageParam?: string;
}): Promise<ChatPageResponse> => {
  const userId = queryKey[1];
  const otherUserId = queryKey[2];
  const limit = pageParam ? CHAT_MESSAGES_LOAD_MORE_LIMIT : CHAT_MESSAGES_INITIAL_LIMIT;
  let url = `${LOCAL_ROUTE}/chat?userId=${userId}&otherUserId=${otherUserId}&limit=${limit}`;
  if (pageParam) url += `&before=${encodeURIComponent(pageParam)}`;
  const response = await axios.get(url, isAuthenticate());
  return { chat: response.data.chat, hasMore: response.data.hasMore };
};

const getChatAction = async ({ queryKey }: { queryKey: string[] }): Promise<IChat> => {
  const response = await axios.get(`${LOCAL_ROUTE}/chat?userId=${queryKey[1]}&otherUserId=${queryKey[2]}`, isAuthenticate());
  return response.data.chat;
};

const deleteChatAction = async ({
  userId,
  otherUserId,
}: {
  userId: string;
  otherUserId: string;
}): Promise<{ deleted: boolean }> => {
  const response = await axios.delete(
    `${LOCAL_ROUTE}/chat?userId=${encodeURIComponent(userId)}&otherUserId=${encodeURIComponent(otherUserId)}`,
    isAuthenticate()
  );
  return response.data;
};

export const getChatPage = tryCatch(getChatPageAction);
export const getChat = tryCatch(getChatAction);
export const deleteChat = tryCatch(deleteChatAction);
