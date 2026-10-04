# Student Task Manager

A lightweight task manager for students, built from scratch with HTML, CSS, and vanilla JavaScript. Add study tasks, track their status, and keep your list organized.

## Features

- Add tasks with a title; blank titles are rejected.
- Mark tasks pending or completed, and reopen completed tasks.
- Delete tasks, search titles without case sensitivity, and filter by status.
- See total, pending, completed, and currently visible task counts.
- Get helpful empty states when there are no tasks or a search/filter has no matches.
- Keep tasks between browser refreshes using LocalStorage.
- Responsive layout, keyboard-accessible controls, and a `/` shortcut to focus search.

## How to Run It

Open `index.html` directly in a modern browser. No server, build step, package installation, or backend is required.

## How Data Is Stored

Tasks are saved as JSON in the browser's LocalStorage under the `study-space-tasks` key. Data remains in that browser on that device. Clearing browser storage removes saved tasks.

## AI Usage

AI assistance (GitHub Copilot) was used to help build and review the application structure, styling, and task interactions. The implementation should be reviewed and understood by the person submitting it.

## Known Limitations

- Tasks are local to one browser and device; there is no account or cloud synchronization.
- The app intentionally keeps each task to a title and completion status.
- If browser storage is unavailable or its saved data is invalid, tasks cannot be persisted and a message is shown.
