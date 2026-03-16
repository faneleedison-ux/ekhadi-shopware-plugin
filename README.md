# e-Khadi

**Community Credit & Stokvel Platform for South African Spaza Shops**

e-Khadi is a community credit and stokvel platform for SASSA grant recipients, built for the Huawei Code4Mzansi 2025 competition.

This repository now contains two implementations:

- **Current submission app (active):** Next.js web application in `web/` (deployed live)
- **Legacy implementation (reference):** Shopware 6 plugin in `src/`

---

## Huawei Cloud Architecture

![e-Khadi Huawei Architecture](./assets/images/architecture/system-architecture-huawei.png)

The current web app is live on Vercel for demo access, while the target competition architecture is designed for Huawei Cloud production.

### Target Architecture (Huawei)

- **Frontend:** Next.js web client (member, shop, admin portals)
- **Ingress Layer:** **API Gateway (APIG)** for secured API entry, throttling, and routing
- **Application Layer:** **FunctionGraph** for serverless business logic (credit scoring, approvals, repayments)
- **Data Layer:** **RDS for PostgreSQL** for transactional records (members, groups, credit, repayments)
- **File/Asset Storage:** **Object Storage Service (OBS)** for exports, proof documents, and media assets
- **Notifications:** **Simple Message Notification (SMN)** for repayment reminders, approvals, and alerts
- **Network & Security:** **VPC + Security Groups + IAM** for private networking and role-based access

### Core Request Flow

1. User logs in and performs an action in the web app.
2. Request enters Huawei **APIG**.
3. **FunctionGraph** validates rules and executes business logic.
4. Function reads/writes data in **RDS PostgreSQL**.
5. Supporting files are stored/retrieved from **OBS**.
6. Events (approval, due repayment, status changes) trigger **SMN** notifications.

### Why This Architecture

- Scales with low operational overhead using serverless compute
- Keeps sensitive financial data in managed relational storage
- Supports strong auditability for compliance and judging criteria
- Aligns directly with Huawei developer competition cloud service expectations

## App Screenshots

<p align="center">
  <img src="./assets/images/screenshots/app-preview-01.png" width="31%" alt="App preview 1" />
  <img src="./assets/images/screenshots/app-preview-02.png" width="31%" alt="App preview 2" />
  <img src="./assets/images/screenshots/app-preview-03.png" width="31%" alt="App preview 3" />
</p>
<p align="center">
  <img src="./assets/images/screenshots/app-preview-04.png" width="31%" alt="App preview 4" />
  <img src="./assets/images/screenshots/app-preview-05.png" width="31%" alt="App preview 5" />
  <img src="./assets/images/screenshots/app-preview-06.png" width="31%" alt="App preview 6" />
</p>
<p align="center">
  <img src="./assets/images/screenshots/app-preview-07.png" width="31%" alt="App preview 7" />
  <img src="./assets/images/screenshots/app-preview-08.png" width="31%" alt="App preview 8" />
  <img src="./assets/images/screenshots/app-preview-09.png" width="31%" alt="App preview 9" />
</p>
<p align="center">
  <img src="./assets/images/screenshots/app-preview-10.png" width="31%" alt="App preview 10" />
  <img src="./assets/images/screenshots/app-preview-11.png" width="31%" alt="App preview 11" />
</p>

---

## Live Demo (Current Submission)

- **Live URL:** https://web-three-wine-92.vercel.app
- **GitHub:** https://github.com/faneleedison-ux/ekhadi-shopware-plugin

### Demo Credentials

- **Admin:** `admin@ekhadi.co.za` / `Admin123!`
- **Member:** `member@ekhadi.co.za` / `Member123!`
- **Shop:** `shop@ekhadi.co.za` / `Shop123!`

### Seeded Demo Dataset (Production)

- Provinces: 9
- Areas: 32
- Members: 110
- Shops: 92
- Groups: 30
- Group memberships: 120
- Credit requests: 120
- Transactions: 251
- Notifications: 96
- Repayments: 72
- Rotation cycles: 60

---

## The Problem

Many South Africans who receive SASSA grants (SRD R350, Old Age R1890, Disability R1890, Child Support R480) run out of funds mid-month. Their primary shopping outlets are local spaza shops. e-Khadi addresses this by:

- Letting communities form **stokvels** to pool grant money and support each other
- Providing **behaviour-based micro-credit** (R50–R300) for essential goods only
- Restricting credit to **spaza shops in the customer's registered area**
- Automatically repaying credit from the **next grant payment**

