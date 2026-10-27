# 🎓 Student Expense Tracker

A modern, responsive, fintech-inspired full-stack web application designed specifically for college students to track their daily expenses, manage category budgets, project pocket-money countdowns, analyze spending habits with interactive charts, and reach savings goals.

Built with **React (Vite)**, **Tailwind CSS**, **Node.js**, **Express**, **MongoDB** (with automatic zero-config persistent JSON database fallback), **Recharts**, and **Lucide React**.

---

## 🌟 Key Features

### 1. 📊 Financial Dashboard
- **Real-Time Financial Metrics**: Total balance, monthly income, total expenses, and remaining budget calculated instantly from actual transactions.
- **Pocket-Money Tracker**: Displays remaining allowance and days remaining until the next allowance date.
- **Daily Safe Spending Limit**: Automatically calculates your safe daily allowance based on your remaining monthly budget and days left in the month.
- **Interactive Visualizations**:
  - Monthly spending timeline graph (Recharts area/bar chart).
  - Category-wise expense distribution (donut pie chart).
  - Monthly budget usage progress bar with color-coded status.
- **Recent Transactions Feed**: View, filter, and jump directly into editing recent expenses.
- **Quick Add Modal**: Add expenses or income from anywhere in the app with one click.

### 2. 💸 Expense & Income Management
- **Full CRUD Operations**: Create, view, edit, and delete transactions.
- **Student Categories**:
  - *Food & Canteen*, *Transport & Commute*, *Education & Books*, *Accommodation & Hostel Rent*, *Shopping*, *Entertainment*, *Bills & Utilities*, *Healthcare*, and *Other*.
- **Indian Payment Methods**:
  - *UPI (GPay / PhonePe / Paytm)*, *Cash*, *Debit Card*, *Credit Card*, and *Net Banking*.
- **Search & Filters**: Search transactions by title, filter by category, payment method, or transaction type (`expense` / `income`), and sort by date or amount.
- **Export to CSV**: Download filtered financial records as a standard CSV file with one click.
- **Deletion Safeguard**: Built-in confirmation modal prevents accidental data loss.
- **Native Currency**: Formatted in Indian Rupees (**₹**) with Indian date format (`DD MMM YYYY`).

### 3. 🎯 Smart Budgeting & Warning Alerts
- **Monthly Spending Limits**: Set overall monthly spending thresholds.
- **Category-Wise Budgets**: Allocate dedicated limits for Canteen, Entertainment, Shopping, etc.
- **80% Warning Threshold**: Visual yellow alert appears when spending reaches 80% of any budget limit.
- **Budget Exceeded Alert**: Immediate red warning banner when a category or monthly limit is breached.
- **Budget History**: Track and compare spending against budgets month over month.

### 4. 📈 Analytics & Reports
- **Dynamic Time Range**: Filter financial reports by month, 3 months, 6 months, or custom date ranges.
- **Key Financial Indicators**: Average daily spend, highest spending category, monthly savings amount, and savings rate percentage.
- **Smart AI Saving Tips**: Dynamic personalized recommendations generated from spending patterns (e.g., dining out too often, high subscription burden).
- **Interactive Charts**:
  - Income vs. Expense monthly comparison bars.
  - Category breakdown with expense share percentages.
  - Daily spending intensity timeline.

### 5. 💰 Savings Goals
- Set target goals for college essentials (e.g., *New Laptop for Coding*, *College Semester Fees*, *Goa Trip with Friends*).
- Track target amount, current saved amount, target date, and progress percentage.
- Deposit or withdraw funds with transaction history.
- Celebratory confetti animation upon reaching 100% of a savings goal.

### 6. 🔄 Recurring Commitments & Subscriptions
- Track fixed monthly student expenses (hostel rent, mess fees, Wi-Fi, Spotify, Netflix, gym).
- Due date indicators with active countdowns.
- 1-click **"Pay Now"** button to automatically log the transaction into your expense ledger.

### 7. 📅 Calendar View
- Visual month calendar showing daily financial activity markers.
- Hover over any calendar day to view the net balance, income logged, and expenses incurred.

### 8. 🌓 Dark Mode & UI/UX Design
- Tailored fintech aesthetic with smooth transitions and subtle animations.
- Full Light and Dark theme support with persistent local storage state.
- Fully responsive layout for desktop, tablet, and mobile with slide-over drawer navigation.
- Color semantics: Emerald Green for Income, Crimson Red for Expenses, Indigo/Violet for Analytics.

### 9. 🔒 Secure Authentication & Data Isolation
- User registration, login, and profile management with avatar customization.
- Passwords securely hashed with **Bcrypt (10 salt rounds)**.
- Stateless authentication using **JSON Web Tokens (JWT)**.
- Strict user data isolation: All queries, budgets, and transactions are strictly scoped to the authenticated student user ID.
- Demo Login: 1-click test student login with sample demo records to immediately explore all features.

