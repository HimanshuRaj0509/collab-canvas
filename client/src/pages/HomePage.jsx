import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const createNewWhiteboard = () => {
    // Create a unique ID for the new whiteboard
    const roomId = crypto.randomUUID();

    // Send the user to that new whiteboard
    navigate(`/whiteboard/${roomId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Collaborative Whiteboard
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Draw, brainstorm, and collaborate in real-time.
        </p>
        <button
          onClick={createNewWhiteboard}
          className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Create a New Whiteboard
        </button>
      </div>
    </div>
  );
};

export default HomePage;
