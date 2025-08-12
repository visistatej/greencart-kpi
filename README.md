GreenCart Logistics - Delivery Simulation & KPI Dashboard

A Full-Stack Project for Purple Merit Technologies Assessment
This project is a comprehensive full-stack web application developed as part of the Full-Stack Developer Assessment for Purple Merit Technologies. It serves as an internal tool for a fictional eco-friendly delivery company, GreenCart Logistics. The application allows managers to run complex delivery simulations, visualize Key Performance Indicators (KPIs) on an interactive dashboard, and manage the core data of the operation: drivers, routes, and orders.

🚀 Live Deployment Links
Live Frontend URL: [Your Deployed Vercel/Netlify URL Here]

Live Backend API URL: [Your Deployed Render/Railway URL Here]

✨ Key Features
Interactive KPI Dashboard: Dynamically visualizes crucial metrics like Total Profit and Efficiency Score. Includes interactive charts from Recharts for on-time vs. late deliveries and fuel cost breakdowns.

Dynamic Simulation Engine: Allows managers to input parameters like the number of available drivers and maximum work hours to run "what-if" scenarios and see their immediate impact on KPIs.

Full CRUD Functionality: Provides complete Create, Read, Update, and Delete capabilities for Drivers, Routes, and Orders through intuitive, modal-based forms.

Secure JWT Authentication: The backend is secured with JSON Web Tokens, ensuring that only authenticated managers can access the dashboard and its features.

Responsive UI: The user interface is designed to be fully responsive, providing a seamless experience on both desktop and mobile devices.

🛠️ Tech Stack
Frontend: React.js (with Hooks), JavaScript (ES6+), Recharts, Lucide React

Backend: Node.js, Express.js, JWT, Mongoose, bcryptjs

Database: MongoDB (cloud-hosted on MongoDB Atlas)

DevOps: Git, GitHub, Vercel (Frontend Deployment), Render (Backend Deployment)

⚙️ Local Setup and Installation
To run this project on your local machine, please follow these steps.

Prerequisites
Node.js (v14 or later)

npm (or yarn)

A free MongoDB Atlas account

1. Clone the Repository
git clone [Your GitHub Repository URL]
cd greencart-fullstack

2. Backend Setup
Navigate to the backend directory:

cd greencart-backend

Install the required dependencies:

npm install

Create a .env file in the greencart-backend root and add the environment variables listed below.

Start the backend server:

node server.js

The server will be running on http://localhost:5000.

3. Frontend Setup
Open a new terminal and navigate to the frontend directory:

cd greencart-frontend

Install the required dependencies:

npm install

Start the React development server:

npm start

The application will open in your browser at http://localhost:3000.

🔑 Environment Variables
The backend requires a .env file with the following variables:

MONGO_URI: Your connection string for the MongoDB Atlas database.

JWT_SECRET: A long, random, secret string used for signing JSON Web Tokens.

PORT: The port on which the backend server will run (e.g., 5000).

📄 API Documentation
Authentication
POST /api/auth/login

Authenticates a user and returns a JWT.

Request Body: { "username": "manager", "password": "password" }

Response: { "token": "...", "user": { "id": "...", "name": "...", "username": "..." } }

Simulation
POST /api/simulation/run

Runs a new delivery simulation based on the provided inputs.

Request Body: { "numDrivers": 5, "startTime": "09:00", "maxHours": 8 }

Response: { "kpis": { "totalProfit": ..., "efficiencyScore": ..., ... } }

CRUD Endpoints
The application supports full CRUD operations for /api/drivers, /api/routes, and /api/orders using standard RESTful conventions (GET, POST, PUT, DELETE).