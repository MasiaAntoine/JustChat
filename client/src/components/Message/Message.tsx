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
          <p className="message-content">{props.content}</p>
        </div>
      </div>
    );
  }
);

export default Message;
