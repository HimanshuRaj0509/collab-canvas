import React from 'react';
import { Outlet } from 'react-router-dom';


function App() {
  return (
    <div className="w-screen h-screen bg-gray-100">
      <Outlet />
    </div>
  );
}

export default App;
