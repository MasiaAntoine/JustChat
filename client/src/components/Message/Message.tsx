import { IMessage } from "../../apis/IMessage";
import { memo } from "react";
import "./Message.css";
import { IUserDTO } from "../../apis/IUserDTO";
import { formatDate } from "../../utils/formatDate";

const Message = memo(
  (
    props: IMessage & {
      isSameSender: boolean;
      infoToDisplay: Pick<IUserDTO, "name" | "pictureId">;
      isMe: boolean;
    }
  ) => {
    return (
      <div
        className="message-container"
        data-is-same-sender={props.isSameSender}
        data-is-me={props.isMe}
      >
        <div className="message-avatar-container">
          {!props.isSameSender ? (
            <img
              src={`/assets/avatar/avatar_${props.infoToDisplay.pictureId}.png`}
              alt={props.isMe ? "Mon avatar" : "User Avatar"}
            />
          ) : (
            <span className="message-avatar-spacer" />
          )}
        </div>
        <div className="message-bubble-wrapper">
          {!props.isSameSender && (
            <div className="message-name-container">
              <p>{props.infoToDisplay.name}</p>
              <span>{formatDate(props.date)}</span>
            </div>
          )}
          {props.image && (
            <a href={props.image} target="_blank" rel="noopener noreferrer" className="message-image-link">
              <img src={props.image} alt="Photo partagée" className="message-image" />
            </a>
          )}
          {props.content ? <p className="message-content">{props.content}</p> : null}
        </div>
      </div>
    );
  }
);

export default Message;
