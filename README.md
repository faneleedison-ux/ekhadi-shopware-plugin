# e-Khadi — Community Credit & Stokvel Platform

> **Huawei Developer Competition Africa 2026** submission by **Fanelesibonge Mbuyazi** (Sanlam)

**e-Khadi** digitises store credit and stokvel savings for South Africa's 18 million+ SASSA grant recipients. Township spaza shop owners extend credit to community members; repayments are automated against monthly grant cycles — all running on Huawei Cloud.

| | |
|---|---|
| **Live app** | https://e-khadi.co.za |
| **GitHub** | https://github.com/faneleedison-ux/ekhadi-shopware-plugin |
| **Server** | Huawei ECS · 110.238.73.51 · af-south-1 |
| **Contact** | Fanelesibonge.Mbuyazi@sanlam.co.za |

---

## Huawei Cloud Services (5 active + 33 planned)

| Service | Status | Role |
|---|---|---|
| **ECS** | ★ Active | Hosts Next.js app (PM2, Node 18, Nginx) |
| **RDS for PostgreSQL** | ★ Active | Primary database · 192.168.0.53:5432 |
| **OBS** | ★ Active | PDF receipts, ID documents, DB backups |
| **SMN** | ★ Active | SMS/email alerts on credit approval/rejection |
| **FunctionGraph** | ★ Active | Automated monthly repayment cron (1st of month) |
| CDN, WAF, AAD, ELB | Planned | Edge & security layer |
| API Gateway, DCS, KMS | Planned | API management, caching, encryption |
| ModelArts, OCR, FRS, NLP | Planned | AI stock forecast, ID verification, chatbot |
| DMS Kafka, DLI, DWS | Planned | Event streaming & analytics |

---

## Architecture

### Current Architecture (5 Huawei Cloud services — live in production)

```
User (Browser / PWA)
       ↓ HTTPS
  Nginx (:80/:443) ← e-khadi.co.za
       ↓
  Next.js App (ECS · :3000 · PM2)
    ├── Prisma ORM ──────────────→ RDS PostgreSQL (192.168.0.53)
    ├── OBS SDK ─────────────────→ OBS Bucket (PDF receipts)
    ├── SMN SDK ─────────────────→ SMN Topic (email/SMS alerts)
    └── FunctionGraph ───────────→ Monthly repayment cron
```

![Current Architecture](./assets/images/architecture/current-architecture.jpg)

### Future Architecture (38 Huawei Cloud services — full scale)

![Full Future Architecture](./assets/images/architecture/future-architecture.jpg)

| Layer | Services |
|---|---|
| Edge | CDN · WAF · AAD · ELB |
| API | API Gateway |
| Compute | ECS ★ · CCE · AS · FunctionGraph ★ · SWR · CodeArts |
| Data | RDS ★ · OBS ★ · DCS Redis · DWS |
| Messaging | SMN ★ · DMS Kafka · DMS RabbitMQ |
| AI | ModelArts · OCR · FRS · NLP · IVS · CSS |
| Analytics | DLI · MRS · DataArts Studio |
| Observability | Cloud Eye · LTS · AOM · CTS · CBR |
| Security | IAM · KMS · HSS · VSS · NAT · Cloud Connect |

★ = Active in production today

---

## Demo Credentials (Judge Accounts)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ekhadi.co.za` | `Admin@2026!` |
| Member | `member@ekhadi.co.za` | `Member@2026!` |
| Shop | `shop@ekhadi.co.za` | `Shop@2026!` |

---

## Key Features

### Member Portal
- Virtual credit card (glowing dark-mode UI)
- Store credit wallet & transaction history
- Grant cycle countdown to SASSA pay-day
- Credit request submission & status tracking
- **QR code payments** — 10-min expiry, 8-digit short code
- **Loyalty rewards** — Bronze → Silver → Gold → Platinum (100pts = R10)
- **2% auto-emergency savings fund** built into every purchase
- Stokvel group management & noticeboard
- Financial advisor chatbot (NLP-powered tips in plain language)

