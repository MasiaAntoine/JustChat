import { useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { IRootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { ISocketEvent } from "../../apis/ISocketEvent";
import { QUERY_KEY } from "../../hooks/useQueryCache/queryKey";
import { useChatCache } from "../../hooks/useQueryCache/useChatCache";
import { ChatPageResponse } from "../../apis/actions/ChatAction";
import { uploadImage } from "../../apis/actions/UploadImageAction";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { reducer, initialState, IAction } from "./InputMessage.reducer";

export const useInputMessage = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { emitEvent } = useSelector((s: IRootState) => s.socket);
  const userId = useSelector((s: IRootState) => s.user._id);
  const { queryChat } = useChatCache();
  const scrollToBottom = useSelector((s: IRootState) => s.chat.scroll.scrollToBottom);

  // States
  const [state, dispatch] = useReducer(reducer, { ...initialState });

  // Ref
  const messageRef = useRef<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.addEventListener("keypress", submitWithKeypress);
    messageRef.current = state.message;
    return () => window.removeEventListener("keypress", submitWithKeypress);
  }, [state.message]);

  /**
   * This function is used to submit form by pressing Enter key
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {void}
   */
  const submitWithKeypress = (e: KeyboardEvent): void => {
    if (e.key !== "Enter") return;
    handleSubmit();
  };

  /**
   * This function is used to add emoji to message input and update value with the new emoji added.
   * @param {string} emoji - The emoji string
   * @returns {void}
   */
  const setEmoji = useCallback((emoji: string): void => {
    const updatedInp = `${messageRef.current}${emoji}`;
    const payload = { ...state, message: updatedInp };
    dispatch({ type: IAction.SET_MESSAGE, payload });
  }, []);

  /**
   * This function is used to fill state with input data that user insert.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input event
   * @returns {void}
   */
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const payload = { ...state, message: e.target.value };
    dispatch({ type: IAction.SET_MESSAGE, payload });
  };

  /**
   * This function is used to submit form and update chat cache
   * @param {{message: string}} formData - Input values from useForm
   * @returns {void}
   */
  const addMessageToCache = useCallback(
    (message: { conversationId?: string; content: string; date: Date; receiver: string; sender: string; image?: string }) => {
      const key = [QUERY_KEY.CHAT, userId, params.id];
      queryClient.setQueryData(key, (old: { pages: ChatPageResponse[]; pageParams: unknown[] } | undefined) => {
        if (!old?.pages?.length) return old;
        const pages = [...old.pages];
        pages[0] = {
          ...pages[0],
          chat: { ...pages[0].chat, messages: [...pages[0].chat.messages, message] },
        };
        return { ...old, pages };
      });
      emitEvent(ISocketEvent.SEND_MESSAGE, message);
    },
    [queryClient, userId, params.id, emitEvent]
  );

  const handleSubmit = (): void => {
    if (!state.message.trim() && !state.pendingImages.length) return;

    const base = {
      conversationId: queryChat.data._id,
      receiver: params.id,
      sender: userId,
      date: new Date(),
    };

    if (state.message.trim()) {
      addMessageToCache({ ...base, content: state.message.trim() });
    }
    state.pendingImages.forEach((image) => {
      addMessageToCache({ ...base, content: "", image });
    });

    scrollToBottom();
    dispatch({ type: IAction.SET_MESSAGE, payload: { ...state, message: "", pendingImages: [] } });
  };

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!imageFiles.length) return;
      try {
        const dataUrls = await Promise.all(imageFiles.map((file) => uploadImage(file)));
        dispatch({
          type: IAction.SET_PENDING_IMAGES,
          payload: { pendingImages: [...state.pendingImages, ...dataUrls] },
        });
      } catch (err) {
        console.error(err);
      }
      e.target.value = "";
    },
    [state.pendingImages]
  );

  const handleRemovePendingImage = useCallback(
    (index: number) => {
      dispatch({
        type: IAction.SET_PENDING_IMAGES,
        payload: { pendingImages: state.pendingImages.filter((_, i) => i !== index) },
      });
    },
    [state.pendingImages]
  );

  return {
    ...state,
    handleSubmit,
    setEmoji,
    handleInput,
    handlePhotoClick,
    handleFileChange,
    handleRemovePendingImage,
    fileInputRef,
  };
};