---

## Compatibility

- Next.js 14.x (App Router)
- Node.js 18+
- PostgreSQL (Supabase)
- Vercel deployment

### Legacy Compatibility (Shopware Plugin)

- Shopware 6.6.x
- PHP 8.1+
- MySQL 8.0+ / MariaDB 10.6+

---

## How to Run (Current Web App)

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL database (Supabase recommended)

### Local Run

```bash
cd web
npm install
cp .env.example .env.local

# Fill DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npm run dev
```

Open http://localhost:3000

### Production Deploy (Vercel)

```bash
cd web
npx vercel --prod
```

Set these production environment variables in Vercel:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `SEED_SECRET` (only if you need protected seed route)

---

## How to Run (Legacy Shopware Plugin)

### Prerequisites

You need a running Shopware 6.6 installation. The fastest way is with Docker:

```bash
# 1. Clone Shopware 6 production template
git clone https://github.com/shopware/production.git shopware
cd shopware

# 2. Start Docker environment
docker compose up -d

# 3. Install Shopware
docker compose exec web bin/console system:install --create-database --basic-setup
```

### Install the e-Khadi Plugin

```bash
# Copy the plugin into Shopware's custom plugins directory
cp -r /path/to/e-Khadi/store-credit-shopware-6-solution25-main \
      shopware/custom/plugins/EKhadi

# Inside the Shopware container or on your host:
cd shopware

# Refresh plugin list
bin/console plugin:refresh

# Install and activate
bin/console plugin:install EKhadi
bin/console plugin:activate EKhadi

# Run database migrations (creates all e-Khadi tables)
bin/console database:migrate --all EKhadi

# Clear cache
bin/console cache:clear
```

### Seed Demo Data (legacy plugin)

```bash
# Seed all demo data
bin/console ekhadi:seed

# Seed with a custom number of customers
bin/console ekhadi:seed --customers=500

# Wipe e-Khadi data and re-seed fresh
bin/console ekhadi:seed --fresh
```

Seed credentials for demo customers (legacy plugin): **password** `eKhadi@2025!`, **customer number** prefix `EKH`.

### Install Order States

```bash
bin/console store-credit:install-order-state
```

### Keep Background Jobs Running

