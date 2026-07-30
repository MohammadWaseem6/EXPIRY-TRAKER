# 📦 Expiry Tracker

A full-stack web application to help you track your grocery items, medicines, and other products so you never miss an expiry date again.

## ✨ Features

- **User Authentication**: Register and login with JWT-based authentication.
- **Protected Routes**: Only authenticated users can access their items.
- **Item Management**:
  - ➕ **Add** new items (name, category, expiry date).
  - 📋 **View** all your items sorted by expiry date.
  - ✏️ **Update** item details if you made a mistake.
  - 🗑️ **Delete** items that have been used or expired.
- **Responsive UI**: Modern and clean interface built with Tailwind CSS.

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** – REST API
- **MongoDB Atlas** & **Mongoose** – Database & ODM
- **JWT** & **bcrypt** – Authentication & password hashing

### Frontend
- **React** & **Vite** – Fast UI development
- **Tailwind CSS** – Styling
- **Fetch API** – HTTP requests

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

**1. Clone the repository**
bash
git clone https://github.com/MohammadWaseem6/EXPIRY-TRAKER
cd expiry-tracker
2. Backend Setup
cd server
npm install
..Create a .env file in the server/ directory:
PORT=6000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key


        PROJECT STRUCTURE
        
expiry-tracker/
├── server/
│   ├── config/              # Database connection
│   ├── models/              # Mongoose schemas (User, Item)
│   ├── controllers/         # Business logic (Auth, Items)
│   ├── routes/              # API routes
│   ├── middleware/          # Auth guard, error handling
│   ├── .env                 # Environment variables
│   └── index.js             # Entry point
├── client/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── App.jsx          # Main app logic
│   │   ├── index.css        # Tailwind directives
│   │   └── main.jsx         # React entry point
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
