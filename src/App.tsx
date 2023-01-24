import { Socket, io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";

const connectChatServer = (user: string) => {
  const socket = io("localhost:3000", {
    transports: ["websocket"],
  });

  socket.once("connect", () => {
    socket.emit("user-connected", { name: user });
  });

  return socket;
};

const disconnectChatServer = (socket: Socket | null) => {
  if (socket) {
    socket.disconnect();
  }
};

type MessageItem = {
  message: string;
  user: User;
  type: string;
};

type User = {
  name: string;
  color: string;
};

export default function App() {
  const [user, setUser] = useState<string>("");
  const [userColor, setUserColor] = useState<string>("#000");
  const [messageList, setMessageList] = useState<MessageItem[]>([]);
  const [socketIsConnected, setSocketIsConnected] = useState<boolean>(false);
  const [userIsSignedIn, setUserIsSignedIn] = useState<boolean>(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const userSocket = useRef<Socket | null>(null);
  const outerChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userIsSignedIn) {
      userSocket.current = connectChatServer(user);

      userSocket.current.on("server-message", (data) => {
        setMessageList((list: MessageItem[]) => [
          ...list,
          { message: data.message, user: data.user, type: data.type },
        ]);
      });
    } else {
      disconnectChatServer(userSocket.current);
      userSocket.current = null;
      setMessageList([]);
    }
  }, [userIsSignedIn, user]);

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToBottom();
    }
  }, [messageList]);

  const messages = messageList.map((item, idx) => {
    let returnMessage = "";

    if (item.type === "chat") {
      returnMessage = `: ${item.message}`;
    } else if (item.type === "connect" || item.type === "disconnect") {
      returnMessage = ` has ${item.type}ed ${
        item.type === "connect" ? "to" : "from"
      } chat.`;
    } else if (item.type === "banned") {
      returnMessage = " has been BANNED!";
    }

    if (!returnMessage) {
      return null;
    }

    return (
      <li key={idx}>
        <span style={{ color: item.user.color }}>{item.user.name}</span>
        {returnMessage}
      </li>
    );
  });

  function scrollToBottom() {
    outerChatRef.current?.scrollTo({
      top: outerChatRef.current?.scrollHeight ?? 0,
      behavior: "smooth",
    });
  }

  function scrollHandler(event: React.UIEvent<HTMLDivElement>) {
    let scrollBox = event.currentTarget,
      isBottom =
        scrollBox.clientHeight === scrollBox.scrollHeight - scrollBox.scrollTop;

    if (isBottom) {
      setAutoScrollEnabled(true);
    } else {
      setAutoScrollEnabled(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    userSocket.current?.emit("send-message", {
      message: form.get("message") as string,
    });

    e.currentTarget.message.value = "";
    e.currentTarget.message.focus?.();
  }

  return (
    <div className="app">
      <h1>Game Chat</h1>
      <div className="nav">
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="username input"
          disabled={userIsSignedIn}
          value={user ?? ""}
          onChange={(event: React.FormEvent<HTMLInputElement>) =>
            setUser(event.currentTarget.value)
          }
        />
        <button
          className="connect"
          onClick={() => setUserIsSignedIn(!userIsSignedIn)}
          disabled={user === ""}
        >
          {userIsSignedIn ? "Disconnect" : "Connect"}
        </button>
      </div>

      {!userIsSignedIn ? null : (
        <>
          <div
            className="outer-chat"
            ref={outerChatRef}
            onScroll={scrollHandler}
          >
            <ul className="chat">{messages}</ul>
          </div>

          <form className="send-message" onSubmit={onSubmit} method="POST">
            <input
              type="text"
              className="message"
              name="message"
              placeholder="Message"
              autoComplete="off"
            />
            <button className="send" type="submit">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