```bash
bin/console scheduled-task:register
bin/console scheduled-task:run
bin/console messenger:consume
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `store_credit` | Personal store credit balance per customer |
| `store_credit_history` | All credit transactions |
| `ekhadi_area` | Geographic areas (9 provinces × 20 areas = 180) |
| `ekhadi_area_shop` | Maps spaza shops (sales channels) to areas |
| `ekhadi_customer_profile` | SASSA grant details, area assignment, credit limit |
| `ekhadi_group` | Stokvel groups |
| `ekhadi_group_member` | Group membership (role: admin/member) |
| `ekhadi_group_wallet` | Shared wallet balance per group |
| `ekhadi_group_bucket` | Spending buckets: food, medicine, toiletries, electricity, baby_products, general |
| `ekhadi_rotation_cycle` | Monthly rotation cycle — tracks whose turn to receive payout |
| `ekhadi_credit_request` | Mid-month credit requests with peer approval tracking |
| `ekhadi_grant_cycle` | Monthly grant cycle with spend velocity and risk score |
| `ekhadi_repayment_schedule` | Scheduled auto-repayments from next grant |

---

## Key Features

### Community Stokvel Groups
- Create groups with up to N members
- Members make monthly contributions into a shared wallet
- Wallet splits into typed spending buckets (food, medicine, toiletries, electricity, baby products)
- Monthly rotation determines who receives the group payout

### Essential-Goods-Only Credit
- Credit is **only** available for essential bucket types: `food`, `medicine`, `toiletries`, `electricity`, `baby_products`
- General shopping is blocked from credit
- Checkout enforces bucket type — non-matching products are rejected

### Behaviour-Based Credit Scoring (No Credit Bureau)
Scoring uses 4 observable factors from e-Khadi data:

| Factor | Points |
|---|---|
| Repayment ratio (repaid / approved) | 0–40 |
| Repayment speed | 0–20 |
| No outstanding debt | 0–20 |
| Grant cycle consistency | 0–20 |

Score → Credit Limit:

| Score | Limit |
|---|---|
| 80–100 | R300 |
| 60–79 | R200 |
| 40–59 | R150 |
| 20–39 | R100 |
| 0–19 | R50 |

Flat 2% service fee. No compound interest.

### Geographic Area Enforcement
- Each customer is assigned to an area (e.g., Soweto, Khayelitsha, Alexandra)
- Credit can only be spent at spaza shops (sales channels) mapped to that area
- Checkout blocks purchases outside the customer's area

### Grant-Aware Spend Monitoring
- Tracks amount spent since last grant payment
- Computes a **shortfall risk score** (0–100) based on daily spend rate
- Risk levels: Low (0–39), Medium (40–69), High (70–100)
- Flags customers likely to run short before next payment

### Automatic Repayment
- When a grant payment arrives, outstanding credit is automatically deducted first
- Repayment = principal + 2% flat fee
- Credit requests are marked `repaid` automatically
- Partial repayment supported if grant is smaller than debt

---

## API Reference

> The endpoint catalog below is for the **legacy Shopware plugin** API in `src/Controller/Api`.
>
> The current Next.js app uses route handlers under `web/app/api`.

All API endpoints require Bearer token authentication:
```
Authorization: Bearer <admin-api-token>
Content-Type: application/json
```

### Store Credit (original)

| Method | Path | Description |
|---|---|---|
| POST | `/api/store-credit/add` | Add credit to a customer |
| POST | `/api/store-credit/deduct` | Deduct credit from a customer |
| GET | `/api/store-credit/balance` | Get customer credit balance |

### Groups & Members

| Method | Path | Description |
|---|---|---|
| POST | `/api/ekhadi/group` | Create a stokvel group |
| GET | `/api/ekhadi/groups` | List all active groups |
| GET | `/api/ekhadi/group/{groupId}` | Get group details |
| PATCH | `/api/ekhadi/group/{groupId}` | Update group |
| POST | `/api/ekhadi/group/{groupId}/member` | Add member to group |
| DELETE | `/api/ekhadi/member/{memberId}` | Remove member |
| GET | `/api/ekhadi/group/{groupId}/members` | List group members |

### Wallets & Buckets

| Method | Path | Description |
|---|---|---|
| GET | `/api/ekhadi/group/{groupId}/wallet` | Get wallet + buckets |
| POST | `/api/ekhadi/group/{groupId}/contribute` | Add contribution to wallet |
| POST | `/api/ekhadi/group/{groupId}/bucket` | Create/ensure a spending bucket |
| PATCH | `/api/ekhadi/bucket/{bucketId}/categories` | Update allowed product categories |

### Rotation Cycles

| Method | Path | Description |
|---|---|---|
| POST | `/api/ekhadi/group/{groupId}/rotation/schedule` | Schedule rotation for all members |
| POST | `/api/ekhadi/group/{groupId}/rotation/advance` | Advance to next cycle |
| POST | `/api/ekhadi/group/{groupId}/rotation/payout` | Pay out current beneficiary |
| GET | `/api/ekhadi/group/{groupId}/rotation/cycles` | List all cycles |
| GET | `/api/ekhadi/group/{groupId}/rotation/active` | Get active cycle |
| PATCH | `/api/ekhadi/rotation/cycle/{cycleId}/skip` | Skip a cycle |

### Credit Requests

| Method | Path | Description |
|---|---|---|
| POST | `/api/ekhadi/credit-request` | Submit a mid-month credit request |
| POST | `/api/ekhadi/credit-request/{requestId}/approve` | Approve a request |
| POST | `/api/ekhadi/credit-request/{requestId}/reject` | Reject a request |
| POST | `/api/ekhadi/credit-request/{requestId}/repay` | Mark as manually repaid |
| GET | `/api/ekhadi/group/{groupId}/credit-requests` | List group credit requests |
| GET | `/api/ekhadi/customer/{customerId}/credit-requests` | List customer credit requests |

### Areas & Customer Profiles

| Method | Path | Description |
|---|---|---|
| POST | `/api/ekhadi/area` | Create an area |
| GET | `/api/ekhadi/areas` | List all areas |
| GET | `/api/ekhadi/area/{areaId}` | Get area details |
| POST | `/api/ekhadi/area/{areaId}/shop` | Map a sales channel to an area |
| DELETE | `/api/ekhadi/area/{areaId}/shop/{salesChannelId}` | Remove shop from area |
| PUT | `/api/ekhadi/customer/{customerId}/profile` | Create/update customer profile |
| GET | `/api/ekhadi/customer/{customerId}/profile` | Get customer profile |
| POST | `/api/ekhadi/customer/{customerId}/credit-limit/recompute` | Recompute credit limit |

### Grant Cycles & Repayment

| Method | Path | Description |
|---|---|---|
| POST | `/api/ekhadi/customer/{customerId}/grant-payment` | Record grant arrival + auto-repay outstanding |
| GET | `/api/ekhadi/customer/{customerId}/spending-status` | Get spend velocity + risk score |
| GET | `/api/ekhadi/customer/{customerId}/credit-score` | Get behaviour-based credit score |
| GET | `/api/ekhadi/customer/{customerId}/repayment-schedule` | Get pending repayment schedule |
| GET | `/api/ekhadi/customer/{customerId}/grant-cycles` | Get grant cycle history |

---

## Example: Full Credit Request Flow

```bash
# 1. Customer submits a R200 credit request for food
POST /api/ekhadi/credit-request
{
  "customerId": "abc123",
  "bucketType": "food",
  "amount": 200,
  "reason": "Running low on groceries",
  "requiredApprovals": 2
}

