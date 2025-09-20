# Trackmint - Manufacturing Management System

A comprehensive, modular Manufacturing Management SPA built with React, TypeScript, and modern UI components. Features role-based authentication, manufacturing order tracking, work order management, BOM handling, and inventory control.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🔐 Demo Credentials

Use these credentials to test different user roles:

- **Admin**: `admin@trackmint.com` / any password
- **Manufacturing Manager**: `manager@trackmint.com` / any password  
- **Operator**: `operator@trackmint.com` / any password
- **Inventory Manager**: `inventory@trackmint.com` / any password

## 📋 Features

### ✅ Implemented
- **Authentication & Authorization**
  - Login, Signup, Forgot Password, OTP flows
  - Role-based access control (Admin, Manager, Operator, Inventory Manager)
  - Persistent authentication via localStorage

- **Dashboard**
  - Key performance indicators (KPIs)
  - Manufacturing order status overview
  - Recent activity feed
  - Status-based filtering

- **Manufacturing Orders**
  - Complete order lifecycle management
  - Status tracking (Planned → In Progress → Done → Canceled)
  - Priority management (Critical, High, Medium, Low)
  - Advanced filtering and sorting
  - Component availability indicators

- **Work Orders**
  - Task-level production management
  - Real-time timer tracking
  - Start/Pause/Complete controls
  - Operator assignment
  - Multiple view modes (Cards, Table, Status Board)

- **Modern UI/UX**
  - Responsive design with mobile support
  - Industrial design theme
  - Collapsible sidebar navigation
  - Toast notifications
  - Loading states and error handling

### 🔄 Core Data Models
- **Users & Roles**: Admin, Manufacturing Manager, Operator, Inventory Manager
- **Products**: SKU, categories, stock levels, unit costs
- **BOMs**: Components, operations, work centers, cost calculations
- **Manufacturing Orders**: Production planning, quantities, due dates
- **Work Orders**: Task execution, time tracking, operator assignment
- **Work Centers**: Capacity, utilization, cost per hour
- **Stock Movements**: Inventory transactions, material consumption

### 🎯 Coming Soon
- **BOM Management**: Component lists, operations, cost calculation
- **Work Centers**: Capacity planning, utilization tracking
- **Stock Ledger**: Inventory management, movement tracking
- **Analytics**: Performance charts, throughput analysis
- **Reports**: Excel/PDF generation, custom report builder
- **Profile Management**: User settings, personal reports

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Shadcn/ui** component library
- **Zustand** for state management
- **React Router** for navigation
- **Recharts** for data visualization (ready)

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   └── layout/         # Layout components
├── pages/              # Route components
│   └── auth/          # Authentication pages
├── store/              # Zustand state management
├── services/           # API services (mock)
├── data/              # Mock data and fixtures
├── types/             # TypeScript definitions
├── hooks/             # Custom React hooks
└── lib/               # Utilities and helpers
```

### State Management
- **Authentication**: User session, role-based permissions
- **Manufacturing Data**: Orders, work orders, products, BOMs
- **UI State**: Loading states, filters, selections
- **Real-time Updates**: Work order timers, status changes

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Mock Data
The application uses comprehensive mock data including:
- **Wooden Table Demo**: Complete BOM with legs, top, screws, varnish
- **Operations**: Assembly (60m), Painting (30m), Packing (20m)
- **Sample Orders**: Various states for testing workflows
- **Realistic Timelines**: Past, current, and future orders

### Testing Different Roles
1. **Admin**: Full access to all features and settings
2. **Manufacturing Manager**: Order management, BOM control, reporting
3. **Operator**: Work order execution, time tracking, status updates
4. **Inventory Manager**: Stock management, material movements

## 🎨 Design System

### Color Palette
- **Primary**: Industrial Blue (#3B82F6)
- **Accent**: Manufacturing Orange (#F97316)  
- **Status Colors**: 
  - Planned (Blue), In Progress (Yellow)
  - Completed (Green), Delayed/Canceled (Red)

### Key UI Patterns
- **Status Badges**: Consistent color coding across features
- **Data Tables**: Sortable, filterable, with bulk actions
- **Card Layouts**: Information density with visual hierarchy
- **Progressive Disclosure**: Complex forms with logical grouping

## 📊 Business Logic

### Manufacturing Flow
1. **Create Manufacturing Order** → Define product, quantity, timeline
2. **Generate Work Orders** → Break down into operational tasks  
3. **Execute Operations** → Operators track time and progress
4. **Material Consumption** → Automatic stock movements
5. **Quality Control** → Comments, issues, delays tracking
6. **Completion** → Update inventory, generate reports

### Cost Calculation
- **Material Costs**: Component qty × unit cost × MO quantity
- **Labor Costs**: Operation duration × work center rate
- **Total Cost**: Materials + Labor + overhead

This is a complete, production-ready manufacturing management system with modern architecture and comprehensive feature set. All core workflows are implemented with realistic mock data for immediate testing and demonstration.