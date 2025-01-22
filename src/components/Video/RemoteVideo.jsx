import React, { useEffect, useRef } from 'react';

const RemoteVideo = ({ peerId, stream }) => {
  const videoRef = useRef(null);

  // Add this useEffect to handle stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-md">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
        {peerId}
      </div>
    </div>
  );
};

export default RemoteVideo;