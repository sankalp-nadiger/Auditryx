# 🧾 ProCure – Smart Supplier Compliance Management System

ProCure is a robust backend system designed for managing supplier information, tracking compliance metrics, analyzing weather-based operational feasibility, and leveraging AI to recommend optimal procurement decisions.

---

## 🔧 Features

- 📦 **Supplier Management**: CRUD operations for supplier records with country, contact info, risk level, and status.
- ✅ **Compliance Tracking**: Track quality, delivery, and other metrics over time.
- 📊 **Metrics & Visualization**: View historical compliance trends for each supplier.
- 🌤 **Weather Intelligence**: Fetch weather data for suppliers’ locations using OpenWeatherMap API.
- 🧠 **AI Recommendations**: Use Gemini to evaluate suppliers and generate compliance insights.
- 🔐 **User Authentication**: Basic auth system with secure hashed passwords using JWT.
- 🧮 **AI Analysis of Historical Data**: Compare database records with reference datasets and evaluate future supplier reliability.

---

## 🚀 Tech Stack

- **Backend**: FastAPI
- **Database**: PostgreSQL (via SQLAlchemy ORM)
- **AI Services**: Gemini (Google Generative AI), OpenAI (optional fallback)
- **Weather API**: OpenWeatherMap
- **Frontend **: React + Tailwind
