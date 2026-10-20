# EcomSalesToGST Frontend (Angular 22)

A modern, high-performance Angular 22 application for importing e-commerce platform sales data and generating GSTR-1 filings, integrated directly with the Spring Boot backend API (`/api/v1/gst/convert-meesho`).

---

## 🚀 Key Features

- **EcomSalesToGST Architecture & Layout**:
  - **Top Navigation Bar**: Brand logo, dropdown menus (`Ecom. Sellers`, `Free Tools`, `Accounting Services` with Tax & Compliance mega-menu), Support, Pricing, and user profile (`Hello, himanshu`).
  - **Left Sidebar**: `Dashboard` (active), `Gov Excel to JSON`, `CSV to JSON`, `JSON Validator`, `2A/2B Reconciliation`, `Ecom to Tally XML` (with `NEW` badge), `Support`, `Settings`, and `Logout`.
  - **Client Metadata Bar**: Real-time display for Company (`dsdivine13`), Client, GSTIN (`09OYVPS2177B2ZI`), Period (`September 2026`), Type (`Monthly`), Year (`2026`), and interactive `Switch Client` action.
  - **Platform Filter & Search**: Search bar (`Search platforms...`), type filter (`All Types`, `B2C`, `B2B`, `B2C/B2B`), status filter, and `Clear` button.
  - **Platform Cards Grid**: Cards for **Meesho**, **Flipkart**, **Amazon (B2C & B2B)**, **Myntra**, **Jio Mart**, **AJIO**, **Nykaa**, and more with exact badges and brand logos.

- **Full Spring Boot API Integration (`POST /api/v1/gst/convert-meesho`)**:
  - Drag-and-drop or select `tcs_sales.xlsx/.csv` (Required), `tcs_sales_return.xlsx/.csv` (Optional), and `tax_invoice_details.xlsx/.csv` (Optional).
  - **Quick Load Sample Data (Sept 2026)** button: Preloads the sample Meesho reports bundled in the project for instant testing with one click.
  - Automatic download of generated `GSTR1_Meesho_<period>.json`.

- **Comprehensive GSTR-1 Statement Viewer**:
  - **Table 7 (B2CS)**: Inter-State & Intra-State Supplies with Place of Supply (`pos`), State Name, Tax Rate, Net Taxable Value, IGST, CGST, and SGST (with return balances highlighted).
  - **Table 12 (HSN Summary)**: HSN codes, UQC, quantity, taxable value, and tax breakdown.
  - **Table 14 (E-Commerce Supplies)**: Supplies made through Meesho (`09AARCM9332R1CM`).
  - **Table 13 (Documents Issued)**: Serial numbers range (`from` - `to`), total invoices, cancellations, and net issued.
  - **Official JSON Payload Tab**: Formatted syntax-highlighted JSON viewer with one-click copy and export.

- **Prebuilt Libraries + Custom CSS**:
  - **Bootstrap 5.3** & **Bootstrap Icons** for responsive grid, alerts, tables, and utility classes.
  - **Angular Material 22 & CDK** for progress bars, tabs, tooltips, and themes.
  - **Custom SCSS** implementing EcomSalesToGST's design system.

---

## 🛠️ Tech Stack

- **Angular**: 22.2.0 (Standalone Components, Signals, Router, Modern Fetch HttpClient)
- **CSS / UI**: Bootstrap 5.3.8, Angular Material 22.2.3, SCSS
- **Backend**: Spring Boot 3.3.4 (running on `http://localhost:8081`)
- **Dev Server Proxy**: Configured via `proxy.conf.json`

---

## 🏃 Running the Application

### 1. Backend Service
Make sure the Spring Boot service in `D:\projects` is running:
```powershell
cd D:\projects
.\mvnw.cmd spring-boot:run
```
(Swagger UI: `http://localhost:8081/swagger-ui/index.html`)

### 2. Frontend Development Server
Start the Angular dev server in `D:\ui`:
```powershell
cd D:\ui
npm.cmd start
```
Navigate to: **[http://localhost:4200/app/dashboard/import](http://localhost:4200/app/dashboard/import)**

---

## ☁️ Production Deployment (Firebase Hosting)

The app is deployed as a static site on Firebase Hosting (e.g. **https://gstr1generator.web.app**). Because Firebase Hosting only serves static files, the frontend talks to the Spring Boot backend through a configurable **backend origin**.

### 1. Configure the backend origin

At startup the app fetches **`public/api-config.json`** (served next to `index.html`) and uses it for every API call (`/api/**`) and the OAuth login redirect:

```json
{
  "apiOrigin": "https://YOUR-BACKEND-HOST",
  "gstConvertEndpoint": "/api/v1/gst/convert-meesho"
}
```

- `"apiOrigin": ""` (default) = same-origin relative URLs — only correct if a reverse proxy in front of the frontend forwards `/api` and `/oauth2` to the backend.
- For a separately hosted backend, set `apiOrigin` to its origin (no trailing slash), e.g. `https://gstr1-api-xxxx.a.run.app`.
- Changing the backend later only requires editing this file and re-running `firebase deploy` — **no rebuild needed**. Build-time fallbacks live in `src/environments/environment.prod.ts`.

### 2. Backend (Spring Boot) must allow the frontend origin

On the backend side, for CORS and the Google OAuth flow:

- **CORS**: allow origin `https://gstr1generator.web.app` (and `http://localhost:4200` for dev) with `Allow-Credentials: true` (the auth endpoints use cookies). Do **not** use `*` together with credentials.
- **OAuth redirect**: allow `https://gstr1generator.web.app` as a trusted redirect/success URL so the `?token=` redirect after Google login returns to the hosted frontend.

### 3. Build & deploy

```bash
npm run build
firebase deploy --only hosting
```

`firebase.json` sets `Cache-Control: no-cache` for `index.html` and `api-config.json` (so config changes take effect immediately) and immutable caching for the hashed `/build/**` assets.

---

## 📁 Project Structure

```
D:\ui\src\app\
├── core/
│   ├── models/
│   │   ├── client-info.model.ts
│   │   ├── gstr1.model.ts
│   │   └── platform.model.ts
│   ├── services/
│   │   ├── client-state.service.ts
│   │   └── gst-api.service.ts
│   └── utils/
│       └── state-codes.ts
├── shared/
│   ├── components/
│   │   ├── icon/
│   │   ├── platform-logo/
│   │   └── toast/
│   └── pipes/
│       └── inr-currency.pipe.ts
└── features/
    ├── dashboard/
    │   ├── client-header/
    │   ├── dashboard-import/
    │   ├── platform-card/
    │   ├── platform-filter/
    │   └── platform-grid/
    ├── layout/
    │   ├── header/
    │   └── sidebar/
    └── modals/
        ├── statement-modal/
        ├── support-widget/
        ├── switch-client-modal/
        └── upload-modal/
```
