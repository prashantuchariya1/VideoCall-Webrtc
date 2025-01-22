import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const createRoomLink = () => {
    const roomId = Math.random().toString(36).substring(2, 12); // Generate random room ID
    const roomLink = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(roomLink); // Copy to clipboard
    alert(`Room link copied to clipboard: ${roomLink}`);
  };

  const createAndRedirect = () => {
    const roomId = Math.random().toString(36).substring(2, 12); // Generate random room ID
    navigate(`/room/${roomId}`); // Redirect to the room
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to WebRTC App</h1>
      <div className="space-y-4">
        <button
          onClick={createRoomLink}
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Room Link
        </button>
        <button
          onClick={createAndRedirect}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create and Start Room
        </button>
      </div>
    </div>
  );
};

export default HomePage;
