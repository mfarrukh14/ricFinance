# RIC Finance Management System

A comprehensive Finance Management System for Rawalpindi Institute of Cardiology built with .NET 9 and React.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Budget Management**: Complete budget tracking for AAA, PLA, and UHI categories
- **Dashboard**: Visual analytics with charts and summary cards
- **Object Codes**: Manage budget object codes and heads of account
- **Fiscal Years**: Track and manage financial year periods
- **User Management**: Admin panel for user administration

## Technology Stack

### Backend
- .NET 9 Web API
- Entity Framework Core 9
- SQL Server 2019
- JWT Authentication
- BCrypt Password Hashing

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router DOM
- Recharts (Charts)
- Lucide React (Icons)

## Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js 18+
- SQL Server 2019 (or SQL Server Express)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/RICFinance.API
   ```

2. Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=YOUR_SERVER;Database=RICFinanceDB;Trusted_Connection=True;TrustServerCertificate=True;"
     }
   }
   ```

3. Restore packages and run migrations:
   ```bash
   dotnet restore
   dotnet ef database update
   ```

4. Run the API:
   ```bash
   dotnet run
   ```
   
   The API will be available at `https://localhost:5001` or `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update the API URL in `src/services/api.js` if needed:
   ```javascript
   const API_URL = 'http://localhost:5000/api';
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   
   The frontend will be available at `http://localhost:5173`

## Default Credentials

- **Username**: admin
- **Password**: Admin@123

## Project Structure

```
ricFinance/
├── backend/
│   └── RICFinance.API/
│       ├── Controllers/       # API Controllers
│       ├── Data/              # DbContext and Migrations
│       ├── DTOs/              # Data Transfer Objects
│       ├── Models/            # Entity Models
│       ├── Services/          # Business Logic Services
│       └── Program.cs         # Application Entry Point
│
└── frontend/
    └── src/
        ├── components/        # Reusable UI Components
        ├── context/           # React Context (Auth)
        ├── pages/             # Page Components
        ├── services/          # API Service
        ├── App.jsx            # Main App Component
        └── main.jsx           # Entry Point
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - List all users (Admin only)

### Budget
- `GET /api/budget/object-codes` - List object codes
- `POST /api/budget/object-codes` - Create object code
- `GET /api/budget/fiscal-years` - List fiscal years
- `POST /api/budget/fiscal-years` - Create fiscal year
- `GET /api/budget/entries` - List budget entries
- `POST /api/budget/entries` - Create budget entry
- `GET /api/budget/dashboard` - Get dashboard summary

## User Roles

1. **Admin**: Full access to all features including user management
2. **FinanceOfficer**: Can manage budget entries and object codes
3. **User**: Read-only access to dashboard and reports

## License

This project is proprietary software for Rawalpindi Institute of Cardiology.

---

Developed for RIC Finance Department © 2024
