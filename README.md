LeanMind – Personal AI Trainer & Progress Tracker
LeanMind is your personal AI companion designed to help you get leaner, think clearer, and stay consistent. It tracks your habits, meals, and mindset through an interactive chat, giving you actionable insights and personalized guidance every day.
Table of Contents
Concept
Features
How It Works
Technologies Used
Getting Started
Usage
Future Enhancements
License
Concept
LeanMind is more than a fitness tracker—it combines physical health and mental wellness. By interacting with the AI daily, you get a clear picture of your progress, habits, and areas for improvement.
“A personal AI that helps you get leaner, think clearer, and stay consistent.”
Features
Daily Interaction: Chat or voice input about your day (e.g., “I worked out today but ate pizza after”).
AI Summaries & Analysis:
Classifies your day (good/bad, reasons why).
Extracts key habits (sleep, gym, food, mood).
Data Storage: Stores daily summaries and metrics using Durable Objects or KV storage.
Feedback & Goals: Provides insights and weekly goals (e.g., “You’re consistent with workouts but eating late — let’s fix that this week.”).
Visual Insights: Generates charts for metrics like:
Average sleep: 6.5h
Mood trends over time
Optional Features:
Voice input
Daily notifications
How It Works
Input: User submits a daily summary via chat or voice.
Processing: LLM analyzes the input to classify the day and extract habits.
Storage: Summary and metrics are stored for long-term tracking.
Output: User receives feedback, weekly goals, and visual insights.
LeanMind learns over time, improving recommendations and highlighting trends in your habits and mindset.
Technologies Used
Cloudflare Workers – Backend serverless runtime
Durable Objects / KV Storage – Persistent data storage
Large Language Models (LLM) – Day analysis and feedback
Charting Libraries – Visualizing trends and metrics
Optional: Web Speech API for voice input
Getting Started
Clone the repository:
git clone https://github.com/Abdulmoiz-h/cf_ai_leanmind.git
Install dependencies:
npm install
Configure your environment variables for LLM API keys and storage.
Start the project locally:
npm start
Open the app in your browser and start chatting with LeanMind!
Usage
Submit your daily reflection either by typing or speaking.
Check your weekly insights and trends.
Receive feedback and suggested goals to improve consistency and wellbeing.
Future Enhancements
Integration with fitness trackers and meal apps
AI-generated motivational messages
Gamification and streak tracking
Mobile push notifications
Why LeanMind is Unique
LeanMind combines physical fitness with mental health tracking, providing a holistic view of your wellbeing. Unlike other apps, it not only records your activity but analyzes your habits and mindset, offering actionable insights tailored to your personal goals.
