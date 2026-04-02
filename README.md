#  CostStruct — Construction Expense Tracker

A professional, bilingual (English/Arabic) construction expense tracker built with **React + Vite**, **Firebase**, and **AMCharts 5**.

## ✨ Features

- **Bilingual** (EN/AR) with RTL support and one-click toggle
- **Dark/Light mode** with localStorage persistence
- **6 Dashboard Sections**: Projects, Labor, Materials, Equipment, Admin, Reports
- **Firebase Auth** (email/password + Google OAuth)
- **Firestore** real-time database with per-user data isolation
- **AMCharts 5** interactive charts: Pie, Line, Budget vs Actual, Drill-Down
- **CSV/PDF export** for all sections
- **Budget alerts** when projects exceed 85% budget
- **Recurring expense** support
- **Responsive** design for mobile & desktop
- **Search & filter** by project, date range, category

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd daata
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google
4. Enable **Firestore Database**
5. Copy your project config

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firestore Rules

Copy the rules from `firestore.rules` into:
**Firebase Console → Firestore → Rules**

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── config/          # Firebase initialization
├── contexts/        # Auth + Theme context providers
├── i18n/            # English + Arabic translations
├── services/        # Firestore CRUD + export services
├── components/      # Reusable UI components
│   ├── DataTable    # Table with search & pagination
│   ├── ExpenseModal # Add/edit expense form
│   ├── ProjectModal # Add/edit project form
│   ├── Sidebar      # Navigation sidebar
│   ├── StatsCard    # Statistics display card
│   └── Layout       # App shell layout
├── pages/           # Page-level components
│   ├── LoginPage
│   ├── DashboardPage
│   ├── ProjectsPage
│   ├── LaborPage
│   ├── MaterialsPage
│   ├── EquipmentPage
│   ├── AdminExpensesPage
│   └── ReportsPage
├── App.jsx          # Router + providers
├── main.jsx         # Entry point
└── index.css        # Full design system
```

---

## 🚢 Deploy to Vercel

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — CostStruct"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com) → Import your repo

3. Add environment variables in Vercel dashboard (same as `.env`)

4. Deploy! The `vercel.json` is already configured for SPA routing.

---

## 🛠 Tech Stack

| Tech | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite | Build tool |
| Firebase Auth | Authentication |
| Firestore | Real-time database |
| AMCharts 5 | Interactive charts |
| react-router-dom | Client-side routing |
| react-i18next | Internationalization |
| jsPDF + autotable | PDF export |
| SheetJS (xlsx) | CSV export |
| react-hot-toast | Notifications |
| react-icons | Icon library |
| date-fns | Date utilities |

---

## 📝 License

MIT — Built with ❤️ for construction professionals.
