import React, { useState } from "react";
import Login from "./Login";
import ipc from "./ipc";
import QueuedMessages from './QueuedMessages';

export default function App() {
  return (
    <Login>
      <QueuedMessages />
    </Login>
  );
}

function TestSendForm() {
  const [message, setMessage] = useState("");
  function handleSend(e) {
    ipc.send("sendMessage", message);
    setMessage("");
    e.preventDefault();
  }
  return (
    <form onSubmit={handleSend}>
      <input type="text" value={message} onChange={e => setMessage(e.target.value)} />
      <input type="submit" value="send" />
    </form>
  );
}
