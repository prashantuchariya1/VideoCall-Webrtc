import React from 'react';

const LocalVideo = ({ localStream }) => {
  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-md">
      {localStream ? (
        <video
          autoPlay
          muted
          playsInline
          ref={video => {
            if (video) {
              video.srcObject = localStream;
            }
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading camera...
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        You
      </div>
    </div>
  );
};

export default LocalVideo;