// ====== انتخاب المان‌ها ======
const form      = document.getElementById("todo-form");
const input     = document.getElementById("todo-input");
const list      = document.getElementById("todo-list");
const counter   = document.getElementById("counter");
const clearDone = document.getElementById("clear-done");
const filterBtns = document.querySelectorAll(".filter-btn");

// ====== State ======
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

// ====== توابع کمکی ======
const save = () => localStorage.setItem("todos", JSON.stringify(todos));

const toPersianNumber = (n) => n.toLocaleString("fa-IR");

// ====== رندر لیست ======
function render() {
  list.innerHTML = "";

  const filtered = todos.filter((t) => {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "done")   return t.done;
    return true;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "هیچ کاری برای نمایش وجود ندارد !";
    list.appendChild(empty);
  }

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <input type="checkbox" ${todo.done ? "checked" : ""} />
      <span class="text">${escapeHtml(todo.text)}</span>
      <div class="actions">
        <button class="icon-btn edit" title="ویرایش">✏️</button>
        <button class="icon-btn delete" title="حذف">🗑️</button>
      </div>
    `;

    // toggle done
    li.querySelector('input[type="checkbox"]').addEventListener("change", () => {
      toggleTodo(todo.id);
    });

    // edit
    li.querySelector(".edit").addEventListener("click", () => {
      startEdit(li, todo);
    });

    // delete
    li.querySelector(".delete").addEventListener("click", () => {
      deleteTodo(todo.id);
    });

    list.appendChild(li);
  });

  updateCounter();
  save();
}

// ====== جلوگیری از XSS ======
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ====== به‌روزرسانی شمارنده ======
function updateCounter() {
  const remaining = todos.filter((t) => !t.done).length;
  counter.textContent = `${toPersianNumber(remaining)} کار باقی مانده`;
}

// ====== افزودن ======
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: Date.now().toString(),
    text,
    done: false,
  });

  input.value = "";
  input.focus();
  render();
});

// ====== حذف ======
function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  render();
}

// ====== تغییر وضعیت ======
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) todo.done = !todo.done;
  render();
}

// ====== ویرایش ======
function startEdit(li, todo) {
  const textEl = li.querySelector(".text");
  const actions = li.querySelector(".actions");

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;

  textEl.replaceWith(editInput);
  actions.style.display = "none";
  editInput.focus();
  editInput.select();

  const commit = () => {
    const newText = editInput.value.trim();
    if (newText) todo.text = newText;
    render();
  };

  editInput.addEventListener("blur", commit);
  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") render();
  });
}

// ====== پاک کردن انجام‌شده‌ها ======
clearDone.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  render();
});

// ====== فیلترها ======
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ====== شروع ======
render();