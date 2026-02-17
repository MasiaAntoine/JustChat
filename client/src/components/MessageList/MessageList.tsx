import Message from "../Message/Message";
import MessageImageGroup from "../Message/MessageImageGroup";
import { useMessageList } from "./MessageList.logic";
import "./MessageList.css";
import ScrollBar from "../Scrollbar/ScrollBar";
import Loader from "../Loader/Loader";

const MessageList = () => {
  const logic = useMessageList();
  const blocks = logic.getMessageBlocks();

  return (
    <div ref={logic.chatContainerRef} className="messageList-container">
      <ScrollBar />
      {logic.queryChat?.isFetchingMore && (
        <div className="messageList-load-older">
          <Loader />
        </div>
      )}
      {blocks.map((block, blockIdx) => {
        if (block.type === "single") {
          const item = block.message;
          const isSameSender = logic.isSameSender(block.index);
          const infoToDisplay = logic.getInfos(item);
          const isMe = item.sender === logic.currentUserId;
          return (
            <Message
              key={block.index}
              {...item}
              isSameSender={isSameSender}
              infoToDisplay={infoToDisplay}
              isMe={isMe}
            />
          );
        }
        const isSameSender = logic.isSameSender(block.startIndex);
        const infoToDisplay = logic.getInfos(block.messages[0]);
        const isMe = block.messages[0].sender === logic.currentUserId;
        return (
          <MessageImageGroup
            key={`group-${block.startIndex}`}
            messages={block.messages}
            isSameSender={isSameSender}
            infoToDisplay={infoToDisplay}
            isMe={isMe}
          />
        );
      })}
    </div>
  );
};

export default MessageList;
