# City Reporter  
AI-Powered City Problem Reporting & Tracking System

City Reporter is a modern full-stack web application that enables citizens to report, track, and resolve infrastructure issues with the help of AI-based photo analysis and community collaboration.

---

## Features

- **Authentication** – Secure login with Supabase Auth and email verification  
- **AI-Powered Photo Analysis** – Automatically detect problem categories (pothole, streetlight, signage, etc.)  
- **Problem Reporting** – Location tagging, priority levels, and real-time status tracking  
- **Dashboard & Analytics** – Personal reports, city-wide insights, and response time monitoring  
- **Community Engagement** – Voting system to prioritize issues and increase transparency  
- **Responsive Design** – Mobile-first with Tailwind CSS for accessibility and performance  

---

## Tech Stack

**Frontend:** Next.js 14, TypeScript, Tailwind CSS  
**Backend:** Supabase (PostgreSQL, Authentication, Storage, Realtime)  
**Deployment:** Vercel (Serverless functions, CDN, SSL)  
**AI (Planned):** CNN-based image classification using TensorFlow.js  

---

## Quick Start

### 1. Clone & Install
``bash
git clone https://github.com/Pranav4555/city-reporter.git
cd city-reporter
npm install

2. Environment Variables

Create a .env.local file in the root:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # optional
NEXT_PUBLIC_APP_URL=http://localhost:3000

3. Database Setup (Supabase SQL)

Run in the Supabase SQL editor:

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE problems (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  location VARCHAR(500),
  priority VARCHAR(50) DEFAULT 'Medium',
  status VARCHAR(50) DEFAULT 'Reported',
  reporter_name VARCHAR(255),
  user_id UUID REFERENCES auth.users(id),
  votes INTEGER DEFAULT 0,
  response_time VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE training_data (
  id BIGSERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  user_id VARCHAR(100),
  confidence DECIMAL(3,2) DEFAULT 1.0
);

4. Run Locally
npm run dev


App will be available at http://localhost:3000

Architecture Overview
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Vercel        │
│ • Next.js App   │───▶│ • PostgreSQL    │    │ • Serverless    │
│ • TypeScript    │    │ • Authentication│    │ • Global CDN    │
│ • Tailwind CSS  │    │ • File Storage  │    │ • SSL/HTTPS     │
│ • Photo Upload  │    │ • Realtime API  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
Roadmap

AI-powered image classification model

Real-time notifications for updates

Admin dashboard for city authorities

Gamification of community participation
