import { useDispatch } from "react-redux";
import { IAppDispatch } from "../../redux/store";
import { useContactCache } from "../../hooks/useQueryCache/useContactCache";
import { setDialog } from "../../redux/reducers/dialogReducer";
import { IDialogs } from "../../types/Dialogs/IDialogs";

export const useChatTop = () => {
  const dispatch = useDispatch<IAppDispatch>();
  const { queryContact } = useContactCache();

  const openDeleteChatDialog = (otherUserId: string | undefined) => {
    if (!otherUserId) return;
    dispatch(setDialog({ isOpen: IDialogs.DELETE_CHAT, data: { otherUserId } }));
  };

  return { contact: queryContact.data?.user, openDeleteChatDialog };
};
