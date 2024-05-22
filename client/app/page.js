"use client";

import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.answer },
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <h1 className="text-center text-xl mb-4">Chatbot that knows about me</h1>
      <div>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.role === "user" ? "user-message" : "assistant-message"
            }
          >
            <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="mt-auto">
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something..."
          disabled={loading}
        />
      </form>
      {loading && <div className="flex"><strong>ASSISTANT: </strong><p>Typing...</p></div>}
    </div>
  );
}
