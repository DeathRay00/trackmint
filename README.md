# Trackmint - Manufacturing Management System

A comprehensive, full-stack Manufacturing Management System built with modern technologies. Trackmint provides end-to-end manufacturing order tracking, work order management, BOM handling, inventory control, and real-time production monitoring.

Video Link :- https://drive.google.com/file/d/1JPoHYnYhVxtHrOngK6cQZerhb_AvZ2mQ/view?usp=sharing

## 🏭 Overview

Trackmint is designed to streamline manufacturing operations by providing:
- **Manufacturing Order Management**: Complete lifecycle tracking from planning to completion
- **Work Order Execution**: Real-time task management with timer tracking
- **Bill of Materials (BOM)**: Component management and cost calculation
- **Inventory Control**: Stock movements and material consumption tracking
- **Work Center Management**: Capacity planning and utilization monitoring
- **Role-based Access Control**: Secure multi-user environment with different permission levels

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (v12 or higher) - Optional, SQLite supported for development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd trackmint
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Database Setup** (Optional - uses SQLite by default)
   ```bash
   # For PostgreSQL
   createdb trackmint_db
   psql trackmint_db < schema.sql
   
   # For SQLite (default)
   python init_db.py
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   python main.py
   # Server runs on http://localhost:8000
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Application runs on http://localhost:8080
   ```

3. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔐 Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@trackmint.com` | `any password` | Full system access |
| **Manufacturing Manager** | `manager@trackmint.com` | `any password` | Order management, BOM control |
| **Operator** | `operator@trackmint.com` | `any password` | Work order execution, time tracking |
| **Inventory Manager** | `inventory@trackmint.com` | `any password` | Stock management, material movements |

## 🏗️ Architecture

### Technology Stack

#### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping (ORM)
- **PostgreSQL/SQLite** - Database management
- **Pydantic** - Data validation and settings management
- **JWT** - JSON Web Tokens for authentication
- **Alembic** - Database migration tool
- **Uvicorn** - ASGI server

#### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - High-quality, accessible component library
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Recharts** - Data visualization library

### Project Structure

```
trackmint/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/routes/        # API endpoint definitions
│   │   ├── core/              # Core configuration
│   │   ├── db/                # Database connection and setup
│   │   ├── middleware/        # Custom middleware
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   └── utils/             # Utility functions
│   ├── tests/                 # Backend tests
│   ├── main.py               # FastAPI application entry point
│   ├── requirements.txt      # Python dependencies
│   └── schema.sql            # Database schema
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route components
│   │   ├── services/         # API services
│   │   ├── store/            # State management
│   │   ├── types/            # TypeScript definitions
│   │   └── hooks/            # Custom React hooks
│   ├── public/               # Static assets
│   ├── package.json          # Node.js dependencies
│   └── vite.config.ts        # Vite configuration
└── README.md                 # This file
```

## 📋 Features

### ✅ Implemented Features

#### Authentication & Authorization
- **Multi-role Authentication**: Admin, Manager, Operator, Inventory Manager
- **JWT-based Security**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions per user role
- **Password Recovery**: Forgot password and OTP verification flows

#### Manufacturing Orders
- **Complete Lifecycle Management**: From planning to completion
- **Status Tracking**: Planned → In Progress → Done → Canceled
- **Priority Management**: Critical, High, Medium, Low priorities
- **Advanced Filtering**: By status, priority, date range, product
- **Component Availability**: Real-time stock level indicators

#### Work Orders
- **Task-level Management**: Break down manufacturing orders into executable tasks
- **Real-time Timer Tracking**: Start, pause, resume, complete operations
- **Operator Assignment**: Assign specific operators to work orders
- **Multiple View Modes**: Cards, Table, Status Board views
- **Progress Monitoring**: Visual progress indicators and completion tracking

#### Modern UI/UX
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Industrial Design Theme**: Manufacturing-focused color scheme and typography
- **Collapsible Navigation**: Space-efficient sidebar with role-based menu items
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Comprehensive loading indicators and error handling
- **Dark/Light Mode**: Theme switching capability

#### Data Management
- **Product Master**: SKU management, categories, specifications
- **Stock Management**: Inventory tracking, stock movements, material consumption
- **Work Centers**: Capacity planning, utilization tracking, cost management
- **Bill of Materials**: Component lists, operations, cost calculations

### 🔄 Core Data Models

#### Users & Roles
- **Admin**: Full system access, user management, system configuration
- **Manufacturing Manager**: Order management, BOM control, reporting
- **Operator**: Work order execution, time tracking, status updates
- **Inventory Manager**: Stock management, material movements, procurement

#### Manufacturing Data
- **Products**: SKU, categories, stock levels, unit costs, specifications
- **BOMs**: Components, operations, work centers, cost calculations
- **Manufacturing Orders**: Production planning, quantities, due dates, priorities
- **Work Orders**: Task execution, time tracking, operator assignment
- **Work Centers**: Capacity, utilization, cost per hour, equipment
- **Stock Movements**: Inventory transactions, material consumption, adjustments

### 🎯 Roadmap

#### Phase 2 Features
- **Advanced Analytics**: Performance charts, throughput analysis, efficiency metrics
- **Report Generation**: Excel/PDF export, custom report builder
- **Profile Management**: User settings, personal dashboards, preferences
- **Notification System**: Real-time alerts, email notifications, mobile push
- **API Integration**: ERP system integration, third-party tool connectivity

#### Phase 3 Features
- **Mobile Application**: Native mobile app for operators
- **IoT Integration**: Sensor data integration, equipment monitoring
- **Machine Learning**: Predictive maintenance, demand forecasting
- **Multi-tenant Support**: Multiple company/organization support

## 🔧 Development

### Backend Development

#### Available Scripts
```bash
# Run development server
python main.py

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Database migrations
alembic upgrade head
```

#### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-for-jwt
DATABASE_URL=postgresql://user:password@localhost/trackmint_db
# or for SQLite: sqlite:///./trackmint.db
```