### Shop Portal
- Transaction management & sales history
- **AI stock forecasting** — CRITICAL / LOW / STOCKED with restock suggestions
- PDF receipt generation (stored in OBS)
- Restock order form with category suggestions
- Sales heatmap by hour of day

### Admin Portal
- Member & group management across geographic areas
- Credit approval / rejection workflow (with AI risk badges)
- **Fraud detection engine** — flags rapid purchases (5+/hr) and high velocity (R300+/day)
- Community noticeboard with area targeting
- ID verification review (OCR + Face Recognition pipeline)

---

## Innovations

| Innovation | What it does |
|---|---|
| AI Stock Forecast | Analyses 30-day purchase patterns per area — CRITICAL / LOW / STOCKED |
| Auto Emergency Fund | 2% of every purchase auto-saved into a locked pot |
| Fraud Detection Engine | Flags 5+ purchases/hr or R300+/24h in real time |
| QR Code Payments | Member shows animated QR — shop scans, no cash needed |
| Loyalty Rewards | 1pt per R10 spent, 4 tiers, redeem 100pts = R10 credit |
| Community Bulk Buy | Group pools pledges to buy wholesale together |
| Financial Chatbot | Savings, budget, debt tips in plain language |

---

## Technology Stack

- **Frontend:** Next.js 14 App Router · TypeScript · Tailwind CSS · PWA
- **Backend:** Next.js API routes · Prisma ORM · NextAuth.js
- **Database:** PostgreSQL on Huawei RDS
- **Auth:** Role-based (ADMIN / MEMBER / SHOP) · JWT sessions
- **Deploy:** PM2 · Nginx · Huawei ECS · e-khadi.co.za

---

## Local Development

```bash
cd web
npm install
cp .env.example .env.local
# Set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
npx prisma db push
npm run dev
```

Open http://localhost:3000

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/ekhadi
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
```

---

## Deploy to Huawei ECS

```bash
# From project root
./deploy.sh "your commit message"
```

This script commits local changes, rsyncs to the server (excluding `.env.local`), runs `prisma db push`, builds, and restarts PM2.

---

## Project Structure

```
web/
├── app/
│   ├── (auth)/            login · register
│   ├── (dashboard)/
│   │   ├── admin/         dashboard · members · groups · credit · fraud · noticeboard
│   │   ├── member/        home · wallet · group · credit-request · noticeboard · bulk-buy
│   │   └── shop/          dashboard · transactions · forecast · restock · receipts
│   └── api/               50+ API routes
├── components/
│   ├── admin/             FraudAlertPanel · NoticeboardAdmin
│   ├── member/            QRWallet · LoyaltyWidget · EmergencyFundWidget · GrantCountdown
│   ├── shop/              ForecastDashboard · SalesHeatmap · RestockForm
│   └── layout/            Sidebar · BottomNav
├── prisma/schema.prisma   15+ models
└── remotion/              Architecture diagram video + PPTX generator
```

---

## Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| Phase 1 ✅ | Now | Full web app live on Huawei Cloud |
| Phase 2 | 3 months | WhatsApp notifications · USSD fallback for feature phones |
| Phase 3 | 6 months | Native Android app (Huawei AppGallery) · biometric login |
| Phase 4 | 12 months | National rollout — 10,000 members across 5 provinces |
| Phase 5 | 2 years | Expand to Zimbabwe, Zambia, Nigeria |

---

## Achievements

- ✅ Live on Huawei Cloud — ECS + RDS + OBS + SMN + FunctionGraph
- ✅ 50+ API routes · 19 pages · 3-role auth system
- ✅ PWA — installable on Android/iOS home screen
- ✅ Custom domain: e-khadi.co.za
- ✅ 15 innovative features built and shipped
- ✅ Huawei Developer Competition Africa 2026 submission

---

*Built by Fanelesibonge Mbuyazi · Sanlam · [e-khadi.co.za](https://e-khadi.co.za)*