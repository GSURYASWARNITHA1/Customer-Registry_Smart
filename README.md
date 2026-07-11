# Customer Registry (ApexRegistry)

A full-stack MERN Customer Registry application designed to manage customer details, support requests, complaints, and interaction history through dedicated user and support agent dashboards.

---

# 🌐 Live Demo

https://customer-registry-frontend.onrender.com

---

# 🚀 How to Run the Project Locally

## 1. Run the Server

1. Open a terminal.
2. Navigate to the `server` folder:

```bash
cd server
```

3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
npm start
```

The backend runs on **http://localhost:5000**.

> **Note:** If MongoDB is unavailable, the application automatically falls back to local JSON storage (`server/data/`) so the application remains functional without additional setup.

---

## 2. Run the Client

1. Open another terminal.
2. Navigate to the `client` folder:

```bash
cd client
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Open your browser and visit:

```
http://localhost:5173
```

---

# 👤 Demo Credentials

### Support Agent

**Email:** `surya@gmail.com`

**Password:** `surya`

> If the default support agent account is unavailable, register a new account using the **Support Agent** option.

---

# ✨ Features

- Customer Registration & Management
- Complaint & Support Ticket Tracking
- User Dashboard
- Support Agent Dashboard
- Search & Filter Customers
- Customer Interaction Timeline
- Dashboard Statistics & Analytics
- Responsive Glassmorphism UI
- MongoDB Database Support
- Automatic Local JSON Storage Fallback

---

# 🛠️ Tech Stack

### Client

- React
- Vite
- JavaScript
- HTML5
- CSS3 (Glassmorphism UI)

### Server

- Node.js
- Express.js
- MongoDB
- Mongoose

---

# 📁 Project Structure

```
Customer-Registry_Smart/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── routes/
│   ├── models/
│   ├── data/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---


