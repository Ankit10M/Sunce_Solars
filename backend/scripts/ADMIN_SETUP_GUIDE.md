# Admin Account Creation Guide

## Overview
This guide explains how to create admin accounts for your ERP system using the `createAdmin.js` script.

---

## Prerequisites
- Backend running (or just dependencies installed)
- MongoDB connection configured in `.env`
- Node.js installed

---

## Quick Start

### Method 1: Using npm script (Recommended)

From the `backend` directory:

```bash
npm run create-admin "Admin Name" "email@sunce.admin.com" "password123"
```

**Example:**
```bash
npm run create-admin "John Doe" "admin@sunce.admin.com" "SecurePassword123"
```

### Method 2: Direct node command

```bash
node scripts/createAdmin.js "Admin Name" "email@sunce.admin.com" "password123"
```

---

## Requirements

✅ **Email Format**: Must end with `@sunce.admin.com`
- ✅ Valid: `admin@sunce.admin.com`, `john@sunce.admin.com`
- ❌ Invalid: `admin@company.com`, `admin@sunce.com`

✅ **Password**: Minimum 8 characters
- ✅ Valid: `SecurePass123`, `MyAdmin@2024`
- ❌ Invalid: `pass123` (too short)

✅ **Name**: Any display name for the admin
- ✅ Valid: `John Doe`, `Boss Man`, `System Admin`

---

## Example Usage

### Create first admin account:
```bash
npm run create-admin "System Admin" "admin@sunce.admin.com" "AdminPass@123"
```

### Expected Output:
```
📡 Connecting to MongoDB...
✅ Connected to MongoDB

🔐 Hashing password...
👤 Creating admin account...

✅ Admin account created successfully!

📋 Admin Details:
   Name:  System Admin
   Email: admin@sunce.admin.com
   Role:  admin
   ID:    507f1f77bcf86cd799439011

🔓 Login Credentials:
   Email:    admin@sunce.admin.com
   Password: AdminPass@123

✨ You can now login at http://localhost:5173/login
```

---

## After Creating Admin Account

### 1. Start the Backend
```bash
npm start
# or
node --watch index.js
```

### 2. Start the Frontend
From the `frontend` directory:
```bash
npm install
npm run dev
```

### 3. Login to Admin Dashboard

1. Navigate to: `http://localhost:5173/login`
2. Enter your admin email: `admin@sunce.admin.com`
3. Enter your password
4. You'll receive a verification link (check console in dev mode or email in production)
5. Click the link to verify and access the admin dashboard

---

## Troubleshooting

### Error: "Admin email must end with @sunce.admin.com"
- Make sure your email is using the exact domain: `@sunce.admin.com`

### Error: "Password must be at least 8 characters long"
- Use a password with minimum 8 characters

### Error: "Admin account with email already exists"
- The email is already registered
- Use a different email or delete the existing one

### Error: "MONGO_URI not found in environment"
- Check your `.env` file contains `MONGO_URI=your_connection_string`
- Verify the file is in the `backend` directory

### Error: "Cannot find module"
- Run `npm install` in the backend directory
- Ensure all dependencies are installed

---

## Creating Multiple Admin Accounts

You can create as many admin accounts as needed:

```bash
npm run create-admin "Admin One" "admin1@sunce.admin.com" "Password@123"
npm run create-admin "Admin Two" "admin2@sunce.admin.com" "Password@456"
npm run create-admin "Admin Three" "admin3@sunce.admin.com" "Password@789"
```

---

## Security Notes

⚠️ **Important for Production**:
1. Use strong, unique passwords for each admin
2. Don't commit this script output to version control
3. Consider using environment variables for sensitive data
4. Change the domain from `@sunce.admin.com` to your actual company domain
5. Implement email verification in production (currently bypassed in dev mode)

---

## Next Steps

After creating admin account:
1. ✅ Login and access admin dashboard
2. ✅ Review existing features in: Analytics, Tickets, Users, Financial, Logs
3. ✅ Connect real APIs to dashboard (currently shows mock data)
4. ✅ Customize features based on your requirements

---

## Support

If you encounter issues:
1. Check MongoDB connection is working
2. Verify `.env` file is properly configured
3. Ensure backend dependencies are installed
4. Check the error message for specific guidance

