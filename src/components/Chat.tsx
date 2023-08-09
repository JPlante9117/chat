import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cx } from "../utils";
import type { MessageItem } from "../types";

type Props = {
  messages: MessageItem[];
};

export const Chat = ({ messages }: Props) => {
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const chatRef = useRef<HTMLDivElement>(null);

  const scrollHandler = (event: React.UIEvent<HTMLDivElement>) => {
    let scrollBox = event.currentTarget,
      isBottom =
        scrollBox.clientHeight === scrollBox.scrollHeight - scrollBox.scrollTop;

    if (isBottom) {
      setAutoScrollEnabled(true);
    } else {
      setAutoScrollEnabled(false);
    }
  };

  const renderedMessages = messages.map((item, idx) => {
    let returnMessage = "";
    let className = "text-gray-950";

    if (item.type === "chat") {
      returnMessage = `: ${item.message}`;
    } else if (item.type === "connect" || item.type === "disconnect") {
      className = "text-gray-500";
      returnMessage = ` has ${item.type}ed ${
        item.type === "connect" ? "to" : "from"
      } chat.`;
    } else if (item.type === "banned") {
      className = "text-red-950";
      returnMessage = " has been BANNED!";
    }

    if (!returnMessage) {
      return null;
    }

    return (
      <motion.li
        transition={{ type: "tween", duration: 1 / 8 }}
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        className={cx("py-1 px-6", className)}
        key={idx}
      >
        <span className="font-bold" style={{ color: item.user.color }}>
          {item.user.name}
        </span>
        {returnMessage}
      </motion.li>
    );
  });

  function scrollToBottom() {
    chatRef.current?.scrollTo({
      top: chatRef.current?.scrollHeight ?? 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div
      className="h-[500px] overflow-y-scroll overflow-x-hidden my-6"
      ref={chatRef}
      onScroll={scrollHandler}
    >
      <ul className="chat">{renderedMessages}</ul>
    </div>
  );
};
