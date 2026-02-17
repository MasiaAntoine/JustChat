import "./ChatTop.css";
import { Link } from "react-router-dom";
import { useChatTop } from "./ChatTop.logic";

const ChatTop = () => {
  const logic = useChatTop();

  if (!logic.contact) return <></>;

  return (
    <div className="chatTop-container">
      <div className="chatTop-user-card">
        <Link
          to="/home"
          replace
          className="chatTop-close-chat"
          title="Quitter le chat"
          aria-label="Quitter le chat"
          onClick={() => console.log("Clic sur quitter le chat")}
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
