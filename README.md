Here's a complete README for your project:

---

# Expiry Tracker - Smart Store Keeper

A full-stack inventory management system that helps you track product expiry dates, manage stock levels, and reduce waste.

## 🚀 Live Demo

- **DEMO:** [smart-store-afs.vercel.app](https://smart-storekeeper.vercel.app/)


## 📦 Features

### Dashboard
- **Real-time Inventory Stats** - Total items, fresh, expiring soon, and expired counts
- **Expiry Timeline Chart** - Visual 29-day expiry forecast
- **Stock Status Donut** - Fresh vs. expiring vs. expired visualization
- **Category Breakdown** - Stock distribution by product category
- **Expiry Leaderboard** - Items sorted by soonest expiration
- **Stock Health Indicator** - Overall inventory health percentage

### Stock Management
- **Search & Filter** - Find items by name, category, or status
- **Status Badges** - Visual indicators (Fresh, Expiring Soon, Expired, Low Stock)
- **Item Details Modal** - View complete product information
- **Release Items** - Remove items from inventory with confirmation

### AI-Powered Features
- **Smart Item Extraction** - Upload delivery notes (images, PDFs, Excel)
- **Tesseract OCR** - Extract product information from images
- **Bulk Add** - Import multiple items at once via CSV format

### Reports & Analytics
- **Category Breakdown** - Visual charts for inventory distribution
- **Expiry Distribution** - See items by expiration timeline
- **Low Stock Alerts** - Identify items with insufficient quantity
- **Export CSV** - Download inventory data for offline analysis

### Settings
- **Dark/Light/System Theme** - Customizable appearance
- **Currency Selection** - Multiple currency support
- **Low Stock Threshold** - Customize alert levels
- **Expiry Warning Window** - Set days for "expiring soon" alerts
- **Auto-Refresh** - Automatic data updates

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Recharts** - Charts and visualizations
- **Lucide React** - Icons
- **Tesseract.js** - OCR for image processing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Multer** - File uploads

### Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting

## 📁 Project Structure

```
EXPIRY-TRAKER/
├── CLIENT/                  # Frontend application
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js   # API service layer
│   │   ├── components/
│   │   │   └── dashboard/     # Dashboard components
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Stock.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Charts.jsx
│   │   │   ├── ExpiredView.jsx
│   │   │   └── SettingsView.jsx
│   │   ├── utils/
│   │   │   └── exportCSV.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── _redirects        # SPA routing support
│   ├── .env                  # Environment variables
│   ├── package.json
│   └── vite.config.js
│
├── SERVER/                  # Backend application
│   ├── config/
│   │   └── db.js             # Database connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── itemController.js
│   ├── models/
│   │   ├── User.js
│   │   └── Item.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── itemRoutes.js
│   │   ├── userRoutes.js
│   │   └── uploadRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   ├── .env                   # Environment variables
│   ├── server.js              # Entry point
│   └── package.json
│
├── vercel.json               # Vercel deployment config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MohammadWaseem6/EXPIRY-TRAKER.git
cd EXPIRY-TRAKER
```

2. **Install backend dependencies**

```bash
cd SERVER
npm install
```

3. **Install frontend dependencies**

```bash
cd ../CLIENT
npm install
```

4. **Set up environment variables**

**Backend (.env in SERVER folder):**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
```

**Frontend (.env in CLIENT folder):**
```env
VITE_API_URL=http://localhost:5001/api
```

### Run Locally

1. **Start the backend**

```bash
cd SERVER
npm run dev
```

2. **Start the frontend**

```bash
cd CLIENT
npm run dev
```

3. **Open your browser**

```
http://localhost:5173
```

## 🌐 Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Root Directory:** `SERVER`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Add environment variables
7. Click **Deploy**

### Deploy Frontend to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click **Add New** → **Project**
4. Import your repository
5. Configure:
   - **Root Directory:** `CLIENT`
   - **Framework Preset:** `React`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
7. Click **Deploy**

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/items` | Get all items |
| POST | `/api/items` | Create a new item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |
| PUT | `/api/items/:id/release` | Release (remove) an item |
| POST | `/api/upload/upload-file` | Upload file for OCR |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Mohammad Waseem**
- GitHub: [@MohammadWaseem6](https://github.com/MohammadWaseem6)

## 🙏 Acknowledgments

- React, Vite, and Tailwind CSS for the frontend
- Node.js, Express, and MongoDB for the backend
- Render and Vercel for hosting
- Tesseract.js for OCR capabilities

---

**Built with ❤️ by Mohammad Waseem**
