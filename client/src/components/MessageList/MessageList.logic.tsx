/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "react-query";
import { useDispatch, useSelector } from "react-redux";
import { IAppDispatch, IRootState } from "../../redux/store";
import { parseSocketEvent } from "../../utils/parseSocketEvent";
import { ISocketEvent } from "../../apis/ISocketEvent";
import { IMessage } from "../../apis/IMessage";
import { useParams } from "react-router-dom";
import { QUERY_KEY } from "../../hooks/useQueryCache/queryKey";
import { IUserDTO } from "../../apis/IUserDTO";
import { useChatCache } from "../../hooks/useQueryCache/useChatCache";
import { setChatContainerRef } from "../../redux/reducers/chatReducer";
import { useContactCache } from "../../hooks/useQueryCache/useContactCache";
import { ChatPageResponse } from "../../apis/actions/ChatAction";
import { IUser } from "../../apis/IUser";

export type MessageBlock =
  | { type: "single"; message: IMessage; index: number }
  | { type: "imageGroup"; messages: IMessage[]; startIndex: number };

const SCROLL_LOAD_MORE_THRESHOLD = 80;

export const useMessageList = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { webSocket } = useSelector((s: IRootState) => s.socket);
  const user = useSelector((s: IRootState) => s.user);
  const { scroll } = useSelector((s: IRootState) => s.chat);
  const { queryContact } = useContactCache();
  const { queryChat } = useChatCache();

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const dispatchCtx = useDispatch<IAppDispatch>();
  const scrollHeightBeforeFetch = useRef(0);
  const scrollTopBeforeFetch = useRef(0);
  const isLoadingOlder = useRef(false);

  useEffect(() => {
    dispatchCtx(setChatContainerRef(chatContainerRef.current));
  }, []);

  useEffect(() => {
    if (!webSocket) return;
    webSocket.addEventListener("message", onEvent);
    return () => {
      webSocket.removeEventListener("message", onEvent);
    };
  }, [webSocket, queryChat.data]);

  const onEvent = (event: unknown): void => {
    const { type, data: dataEvent } = parseSocketEvent(event);
    switch (type) {
      case ISocketEvent.SEND_MESSAGE:
        onReceiveMessage(dataEvent as Omit<IMessage, "conversationId">);
        break;
      case ISocketEvent.USER_IS_CONNECTED:
      case ISocketEvent.USER_IS_DISCONNECTED: {
        const userEvent = dataEvent as IUser;
        if (userEvent._id === params.id) {
          queryClient.setQueryData(
            [QUERY_KEY.CONTACT, params.id],
            (old: { user: IUserDTO } | undefined) =>
              old ? { user: { ...old.user, online: type === ISocketEvent.USER_IS_CONNECTED } } : old
          );
        }
        queryClient.invalidateQueries([QUERY_KEY.USERS, user._id]);
        break;
      }
      default:
        break;
    }
  };

  const onReceiveMessage = (message: Omit<IMessage, "conversationId">): void => {
    if (message.sender !== params.id) return;
    const key = [QUERY_KEY.CHAT, user._id, params.id];
    queryClient.setQueryData(key, (old: { pages: ChatPageResponse[]; pageParams: unknown[] } | undefined) => {
      if (!old?.pages?.length) return old;
      const pages = [...old.pages];
      const mostRecentPageIdx = 0;
      pages[mostRecentPageIdx] = {
        ...pages[mostRecentPageIdx],
        chat: { ...pages[mostRecentPageIdx].chat, messages: [...pages[mostRecentPageIdx].chat.messages, message] },
      };
      return { ...old, pages };
    });
    scroll.scrollToBottom();
  };

  /**
   * This function is used to know if the last message is from the same people
   * @param {number} currentIdx - Index to get last message
   * @returns {boolean}
   */
  const isSameSender = (currentIdx: number): boolean => {
    const { messages } = queryChat.data;
    const prevMessageIdx = currentIdx - 1;
    if (prevMessageIdx < 0) return false;
    return messages[currentIdx].sender === messages[prevMessageIdx].sender;
  };

  /**
   * This function is used to know which information we should display on message
   * @param {IMessage} item - Message informations
   * @returns {Pick<IUserDTO, "name" | "pictureId">}
   */
  const getInfos = (item: IMessage): Pick<IUserDTO, "name" | "pictureId"> => {
    const contact = queryContact.data!.user;
    const isMe = item.sender === user._id;
    if (isMe) {
      return { name: user.name, pictureId: user.pictureId };
    } else {
      return { name: contact.name, pictureId: contact.pictureId };
    }
  };

  const handleScroll = useCallback(() => {
    const el = chatContainerRef.current;
    if (!el || !queryChat.hasMoreOlder || queryChat.isFetchingMore || isLoadingOlder.current) return;
    if (el.scrollTop <= SCROLL_LOAD_MORE_THRESHOLD) {
      isLoadingOlder.current = true;
      scrollHeightBeforeFetch.current = el.scrollHeight;
      scrollTopBeforeFetch.current = el.scrollTop;
      queryChat.fetchMoreOlder();
    }
  }, [queryChat.hasMoreOlder, queryChat.isFetchingMore, queryChat.fetchMoreOlder]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el || !isLoadingOlder.current) return;
    if (!queryChat.isFetchingMore) {
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = newHeight - scrollHeightBeforeFetch.current + scrollTopBeforeFetch.current;
        isLoadingOlder.current = false;
      });
    }
  }, [queryChat.data.messages.length, queryChat.isFetchingMore]);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /**
   * Regroupe les messages photo consécutifs du même expéditeur pour affichage en grille (3 par ligne).
   */
  const getMessageBlocks = useCallback((): MessageBlock[] => {
    const messages = queryChat.data.messages || [];
    const blocks: MessageBlock[] = [];
    const imageOnly = (m: IMessage) => !!(m.image && !(m.content || "").trim());

    let i = 0;
    while (i < messages.length) {
      const msg = messages[i];
      if (imageOnly(msg)) {
        let j = i;
        while (j < messages.length && messages[j].sender === msg.sender && imageOnly(messages[j])) {
          j++;
        }
        if (j > i) {
          blocks.push({ type: "imageGroup", messages: messages.slice(i, j), startIndex: i });
          i = j;
          continue;
        }
      }
      blocks.push({ type: "single", message: msg, index: i });
      i++;
    }
    return blocks;
  }, [queryChat.data.messages]);

  return {
    chat: queryChat.data,
    queryChat,
    isSameSender,
    getInfos,
    getMessageBlocks,
    chatContainerRef,
    currentUserId: user._id,
  };
};
