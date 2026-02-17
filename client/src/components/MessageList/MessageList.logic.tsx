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

  return {
    chat: queryChat.data,
    queryChat,
    isSameSender,
    getInfos,
    chatContainerRef,
    currentUserId: user._id,
  };
};
