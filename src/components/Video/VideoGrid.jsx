import React from 'react';
import LocalVideo from './LocalVideo';
import RemoteVideo from './RemoteVideo';

const VideoGrid = ({ localStream, peers, remoteStreams }) => {
  console.log('Rendering peers:', peers);
console.log('Remote streams:', remoteStreams);
  return (
    <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <LocalVideo localStream={localStream} />
      {peers.map((peerId) => {
  const stream = remoteStreams[peerId];
  return (
    <RemoteVideo
      key={peerId}
      peerId={peerId}
      stream={stream?.active ? stream : null}
    />
  );
})}
    </div>
  );
};

export default VideoGrid;