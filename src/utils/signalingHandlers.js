import { ICE_SERVERS } from '../constants/iceServers';

export const handleSignalingMessage = async (message, setPeers, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams ) => {
  try {
    switch (message.type) {
      case 'peers':
        setPeers(message.payload.peers);
        break;
      case 'reconnect-peers':
        await handleReconnectPeers(message.payload.peers, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams );
        break;
      case 'peer-joined':
        setPeers(prev => [...prev, message.from]);
        await handlePeerJoin(message.from, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams);
        break;
      case 'peer-left':
        await handlePeerLeave(message.from, peerConnections, setPeers, setRemoteStreams );
        break;
      case 'offer':
        await handleOffer(message, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams );
        break;
      case 'answer':
        await handleAnswer(message, peerConnections);
        break;
      case 'ice-candidate':
        await handleIceCandidate(message, peerConnections);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  } catch (err) {
    console.error('Error handling signaling message:', err);
  }
};

const handlePeerJoin = async (peerId, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams ) => {
  try {
    if (!localStream) {
      console.error('Local stream not ready');
      return;
    }

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerId] = peerConnection;

    // Set up data channel
    const dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onopen = () => console.log('Data channel open with', peerId);
    dataChannel.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: peerId, text: event.data }]);
    };
    peerConnections.current[peerId].dataChannel = dataChannel;

    // Add local stream tracks to the peer connection
    localStream.getTracks().forEach((track) => {
      console.log('Adding track to peer connection:', track.kind);
      peerConnection.addTrack(track, localStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'ice-candidate',
          from: ws.current.url.split('=')[1],
          target: peerId,
          room: roomId,
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        });
      }
    };

    // Handle remote tracks
    peerConnection.ontrack = (event) => {
      console.log('Received track:', event.track.kind);
  console.log('Stream active:', event.streams[0]?.active);
      // Create new stream if none exists
      const stream = event.streams[0] || new MediaStream();
      event.track && stream.addTrack(event.track);
      
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: stream
      }));
    };

    // Create and send offer
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    sendMessage({
      type: 'offer',
      from: ws.current.url.split('=')[1],
      target: peerId,
      room: roomId,
      payload: { sdp: offer },
    });

  } catch (err) {
    console.error('Error handling peer join:', err);
  }
};

const handleReconnectPeers = async (peers, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams ) => {
  try {
    setPeers(peers);
    // Check existing connections against the new peer list
    const currentPeers = Object.keys(peerConnections.current);
    const reconnectedPeers = peers;
    
    // Clean up any connections to peers that are no longer in the room
    currentPeers.forEach(peerId => {
      if (!reconnectedPeers.includes(peerId)) {
        if (peerConnections.current[peerId]) {
          peerConnections.current[peerId].close();
          delete peerConnections.current[peerId];
        }
      }
    });
    
    // If any new peers joined while disconnected, initialize connections with them
    reconnectedPeers.forEach(async (peerId) => {
      if (!peerConnections.current[peerId]) {
        await handlePeerJoin(peerId, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams );
      }
    });
  } catch (err) {
    console.error('Error handling reconnect peers:', err);
  }
};

const handleOffer = async (message, peerConnections, localStream, sendMessage, ws, roomId, setMessages, setRemoteStreams ) => {
  try {
    const peerId = message.from;
    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    peerConnections.current[peerId] = peerConnection;

    // Add local stream tracks immediately
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        console.log('Adding local track to answer:', track.kind);
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage({
          type: 'ice-candidate',
          from: ws.current.url.split('=')[1],
          target: peerId,
          room: roomId,
          payload: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex,
          },
        });
      }
    };

    // Handle remote tracks
    peerConnection.ontrack = (event) => {
      console.log('Received track:', event.track.kind);
  console.log('Stream active:', event.streams[0]?.active);
      // Create new stream if none exists
      const stream = event.streams[0] || new MediaStream();
      event.track && stream.addTrack(event.track);
      
      setRemoteStreams(prev => ({
        ...prev,
        [peerId]: stream
      }));
    };

    // Handle data channel
    peerConnection.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dataChannel.onmessage = (e) => {
        setMessages((prev) => [...prev, { sender: peerId, text: e.data }]);
      };
      peerConnections.current[peerId].dataChannel = dataChannel;
    };

    // Set remote description and create answer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.payload.sdp));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendMessage({
      type: 'answer',
      from: ws.current.url.split('=')[1],
      target: peerId,
      room: roomId,
      payload: { sdp: answer },
    });

  } catch (err) {
    console.error('Error handling offer:', err);
  }
};

const handleAnswer = async (message, peerConnections) => {
  try {
    const peerId = message.from;
    const peerConnection = peerConnections.current[peerId];
    if (peerConnection) {
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(message.payload.sdp)
      );
    }
  } catch (err) {
    console.error('Error handling answer:', err);
  }
};

const handleIceCandidate = async (message, peerConnections) => {
  try {
    const peerId = message.from;
    const peerConnection = peerConnections.current[peerId];
    if (peerConnection) {
      await peerConnection.addIceCandidate(
        new RTCIceCandidate(message.payload)
      );
    }
  } catch (err) {
    console.error('Error handling ICE candidate:', err);
  }
};


const handlePeerLeave = async (peerId, peerConnections, setPeers, setRemoteStreams ) => {
  try {
    // Get the peer connection
    const peerConnection = peerConnections.current[peerId];
    
    if (peerConnection) {
      // Close the peer connection
      peerConnection.close();
      
      // Remove data channel reference if it exists
      if (peerConnection.dataChannel) {
        peerConnection.dataChannel.close();
      }

      // Delete the peer connection from the references
      delete peerConnections.current[peerId];

      // Update peers state to remove the left peer
      setPeers(prevPeers => prevPeers.filter(id => id !== peerId));

      // Clean up video element if it exists
      setRemoteStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[peerId];
        return newStreams;
      });
    }
  } catch (err) {
    console.error('Error handling peer leave:', err);
  }
};
