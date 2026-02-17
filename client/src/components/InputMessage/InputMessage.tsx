import { useState, useRef, useEffect } from "react";
import { useInputMessage } from "./InputMessage.logic";
import "./InputMessage.css";
import EmojiButton from "../InputButton/EmojiButton";
import SendIcon from "../../icons/SendIcon/SendIcon";

const InputMessage = () => {
  const logic = useInputMessage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const canSend = !!(logic.message.trim() || logic.pendingImages.length);

  return (
    <div className="input-message-container">
      {logic.pendingImages.length > 0 && (
        <div className="input-message-preview-list">
          {logic.pendingImages.map((src, index) => (
            <div key={index} className="input-message-preview">
              <img src={src} alt={`Aperçu ${index + 1}`} />
              <button
                type="button"
                className="input-message-preview-remove"
                onClick={() => logic.handleRemovePendingImage(index)}
                aria-label="Retirer la photo"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="input-message-row">
        <div className="input-message-plus-wrap" ref={menuRef}>
          <button
            type="button"
            className="input-message-plus"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            +
          </button>
          {menuOpen && (
            <div className="input-message-menu">
              <button type="button" onClick={() => { logic.handlePhotoClick(); setMenuOpen(false); }}>
                Photo
              </button>
            </div>
          )}
          <input
            ref={logic.fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="input-message-file-inp"
            onChange={logic.handleFileChange}
          />
        </div>
        <div className="input-message-content">
          <input
            className="input-message-inp"
            type="text"
            placeholder="Envoyer un message"
            value={logic.message}
            onChange={logic.handleInput}
          />
          <div className="input-message-button-container">
            <EmojiButton setEmoji={logic.setEmoji} />
          </div>
        </div>
      </div>
      <button
        onClick={logic.handleSubmit}
        data-form-validity={canSend}
        className="input-message-submit input-message-submit-desktop"
      >
        Envoyer
      </button>
      <button
        onClick={logic.handleSubmit}
        data-form-validity={canSend}
        className="input-message-submit input-message-submit-mobile"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default InputMessage;
