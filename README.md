# ChatApp

An advanced chat platform built with the MERN stack, WebSockets, and ZEGOCLOUD, supporting both 1:1 and group audio/video calls. The app includes secure user authentication with email verification via BullMQ and Nodemailer. This project is open-source and actively evolving, with plans to integrate modern productivity and AI-driven features.

---

## Why I Built This

I created ChatApp to deepen my knowledge of building scalable, real-time applications using modern web technologies. It’s not just a chat app—it’s a foundation for developing powerful collaboration tools and advanced features that could transform communication and productivity platforms.

This project showcases my ability to:

- Design real-time systems
- Integrate cloud services like ZEGOCLOUD and Redis
- Build scalable backend and frontend architectures
- Work with asynchronous job queues
- Plan and execute advanced product roadmaps

---

## Tech Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS

**Backend**
- Node.js (Express)
- MongoDB (Mongoose)
- JWT Authentication
- Nodemailer

**Real-Time and Media**
- WebSockets
- ZEGOCLOUD SDK for audio/video calls

**Queues & Infrastructure**
- BullMQ (Redis queues)
- Redis (Upstash, Redis Cloud, or similar)
- Render (Backend and workers)
- Vercel (Frontend deployment)

---

## Core Features

- User authentication and signup flow
- Email verification via Nodemailer and BullMQ
- 1:1 private chat
- Group chat rooms
- Real-time messaging using WebSockets
- Audio and video calls via ZEGOCLOUD SDK
- Publishing and playing streams dynamically for all users in a room
- Environment separation for development and production

---

## Email Verification Flow

1. User signs up.
2. Server generates a JWT token.
3. An email job is queued in BullMQ.
4. Nodemailer sends a verification email.
5. User clicks the verification link.
6. Account is verified and user is logged in automatically.

---

## Live Demo

[Link to your deployed frontend app](https://chat-app-rho-ashy.vercel.app/)

*(Replace this with your actual deployed frontend URL.)*

---

## What’s Next

This project is actively evolving. Planned features include:

- Video call summarization using AI
- Smart reply suggestions and chat summarization
- Kanban boards for task management
- Task creation and automation using generative AI
- Collaborative document editing
- Usage analytics and dashboards
- Web push notifications and reminders
- Two-factor authentication
- Enhanced security and monitoring features

---

## For Recruiters and Engineering Managers

This project demonstrates my ability to:

- Develop real-time, scalable applications
- Work with modern tools and cloud services
- Integrate complex third-party SDKs like ZEGOCLOUD
- Implement secure authentication flows
- Design modular and maintainable codebases
- Plan and execute product features with a vision for extensibility

I’m eager to bring these skills into a professional team and continue building impactful products.

---

## Running the App Locally

```bash
# Clone the repository
git clone https://github.com/Hymanshu-jha/chatAppFullStack.git
cd chatapp

# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm run dev