### 10. ⚡ Smart Database Engine (Zero-Config)
- Automatically checks for a running **MongoDB** instance (local or MongoDB Atlas via `MONGODB_URI`).
- If MongoDB is not running locally, the system automatically switches to an integrated **atomic persistent JSON database** located at `backend/data/db.json`.
- The JSON engine provides 100% of Mongoose's CRUD operations, sorting, skipping, and filtering with persistent storage across restarts, ensuring the application works immediately out-of-the-box on any machine.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, CORS, Dotenv, Net socket probe |
| **Authentication**| JSON Web Tokens (jsonwebtoken), Bcryptjs |
| **Database** | MongoDB / Mongoose ODM (with automatic fallback to local atomic JSON DB) |
| **Testing** | Node.js Assert, HTTP Integration Test Suite, Calculation Unit Tests |

---

## 📁 Project Structure

```text
student-expense-tracker/
├── package.json                   # Root workspace scripts
├── .gitignore                     # Git ignore rules
├── .env.example                   # Environment configuration template
├── README.md                      # Project documentation
│
├── backend/                       # Node.js + Express API
│   ├── config/
│   │   ├── db.js                  # Smart MongoDB connection & fallback manager
│   │   └── store.js               # Atomic JSON file database engine
│   ├── controllers/               # Business logic controllers
│   │   ├── authController.js      # User registration, login, profile, demo seed
│   │   ├── transactionController.js # CRUD, filtering, CSV export
│   │   ├── budgetController.js    # Budgets & 80% threshold calculation
│   │   ├── savingsGoalController.js # Goals & deposit/withdraw tracking
│   │   ├── recurringController.js # Recurring expenses & allowance countdown
│   │   └── analyticsController.js # KPIs, charts data, smart saving tips
│   ├── data/                      # Local persistent JSON data storage (db.json)
│   ├── middleware/                # JWT auth guard and error handlers
│   ├── models/                    # Mongoose schemas (User, Transaction, Budget, etc.)
│   ├── routes/                    # Express API route endpoints
│   ├── tests/                     # Automated unit and integration tests
│   │   ├── calculation.test.js    # Unit tests for financial calculations
│   │   └── api.test.js            # Integration tests for API endpoints
│   ├── .env                       # Backend environment variables
│   ├── package.json
│   └── server.js                  # Express entry point
│
└── frontend/                      # React + Vite + Tailwind CSS Client
    ├── public/                    # Static assets
    ├── src/
    │   ├── components/            # Reusable UI components
    │   │   ├── Navbar.jsx         # Top navbar with DB health indicator & quick add
    │   │   ├── Sidebar.jsx        # Sidebar navigation & student profile card
    │   │   ├── MetricCard.jsx     # Fintech KPI card component
    │   │   ├── PocketMoneyBanner.jsx # Allowance countdown & daily spending limit
    │   │   ├── BudgetAlertBanner.jsx # Visual 80% & budget exceeded banners
    │   │   ├── TransactionModal.jsx  # Add/Edit transaction modal form
    │   │   └── ConfirmModal.jsx   # Deletion confirmation modal
    │   ├── context/               # React Context Providers
    │   │   ├── AuthContext.jsx    # User authentication, token, demo login
    │   │   └── ThemeContext.jsx   # Light / Dark mode toggle
    │   ├── pages/                 # Full-page views
    │   │   ├── LandingPage.jsx    # Hero landing page
    │   │   ├── LoginPage.jsx      # Login view with 1-click demo button
    │   │   ├── RegisterPage.jsx   # Student registration form
    │   │   ├── DashboardPage.jsx  # Main fintech dashboard
    │   │   ├── TransactionsPage.jsx # Transaction ledger with filters & CSV export
    │   │   ├── BudgetsPage.jsx    # Budget management & category allocations
    │   │   ├── AnalyticsPage.jsx  # Recharts financial reports & smart tips
    │   │   ├── SavingsGoalsPage.jsx # Target savings goals with progress tracking
    │   │   ├── RecurringPage.jsx  # Subscriptions & recurring expenses
    │   │   ├── CalendarPage.jsx   # Daily calendar spend view
    │   │   └── SettingsPage.jsx   # Profile settings & password update
    │   ├── utils/
    │   │   └── formatters.js      # Indian Rupee (₹) & date formatting helpers
    │   ├── App.jsx                # Main application shell & router
    │   ├── index.css              # Tailwind CSS directives
    │   └── main.jsx               # React DOM entry point
    ├── index.html
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)
- Optional: [MongoDB](https://www.mongodb.com/) (If MongoDB is not installed, the app automatically runs on its built-in persistent JSON database).

---

### Step 1: Install Dependencies

From the project root:

```bash
# Option A: Install using root convenience script
npm run install:all

