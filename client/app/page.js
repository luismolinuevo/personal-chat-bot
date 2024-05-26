"use client";

import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatBox = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      const data = await response.json();
      setMessages([
        ...newMessages,
        { role: "assistant", content: data.answer },
      ]);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    //   <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
    //     <h1 className="text-center text-xl mb-4">Chatbot that knows about me</h1>
    //     <div>
    //       {messages.map((msg, index) => (
    //         <div
    //           key={index}
    //           className={
    //             msg.role === "user" ? "user-message" : "assistant-message"
    //           }
    //         >
    //           <strong>{msg.role.toUpperCase()}:</strong> {msg.content}
    //         </div>
    //       ))}
    //     </div>
    //     <form onSubmit={sendMessage} className="mt-auto">
    //       <input
    //         className="fixed bottom-0 w-full max-w-md p-2 mb-8 border-2 border-gray-300 rounded shadow-xl"
    //         type="text"
    //         value={input}
    //         onChange={(e) => setInput(e.target.value)}
    //         placeholder="Say something..."
    //         disabled={loading}
    //       />
    //     </form>
    //     {loading && <div className="flex"><strong>ASSISTANT: </strong><p>Typing...</p></div>}
    //   </div>
    // );
    <div className="fixed bottom-10 right-10 z-50">
      <button
        className="bg-blue-500 text-white rounded-full w-12 h-12 flex justify-center items-center shadow-lg focus:outline-none"
        onClick={toggleChatBox}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4c0-1.1.9-2 2-2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9l3 3m0 0l-3 3m3-3H9"
          />
        </svg>
      </button>
      {/* Chat Box */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white w-[350px] rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <p>Chat box content goes here...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// import React, { useState } from "react";

// const ChatBot = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleChatBox = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//   <div className="fixed bottom-10 right-10 z-50">
//     <button
//       className="bg-blue-500 text-white rounded-full w-12 h-12 flex justify-center items-center shadow-lg focus:outline-none"
//       onClick={toggleChatBox}
//     >
//       <svg
//         xmlns="http://www.w3.org/2000/svg"
//         className="h-6 w-6"
//         fill="none"
//         viewBox="0 0 24 24"
//         stroke="currentColor"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M3 4c0-1.1.9-2 2-2h14a2 2 0 012 2v16a2 2 0 01-2 2H5a2 2 0 01-2-2V4z"
//         />
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M18 9l3 3m0 0l-3 3m3-3H9"
//         />
//       </svg>
//     </button>
//     {/* Chat Box */}
//     {isOpen && (
//       <div className="absolute bottom-16 right-0 bg-white w-64 rounded-lg shadow-lg border border-gray-200">
//         {/* Chat Box Content */}
//         {/* You can put your chat box content here */}
//         <div className="p-4">
//           <p>Chat box content goes here...</p>
//         </div>
//       </div>
//     )}
//   </div>
// );
// };

// export default ChatBot;
