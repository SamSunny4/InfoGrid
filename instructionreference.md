AI Department Digital Display System
Software Requirement Document (SRD)
1. Introduction
1.1 Project Title
AI Department Digital Display & Interactive 
Ecosystem
1.2 Purpose
The purpose of this project is to develop an integrated digital display system for a 43-inch vertical 
indoor screen that showcases AI-related news, department highlights, interactive quiz activities, and 
leaderboards.
The system will consist of three interconnected web applications:
1. Display Landing Page (Digital Signage)
2. Content Management Website (Admin Panel)
3. Quiz / Puzzle Website (Interactive Platform)
2. System Overview
This project is not a single webpage but a connected ecosystem of three systems that communicate 
through APIs.
System Purpose Target Users
Display Landing 
Page Public digital wall display Students & 
Visitors
Content Website Manage news, posters, events Admin Team
Quiz Website Interactive quizzes & 
leaderboard Students
3. System Architecture Overview
Data Flow:  Content Website → Display Landing Page
 Quiz Website → Display Landing Page
 Students → Quiz Website
The Display Page fetches data dynamically and does not permanently store content.
4. System 1: Display Landing Page (Digital Signage)
4.1 General Requirements  Designed for 43-inch vertical indoor display
 Resolution optimized for 1080 x 1920 (Portrait Mode)  Full-screen display
 Auto-refresh without manual reload
 Smooth animations and transitions
4.2 Layout Structure
The screen must be divided vertically in a 60:40 ratio:  Top 60% – Dynamic Information Panel  Bottom 40% – Scrolling Poster Section
4.3 Top 60% – Functional Requirements
4.3.1 AI-Related News  Fetched from Content Website
 Display title, short description, and date
 Card-based layout  Auto-refresh every 2–3 minutes  Large, readable fonts
4.3.2 QR Code Section
 Clearly visible QR code
 Redirects users to Quiz/Puzzle Website
 Easily scannable from distance
 Can be updated from backend
4.3.3 Cumulative Leaderboard
 Fetched from Quiz Website
 Display top participants  Sorted by total score
 Auto-updated periodically
4.3.4 Weekly Top Scores  Separate section from cumulative leaderboard
 Displays weekly rankings
 Auto-updated
4.3.5 Upcoming Events  Fetched from Content Website
 Show event name and date
 Clean card-style layout
4.4 Bottom 40% – Scrolling Poster Section
Content Types:  Achievements  Placements  Department Highlights
Behavior Requirements:  Vertical auto-scroll  Smooth infinite loop animation
 Each poster visible for a few seconds  Slight pause before transitioning
 Optimized for large display readability
5. System 2: Content Management Website (Admin Panel)
5.1 Purpose
To manage and update all content displayed on the wall screen.
5.2 Functional Requirements
5.2.1 News Management  Add AI news  Edit news  Delete news
5.2.2 Poster Management  Upload poster images  Categorize posters: o Achievement o Placement o Department Highlight  Edit and delete posters
5.2.3 Event Management  Add upcoming events  Edit and delete events
5.2.4 Security
 Admin login authentication required
 Secure backend APIs
6. System 3: Quiz / Puzzle Website
6.1 Purpose
To engage students through interactive AI-related quizzes and games.
Accessed via QR code displayed on the wall.
6.2 Functional Requirements
6.2.1 Quiz / Puzzle Features  AI-related quizzes  Logic puzzles  Weekly challenges
6.2.2 Score Tracking
Each participant must have:  Name
 Total Score
 Weekly Score
6.2.3 Leaderboard System
 Cumulative leaderboard
 Weekly leaderboard
 APIs accessible by Display Page
7. Technical Requirements
7.1 Frontend (Display & Quiz)  React  Fixed portrait layout (1080 x 1920)  Axios for API calls  Smooth CSS animations
7.2 Backend (Content & Quiz APIs)
 Node.js + Express  MongoDB database
 REST API architecture
 Proper folder structure
8. Design Requirements (Display Page)  Modern dashboard-style UI  High contrast colors  Minimal clutter  Large readable fonts  Dark background with AI-themed accent colors  Smooth transitions
9. Performance Requirements  Must run continuously without crashing
 Auto-load on system startup
 Lightweight and optimized
 Compressed images for faster loading
 Stable API communication
10. Non-Functional Requirements  Secure backend endpoints  Clean and maintainable code structure
 Scalable architecture for future upgrades  Easy content management  Reliable and stable operation
11. Future Enhancements (Optional)  Real-time leaderboard updates (WebSockets)  Automated AI news fetching
 Event countdown timers  Admin analytics dashboard
12. Project Summary
This project is a connected digital ecosystem consisting of:
1. Public Display Interface
2. Admin Content Management System
3. Interactive Quiz Platform
All systems communicate through APIs to ensure dynamic and real-time updates on the display.