# Option B: Install manually in each directory
cd backend && npm install
cd ../frontend && npm install
```

---

### Step 2: Environment Configuration

Both `backend` and `frontend` come pre-configured with default development settings.

To customize backend environment variables, inspect or copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/student_expense_tracker
JWT_SECRET=super_secret_jwt_key_student_expense_tracker_2024
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

> **Note on MongoDB**: If you have a MongoDB Atlas connection string, you can paste it directly into `MONGODB_URI`. If you do not have MongoDB running, leave it as is; the system will detect it within 700ms and use the persistent local JSON database seamlessly.

---

### Step 3: Run the Application

Open two terminal windows:

#### Terminal 1: Start Backend Server
```bash
cd backend
npm run dev
```
The API server will start on `http://localhost:5000`. You can test health at:
`http://localhost:5000/api/health`

#### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Vite will serve the client at `http://localhost:5173`. Open this URL in your web browser.

---

## 🧪 Running Automated Tests

The application includes unit tests for financial calculations and integration tests for all core API endpoints:

```bash
cd backend
npm test
```

### What is tested:
1. **Calculation Unit Tests (`tests/calculation.test.js`)**:
   - Remaining monthly budget calculation.
   - 80% warning and exceeded alert flags.
   - Safe daily spending limit calculation.
   - Savings rate and savings amount logic.
   - Pocket-money days-remaining countdown.
2. **API Integration Tests (`tests/api.test.js`)**:
   - `GET /api/health` - Health check and database engine status.
   - `GET /api/transactions` - Protected route token validation (rejects unauthorized requests with 401).
   - `POST /api/auth/register` - User registration and JWT token generation.
   - `POST /api/transactions` - Expense creation with category and payment method validation.
   - `GET /api/transactions` - User data isolation and accurate summary totals.

---

## 📖 API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new student account.
- `POST /api/auth/login` - Authenticate user and receive JWT.
- `GET /api/auth/me` - Get current authenticated user profile.
- `PUT /api/auth/profile` - Update student profile details (name, college, monthly allowance).
- `PUT /api/auth/password` - Change account password.
- `POST /api/auth/seed-demo` - Load rich demo student records with 1 click.

### Transactions (`/api/transactions`)
- `GET /api/transactions` - List user transactions (supports `?search=`, `?category=`, `?type=`, `?paymentMethod=`, `?startDate=`, `?endDate=`, `?sort=`).
- `POST /api/transactions` - Create a new expense or income record.
- `GET /api/transactions/:id` - Fetch single transaction details.
- `PUT /api/transactions/:id` - Update existing transaction.
- `DELETE /api/transactions/:id` - Delete transaction.
- `GET /api/transactions/export/csv` - Download transactions as CSV file.

### Budgets (`/api/budgets`)
- `GET /api/budgets` - Fetch active month budgets with spent amounts, remaining amounts, and alert flags.
- `POST /api/budgets` - Create or update monthly/category budget.
- `DELETE /api/budgets/:id` - Delete category budget.

### Analytics (`/api/analytics`)
- `GET /api/analytics/summary` - Key dashboard metrics, income vs expenses, highest spend category, savings rate.
- `GET /api/analytics/category-breakdown` - Category-wise spending breakdown for pie charts.
- `GET /api/analytics/monthly-trends` - 6-month historical spending trends.
- `GET /api/analytics/daily-spending` - Daily spending distribution for the selected month.
- `GET /api/analytics/smart-tips` - Automated financial suggestions based on student spending habits.
- `GET /api/analytics/calendar-view` - Day-by-day transaction summaries for the calendar view.

### Savings Goals (`/api/savings-goals`)
- `GET /api/savings-goals` - List student savings targets and progress.
- `POST /api/savings-goals` - Create new savings goal.
- `PUT /api/savings-goals/:id` - Update goal details.
- `POST /api/savings-goals/:id/deposit` - Deposit funds toward a goal.
- `POST /api/savings-goals/:id/withdraw` - Withdraw funds from a goal.
- `DELETE /api/savings-goals/:id` - Delete a goal.

### Recurring Expenses & Allowance (`/api/recurring`)
- `GET /api/recurring` - List recurring subscriptions and allowance countdown.
- `POST /api/recurring` - Create recurring expense entry.
- `POST /api/recurring/:id/pay` - Log recurring expense as paid transaction for the current month.
- `DELETE /api/recurring/:id` - Delete recurring expense.

---

## 🎨 UI & Design Principles

- **Fintech Aesthetic**: Clean typography, rounded cards (`rounded-2xl`), subtle borders, and soft drop shadows.
- **Micro-Interactions**: Hover states on cards, smooth progress bar animations, and celebration confetti on reaching savings milestones.
- **Responsive Layout**: Designed mobile-first, tested seamlessly on smartphones, tablets, and widescreen displays.
- **Accessibility & Contrast**: Carefully selected color contrasts in both light mode and dark mode to reduce eye strain during late-night study sessions.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
