import { Socket, io } from "socket.io-client";
import { useEffect, useState, useRef } from "react";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { Chat } from "./components/Chat";
import { cx } from "./utils";

import type { MessageItem } from "./types";

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

export default function App() {
  const [user, setUser] = useState<string>("");
  const [messageList, setMessageList] = useState<MessageItem[]>([]);
  const [userIsSignedIn, setUserIsSignedIn] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const userSocket = useRef<Socket | null>(null);
  const messageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userIsSignedIn) {
      userSocket.current = connectChatServer(user);

      userSocket.current?.on("connect", () => {
        setIsConnected(true);
      });

      userSocket.current?.on("disconnect", () => {
        setIsConnected(false);
      });

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
    if (isConnected) {
      messageRef.current?.focus();
    }
  }, [isConnected]);

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
    <div className="m-auto p-6 md:max-w-screen-md w-full">
      <div className="bg-gray-50 py-6 rounded-lg">
        <div className="w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUserIsSignedIn(!userIsSignedIn);
            }}
            className="flex px-6"
          >
            <Input
              type="text"
              placeholder="Enter a username to start chatting"
              name="username"
              disabled={userIsSignedIn}
              value={user ?? ""}
              onChange={(event: React.FormEvent<HTMLInputElement>) =>
                setUser(event.currentTarget.value)
              }
              className="mr-6"
            />
            <Button
              type="submit"
              className={cx(isConnected ? "bg-red-700" : "bg-green-700")}
              disabled={user === "" || (userIsSignedIn && !isConnected)}
            >
              {userIsSignedIn
                ? isConnected
                  ? "Disconnect"
                  : "Connecting..."
                : "Connect"}
            </Button>
          </form>
        </div>

        {!userIsSignedIn ? null : (
          <>
            <Chat messages={messageList} />
            <form className="flex px-6" onSubmit={onSubmit} method="POST">
              <Input
                ref={messageRef}
                type="text"
                name="message"
                placeholder="Type a message"
                autoComplete="off"
                className="mr-6"
                disabled={!isConnected}
              />
              <Button className="send" type="submit" disabled={!isConnected}>
                Send
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