# 2. Two group members approve
POST /api/ekhadi/credit-request/{requestId}/approve
{ "approvingCustomerId": "member001" }

POST /api/ekhadi/credit-request/{requestId}/approve
{ "approvingCustomerId": "member002" }
# -> auto-disburses R200 to customer's store credit; schedules R204 repayment

# 3. Customer shops at a spaza shop in their area using store credit
# Checkout enforces: food bucket only, area match

# 4. Next grant arrives (R1890)
POST /api/ekhadi/customer/{customerId}/grant-payment
{ "grantAmount": 1890, "paymentDate": "2026-04-03" }
# -> auto-deducts R204 (principal + 2% fee), marks request repaid
# -> remaining R1686 available as store credit
```

---

## Project Structure

```
src/
├── Command/
│   ├── EKhadiSeedCommand.php          # bin/console ekhadi:seed
│   └── OrderStateInstallerCommand.php
├── Controller/
│   ├── Api/
│   │   ├── EKhadiAreaController.php
│   │   ├── EKhadiCreditRequestController.php
│   │   ├── EKhadiGrantController.php
│   │   ├── EKhadiGroupController.php
│   │   ├── EKhadiRotationController.php
│   │   └── EKhadiWalletController.php
│   ├── StoreCreditController.php
│   └── StoreCreditPageController.php
├── Core/Content/EKhadi/
│   ├── Area/                          # ekhadi_area entity
│   ├── AreaShop/                      # ekhadi_area_shop entity
│   ├── CreditRequest/                 # ekhadi_credit_request entity
│   ├── CustomerProfile/               # ekhadi_customer_profile entity
│   ├── GrantCycle/                    # ekhadi_grant_cycle entity
│   ├── Group/                         # ekhadi_group entity
│   ├── GroupBucket/                   # ekhadi_group_bucket entity
│   ├── GroupMember/                   # ekhadi_group_member entity
│   ├── GroupWallet/                   # ekhadi_group_wallet entity
│   ├── RepaymentSchedule/             # ekhadi_repayment_schedule entity
│   └── RotationCycle/                 # ekhadi_rotation_cycle entity
├── Migration/
│   ├── Migration*StoreCredit*.php     # Original store credit tables
│   ├── Migration1741958400EKhadiGroup.php
│   ├── Migration1741958410EKhadiGroupMember.php
│   ├── Migration1741958420EKhadiGroupWallet.php
│   ├── Migration1741958430EKhadiGroupBucket.php
│   ├── Migration1741958440EKhadiRotationCycle.php
│   ├── Migration1741958450EKhadiCreditRequest.php
│   ├── Migration1741958460EKhadiArea.php
│   ├── Migration1741958465EKhadiGroupArea.php
│   ├── Migration1741958470EKhadiCustomerProfile.php
│   ├── Migration1741958480EKhadiAreaShop.php
│   ├── Migration1741958490EKhadiGrantCycle.php
│   └── Migration1741958500EKhadiRepaymentSchedule.php
├── Service/
│   ├── AreaManager.php                # Area + customer profile enforcement
│   ├── CreditRequestManager.php       # Mid-month credit request lifecycle
│   ├── CreditRulesEngine.php          # Behaviour-based credit scoring
│   ├── GrantCycleService.php          # Grant tracking + spend velocity
│   ├── GroupManager.php               # Stokvel group management
│   ├── GroupWalletManager.php         # Wallet + bucket operations
│   ├── RepaymentService.php           # Auto-repayment engine
│   ├── RotationManager.php            # Monthly rotation cycles
│   └── StoreCreditManager.php         # Core store credit operations
├── Storefront/Controller/
│   └── StoreCreditApplyController.php # Checkout credit application + enforcement
├── Subscriber/
│   ├── CartSubscriber.php             # Order placed → deduct bucket or personal credit
│   ├── ConfigCommandSubscriber.php
│   ├── OrderEditSubscriber.php
│   └── OrderRefundSubscriber.php
└── Resources/config/
    ├── services.xml                   # Symfony DI registrations
    └── routes.xml
