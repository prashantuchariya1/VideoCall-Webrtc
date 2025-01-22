import React, { useState } from 'react';
import Message from './Message';

const ChatBox = ({ messages, newMessage, setNewMessage, handleSendMessage }) => {
  return (
    <div className="w-full md:w-1/3 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 text-white py-3 px-4">
        <h3 className="font-semibold">Chat</h3>
      </div>

      {/* Messages */}
      <Message messages={messages} />

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-100 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;