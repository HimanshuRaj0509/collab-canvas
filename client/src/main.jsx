import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

import HomePage from './pages/HomePage';
import WhiteboardPage from './pages/WhiteboardPage';

// Define the main routes for the app
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true, // Load HomePage when visiting "/"
        element: <HomePage />,
      },
      {
        path: '/whiteboard/:roomId', // Load a whiteboard based on its room ID
        element: <WhiteboardPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