```

---

## Bucket Types

| Bucket | Eligible for Credit | Description |
|---|---|---|
| `food` | Yes | Groceries and food items |
| `medicine` | Yes | Medication and health products |
| `toiletries` | Yes | Soap, hygiene products |
| `electricity` | Yes | Prepaid electricity tokens |
| `baby_products` | Yes | Nappies, formula, baby food |
| `general` | No | General shopping (credit blocked) |

---

## Seed Data Summary

### Current Web App Seed (production demo)

| Data | Count |
|---|---|
| Provinces | 9 |
| Areas | 32 |
| Members | 110 |
| Shops | 92 |
| Stokvel groups | 30 |
| Group memberships | 120 |
| Credit requests | 120 |
| Transactions | 251 |
| Notifications | 96 |
| Repayments | 72 |
| Rotation cycles | 60 |

### Legacy Shopware Plugin Seed

Running `bin/console ekhadi:seed` creates plugin-side data in a Shopware installation.

---

## Troubleshooting

**Plugin not appearing after install**
```bash
bin/console plugin:refresh
bin/console plugin:install EKhadi
bin/console cache:clear
```

**Migration errors**
```bash
bin/console database:migrate --all EKhadi
# Check for missing tables with:
bin/console dbal:run-sql "SHOW TABLES LIKE 'ekhadi_%'"
```

**Credit not applying at checkout**
- Verify the customer has an `ekhadi_customer_profile` with `area_id` set
- Verify the sales channel (spaza shop) is mapped to that area via `ekhadi_area_shop`
- Check bucket type is one of the 5 essential types (not `general`)

**Seed command fails**
- Ensure at least one sales channel, customer group, and ZA country exist in Shopware
- Run `bin/console ekhadi:seed --fresh` to reset and retry

---

## Changelog

### v3.0.0 — Next.js Live Submission (Current)
- Added production-ready Next.js web app under `web/`
- Added role-based auth flows (Admin, Member, Shop)
- Added Supabase-backed production data store
- Added protected production seed route with realistic South African demo dataset
- Added live Vercel deployment and demo credentials
- Kept Shopware plugin implementation as legacy reference

### v2.0.0 — e-Khadi Platform (Legacy Shopware)
- Added 9 SA provinces × 20 geographic areas (180 total)
- Added stokvel group system: `ekhadi_group`, `ekhadi_group_member`
- Added group wallet + 6 spending bucket types: `ekhadi_group_wallet`, `ekhadi_group_bucket`
- Added monthly rotation cycles: `ekhadi_rotation_cycle`
- Added mid-month peer-approved credit requests: `ekhadi_credit_request`
- Added customer SASSA profiles with area assignment: `ekhadi_customer_profile`
- Added area-to-spaza-shop mapping: `ekhadi_area`, `ekhadi_area_shop`
- Added grant cycle tracking with spend velocity + shortfall risk score: `ekhadi_grant_cycle`
- Added automatic repayment scheduling from next grant: `ekhadi_repayment_schedule`
- Added behaviour-based credit scoring engine (no credit bureau required)
- Added checkout enforcement: essential goods only, area restriction, credit limit gate
- Added 6 new API controller groups (30+ endpoints)
- Added `bin/console ekhadi:seed` command with 1000 customers + full SA demo data
- Flat 2% service fee, no compound interest

### v1.0.5 — Store Credit (Original)
- Store credit management (add, deduct, balance)
- Partial usage across multiple orders
- Checkout integration
- Transaction history
- Refund-as-credit workflow
