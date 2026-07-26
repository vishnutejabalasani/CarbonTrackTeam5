# 🌿 CarbonTrack — Enterprise Sustainability Analytics & Footprint Tracking Platform

**CarbonTrack** is a full-stack enterprise web application designed for environmental impact tracking, multimodal AI carbon activity logging, automated corporate ESG reporting, and gamified reduction milestone management.

Built with **Java Spring Boot 3**, **React 18 (Vite)**, **PostgreSQL / Flyway**, **Tailwind CSS**, and **Google Gemini 2.5 Vision AI**.

---

## 🌟 Key Features

* **🤖 AI Vision Carbon Analyzer**: Drag-and-drop or upload images of meals, appliances, or transit to automatically calculate carbon footprints via Google Gemini Vision API.
* **📊 Multimodal Footprint Logging**: Track daily activities across 4 core categories — **Transport**, **Electricity**, **Food**, and **Shopping** with automated CO₂e calculations based on IPCC / EPA emission factors.
* **📈 Real-Time Analytics & Aggregation**: Category breakdown charts, weekly emission trendlines, and anonymous peer benchmarking with percentile rankings.
* **🏆 Gamified Milestones & Tiered Badges**: Complete reduction targets to plant virtual tree saplings in your forest canopy and unlock collectible ESG credentials sorted from **Bronze** to **Legendary**.
* **📄 Automated Corporate ESG Reporting**: Generate official corporate sustainability statements and export compliance PDF reports.
* **🔐 Enterprise Authentication**: Spring Security 6 JWT authentication with Google OAuth2 login integration.

---

## 🚀 Quick Start Guide (How to Run Locally)

Follow these steps to launch both the Spring Boot Backend and React Frontend on your machine.

### 📋 Prerequisites
* **Java JDK 17+** installed
* **Node.js 18+** & **npm** installed
* (Optional) **PostgreSQL** or **Redis** (defaults to automated in-memory H2 & ConcurrentCache for seamless 1-click execution!)

---

### 1️⃣ Launch the Backend (Spring Boot API)

Open a terminal in the root project directory:

```bash
# Windows (PowerShell / Command Prompt)
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The Spring Boot backend will start on **`http://localhost:8080`**.

---

### 2️⃣ Launch the Frontend (React / Vite Dashboard)

Open a new terminal window in the `frontend` folder:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (first time only)
npm install

# Start the Vite development server
npm run dev
```

The frontend dashboard will automatically open at **`http://localhost:5173`**.

---

## 🧪 Running Automated Unit Tests

To run the JUnit 5 calculation engine test suite:

```bash
.\mvnw.cmd test
```

---

## 📂 Project Architecture

```
CarbonTrackTeam5/
├── src/main/java/com/carbontrack/
│   ├── config/            # Security, Redis, Web & CORS configurations
│   ├── controller/        # REST Controllers (Activity, Goals, Gemini Vision, ESG)
│   ├── entity/            # JPA Data Entities & Flyway Schema Mappings
│   ├── repository/        # Spring Data Repositories & JPQL Aggregation
│   └── service/           # Emission Calculation Engine, Badges, & Vision API
├── src/main/resources/
│   ├── application.properties
│   └── db/migration/      # Flyway SQL Migration Scripts (V1 through V11)
├── frontend/
│   ├── src/components/    # Modular React UI Components & Charts
│   ├── src/pages/         # Dashboard, Vision Analyzer, Goals, Community Pages
│   └── src/index.css      # Custom Styling System & Keyframes
└── README.md
```

---

## 🛡️ License & Credits

Developed for Corporate Sustainability Analytics & Hackathon Demonstration. Powered by IPCC & EPA Emission Data.
