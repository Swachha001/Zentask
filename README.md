# ZenTask - Smart Todo & Focus Tracker 🎯

![ZenTask Preview](https://img.shields.io/badge/Status-Completed-success) ![License](https://img.shields.io/badge/License-MIT-blue)

ZenTask is a beautiful, feature-rich productivity web application built entirely with vanilla web technologies (HTML, CSS, JavaScript) without any external frameworks or libraries. It combines a powerful task manager with focus tools like a stopwatch and a Pomodoro-style break reminder.

## ✨ Features

*   **Stunning UI & UX**: Modern glassmorphism design with animated gradient backgrounds, micro-animations, and a responsive layout that looks great on desktop and mobile.
*   **Task Management**:
    *   Add, edit, and delete tasks.
    *   Categorize tasks (Work, Personal, Health, Study, Other).
    *   Set priority levels (High, Medium, Low).
    *   Filter tasks by status, priority, or category.
*   **Focus Mode**: Click on any active task to enter Focus Mode. A floating banner tracks what you're currently working on, and the time spent is automatically recorded and displayed on the task.
*   **Built-in Stopwatch**: A fully functional stopwatch with start, pause, lap, and reset capabilities to track arbitrary time intervals.
*   **Break Reminder (Pomodoro)**: Set a focus interval (25, 45, 50, 60, or 90 minutes). An animated SVG ring visually counts down the time. You receive in-app toast notifications and native browser push notifications when it's time to take a break.
*   **Productivity Analytics**:
    *   Live stats dashboard showing total, completed, active, and high-priority tasks.
    *   Daily progress bar.
    *   28-day GitHub-style contribution heatmap tracking your daily completed tasks.
*   **Daily Inspiration**: Rotating motivational quotes to keep you going.
*   **Light/Dark Mode**: Seamlessly toggle between dark mode (default) and light mode with a single click.
*   **Persistent Data**: All your tasks, tracked time, and heatmap activity are saved locally in your browser using `localStorage`. Nothing is lost when you close the tab.
*   **Delightful Details**: Celebratory confetti bursts when you complete a task! 🎉

## 🛠️ Tech Stack

This project is built from scratch to demonstrate the power of modern vanilla web technologies:

*   **HTML5**: Semantic structure.
*   **CSS3**: Custom properties (variables) for theming, CSS Grid & Flexbox for layout, Keyframes for animations, Backdrop-filter for glassmorphism.
*   **JavaScript (ES6+)**: DOM manipulation, event delegation, `localStorage` API, `Notification` API, `setInterval`/`clearInterval` for timing.
*   **No Dependencies**: Zero frameworks (no React, Vue, Tailwind, etc.), making it incredibly lightweight and fast.

## 🚀 Getting Started

Since this is a vanilla web application, no build steps or servers are required!

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/zentask.git
    cd zentask
    ```

2.  **Open the app**:
    Simply double-click the `index.html` file to open it in your default web browser.
    *(Alternatively, use an extension like Live Server in VS Code).*

## 📂 Project Structure

```
zentask/
├── index.html     # The main HTML structure
├── styles.css     # All CSS styles, animations, and themes
└── app.js         # Core application logic and state management
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/yourusername/zentask/issues).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
