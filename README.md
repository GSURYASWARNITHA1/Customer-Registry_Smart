# Customer Registry (ApexRegistry)

A full-stack MERN customer registry application designed to track customer details and log care interactions, support tickets, and feedbacks.

---

## 🚀 How to Run the App Locally

### 1. Run the Backend Server
1. Open a terminal.
2. Go to the `backend` folder:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server (runs on port 5000):
   ```bash
   npm start
   ```
   *(Note: The server will auto-detect if MongoDB is running locally. If MongoDB is not found, it will automatically save data to local JSON files in `backend/data/` so the app remains fully functional with zero setup!)*

### 2. Run the Frontend App
1. Open a second terminal window.
2. Go to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to: **`http://localhost:5173/`**

---
## Demo Credentials

### Admin

Email: surya@gmail.com

Password: surya



## 🛠️ Tech Stack & Features
- **Frontend**: React, Vite, Custom CSS HSL Glassmorphism UI
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Fallback**: Local JSON database file-based storage layer
- **Features**: Customer CRUD directory, chronological timeline support ticket logging, dashboard statistics analytics, search & filter bars.
