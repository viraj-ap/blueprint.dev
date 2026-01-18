# blueprint.dev - Collaborative AI Agent Planning Workspace

<p align="center">
  <strong>A modern, real-time collaboration tool for designing software architecture with AI agents.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Socket.io-4.8-green?logo=socket.io&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/Gemini-2.0_Flash-4285F4?logo=google-gemini&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Shadcn_UI-Latest-000000?logo=shadcnui&logoColor=white" alt="Shadcn">
</p>

## AI Workflow Architecture for Collaborative System Design

This workflow integrates distinct AI agents into your collaborative system design tool. The system accepts a System Design Plan (in .md format) and passes it through a pipeline of specialized agents powered by Gemini.

Each agent operates on a specific "Lens" to prevent context pollution (e.g., the Security agent doesn't care about variable naming, only vulnerabilities).

### Workflow Overview

- **Input**: User uploads/edits a System Design Plan (design_plan.md).
- **Parallel Processing**: The plan is simultaneously analyzed by specialized Lenses.
- **Synthesis/Action**: The Plan Refiner aggregates insights and offers "Accept/Reject" modifications.

### Tool 1: Security Lens Toggle 🛡️

**Trigger**: User toggles "Security Review Mode" in the UI.
**Role**: Specialized Auditor.

**Workflow Logic**:

- When the toggle is ON, the system sends the markdown content to a strict security-focused system instruction.
- It ignores architectural elegance and focuses solely on the "CIA Triad" (Confidentiality, Integrity, Availability).

**Prompt Strategy (Gemini)**:
"You are a Security Auditor. Analyze the provided system design markdown. You are strictly forbidden from commenting on feature logic. ONLY identify: Authentication flaws, Injection risks, Secrets handling, Rate limiting gaps."

### Tool 2: AI Contradiction Detector ❌

**Trigger**: Automatic (runs on save or edit).
**Role**: Semantic Consistency Checker.

**Workflow Logic**:

- This agent parses the full document to build a "Truth Table" of architectural decisions.
- It compares early definitions against later implementation details.

**Prompt Strategy (Gemini)**:
"Analyze this system design for semantic contradictions. Example: Statelessness claimed vs. Server Sessions used."

### Tool 3: AI Risk Labeler (Step-Level) 🚨

**Trigger**: UI Rendering (Visual Annotation).
**Role**: Metadata Tagger.

**Workflow Logic**:

- This agent breaks the markdown plan into logical "steps" or "blocks".
- It assigns a risk score to each block to visually color-code the UI (e.g., Red border for High Risk).

**Prompt Strategy (Gemini)**:
"For each distinct step or module in the provided markdown, assign a risk level (low, medium, high)."

### Tool 4: Plan Refiner (Auto-Remediation) 🛠️

**Trigger**: User clicks "Fix Issues" or "Apply Recommendations".
**Role**: Active Editor.

**Workflow Logic**:

- This tool takes the outputs from Tools 1, 2, and 3.
- It generates a "Diff" or a revised version of the .md file.
- It presents the changes as a "Pull Request" style view for the user to accept or reject.

## Features

### **Real-time Collaboration**

- **Multiplayer Editing**: See other users' cursors and edits in real-time.
- **Live Presence**: Know who is currently viewing the document.

### **AI-Powered Planning**

- **Instant Plans**: Generate comprehensive implementation plans from a simple prompt.
- **Enhance with Gemini**: Refine your plan with a single click, incorporating your comments and annotations.

### **Rich Annotation Platform**

- **Contextual Comments**: Highlight text to add comments or attach images.
- **Whiteboard**: Draw diagrams directly in the browser and attach them to your plan.
- **Redline Mode**: Mark up the document for deletion or review.

### **Modern UI/UX**

- **BentoGrid Layout**: A beautiful landing page showcasing features.
- **Dark Mode**: Native support for light and dark themes.
- **Shadcn UI**: Built with accessible and customizable components.

## Tech Stack

### **Frontend (Client)**

- **React 19**
- **Vite**
- **TailwindCSS v4**
- **Shadcn UI**
- **Lucide React**
- **Socket.io-client**
- **Axios**

### **Backend (Server)**

- **Node.js & Express**
- **Google Gemini API (@google/genai)**
- **Socket.io**
- **Mongoose (MongoDB)**

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Om-Thanage/blueprint.dev.git
    cd blueprint.dev
    ```

2.  **Install dependencies**

    **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    ```

    **Install Frontend Dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

3.  **Set up environment variables**

    **Backend (.env)**
    Create a `.env` file in the `backend` directory:

    ```env
    PORT=5000
    GEMINI_API_KEY=your_gemini_api_key
    MONGODB_URI=mongodb://localhost:27017/blueprint
    ```

4.  **Run the application**

    **Terminal 1 (Backend):**

    ```bash
    cd backend
    npm run dev
    ```

    **Terminal 2 (Frontend):**

    ```bash
    cd frontend
    npm run dev
    ```

5.  **Open your browser**
    Navigate to `http://localhost:5173` to start building.


<p align="center">
  Made with ❤️ by Team bootWinXP
</p>