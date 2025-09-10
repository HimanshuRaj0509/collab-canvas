# Real-Time Collaborative Whiteboard 🎨

A full-stack, real-time collaborative whiteboard application inspired by tools like **Miro** and **FigJam**.  
This project enables multiple users to join a shared canvas, where they can draw, write, and see each other's actions live.  
It's built with a modern tech stack designed for **low-latency, interactive experiences**.

---

## ✨ Features

### 🌐 Real-Time Collaboration
- Create unique, shareable rooms for each whiteboard session.  
- All actions (drawing, writing, clearing, undo/redo) are synchronized across all clients in the room instantly.

### 🖱️ Live Cursor Tracking
- See the cursors of other participants move on the canvas in real-time.  
- Each user is assigned a unique anonymous animal name and color for clear identification.

### ✏️ Comprehensive Drawing Tools
- **Pen Tool** with a customizable Color Palette.  
- **Eraser Tool** to remove drawings.  
- **Text Tool** with intuitive, direct-on-canvas typing and editing.

### ⏪ Advanced State Management
- **Undo/Redo Functionality** for all drawing and text actions.  
- The entire history of the canvas is managed on the server, ensuring a single source of truth for all users.

### 💾 Session Persistence
- The state of the whiteboard is saved on the server.  
- New users joining an existing room will instantly see the complete, up-to-date canvas.

---

## 🛠️ Tech Stack
**Frontend:** React, Vite, React Router, Socket.IO Client, Konva.js, Tailwind CSS  
**Backend:** Node.js, Express, Socket.IO  

---

## 🚀 Getting Started

This project is structured as a **monorepo** with a `client` and a `server` directory.  
Follow these steps to get a local copy up and running.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)  
- npm or yarn  

---

#### Installation & Setup

### 1. Clone the repo
```bash
git clone https://github.com/your-username/real-time-whiteboard.git


#### 2. Navigate into the project directory
cd real-time-whiteboard

3. Set up the Server
# Go into the server directory
cd server

# Install server dependencies
npm install

4. Set up the Client
# Go back to the root and into the client directory
cd ../client

# Install client dependencies
npm install


Note:
The client does not require any environment variables for local development as it defaults to connecting to localhost:3001.

Running the Application

You will need to run the server and the client in two separate terminals.

Start the Server
# Navigate to the server directory
cd server

# Run the development server
npm run dev


The server will be running on http://localhost:3001

Start the Client
# Navigate to the client directory
cd client

# Run the development server
npm run dev


The application will be available at http://localhost:5173
