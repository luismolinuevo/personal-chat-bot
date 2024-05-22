"use client";

import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  console.log("Messages received:", messages);

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}


// import { useCompletion } from 'ai/react';
// import React, { useState } from 'react';

// export default function Chat() {
//   const [inputValue, setInputValue] = useState('');
//   const { completion, input, handleInputChange, handleSubmit } = useCompletion();

//   const handleInput = (e) => {
//     setInputValue(e.target.value);
//     handleInputChange(e); // Forward input change event to the completion hook
//   };

//   const submitForm = (e) => {
//     e.preventDefault();
//     handleSubmit(e); // Forward form submission event to the completion hook
//   };

//   return (
//     <div>
//       {completion}
//       <form onSubmit={submitForm}>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={handleInput}
//           placeholder="Enter your message..."
//         />
//         <button type="submit">Send</button>
//       </form>
//     </div>
//   );
// }
