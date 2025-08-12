Here’s your project description converted into a clean **Markdown README** format:

````markdown
# GreenCart Logistics - Delivery Simulation & KPI Dashboard

A **Full-Stack Project** for **Purple Merit Technologies Assessment**.  
This project is a comprehensive full-stack web application developed as part of the Full-Stack Developer Assessment for Purple Merit Technologies.  
It serves as an **internal tool** for a fictional eco-friendly delivery company, **GreenCart Logistics**.

The application allows managers to:
- Run complex **delivery simulations**.
- Visualize **Key Performance Indicators (KPIs)** on an interactive dashboard.
- Manage core data of the operation: **drivers, routes, and orders**.

---

## 🚀 Live Deployment Links
- **Frontend**: [Your Deployed Vercel/Netlify URL Here]  
- **Backend API**: [Your Deployed Render/Railway URL Here]

---

## ✨ Key Features

- **Interactive KPI Dashboard**  
  - Dynamically visualizes crucial metrics like *Total Profit* and *Efficiency Score*.  
  - Includes interactive charts (using **Recharts**) for on-time vs. late deliveries and fuel cost breakdowns.

- **Dynamic Simulation Engine**  
  - Allows managers to input parameters like the number of available drivers and maximum work hours.  
  - Runs "what-if" scenarios and instantly shows the impact on KPIs.

- **Full CRUD Functionality**  
  - Create, Read, Update, and Delete drivers, routes, and orders.  
  - Uses **modal-based forms** for a smooth UX.

- **Secure JWT Authentication**  
  - Backend secured with JSON Web Tokens.  
  - Only authenticated managers can access the dashboard.

- **Responsive UI**  
  - Fully responsive layout for both desktop and mobile devices.

---

## 🛠️ Tech Stack

**Frontend**: React.js (Hooks), JavaScript (ES6+), Recharts, Lucide React  
**Backend**: Node.js, Express.js, JWT, Mongoose, bcryptjs  
**Database**: MongoDB (Atlas)  
**DevOps**: Git, GitHub, Vercel (Frontend Deployment), Render (Backend Deployment)

---

## ⚙️ Local Setup & Installation

### **Prerequisites**
- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account

### **1. Clone the Repository**
```bash
git clone [Your GitHub Repository URL]
cd greencart-fullstack
````

### **2. Backend Setup**

```bash
cd greencart-backend
npm install
```

Create a `.env` file in `greencart-backend` and add:

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=5000
```

Start the backend:

```bash
node server.js
```

Backend will run on: `http://localhost:5000`

### **3. Frontend Setup**

```bash
cd greencart-frontend
npm install
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🔑 Environment Variables

**Backend `.env`**

```
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=5000
```

---

## 📄 API Documentation

### **Authentication**

**POST** `/api/auth/login`
Authenticates a user and returns a JWT.
**Request Body:**

```json
{
  "username": "manager",
  "password": "password"
}
```

**Response:**

```json
{
  "token": "...",
  "user": {
    "id": "...",
    "name": "...",
    "username": "..."
  }
}
```

---

### **Simulation**

**POST** `/api/simulation/run`
Runs a new delivery simulation.
**Request Body:**

```json
{
  "numDrivers": 5,
  "startTime": "09:00",
  "maxHours": 8
}
```

**Response:**

```json
{
  "kpis": {
    "totalProfit": 10000,
    "efficiencyScore": 85,
    ...
  }
}
```

---

### **CRUD Endpoints**

Supports full CRUD for:

* `/api/drivers`
* `/api/routes`
* `/api/orders`

Standard REST conventions:

* `GET` → Fetch data
* `POST` → Create data
* `PUT` → Update data
* `DELETE` → Remove data

