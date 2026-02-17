import "./ChatTop.css";
import { Link, useParams } from "react-router-dom";
import { useChatTop } from "./ChatTop.logic";

const ChatTop = () => {
  const logic = useChatTop();
  const params = useParams();

  if (!logic.contact) return <></>;

  return (
    <div className="chatTop-container">
      <div className="chatTop-user-card">
        <button
          type="button"
          className="chatTop-delete-chat"
          title="Supprimer tout le chat"
          aria-label="Supprimer tout le chat"
          onClick={() => logic.openDeleteChatDialog(params.id)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
        <Link
          to="/home"
          replace
          className="chatTop-close-chat"
          title="Quitter le chat"
          aria-label="Quitter le chat"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" />
          </svg>
        </Link>
        <div className="chatTop-user-card-left">
          <img src={`/assets/avatar/avatar_${logic.contact.pictureId}.png`} alt="User Avatar" />
          <p>{logic.contact.name}</p>
          <div className="chatTop-online-container" data-online={logic.contact.online}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatTop;
