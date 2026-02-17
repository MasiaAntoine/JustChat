import DialogBanner from "../DialogBanner/DialogBanner";
import "./DeleteChatDialog.css";
import { useDeleteChatDialog } from "./DeleteChatDialog.logic";

const DeleteChatDialog = () => {
  const logic = useDeleteChatDialog();

  return (
    <div className="deleteDialog-container">
      <DialogBanner icon={<></>} title="Supprimer le chat" alert />
      <div className="deleteDialog-content">
        <p>
          Êtes-vous sûr de vouloir supprimer tout le chat pour vous et l&apos;autre utilisateur ?{" "}
          <strong>Cela est irréversible.</strong>
        </p>
      </div>
      <div className="deleteDialog-footer">
        <button type="button" onClick={logic.handleClose}>
          Annuler
        </button>
        <button type="button" onClick={logic.handleConfirm} data-cta>
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default DeleteChatDialog;