### Frontend Development

#### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Mock Data
The application includes comprehensive mock data:
- **Wooden Table Demo**: Complete BOM with legs, top, screws, varnish
- **Operations**: Assembly (60m), Painting (30m), Packing (20m)
- **Sample Orders**: Various states for testing workflows
- **Realistic Timelines**: Past, current, and future orders

### Testing

#### Backend Tests
```bash
cd backend
pytest tests/
```

#### Frontend Tests
```bash
cd frontend
npm test
```

## 🎨 Design System

### Color Palette
- **Primary**: Industrial Blue (#3B82F6)
- **Accent**: Manufacturing Orange (#F97316)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Status Colors**:
  - Planned (Blue), In Progress (Yellow)
  - Completed (Green), Delayed/Canceled (Red)

### Key UI Patterns
- **Status Badges**: Consistent color coding across all features
- **Data Tables**: Sortable, filterable, with bulk actions
- **Card Layouts**: Information density with clear visual hierarchy
- **Progressive Disclosure**: Complex forms with logical grouping
- **Responsive Grid**: Adaptive layouts for different screen sizes

## 📊 Business Logic

### Manufacturing Flow
1. **Create Manufacturing Order** → Define product, quantity, timeline, priority
2. **Generate Work Orders** → Break down into operational tasks with dependencies
3. **Execute Operations** → Operators track time, progress, and issues
4. **Material Consumption** → Automatic stock movements based on BOM
5. **Quality Control** → Comments, issues, delays tracking
6. **Completion** → Update inventory, generate reports, archive data

### Cost Calculation
- **Material Costs**: Component qty × unit cost × MO quantity
- **Labor Costs**: Operation duration × work center rate
- **Total Cost**: Materials + Labor + overhead + waste
- **Profitability**: Revenue - Total Cost - Overhead

### Role Permissions Matrix

| Feature | Admin | Manager | Operator | Inventory |
|---------|-------|---------|----------|-----------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Manufacturing Orders | ✅ | ✅ | 👁️ | 👁️ |
| Work Orders | ✅ | ✅ | ✅ | ❌ |
| BOM Management | ✅ | ✅ | 👁️ | 👁️ |
| Stock Management | ✅ | 👁️ | ❌ | ✅ |
| Work Centers | ✅ | ✅ | 👁️ | ❌ |
| Reports | ✅ | ✅ | 👁️ | ✅ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

Legend: ✅ Full Access, 👁️ Read Only, ❌ No Access

## 🚀 Deployment

### Production Deployment

#### Backend Deployment
```bash
# Using Docker (recommended)
docker build -t trackmint-backend ./backend
docker run -p 8000:8000 trackmint-backend

# Using Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

#### Frontend Deployment
```bash
# Build for production
npm run build

# Serve with nginx or any static file server
# Files will be in ./dist directory
```

#### Environment Configuration
```env
# Production .env
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:password@prod-db-host/trackmint_db
CORS_ORIGINS=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and patterns
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation at `/docs` endpoint
- Review the API documentation at `http://localhost:8000/docs`

## 🙏 Acknowledgments

- Built with modern web technologies and best practices
- Inspired by manufacturing industry requirements
- Uses open-source libraries and frameworks
- Designed for scalability and maintainability

---

**Trackmint** - Streamlining Manufacturing Operations with Modern Technology
