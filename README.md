# CodeSync Frontend

CodeSync is a real-time collaborative web code editor built with React, Monaco Editor, Tailwind CSS, and Yjs.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Lucide Icons + Sonner
- **Editor:** Monaco Editor with Yjs collaborative binding (`y-monaco`, `y-websocket`)
- **Real-Time Communication:** Socket.IO & Yjs WebSockets
- **Routing:** React Router v6

## Environment Configuration
Create a `.env` file in the project root:
```env
VITE_API_URL=https://codesync-backend-5-q8qt.onrender.com
```

## Getting Started
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
