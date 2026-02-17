import { useSelector } from "react-redux";
import { getChatPage, ChatPageResponse } from "../../apis/actions/ChatAction";
import { IRootState } from "../../redux/store";
import { queryOptions } from "./queryOptions";
import { useInfiniteQuery } from "react-query";
import { IChat } from "../../apis/IChat";
import { QUERY_KEY } from "./queryKey";
import { useParams } from "react-router-dom";

const getChatPageQueryFn = ({ queryKey, pageParam }: { queryKey: string[]; pageParam?: string }) =>
  getChatPage({ queryKey, pageParam });

export const useChatCache = () => {
  const userId = useSelector((s: IRootState) => s.user._id);
  const params = useParams();

  const infiniteQuery = useInfiniteQuery<ChatPageResponse>(
    [QUERY_KEY.CHAT, userId, params.id],
    getChatPageQueryFn,
    {
      ...queryOptions,
      staleTime: Infinity,
      getNextPageParam: (lastPage: ChatPageResponse) => {
        if (!lastPage.hasMore || !lastPage.chat.messages.length) return undefined;
        const oldest = lastPage.chat.messages[0];
        return oldest?.date ? new Date(oldest.date).toISOString() : undefined;
      },
      enabled: !!(userId && params.id),
    }
  );

  const pages = infiniteQuery.data?.pages ?? [];
  const messages = [...pages].reverse().flatMap((p) => p.chat.messages);
  const chatId = pages[0]?.chat._id ?? pages[pages.length - 1]?.chat._id;
  const createdAt = pages[0]?.chat.createdAt ?? pages[pages.length - 1]?.chat.createdAt;
  const hasMoreOlder = infiniteQuery.hasNextPage ?? false;

  const chatData: IChat = {
    _id: chatId ?? "",
    createdAt: createdAt ?? new Date(),
    messages,
  };

  return {
    queryChat: {
      ...infiniteQuery,
      data: chatData,
      hasMoreOlder,
isFetchingMore: infiniteQuery.isFetchingNextPage,
    fetchMoreOlder: infiniteQuery.fetchNextPage,
    },
  };
};
