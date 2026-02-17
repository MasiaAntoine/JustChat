import { IMessage } from "../../apis/IMessage";
import { memo, useState } from "react";
import { IUserDTO } from "../../apis/IUserDTO";
import { formatDate } from "../../utils/formatDate";
import ImageLightbox from "../ImageLightbox/ImageLightbox";
import "./MessageImageGroup.css";

type Props = {
  messages: IMessage[];
  isSameSender: boolean;
  infoToDisplay: Pick<IUserDTO, "name" | "pictureId">;
  isMe: boolean;
};

const MessageImageGroup = memo(({ messages, isSameSender, infoToDisplay, isMe }: Props) => {
  const first = messages[0];
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const slides = messages.map((msg) => ({ src: msg.image! }));

  return (
    <div
      className="message-container message-image-group"
      data-is-same-sender={isSameSender}
      data-is-me={isMe}
    >
      <div className="message-avatar-container">
        {!isSameSender ? (
          <img
            src={`/assets/avatar/avatar_${infoToDisplay.pictureId}.png`}
            alt={isMe ? "Mon avatar" : "User Avatar"}
          />
        ) : (
          <span className="message-avatar-spacer" />
        )}
      </div>
      <div className="message-bubble-wrapper">
        {!isSameSender && (
          <div className="message-name-container">
            <p>{infoToDisplay.name}</p>
            <span>{formatDate(first.date)}</span>
          </div>
        )}
        <div className="message-image-group-grid">
          {messages.map((msg, i) => (
            <button
              key={i}
              type="button"
              className="message-image-group-item"
              onClick={() => openLightbox(i)}
              aria-label="Agrandir la photo"
            >
              <img src={msg.image} alt="Photo partagée" />
            </button>
          ))}
        </div>
      </div>
      <ImageLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />
    </div>
  );
});

MessageImageGroup.displayName = "MessageImageGroup";
export default MessageImageGroup;
