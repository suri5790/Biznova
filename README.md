# BizNova - AI-Powered MSME Business Assistant

## Project Overview
BizNova is a comprehensive MERN stack application designed to help Micro, Small, and Medium Enterprises (MSMEs) manage their business operations with AI-powered insights and automation.

## Tech Stack
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React.js, TailwindCSS, React Router
- **AI Integration**: OpenAI GPT-4o, Whisper, DALL·E
- **Communication**: WhatsApp API integration
- **Charts**: Recharts for data visualization

## Project Structure
```
Biznova/
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── config/db.js    # MongoDB connection
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   └── server.js       # Express server
│   ├── .env               # Environment variables
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── index.jsx      # Entry point
│   └── package.json       # Frontend dependencies
└── package.json           # Root package with scripts
```

## Development Phases

### Phase 1: Foundation (Current)
- ✅ MERN stack setup
- ✅ Basic routing and structure
- ✅ Database connection
- ✅ Frontend layout with TailwindCSS

### Phase 2: Core Features (Future)
- User authentication and authorization
- Sales and expense tracking
- Inventory management
- Customer relationship management

### Phase 3: AI Integration (Future)
- GPT-4o integration for business insights
- Voice-to-text with Whisper
- Image generation with DALL·E
- AI-powered daily business digest

### Phase 4: Communication (Future)
- WhatsApp webhook integration
- Automated customer communication
- UPI QR code generation

### Phase 5: Analytics (Future)
- Advanced charts and visualizations
- Business performance metrics
- Predictive analytics

### Phase 6: Mobile & Deployment (Future)
- Mobile responsiveness
- Production deployment
- Performance optimization

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

5. Setup environment variables:
   - Copy `.env.example` to `.env` in the backend folder
   - Update MongoDB connection string and other variables

### Running the Application

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

### Individual Commands
- Backend only: `npm run server`
- Frontend only: `npm run client`

## API Endpoints (Placeholder)

- `GET /api/users` - User management
- `GET /api/sales` - Sales tracking
- `GET /api/expenses` - Expense management
- `GET /api/inventory` - Inventory management
- `GET /api/customers` - Customer management
- `GET /api/ai` - AI services

## Contributing
This is a foundation project ready for Phase 2 development. All placeholder routes and components are documented and ready for implementation.

## License
Private project for MSME business management.
