# 🔍 Project Walkthrough & Report: College Lost & Found System

## 1. 🎨 Project Abstract / Overview
The Lost & Found System is a full-stack web application designed to streamline the process of reporting lost items and claiming found ones within a campus ecosystem. It features a modern, responsive user interface with smooth animations, real-time updates, and robust administrative moderation controls to ensure the platform's integrity.

**Key Value Propositions:**
- **Centralized Database**: A single, reliable platform for all lost and found item inquiries.
- **Real-time Notifications**: Instant alerts when a potential match is found or an update occurs.
- **Secure Authentication**: Role-based access control with secure OTP verification.
- **Admin Oversight**: Comprehensive moderation tools for admins to approve reports and manage users.

---

## 2. 🛠️ Technology Stack
- **Frontend Layer**: React (v19) for dynamic UI rendering.
- **Styling & Aesthetics**: Tailwind CSS + Framer Motion for a premium, animated user experience.
- **Backend Service**: Node.js / Express for fast and scalable API responses.
- **Database Management**: MySQL for reliable relational data storage.
- **Real-time Communication**: Socket.io for live active user counting and updates.
- **Authentication**: JWT (JSON Web Tokens) combined with OTP functionality.

---

## 3. 📸 Application Interfaces & Screenshots

### 3.1 User Home Page
The User Home Page acts as the primary feed where all reported "Lost" and "Found" items are displayed. Users can filter items by category, search by item name, and view detailed information. 

> **[ Placeholder for User Home Page Screenshot ]**
> *(Please insert the screenshot of your application's Home / Feed Page here.)*

**Features visible on this page:**
- Real-time Items Feed with card-based layouts.
- Navigation bar with quick access to "Report Lost/Found" actions.
- Animated transitions for a premium user experience.

### 3.2 Admin Dashboard
The Admin Dashboard is a restricted area solely for individuals with the `Admin` role. It serves as the primary moderation and monitoring hub.

> **[ Placeholder for Admin Dashboard Screenshot ]**
> *(Please insert the screenshot of your application's Admin Dashboard here.)*

**Features visible on this page:**
- **Pending Approvals Queue**: Admins can approve or reject new reports before they go live on the user feed.
- **User Activity Metrics**: Real-time "Active Users" widget powered by Socket.io.
- **System Management**: Tools to manage, ban, or activate user accounts based on platform integrity policies.

---

## 4. ✨ Detailed Workflow Walkthrough

### Step 1: Secure Login & Onboarding
- **Users (Students)** log in securely using their registered email and a 6-digit OTP (One Time Password).
- The system automatically detects the role of the user, distinguishing between an organic **Student** and an **Admin**.

### Step 2: Reporting Mechanism
- **To Report a Lost Item**: A user fills out a secure form detailing what was lost, where they suspect it was lost, and when.
- **To Report a Found Item**: A user who found an item can upload an image and a brief description. All submitted items traverse through a moderation check.

### Step 3: Admin Moderation (Crucial Step)
- Once an item is reported, its status is set to `PendingApproval`.
- The Admin logs in and reviews the new report from the Admin Dashboard.
- Only upon admin approval does the reported item officially transition to the public feed.

### Step 4: Real-time Engagement & Resolution
- As the platform is actively used, Socket.io powers a background engine showing the live count of active app users.
- Users can view their personal submissions within the "User Dashboard" and track query resolution statuses.

---

## 5. 🚀 Setup & Execution Guide (For Reference)
Ensure **MySQL** database is running locally on port 3306.
1. Run Backend Server: `cd server` -> `npm i` -> `node index.js`
2. Run Frontend App: In root directory -> `npm i` -> `npm start`
