import React from 'react';
import { Mic, Camera } from 'lucide-react';

const DeviceSelectionModal = ({ setIsDeviceSelectOpen, selectedDevices, handleDeviceChange, mediaDevices }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Device Settings</h2>
          <button
            onClick={() => setIsDeviceSelectOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Microphone Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Mic size={16} />
              Microphone
            </div>
          </label>
          <select
            value={selectedDevices.audioInput}
            onChange={(e) => handleDeviceChange('audioInput', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {mediaDevices.audioInputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>

        {/* Camera Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center gap-2">
              <Camera size={16} />
              Camera
            </div>
          </label>
          <select
            value={selectedDevices.videoInput}
            onChange={(e) => handleDeviceChange('videoInput', e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {mediaDevices.videoInputs.map(device => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DeviceSelectionModal;