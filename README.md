✉️ AI Email Writer Extension

An AI-powered email reply generator that helps users draft professional, context-aware email responses directly inside Gmail.
Built with Spring Boot, React (Vite), and a Chrome Extension (MV3).

🚀 Features

✨ Generate professional email replies using AI

🧠 Context-aware responses based on original email content

🎯 Multiple tone support (Professional, Polite, Concise, etc.)

📩 Seamless integration with Gmail via Chrome Extension

⚡ Fast and lightweight frontend using Vite + React

🔒 Secure backend with controlled CORS for extension access

🏗️ Tech Stack
Backend

Java 17

Spring Boot

REST APIs

Environment-based CORS configuration

Deployed on Render

Frontend

React

Vite

Material UI (MUI)

Chrome Extension

Manifest V3

Content scripts for Gmail UI injection

Background service worker for API communication

📁 Project Structure
email-project/
├── email-writer/           # Spring Boot backend
├── email-writer-frontend/  # React + Vite frontend
├── email-writer-ext/       # Chrome Extension (MV3)
└── README.md

⚙️ How It Works

User opens Gmail

Chrome Extension injects a UI button

Email content is captured by the content script

Request is sent to the background service worker

Background script calls the Spring Boot API

AI-generated reply is returned and inserted into Gmail

🔐 CORS & Security Design

API calls are not made directly from content scripts

All backend requests go through the extension background script

Backend allows only:

chrome-extension://<EXTENSION_ID>


Extension ID is injected via environment variables

🛠️ Setup Instructions
1️⃣ Backend (Spring Boot)
cd email-writer
./mvnw spring-boot:run


Set environment variable:

EXTENSION_ORIGIN=chrome-extension://<your-extension-id>

2️⃣ Frontend (React)
cd email-writer-frontend
npm install
npm run dev

3️⃣ Chrome Extension

Open Chrome → chrome://extensions

Enable Developer Mode

Click Load unpacked

Select email-writer-ext folder

Copy the generated Extension ID

Update backend EXTENSION_ORIGIN

📡 API Endpoint
Generate Email Reply
POST /api/email/generate


Request Body

{
  "emailContent": "Original email text",
  "tone": "Professional"
}


Response

AI-generated email reply (plain text)

🧪 Example Use Case

Follow-up emails

Client communication

Academic or professional replies

Polite rejections or confirmations

📌 Future Enhancements

🔑 API key authentication

🧩 Tone presets & templates

📊 Usage analytics

🌍 Multi-language support

☁️ Full cloud deployment pipeline

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a feature branch

Commit changes

Open a Pull Request

📄 License

This project is licensed under the MIT License.

👤 Author

Bhavya Sharma
