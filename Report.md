# PrepConnect: Technical Analysis & Deployment Report

This report provides a deep-dive analysis of the **PrepConnect** architecture, detailing the technology stack, concepts, and file-by-file logic. It also includes a step-by-step guide for production deployment.

---

## 1. Project Analysis (File-by-File)

### 📂 Backend (Node.js, Express, MongoDB)

#### **Server Core**
- **`server.js`**: 
    - **Tech**: Node.js, Express.
    - **Concepts**: Server initialization, global middleware (CORS, JSON parsing), API routing, MongoDB connection logic via Mongoose.

#### **Models (Database Schemas)**
- **`User.js`**: 
    - **Tech**: Mongoose.
    - **Concepts**: Data Modeling, Enums (Role-based), Default values, Timestamps.
- **`Booking.js`**: 
    - **Tech**: Mongoose.
    - **Concepts**: References (`ObjectId`), Nested objects (Feedback), Status management.
- **`Availability.js` & `Withdrawal.js`**: 
    - **Tech**: Mongoose.
    - **Concepts**: Tracking interviewer slots and financial transactions.

#### **Routes (REST API Endpoints)**
- **`userRoutes.js`**: 
    - **Concepts**: JWT Sign/Verify, Bcrypt hashing, Authentication flow.
- **`bookingRoutes.js`**: 
    - **Concepts**: Transactional logic (deducting credits from candidate, adding to interviewer).
- **`aiRoutes.js`**: 
    - **Concepts**: Integration with external services (simulation of AI generation).
- **`dashboardRoutes.js`**: 
    - **Concepts**: Data aggregation for statistics (earnings, total bookings).

#### **Middleware**
- **`auth.js`**: 
    - **Concepts**: Token-based security, Intercepting requests to verify identity before hitting private routes.

---

### 📂 Frontend (React, Tailwind CSS, Framer Motion)

#### **Core Architecture**
- **`App.js`**: 
    - **Tech**: React Router.
    - **Concepts**: Declarative Routing, Protected Routes (Guest vs. Auth), Layout nesting.
- **`index.js`**: 
    - **Tech**: React DOM.
    - **Concepts**: Root mounting, StrictMode.

#### **State & Context**
- **`AuthContext.js`**: 
    - **Tech**: React Context API.
    - **Concepts**: Global State Management, persistent login (localStorage), providing user data to the entire app.
- **`api/index.js`**: 
    - **Tech**: Axios.
    - **Concepts**: Interceptor patterns, Base URL configuration, standardizing HTTP requests.

#### **Pages (View Logic)**
- **`Explore.js`**: 
    - **Concepts**: Search filtering, Client-side data fetching, state-driven UI.
- **`CallRoom.js`**: 
    - **Tech**: WebRTC / Browser Media APIs.
    - **Concepts**: `getUserMedia`, Stream handling, UI for video controls (mute/camera).
- **`Dashboard.js`**: 
    - **Concepts**: Role-specific dashboards (Interviewer vs. Candidate).
- **`Home.js`**: 
    - **Concepts**: Landing page components, marketing sections.

#### **UI Components**
- **`MotionButton.js`, `MotionSlot.js`**: 
    - **Tech**: Framer Motion.
    - **Concepts**: Declarative animations, hover/tap effects, shared layout transitions.
- **`Header.js`**: 
    - **Concepts**: Responsive navigation, conditional auth links.

---

## 2. Tech Stack Concepts Summary

| Tech Stack | Key Concepts Used |
| :--- | :--- |
| **React** | Functional Components, Hooks (`useState`, `useEffect`, `useRef`), Context API. |
| **Express** | RESTful Routing, Middleware, Controller-Route separation. |
| **MongoDB** | Document-based storage, Collections, ObjectIDs. |
| **Mongoose** | Schema Validation, Population, Querying. |
| **JWT** | Stateless Authentication, Token expiry, Payload encoding. |
| **Tailwind CSS** | Utility-first styling, Responsive breakpoints, Custom themes. |
| **Framer Motion** | Entry/Exit animations, Spring physics, Keyframes. |

---

## 3. Deployment Guide

### **Frontend: Deploying on Netlify**
1.  **Prepare**: Ensure your `API_URL` in the code points to the production backend URL.
2.  **Login to Netlify**: Go to `app.netlify.com`.
3.  **New Site**: Choose "Import from Git" or drag-and-drop the `build` folder.
4.  **Build Settings**:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `frontend/build` (or `build` if in root).
5.  **Environment Variables**: Add `REACT_APP_API_URL` with your backend server link.
6.  **Redirects**: Add a `_redirects` file in `public/` containing `/* /index.html 200` to support React Router.

### **Backend: Deploying on AWS EC2**
1.  **Launch Instance**: Select **Ubuntu 22.04 LTS**. Ensure Port **80 (HTTP)**, **443 (HTTPS)**, and your app port (e.g., **5000**) are open in Security Groups.
2.  **SSH into EC2**: `ssh -i your-key.pem ubuntu@your-ip`.
3.  **Install Environment**:
    ```bash
    sudo apt update
    sudo apt install nodejs npm git
    sudo npm install -g pm2
    ```
4.  **Clone & Configure**:
    ```bash
    git clone https://github.com/Pushpendra143/PrepConnect.git
    cd PrepConnect/backend
    npm install
    nano .env # Add production MONGO_URI and JWT_SECRET
    ```
5.  **Run with PM2**:
    ```bash
    pm2 start server.js --name "prep-backend"
    ```
6.  **Nginx Reverse Proxy (Optional but Recommended)**:
    - Install Nginx: `sudo apt install nginx`.
    - Configure `/etc/nginx/sites-available/default` to proxy requests from port 80 to your app's port.

---
**Report Generated for PrepConnect Project Audit.**
