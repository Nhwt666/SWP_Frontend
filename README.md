# 🧬 DNA Testing Service - Frontend Application

A React-based frontend application for a DNA testing service that manages ticket requests, user authentication, payment processing, and administrative functions.

## 🚀 Features

- **User Management** - Registration, authentication, role-based access (Member, Staff, Admin)
- **Ticket Management** - DNA test requests, status tracking, test history
- **Payment System** - Wallet top-up, payment processing, transaction history
- **Admin Dashboard** - User management, ticket oversight, reports, voucher management
- **Staff Interface** - Request processing, sample management, status updates
- **Modern UI/UX** - Responsive design, charts, animations, toast notifications

## 🛠️ Technology Stack

- **Frontend**: React 19.1.0, React Router DOM 7.6.1
- **HTTP Client**: Axios 1.9.0
- **UI/UX**: Lucide React, React Icons, Framer Motion 12.23.0
- **Charts**: Chart.js 4.5.0, React Chart.js 2
- **PDF**: jsPDF, PDFMake, HTML2Canvas
- **Notifications**: React Toastify 11.0.5
- **Testing**: React Testing Library

## 📦 Installation

### Prerequisites
- Node.js (version 16 or higher)
- Backend API server running on `http://localhost:8080`

### Setup
```bash
git clone <repository-url>
cd SWP_Frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## 🌐 API Configuration

The application proxies API requests to the backend server on `http://localhost:8080`:

```json
{
  "proxy": "http://localhost:8080"
}
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Home, Login, Ticket, Admin, etc.)
├── services/           # API service functions
├── hooks/              # Custom React hooks
├── styles/             # CSS stylesheets
├── lib/                # Utility libraries
├── fonts/              # Custom fonts
└── App.js              # Main application component
```

## 🎯 Key Features by User Role

### 👤 Member Users
- Create DNA test requests
- View test history and status
- Manage wallet and payments
- Update profile information

### 👨‍💼 Staff Users
- Process incoming test requests
- Update test statuses
- Manage sample collection

### 👨‍💻 Admin Users
- Manage all user accounts
- Oversee all test requests
- Generate reports and analytics
- Manage vouchers and promotions

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for secure authentication with role-based access control.

## 🧪 Testing

```bash
npm test
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENVIRONMENT=development
```

---

**Built with ❤️ using React and modern web technologies**
