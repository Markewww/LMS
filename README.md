# 📚 CEIT Reading Room Library Management System

A modern, centralized library management solution for the **College of Engineering and Information Technology (CEIT)** at Cavite State University - Indang Campus.

---

## 🎯 Project Overview

This system is designed to digitize the CEIT Reading Room's operations. It provides a dual-interface experience: a powerful administrative panel for library staff and a sleek, view-only catalog for students to browse resources and manage their digital library IDs.

---

## ✨ Key Features

### 🔐 Administrative Suite
*   **Student Profile Management:** Comprehensive CRUD operations for student records.
*   **Digital ID Issuance:** Automated generation of student library cards.
*   **High-Fidelity QR System:** Built-in branded QR code generator (optimized for 2D hardware scanners).
*   **Export Engine:** Download student IDs as high-resolution PNGs (pixel-perfect at 4x scale).
*   **Account Security:** Administrative control over student credentials and account statuses (Active/Pending/Suspended).

### 📖 Student Dashboard
*   **Minimalist UI:** Clean, modern interface inspired by high-end educational platforms.
*   **Live Catalog:** Search and browse books by title, author, or engineering program.
*   **Real-time Availability:** Visual badges indicating if a book is "Available" or "Borrowed."
*   **Responsive Experience:** Fully optimized for mobile devices, tablets, and desktop workstations.

---

## 🛠️ Technical Stack


| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **Animation** | Framer Motion |
| **Icons** | Lucide React |
| **Form Logic** | React Hook Form, Axios |
| **Imaging** | html-to-image (Modern CSS support) |
| **Backend** | Native PHP (REST API) |
| **Database** | MySQL (XAMPP Environment) |

---

## ⚙️ Installation & Setup

### 1. Database Configuration
1.  Open **XAMPP Control Panel** and start Apache and MySQL.
2.  Navigate to `http://localhost/phpmyadmin`.
3.  Create a database named **LMS**.
4.  Import the provided SQL schema (found in `/src/API/database/LMS.sql`).

### 2. Backend Setup
1.  Ensure your project folder is located in `C:/xampp/htdocs/LMS`.
2.  Verify connection settings in `src/API/dbconfig.php`:

```php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "LMS";
```
### 3. Frontend Setup
1.  Open your terminal in the root directory.
2.  Install dependencies:
`npm install`
3.  Launch the development server:
`npm run dev`


## 🎨 Branding & Design System
The system adheres to the official CvSU visual identity:
*   **Primary Green:** #1b651b (CvSU Base)
*   **Accent Green:** #064e3b (Deep Forest)
*   **Typography:** Montserrat (Headings), DN Sans (Body)
*   **UI Elements:** 2xl Rounded corners, subtle glassmorphism, and soft shadows


## 📂 Project Structure
src/
├── API/              # PHP Backend & Database Config
├── images/           # Assets & Logos
└── pages/
   ├── admin/        # Student Management, ID Generation
   └── student/      # Dashboard, Book Catalog, Profile

# Developed for the CEIT Reading Room | Cavite State University
