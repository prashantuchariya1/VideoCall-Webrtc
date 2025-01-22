import { useState, useEffect } from 'react';

const useMediaDevices = (setMessages, peerConnections) => {
  const [mediaDevices, setMediaDevices] = useState({
    audioInputs: [],
    videoInputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: '',
    videoInput: '',
  });
  const [localStream, setLocalStream] = useState(null);

  const getMediaDevices = async () => {
    try {
      // Release existing stream first
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
      // Request initial permissions
      const initialStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      setLocalStream(initialStream); // Set initial stream immediately

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');

      setMediaDevices({ audioInputs, videoInputs });

      // Set and use first available devices
      const newSelectedDevices = {
        audioInput: audioInputs[0]?.deviceId || '',
        videoInput: videoInputs[0]?.deviceId || '',
      };
      setSelectedDevices(newSelectedDevices);

      // Get stream with selected devices
      if (audioInputs[0] || videoInputs[0]) {
        getUserMedia(newSelectedDevices.audioInput, newSelectedDevices.videoInput);
      }
    } catch (err) {
      console.error('Error getting media devices:', err);
      setMessages(prev => [...prev, {
        sender: 'system',
        text: `Please allow camera and microphone access: ${err.message}`
      }]);
    }
  };

  const getUserMedia = async (audioDeviceId = selectedDevices.audioInput, videoDeviceId = selectedDevices.videoInput) => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);

      // Update tracks in peer connections
      Object.values(peerConnections.current).forEach(peerConnection => {
        const senders = peerConnection.getSenders();
        senders.forEach(sender => {
          const track = stream.getTracks().find(t => t.kind === sender.track.kind);
          if (track) {
            sender.replaceTrack(track);
          }
        });
      });

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      // Try fallback to any available devices
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        setLocalStream(fallbackStream);
        return fallbackStream;
      } catch (fallbackErr) {
        setMessages(prev => [...prev, {
          sender: 'system',
          text: `Failed to access camera/microphone: ${err.message}`
        }]);
        return null;
      }
    }
  };

  useEffect(() => {
    getMediaDevices();

    navigator.mediaDevices.addEventListener('devicechange', getMediaDevices);

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      navigator.mediaDevices.removeEventListener('devicechange', getMediaDevices);
    };
  }, []); // Run once when component mounts

  return { mediaDevices, selectedDevices, setSelectedDevices, localStream, getUserMedia };
};

export default useMediaDevices;