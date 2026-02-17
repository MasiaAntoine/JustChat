import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "react-query";
import { IAppDispatch, IRootState } from "../../redux/store";
import { setDialog } from "../../redux/reducers/dialogReducer";
import { deleteChat } from "../../apis/actions/ChatAction";
import { QUERY_KEY } from "../../hooks/useQueryCache/queryKey";

export const useDeleteChatDialog = () => {
  const dispatch = useDispatch<IAppDispatch>();
  const user = useSelector((s: IRootState) => s.user);
  const dialogData = useSelector((s: IRootState) => s.dialog.data) as { otherUserId: string } | undefined;
  const queryClient = useQueryClient();

  const handleClose = useCallback(() => {
    dispatch(setDialog({ isOpen: undefined, data: undefined }));
  }, [dispatch]);

  const handleConfirm = useCallback(async () => {
    if (!user._id || !dialogData?.otherUserId) return;
    try {
      await deleteChat({ userId: user._id, otherUserId: dialogData.otherUserId });
      queryClient.invalidateQueries([QUERY_KEY.CHAT, user._id, dialogData.otherUserId]);
      dispatch(setDialog({ isOpen: undefined, data: undefined }));
    } catch {
      // Erreur réseau ou serveur : on laisse le dialog ouvert
    }
  }, [user._id, dialogData?.otherUserId, queryClient, dispatch]);

  return { handleClose, handleConfirm };
};
