
const STORAGE_KEY = "anjaz-tasks-v1";
const THEME_KEY = "anjaz-theme";
const NAME_KEY = "anjaz-user-name";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter");
const progressBar = document.querySelector("#progress-bar");
const progressLabel = document.querySelector("#progress-label");
const remainingCount = document.querySelector("#remaining-count");
const themeButton = document.querySelector("#theme-button");
const nameInput = document.querySelector("#name-input");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentFilter = "all";

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function escapeHtml(text) { const element = document.createElement("div"); element.textContent = text; return element.innerHTML; }

function renderTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const visibleTasks = tasks.filter((task) => {
    const matchesFilter = currentFilter === "all" || (currentFilter === "active" && !task.completed) || (currentFilter === "completed" && task.completed);
    return matchesFilter && task.text.toLowerCase().includes(query);
  });

  taskList.innerHTML = visibleTasks.length
    ? visibleTasks.map((task) => `
      <li class="task ${task.completed ? "completed" : ""}" data-id="${task.id}">
        <input class="task-check" type="checkbox" ${task.completed ? "checked" : ""} aria-label="تحديد المهمة" />
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-actions">
          <button class="action-button edit" type="button" title="تعديل المهمة">✎</button>
          <button class="action-button delete" type="button" title="حذف المهمة">⌫</button>
        </div>
      </li>`).join("")
    : `<li class="empty"><span>${tasks.length ? "🔎" : "🎯"}</span>${tasks.length ? "لا توجد نتائج مطابقة" : "ابدأ بإضافة أول مهمة لك!"}</li>`;

  const completed = tasks.filter((task) => task.completed).length;
  const remaining = tasks.length - completed;
  progressBar.style.width = tasks.length ? `${(completed / tasks.length) * 100}%` : "0";
  progressLabel.textContent = `${completed} من ${tasks.length} مكتملة`;
  remainingCount.textContent = remaining ? `متبقي ${remaining} ${remaining === 1 ? "مهمة" : "مهام"}` : tasks.length ? "أحسنت! أنجزت كل المهام 🎉" : "لا توجد مهام";
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: Date.now(), text, completed: false });
  saveTasks();
  taskInput.value = "";
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  const taskElement = event.target.closest(".task");
  if (!taskElement) return;
  const task = tasks.find((item) => item.id === Number(taskElement.dataset.id));
  if (event.target.matches(".task-check")) task.completed = event.target.checked;
  if (event.target.matches(".delete")) tasks = tasks.filter((item) => item.id !== task.id);
  if (event.target.matches(".edit")) {
    const updatedText = prompt("عدّل المهمة:", task.text);
    if (updatedText?.trim()) task.text = updatedText.trim();
  }
  saveTasks();
  renderTasks();
});

filterButtons.forEach((button) => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  document.querySelector(".filter.active").classList.remove("active");
  button.classList.add("active");
  renderTasks();
}));

searchInput.addEventListener("input", renderTasks);
document.querySelector("#clear-completed").addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
});

themeButton.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  themeButton.textContent = isDark ? "☀" : "☾";
});

if (localStorage.getItem(THEME_KEY) === "dark") { document.body.classList.add("dark"); themeButton.textContent = "☀"; }
nameInput.value = localStorage.getItem(NAME_KEY) || "";
nameInput.addEventListener("input", () => localStorage.setItem(NAME_KEY, nameInput.value.trim()));
document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
renderTasks();
