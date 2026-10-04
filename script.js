"use strict";

const STORAGE_KEY = "study-space-tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const searchInput = document.querySelector("#search-input");
const taskList = document.querySelector("#task-list");
const feedback = document.querySelector("#feedback");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const filterButtons = document.querySelectorAll(".filter-button");
const counts = {
  total: document.querySelector("#total-count"),
  pending: document.querySelector("#pending-count"),
  completed: document.querySelector("#completed-count"),
  visible: document.querySelector("#visible-count")
};

let tasks = loadTasks();
let activeFilter = "all";
let searchTerm = "";

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks === null) return [];

    const parsedTasks = JSON.parse(savedTasks);
    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isValidTask)) {
      throw new Error("Saved task data has an invalid format.");
    }
    return parsedTasks;
  } catch (error) {
    feedback.textContent = "Saved tasks could not be loaded. Your browser storage may be unavailable or corrupted.";
    console.error("Unable to load saved tasks:", error);
    return [];
  }
}

function isValidTask(task) {
  return task !== null
    && typeof task === "object"
    && typeof task.id === "string"
    && typeof task.title === "string"
    && task.title.trim().length > 0
    && typeof task.completed === "boolean";
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    feedback.textContent = "";
    return true;
  } catch (error) {
    feedback.textContent = "Your change could not be saved. Check that browser storage is enabled.";
    console.error("Unable to save tasks:", error);
    return false;
  }
}

function visibleTasks() {
  return tasks.filter((task) => {
    const matchesFilter = activeFilter === "all"
      || (activeFilter === "pending" && !task.completed)
      || (activeFilter === "completed" && task.completed);
    return matchesFilter && task.title.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase());
  });
}

function renderTasks() {
  taskList.replaceChildren();
  const filteredTasks = visibleTasks();
  counts.total.textContent = String(tasks.length);
  counts.pending.textContent = String(tasks.filter((task) => !task.completed).length);
  counts.completed.textContent = String(tasks.filter((task) => task.completed).length);
  counts.visible.textContent = String(filteredTasks.length);

  filteredTasks.forEach((task) => taskList.append(createTaskElement(task)));
  emptyState.hidden = filteredTasks.length > 0;
  if (tasks.length === 0) {
    emptyTitle.textContent = "Nothing on your list yet";
    emptyCopy.textContent = "Add a task above and make today count.";
  } else if (filteredTasks.length === 0 && searchTerm) {
    emptyTitle.textContent = "No tasks found";
    emptyCopy.textContent = "Try another search term or change your filters.";
  } else {
    emptyTitle.textContent = "No tasks in this view";
    emptyCopy.textContent = "Choose another filter to see your tasks.";
  }
}

function createTaskElement(task) {
  const item = document.createElement("li");
  item.className = `task-item${task.completed ? " is-completed" : ""}`;

  const toggle = document.createElement("button");
  toggle.className = "toggle-task";
  toggle.type = "button";
  toggle.setAttribute("aria-label", `${task.completed ? "Reopen" : "Complete"} ${task.title}`);
  toggle.setAttribute("aria-pressed", String(task.completed));
  toggle.textContent = task.completed ? "✓" : "";
  toggle.addEventListener("click", () => updateTask(task.id, { completed: !task.completed }));

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Completed" : "Pending";

  const remove = document.createElement("button");
  remove.className = "delete-task";
  remove.type = "button";
  remove.setAttribute("aria-label", `Delete ${task.title}`);
  remove.title = "Delete task";
  remove.textContent = "×";
  remove.addEventListener("click", () => deleteTask(task.id));

  item.append(toggle, title, status, remove);
  return item;
}

function updateTask(id, changes) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    feedback.textContent = "That task could not be found. Refresh the page and try again.";
    return;
  }

  const previousTask = tasks[taskIndex];
  tasks[taskIndex] = { ...previousTask, ...changes };
  if (!saveTasks()) tasks[taskIndex] = previousTask;
  renderTasks();
}

function deleteTask(id) {
  const taskIndex = tasks.findIndex((task) => task.id === id);
  if (taskIndex === -1) {
    feedback.textContent = "That task could not be found. Refresh the page and try again.";
    return;
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  if (!saveTasks()) tasks.splice(taskIndex, 0, deletedTask);
  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) {
    feedback.textContent = "Enter a task title before adding it.";
    taskInput.focus();
    return;
  }

  const task = {
    id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    completed: false
  };
  tasks.unshift(task);
  if (!saveTasks()) tasks.shift();
  renderTasks();
  if (tasks.includes(task)) taskInput.value = "";
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim();
  renderTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    renderTasks();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey
    && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
});

renderTasks();
