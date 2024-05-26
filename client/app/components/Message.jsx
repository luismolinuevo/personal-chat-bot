import React from "react";

export default function Message({ type, message }) {
  return (
    <div
      className={`p-2 text-[15px] ${type == "user" ? "bg-green-200" : "bg-gray-300"}`}
    >
        {message}
    </div>
  );
}
