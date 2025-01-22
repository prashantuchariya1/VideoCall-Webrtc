import React from 'react';

const Message = ({ messages }) => {
  return (
    <div className="flex-grow p-4 overflow-y-auto bg-gray-50" style={{ maxHeight: 'calc(100vh - 300px)' }}>
      <div className="space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.sender === 'You' ? 'bg-blue-100 ml-auto max-w-[80%]' :
              msg.sender === 'system' ? 'bg-gray-200 max-w-[80%] mx-auto italic' :
              'bg-gray-100 max-w-[80%]'
            }`}
          >
            {msg.sender !== 'system' && (
              <div className="font-semibold text-sm text-gray-700 mb-1">
                {msg.sender}
              </div>
            )}
            <div className={`text-sm ${msg.sender === 'system' ? 'text-gray-600' : 'text-gray-800'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Message;