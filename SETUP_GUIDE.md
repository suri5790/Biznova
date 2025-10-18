# BizNova Setup Guide

This guide will help you set up and run the BizNova application with both frontend and backend connected.

## Prerequisites

Before starting, make sure you have the following installed:
- Node.js (version 16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Git

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd Biznova/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create a `.env` file in the `Biznova/backend` directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/biznova

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=biznova_jwt_secret_key_2024

# AI Services (Future Integration)
OPENAI_API_KEY=your_openai_api_key_here
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service or run `mongod`
- **macOS**: Run `brew services start mongodb-community`
- **Linux**: Run `sudo systemctl start mongod`

### 5. Start Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd Biznova/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Testing the Application

### 1. Open the Application
Navigate to `http://localhost:3000` in your browser.

### 2. Register a New User
- Click on "Sign up here" or navigate to `/register`
- Fill in the registration form:
  - Full Name: Your name
  - Phone Number: Indian phone number (10 digits starting with 6-9)
  - Shop/Business Name: Your business name
  - Preferred Language: Select your language
  - UPI ID: Optional
  - Password: At least 6 characters
  - Confirm Password: Same as password
- Click "Create Account"

### 3. Login
- After registration, you'll be redirected to login
- Use your phone number and password to login
- You'll be redirected to the dashboard

### 4. Dashboard
- You should see the main dashboard with your user information in the header
- The sidebar contains navigation options
- You can logout using the user menu in the header

## API Endpoints

The backend provides the following API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Other Endpoints
- `GET /api/sales` - Get all sales (protected)
- `POST /api/sales` - Create new sale (protected)
- `GET /api/expenses` - Get all expenses (protected)
- `POST /api/expenses` - Create new expense (protected)
- `GET /api/inventory` - Get all inventory items (protected)
- `POST /api/inventory` - Create new inventory item (protected)
- `GET /api/customers` - Get all customers (protected)
- `POST /api/customers` - Create new customer (protected)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the MONGODB_URI in your .env file
   - Try connecting to MongoDB using a client like MongoDB Compass

2. **CORS Error**
   - Make sure the FRONTEND_URL in backend .env matches your frontend URL
   - Check that both servers are running

3. **Port Already in Use**
   - Backend: Change PORT in .env file
   - Frontend: React will automatically suggest a different port

4. **Dependencies Issues**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

5. **Authentication Issues**
   - Check browser console for errors
   - Ensure JWT_SECRET is set in backend .env
   - Clear browser localStorage and try again

6. **"User already exists" Error**
   - This means the phone number is already registered
   - Use a different phone number for registration
   - Or clear the database: `cd backend && npm run clear-db`
   - Or try logging in with existing credentials

7. **React Router Warnings**
   - These are just deprecation warnings and don't affect functionality
   - The app will work fine despite these warnings

### Development Tips

1. **Backend Logs**: Check the terminal where you ran `npm run dev` for backend logs
2. **Frontend Logs**: Check browser console (F12) for frontend errors
3. **API Testing**: Use tools like Postman to test API endpoints directly
4. **Database**: Use MongoDB Compass to view your data

## Project Structure

```
Biznova/
├── backend/
│   ├── src/
│   │   ├── controllers/     # API route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication & validation
│   │   └── server.js        # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── services/       # API service functions
│   │   └── App.jsx         # Main app component
│   └── package.json
└── SETUP_GUIDE.md
```

## Next Steps

Once the basic setup is working, you can:
1. Add more business features (sales, expenses, inventory management)
2. Implement AI insights and recommendations
3. Add WhatsApp integration
4. Deploy to production

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are properly installed
4. Verify that MongoDB is running and accessible
