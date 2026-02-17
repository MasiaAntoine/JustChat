import { IMessage } from "../../apis/IMessage";
import { memo } from "react";
import { IUserDTO } from "../../apis/IUserDTO";
import { formatDate } from "../../utils/formatDate";
import "./MessageImageGroup.css";

type Props = {
  messages: IMessage[];
  isSameSender: boolean;
  infoToDisplay: Pick<IUserDTO, "name" | "pictureId">;
  isMe: boolean;
};

const MessageImageGroup = memo(({ messages, isSameSender, infoToDisplay, isMe }: Props) => {
  const first = messages[0];
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
            <a
              key={i}
              href={msg.image}
              target="_blank"
              rel="noopener noreferrer"
              className="message-image-group-item"
            >
              <img src={msg.image} alt="Photo partagée" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

MessageImageGroup.displayName = "MessageImageGroup";
export default MessageImageGroup;
