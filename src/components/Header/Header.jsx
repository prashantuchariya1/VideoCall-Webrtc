import React from 'react';
import { Settings } from 'lucide-react';

const Header = ({ roomId, peers, connectionStatus, setIsDeviceSelectOpen, onEndCall }) => {
  return (
    <header className="w-full py-4 bg-gray-800 text-white text-center shadow">
      <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Room ID: {roomId}</h1>
        <div className="flex items-center gap-6">
          {/* Display the number of connected users */}
          <div className="text-sm text-gray-300">
            Connected Users: {peers.length + 1}
          </div>
          <div
            className={`text-sm ${
              connectionStatus === 'connected'
                ? 'text-green-400'
                : connectionStatus === 'error'
                ? 'text-red-400'
                : 'text-yellow-400'
            }`}
          >
            {connectionStatus === 'connected'
              ? 'Connected'
              : connectionStatus === 'error'
              ? 'Connection Error'
              : 'Connecting...'}
          </div>
          <button
            onClick={() => setIsDeviceSelectOpen(true)}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            title="Device Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onEndCall} // Now works with the passed handler
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
            End Call
              </button>
        </div>
      </div>
    </header>
  );
};

export default Header;