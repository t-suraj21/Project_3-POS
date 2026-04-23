# 🛒 SmartPOS — Multi-Tenant Point of Sale System

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![PHP](https://img.shields.io/badge/PHP-8.1+-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**A full-featured, multi-tenant POS system for shops of all types — Grocery, Electronics, Retail & more.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Features](#-features)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Workflow Diagrams](#-workflow-diagrams)
- [Subscription Plans](#-subscription-plans)

---

## 🌟 Overview

SmartPOS is a **multi-tenant SaaS POS platform** where each shop owner registers their shop, manages products, processes sales, tracks inventory, manages customer credit (Udhar), handles supplier purchases, and generates reports — all isolated per shop using `shop_id` data scoping.

A **SuperAdmin** oversees all shops, manages subscriptions, and has platform-wide visibility.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router v7, Axios, Vite 8 |
| **Backend** | PHP 8.1+ (no framework), Custom Router |
| **Database** | MySQL 8.0 |
| **Auth** | JWT (HS256) via `firebase/php-jwt` |
| **Email** | PHPMailer + Gmail SMTP (OTP, Password Reset) |
| **Payments** | Razorpay (online billing + webhooks) |
| **Dev Server** | PHP built-in server + Vite dev server |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                 │
│  Vite + React 19 + React Router v7 + Axios             │
│  Port: 5173                                             │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP/JSON (JWT Bearer Token)
                         ▼
┌─────────────────────────────────────────────────────────┐
│               PHP Backend (index.php router)            │
│  Port: 8888                                             │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │  Auth    │  │ Role &   │  │  Route Files         │  │
│  │Middleware│→ │ Module   │→ │  /routes/*.php       │  │
│  │(JWT)     │  │ Guard    │  │                      │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
│                                         │               │
│                              ┌──────────▼─────────┐     │
│                              │   Controllers/     │     │
│                              │   *.php            │     │
│                              └──────────┬─────────┘     │
└─────────────────────────────────────────┼───────────────┘
                                          │ PDO
                                          ▼
┌─────────────────────────────────────────────────────────┐
│                    MySQL Database                        │
│                    pos_db                               │
│  shops │ users │ products │ sales │ suppliers │ ...    │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```
┌──────────┐       ┌──────────────┐      ┌──────────────────┐
│  shops   │──┬───▶│    users     │      │ subscription_    │
│          │  │    │  (all roles) │      │ plans            │
│ id       │  │    │ shop_id(FK)  │      └──────────────────┘
│ name     │  │    │ role(ENUM)   │
│ email    │  │    └──────────────┘      ┌──────────────────┐
│ phone    │  │                          │  subscriptions   │
│ billing_ │  │    ┌──────────────┐      │  shop_id (FK)    │
│ layout   │  ├───▶│  categories  │      │  plan/status     │
│ sub_     │  │    │  shop_id(FK) │      └──────────────────┘
│ status   │  │    │  parent_id   │
└──────────┘  │    └──────┬───────┘
              │           │
              │    ┌──────▼───────┐      ┌──────────────────┐
              ├───▶│   products   │─────▶│  stock_history   │
              │    │  shop_id(FK) │      │  product_id(FK)  │
              │    │  category_id │      └──────────────────┘
              │    │  cost/sell   │
              │    │  stock/unit  │      ┌──────────────────┐
              │    └──────┬───────┘      │   sale_items     │
              │           │              │   sale_id(FK)    │
              │    ┌──────▼───────┐      │   product_id(FK) │
              ├───▶│    sales     │─────▶└──────────────────┘
              │    │  shop_id(FK) │
              │    │  bill_number │      ┌──────────────────┐
              │    │  payment_mode│─────▶│    refunds       │
              │    └──────────────┘      │    refund_items  │
              │                          └──────────────────┘
              │    ┌──────────────┐
              ├───▶│  suppliers   │──┬──▶┌──────────────────┐
              │    │  shop_id(FK) │  │   │supplier_purchases│
              │    │  total_purch.│  │   │ unit, qty, price │
              │    │  total_paid  │  │   └──────────────────┘
              │    │  remaining   │  │
              │    └──────────────┘  └──▶┌──────────────────┐
              │                          │supplier_payments │
              │    ┌──────────────┐      └──────────────────┘
              └───▶│credit_cust.  │──┬──▶┌──────────────────┐
                   │  (Udhar)     │  │   │credit_transactions│
                   │  total_credit│  │   └──────────────────┘
                   │  remaining   │  └──▶┌──────────────────┐
                   └──────────────┘      │credit_payments   │
                                         └──────────────────┘
```

---

## 👥 User Roles & Permissions

| Role | Dashboard | Products | Sales | Billing | Accounts | Suppliers | Inventory | Reports | Settings | Workers |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **superadmin** | ✅ | — | — | — | — | — | — | — | — | — |
| **shop_admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **manager** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **sales_worker** | — | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — |
| **account_worker** | — | — | — | — | ✅ | ✅ | — | — | — | — |
| **stock_manager** | — | ✅ | — | — | — | ✅ | ✅ | — | — | — |
| **cashier** | — | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — |

---

## ✨ Features

### 🔐 Authentication
- Shop registration with **email OTP verification**
- JWT-based login (7-day expiry)
- Forgot password / reset via email link
- SuperAdmin separate login portal

### 🏪 Shop Dashboard
- Live KPIs: Today's revenue, total orders, low-stock alerts, pending dues
- Real-time stats per shop

### 📦 Products
- Full CRUD with image upload
- SKU, barcode, brand, description
- GST-inclusive / exclusive pricing
- Unit types (pcs, kg, liter, meter…)
- Stock alert threshold

### 🗂️ Categories
- Two-level hierarchy (Parent → Subcategory)
- Active / Inactive toggle
- Category images

### 🧾 Billing & Sales
- POS terminal billing interface
- Multiple payment modes: Cash, UPI, Card, Credit, Online (Razorpay)
- 9 customisable bill layouts (Classic, Modern, Dark, Teal, Purple…)
- Auto bill number generation
- Customer info on bill
- Discount & tax support
- QR / digital receipt ready

### 📊 Orders & Refunds
- View all orders with filters (All / Completed / Pending / Refunded)
- Full & partial refunds
- Refund modes: Cash, UPI, Card, Credit

### 📈 Inventory
- Live stock tracking per product
- Stock history log (restock, sale, manual, adjustment, return)
- Low-stock alerts dashboard

### 📉 Reports
- Revenue summaries (daily / weekly / monthly)
- Top-selling products
- Low-stock report
- Payment mode breakdown

### 👥 Customer Accounts (Udhar/Credit)
- Add customers with credit limit
- Record credit sales with item details
- Accept partial / full payments
- Running balance per customer
- Status: Active / Cleared

### 🏭 Suppliers
- Add suppliers with full contact info
- **Products Purchased** with unit support:
  - ⚖️ Weight: kg, g, mg, quintal, ton
  - 🧴 Volume: liter, ml, cl
  - 📦 Count: pcs, dozen, box, carton, pack, bundle, pair, set…
  - 📏 Length: meter, cm, mm, feet, inch, yard
  - 🔌 Electronics: unit, watt, kwh, ampere, volt
- Decimal quantity support (0.5 kg, 1.5 liter)
- Initial payment recording
- Auto-calculated: Total Purchased → Paid → **Remaining Balance**
- Payment modes: Cash, UPI, Card, Bank Transfer
- Status: Active / Cleared

### ⚙️ Shop Settings
- Shop name, address, GST number
- Logo & favicon upload
- Owner signature upload
- Bill layout selection

### 👷 Workers Management
- Invite workers by email
- Assign roles (manager, sales_worker, etc.)
- View all workers per shop

### 💳 Subscriptions (SaaS)
| Plan | Duration | Price |
|---|---|---|
| Starter | 3 months | ₹2,999 |
| Growth | 6 months | ₹5,499 |
| Pro | 12 months | ₹9,999 |

- Razorpay payment integration
- Auto-expiry & status tracking
- SuperAdmin can pause / resume

### 🔔 Notifications
- Low stock alerts
- Refund notifications
- System notifications per shop

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register-shop` | Register new shop + owner |
| POST | `/api/auth/verify-otp` | Verify email OTP |
| POST | `/api/auth/login` | Login → returns JWT |
| POST | `/api/auth/forgot-password` | Send reset link |
| POST | `/api/auth/reset-password` | Reset with token |
| GET | `/api/auth/me` | Get current user |

### Shop
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/shop/dashboard` | KPI stats |
| GET/PUT | `/api/settings` | Shop settings |

### Products
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get single product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Sales
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sales` | List orders |
| POST | `/api/sales` | Create bill/sale |
| GET | `/api/sales/:id` | Order detail |
| POST | `/api/sales/:id/refund` | Process refund |

### Suppliers
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/suppliers` | List suppliers |
| POST | `/api/suppliers` | Create supplier + purchases + payment |
| GET | `/api/suppliers/:id` | Supplier detail + history |
| PUT | `/api/suppliers/:id` | Update supplier info |
| DELETE | `/api/suppliers/:id` | Delete supplier |
| POST | `/api/suppliers/:id/payments` | Record payment |

### Accounts (Udhar)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/accounts/customers` | List credit customers |
| POST | `/api/accounts/customers` | Add customer |
| POST | `/api/accounts/transactions` | Add credit transaction |
| POST | `/api/accounts/payments` | Record payment |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/inventory` | Stock list |
| PUT | `/api/inventory/:id` | Update stock |
| GET | `/api/inventory/history` | Stock history |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports` | Revenue + product reports |

---

## 📁 Project Structure

```
Project_3-POS/
├── backend/
│   ├── index.php               ← Main router & CORS
│   ├── .env                    ← Environment config
│   ├── composer.json
│   ├── config/
│   │   ├── database.php        ← PDO connection
│   │   └── email.php           ← Mail config
│   ├── middleware/
│   │   ├── authMiddleware.php  ← JWT verify (authenticate())
│   │   ├── roleMiddleware.php  ← Role + module guard
│   │   ├── shopMiddleware.php  ← Shop data isolation
│   │   └── rateLimitMiddleware.php
│   ├── controllers/
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── SalesController.php
│   │   ├── SupplierController.php
│   │   ├── AccountController.php
│   │   ├── InventoryController.php
│   │   ├── ReportController.php
│   │   ├── WorkerController.php
│   │   ├── ShopSettingsController.php
│   │   ├── ShopDashboardController.php
│   │   ├── SubscriptionController.php
│   │   ├── NotificationController.php
│   │   ├── RazorpayController.php
│   │   └── SuperAdminController.php
│   ├── routes/
│   │   ├── auth.php
│   │   ├── products.php
│   │   ├── sales.php
│   │   ├── suppliers.php
│   │   ├── accounts.php
│   │   ├── inventory.php
│   │   ├── reports.php
│   │   ├── settings.php
│   │   ├── workers.php
│   │   ├── subscriptions.php
│   │   ├── notifications.php
│   │   ├── shopDashboard.php
│   │   ├── super.php
│   │   └── webhooks.php
│   ├── utils/
│   │   ├── jwt.php             ← generateJWT / decodeJWT
│   │   └── Mailer.php          ← PHPMailer wrapper
│   ├── database/
│   │   ├── complete_database.sql   ← Full consolidated schema
│   │   ├── suppliers_migration.sql
│   │   └── ...other migrations
│   └── uploads/
│       └── products/           ← Product images
│
└── frontend /
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx             ← Routes definition
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx ← Global auth state
        ├── hooks/
        │   └── useAuth.js
        ├── routes/
        │   └── ProtectedRoute.jsx
        ├── services/
        │   └── api.js          ← Axios instance + interceptors
        ├── components/
        │   └── ShopLayout.jsx  ← Sidebar + topbar layout
        ├── Auth/               ← Login, Register, OTP, Reset
        └── pages/
            ├── super/          ← SuperAdmin pages
            │   ├── SuperDashboard
            │   ├── ShopsList
            │   ├── ShopDetails
            │   └── Subscriptions
            └── shop/           ← Shop pages
                ├── ShopDashboard
                ├── Products / AddEditProduct
                ├── Categories / SubCategories
                ├── Billing / Sales / Orders / Refunds
                ├── AccountManagement / CustomerDetail
                ├── Suppliers / SupplierDetail
                ├── Inventory
                ├── Reports
                ├── ShopSettings
                └── Workers/
```

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.1+
- MySQL 8.0+
- Node.js 18+
- Composer

### 1. Clone the repo
```bash
git clone https://github.com/t-suraj21/Project_3-POS.git
cd Project_3-POS
```

### 2. Setup Backend
```bash
cd backend
composer install
cp .env.example .env   # Edit with your DB, JWT, mail credentials
```

Create the database:
```bash
mysql -u root -p < database/complete_database.sql
mysql -u root -p pos_db < database/suppliers_migration.sql
mysql -u root -p pos_db < database/suppliers_updated_at_migration.sql
```

Start PHP server:
```bash
php -S localhost:8888 index.php
```

### 3. Setup Frontend
```bash
cd "frontend "
npm install
npm run dev
```

Open **http://localhost:5173**

---

## 🔧 Environment Variables

```env
# App
APP_ENV=development          # development | production

# Database
DB_HOST=localhost
DB_NAME=pos_db
DB_USER=root
DB_PASSWORD=your_password

# JWT — generate with: openssl rand -hex 32
JWT_SECRET=your_32_char_min_secret_here

# CORS
FRONTEND_URL=http://localhost:5173

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=

# Email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_EMAIL=your@gmail.com
MAIL_FROM_NAME=POS System
MAIL_TOKEN_TTL=10            # OTP expiry in minutes

# App URL (for email links)
APP_URL=http://localhost:5173
```

---

## 🔄 Workflow Diagrams

### User Registration & Login Flow

```
User Visits /register
      │
      ▼
Fill: shop_name, owner_name, email, password
      │
      ▼
POST /api/auth/register-shop
      │
      ├──▶ Create shops record
      ├──▶ Create users record (is_verified=0)
      └──▶ Send 6-digit OTP via email
      │
      ▼
Enter OTP at /verify-otp
      │
POST /api/auth/verify-otp
      │
      └──▶ Set is_verified=1
      │
      ▼
Login at /login
      │
POST /api/auth/login
      │
      └──▶ Returns JWT token + user object
      │
      ▼
Redirected to /shop/:id/dashboard
```

### Sale / Billing Flow

```
Cashier opens /shop/:id/billing
      │
      ▼
Search & add products to cart
      │
      ▼
Enter customer info (optional)
Apply discount / select payment mode
      │
      ├─── Cash/UPI/Card ──▶ POST /api/sales
      │                           │
      │                     ┌─────▼──────┐
      │                     │ Insert sale│
      │                     │ sale_items │
      │                     │ Update stock│
      │                     └─────┬──────┘
      │                           │
      │                     Print/Show bill
      │
      └─── Online (Razorpay) ──▶ POST /api/sales/razorpay/order
                                        │
                                  Open Razorpay modal
                                        │
                                  Payment success
                                        │
                                  POST /api/webhooks/razorpay
                                        │
                                  Verify HMAC signature
                                        │
                                  Update payment_status=paid
```

### Supplier Purchase Flow

```
Owner opens Suppliers → Add Supplier
      │
      ▼
Fill: Name, Phone, Email, Address
      │
      ▼
Add Products Purchased:
  Product Name | Qty | Unit (kg/liter/pcs/meter…) | Rate → Amount
  [+ Add Another Product]
      │
      ▼
Payment Section:
  Total Purchase = Σ(qty × rate)
  Amount Paid Now → enter
  Remaining Balance = Total − Paid  (auto)
  Payment Mode: Cash/UPI/Card/Bank Transfer
      │
      ▼
POST /api/suppliers
      │
  ┌───┴──────────────────────┐
  │ BEGIN TRANSACTION        │
  │                          │
  ├── INSERT suppliers       │
  ├── INSERT supplier_purch. │  (one row per product)
  └── INSERT supplier_pay.   │  (if paid > 0)
      └──────────────────────┘
      │
      ▼
Supplier appears in table with
  Total Purchased | Paid | Remaining | Status
```

### Multi-Tenant Data Isolation

```
Every API Request:
      │
      ▼
Extract JWT → get shop_id
      │
      ▼
All DB queries: WHERE shop_id = ?
      │
  ┌───┴───────────────────────┐
  │ Shop A data  │ Shop B data│  ← Completely isolated
  └──────────────┴────────────┘
```

---

## 💳 Subscription Plans

| Plan | Duration | Price | Features |
|---|---|---|---|
| **Starter** | 3 months | ₹2,999 | All core features |
| **Growth** | 6 months | ₹5,499 | All features + priority support |
| **Pro** | 12 months | ₹9,999 | All features + advanced reports |

- Payments via **Razorpay**
- Auto-expire on end date
- SuperAdmin can pause / resume any shop's subscription

---

## 🔒 Security Features

- **JWT HS256** tokens with 7-day expiry
- **bcrypt** password hashing (cost=12)
- **OTP email verification** on registration
- **Role-based access control** per module
- **Shop-level data isolation** (all queries scoped by `shop_id`)
- **CORS whitelist** (only allowed origins)
- **Rate limiting** (100 req / hour)
- **HMAC webhook verification** for Razorpay
- Security headers: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `CSP`

---

## 📜 License

MIT © 2026 Suraj Kumar

---

<div align="center">
Built with ❤️ for shop owners across India 🇮🇳
</div>
