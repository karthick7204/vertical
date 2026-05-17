# AI-Powered Modular Learning Platform

A modern full-stack web application designed to deliver highly personalized learning experiences. This platform leverages generative AI (Google Gemini 1.5) to dynamically evaluate a learner's existing skills through diagnostic assessments, and automatically generate tailored, modular learning paths based on their performance.

## 🌟 Key Features

- **Diagnostic-First Onboarding:** AI-driven assessments that dynamically evaluate user skills before course commencement.
- **Personalized Learning Paths:** Instead of static linear courses, the platform constructs dynamic pathways linking specific sub-modules tailored to bridge a learner's exact skill gaps.
- **Modular Course Architecture:** Content is broken down into granular models (Courses -> Modules -> Sub-modules) allowing highly specific content delivery.
- **Progress & Performance Tracking:** Deep analytics on user engagement, module completion, and learner score evolution.
- **Role-Based Access Control & Multi-Tenancy:** Robust authentication and organization-based scoping for different users (Learners, Instructors, Admins).

## 🏗️ Architecture

The platform follows a decoupled client-server architecture, strongly typed with TypeScript across the stack.

### Frontend
- **Framework:** Next.js 16 (App Router) & React 19
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion for premium micro-interactions and staggered entry animations.
- **Icons:** Lucide React
- **Structure:**
  - `/app/onboarding` & `/app/login`: Authentication and initial diagnostic workflows.
  - `/app/dashboard`: Main user interface displaying the personalized learning trajectory.
  - `/src/services`: Decoupled API client services (Auth, Course, Learner, Assessment).

### Backend
- **Framework:** Node.js with Express v5
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **AI Integration:** Google Generative AI (`@google/generative-ai`) via a dedicated `aiGenerator` utility to synthesize JSON-structured assessments and curriculum paths.
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs for secure password hashing.
- **Mailing:** Nodemailer for transactional email logs.

### Database Schema (Core Models)
- **User & Organization:** Core identity and multi-tenant scoping.
- **Course & Module:** The hierarchical structure of the learning content.
- **Assessment & LearnerScore:** Diagnostic evaluations and the resulting normalized skill metrics.
- **PersonalizedPath:** The AI-generated mapping of `Modules` assigned to a specific `User`.
- **Enrollment & ProgressTracking:** State management for a user's journey through their assigned path.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- MongoDB Instance (Local or Atlas)
- Google Gemini API Key

### Installation

1. **Clone the repository**
2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   Run the backend dev server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
   Run the frontend dev server:
   ```bash
   npm run dev
   ```

## 🧠 AI Assessment Pipeline Workflow

1. **Trigger:** Learner initiates the onboarding sequence.
2. **Generation:** Backend `assessmentController` calls the `aiGenerator` service. Gemini 1.5 analyzes the target course domains and returns a structured JSON payload containing diagnostic questions.
3. **Evaluation:** Learner submits answers; the system evaluates and updates the `LearnerScore` document.
4. **Path Synthesis:** Based on the scores, the AI determines which modules can be skipped and which are mandatory, persisting this into a `PersonalizedPath`.
