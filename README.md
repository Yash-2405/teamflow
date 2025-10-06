## TeamFlow 🚀

TeamFlow is a lightweight project management platform inspired by Jira and Trello. It enables teams to manage tasks in real-time, collaborate live, track progress, and leverage AI-powered task summarization.

## 🏆 Features

Kanban Boards: Create boards and manage tasks across columns (To Do → In Progress → Done)


Real-time Collaboration: Updates broadcast instantly to all users via WebSockets


Activity Feed: Track all task updates and user actions


Sprint Analytics: View metrics like tasks completed, in progress, and story points


AI Task Summarization: Summarize tasks or sprint notes using OpenAI GPT


User Management: JWT-based authentication with role-based access (Admin / Member)

## 🧩 Tech Stack

Frontend: React + TypeScript + Tailwind CSS + react-beautiful-dnd + Socket.IO + Axios


Backend: Flask + Flask-JWT-Extended + Flask-SocketIO + SQLAlchemy (SQLite/PostgreSQL)


Database: SQLite (development), PostgreSQL (production)


Deployment: Render / Railway (Docker optional)
Testing: Pytest for backend routes
