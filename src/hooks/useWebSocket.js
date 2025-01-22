import { useRef, useState, useEffect } from 'react';
import { handleSignalingMessage } from '../utils/signalingHandlers';

const useWebSocket = (roomId, setMessages, setPeers, setConnectionStatus, peerConnections, localStream, setRemoteStreams ) => {
  const ws = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const wasConnectedBefore = useRef(false);
  const isConnecting = useRef(false);
  
  // Persistent clientId to avoid generating new IDs on reconnect
  const clientIdRef = useRef(`user-${Math.floor(Math.random() * 1000000)}`);
  const clientId = clientIdRef.current;

  const connectWebSocket = () => {
    if (!localStream) {
      console.error('Local stream not ready');
      return;
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting.current) {
      console.log('Connection attempt already in progress');
      return;
    }

    try {
      isConnecting.current = true;
      // const wsUrl = `wss://signalling-server-go.onrender.com/ws?clientId=${clientId}`;
      const wsUrl = `ws://localhost:8080/ws?clientId=${clientId}`;
      console.log(`${wasConnectedBefore.current ? 'Reconnecting' : 'Connecting'} to WebSocket at ${wsUrl}`);
      
      if (ws.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket is already connected');
        isConnecting.current = false;
        return;
      }

      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        isConnecting.current = false;
        setConnectionStatus('connected');
        
        if (wasConnectedBefore.current) {
          console.log('Sending reconnect message');
          sendMessage({ 
            type: 'reconnect', 
            from: clientId, 
            room: roomId 
          });
        } else {
          console.log('Sending initial join message');
          sendMessage({ 
            type: 'join', 
            from: clientId, 
            room: roomId 
          });
          wasConnectedBefore.current = true;
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          handleSignalingMessage(message, setPeers, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        isConnecting.current = false;
        setConnectionStatus('error');
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        isConnecting.current = false;
        setConnectionStatus('disconnected');
        
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        if (event.code !== 1000) {
          console.log('Unintentional disconnect - scheduling reconnect');
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
        } else {
          console.log('Intentional disconnect - not reconnecting');
          wasConnectedBefore.current = false;
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      isConnecting.current = false;
      setConnectionStatus('error');
    }
  };

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      try {
        ws.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending message:', err);
      }
    } else {
      console.error('WebSocket is not connected');
    }
  };

  useEffect(() => {
    if (localStream) {
      connectWebSocket();
    }
  
    return () => {
      isConnecting.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (ws.current) {
        if (ws.current.readyState === WebSocket.OPEN) {
          // Send 'leave' message directly using ws.current
          ws.current.send(JSON.stringify({
            type: 'leave',
            from: clientId,
            room: roomId,
          }));
          console.log('Sent leave message to signaling server');
        }
        wasConnectedBefore.current = false;
        ws.current.close(1000, 'Cleanup');
      }
    };
  }, [roomId, localStream]);
  

  return { sendMessage };
};

export default useWebSocket;


