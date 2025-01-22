import React, { useState, useRef, useEffect } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import useMediaDevices from '../hooks/useMediaDevices';
import Header from '../components/Header/Header';
import DeviceSelectionModal from '../components/Modals/DeviceSelectionModal';
import VideoGrid from '../components/Video/VideoGrid';
import ChatBox from '../components/Chat/ChatBox';
import { useParams, useNavigate } from 'react-router-dom';
const RoomPage = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [messages, setMessages] = useState([
    { sender: 'system', text: 'Welcome to the room!' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [peers, setPeers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [isDeviceSelectOpen, setIsDeviceSelectOpen] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});

  const { mediaDevices, selectedDevices, setSelectedDevices, localStream, getUserMedia } = useMediaDevices(setMessages, peerConnections);
  const { sendMessage } = useWebSocket(roomId, setMessages, setPeers, setConnectionStatus, peerConnections, localStream, setRemoteStreams );

  useEffect(() => {
    return () => {
      // Cleanup peer connections
      Object.values(peerConnections.current).forEach(pc => {
        pc.close();
      });
      peerConnections.current = {};
      setPeers([]);
    };
  }, []);

  const handleEndCall = () => {
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  
    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  
    // Clear states
    setPeers([]);
    setRemoteStreams({});
    
    // Navigate to home
    navigate('/');
  };

  const handleDeviceChange = async (type, deviceId) => {
    try {
      const newSelectedDevices = {
        ...selectedDevices,
        [type]: deviceId
      };
      setSelectedDevices(newSelectedDevices);

      await getUserMedia(
        type === 'audioInput' ? deviceId : selectedDevices.audioInput,
        type === 'videoInput' ? deviceId : selectedDevices.videoInput
      );
    } catch (err) {
      console.error('Error changing device:', err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = { sender: 'You', text: newMessage.trim() };
      setMessages((prev) => [...prev, message]);

      Object.values(peerConnections.current).forEach((pc) => {
        if (pc.dataChannel?.readyState === 'open') {
          pc.dataChannel.send(newMessage.trim());
          console.log('Sent message via data channel:', newMessage.trim());
        } else {
          console.error('Data channel is not open:', pc.dataChannel?.readyState);
        }
      });

      setNewMessage('');
    } else {
      console.warn('Message is empty, not sending');
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gray-50">
      <Header
      roomId={roomId}
      peers={peers}
      connectionStatus={connectionStatus}
      setIsDeviceSelectOpen={setIsDeviceSelectOpen}
      onEndCall={handleEndCall} 
    />

      {isDeviceSelectOpen && (
        <DeviceSelectionModal
          setIsDeviceSelectOpen={setIsDeviceSelectOpen}
          selectedDevices={selectedDevices}
          handleDeviceChange={handleDeviceChange}
          mediaDevices={mediaDevices}
        />
      )}

      <div className="flex-grow w-full flex md:flex-row flex-col-reverse p-6 gap-4 max-w-7xl mx-auto">
      <VideoGrid localStream={localStream} peers={peers} remoteStreams={remoteStreams} />
        <ChatBox messages={messages} newMessage={newMessage} setNewMessage={setNewMessage} handleSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default RoomPage;