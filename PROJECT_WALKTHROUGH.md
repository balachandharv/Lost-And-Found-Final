# 🔍 Project Walkthrough: College Lost & Found System

This document provides a comprehensive overview of the **College Lost & Found System**, designed to help students and faculty report lost items and find found ones within the campus ecosystem.

---

## 🎨 Project Overview
The Lost & Found System is a full-stack web application that streamlines the process of returning lost items. It features a modern, responsive UI with smooth animations, real-time updates, and robust administrative controls.

### Key Value Propositions:
- **Centralized Database**: One place for all lost and found items.
- **Real-time Notifications**: Instant alerts when a potential match is found.
- **Secure Authentication**: Role-based access control with OTP verification.
- **Admin Oversight**: Moderation tools to ensure the platform's integrity.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React (v19) | Modern UI library for a dynamic experience. |
| **Styling** | Tailwind CSS + Framer Motion | Premium aesthetics and smooth transitions. |
| **Backend (Primary)** | Node.js / Express | Fast, scalable API service. |
| **Backend (Secondary)** | Spring Boot (Java) | Robust alternative/enterprise-grade backend. |
| **Database** | MySQL | Reliable relational data storage. |
| **Real-time** | Socket.io | Live counting of active users. |
| **Notifications** | Firebase (FCM) | Cross-device push notifications. |
| **Auth** | JWT + OTP | Secure, passwordless authentication. |

---

## 📁 Project Structure

```text
/react-router-dom
├── /src                   # Frontend Source
│   ├── /components        # Reusable UI components (Navbar, Loader, etc.)
│   ├── /context           # State management (Auth, Reports)
│   ├── /pages             # View components (Feed, Dashboard, Profile)
│   ├── /services          # API interaction layer
│   └── App.js             # Routing and main application entry
├── /server                # Node.js/Express Backend
│   ├── /routes            # API endpoints (Auth, Reports, Users)
│   ├── /public/uploads    # Stored item images
│   ├── db.js              # MySQL connection and schema initialization
│   └── index.js           # Server entry point with Socket.io
└── /spring-boot-backend   # Java/Spring Boot Backend Implementation
    └── /src/main/java     # Entity, Repository, Controller layers
```

---

## ✨ Key Features Walkthrough

### 1. **Secure Login & Onboarding**
- **OTP Verification**: Students log in using their email and a 6-digit OTP sent to them.
- **Role Detection**: The system identifies whether a user is a **Student** or an **Admin**.

### 2. **Items Feed & Search**
- Browse all reported items in a clean, card-based layout.
- Filter by category or search by item name.
- Animated transitions between views.

### 3. **Reporting Mechanism**
- **Report Lost**: Users can detail what they've lost, where, and when.
- **Report Found**: Users can upload images and descriptions of found items.
- **Image Uploads**: Integrated support for visual verification.

### 4. **User & Admin Dashboards**
- **User Dashboard**: Track personal reports and manage profile settings.
- **Admin Dashboard**:
  - Approve/Reject reports.
  - Manage user accounts (Ban/Activate).
  - Real-time "Active Users" widget via Socket.io.

### 5. **Real-time Engine**
- **Socket.io Integration**: Shows how many people are currently using the platform.
- **Notification Panel**: Sidebar notifications for important updates.

---

## 🚀 How to Run the Presentation

### 1. Database Setup
Ensure **MySQL Workbench** is running on your local machine (`localhost:3306`). The server will automatically initialize the `lost_and_found_db` and required tables.

### 2. Start the Backend
```bash
cd server
npm install
node index.js
```

### 3. Start the Frontend
```bash
# In the root directory
npm install
npm start
```

### 4. Optional: Spring Boot Backend
If demonstrating the Java backend:
```bash
cd spring-boot-backend
mvn spring-boot:run
```

---

## 🎯 Presentation Tips
- **Demo the "Report Found" flow**: Show how easy it is for an honest finder to post an item.
- **Show the Admin Panel**: Highlight the security and moderation features.
- **Mention Animations**: Briefly point out the use of Framer Motion for that "premium" feel.
- **Live User Count**: Open the app in two windows to show the Socket.io active user count updating live.

---
> [!TIP]
> Use the **Admin Credentials** (if applicable) to demonstrate the moderation flow. Ensure the backend is connected before starting the frontend to avoid "Service Unavailable" errors.
