// Simple To-Do app with localStorage persistence
const STORAGE_KEY = 'todos-v1';

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const form = $('#todo-form');
const input = $('#todo-input');
const listEl = $('#todo-list');
const countEl = $('#count');
const filters = document.querySelectorAll('.filter');
const searchEl = $('#search');
const clearCompletedBtn = $('#clear-completed');
const clearAllBtn = $('#clear-all');

let todos = [];
let currentFilter = 'all';
let currentSearch = '';

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    todos = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load todos', e);
    todos = [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function makeTodo(text) {
  return {
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function render() {
  // filter & search
  const filtered = todos.filter(t => {
    if (currentFilter === 'active' && t.completed) return false;
    if (currentFilter === 'completed' && !t.completed) return false;
    if (currentSearch && !t.text.toLowerCase().includes(currentSearch.toLowerCase())) return false;
    return true;
  });

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'small';
    empty.textContent = 'No tasks found.';
    listEl.appendChild(empty);
  } else {
    for (const t of filtered) {
      listEl.appendChild(renderTodoItem(t));
    }
  }

  const remaining = todos.filter(t => !t.completed).length;
  countEl.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;

  // toggle active class on filters
  filters.forEach(f => f.classList.toggle('active', f.dataset.filter === currentFilter));
}

function renderTodoItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.id = todo.id;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'icon';
  toggleBtn.title = 'Toggle complete';
  toggleBtn.innerHTML = todo.completed ? '✓' : '○';
  toggleBtn.addEventListener('click', () => {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  });

  const textWrap = document.createElement('div');
  textWrap.className = 'text' + (todo.completed ? ' completed' : '');
  textWrap.textContent = todo.text;
  textWrap.contentEditable = true;
  textWrap.spellcheck = false;
  textWrap.title = 'Double-click or edit to change text (press Enter to save)';

  // Save edits on Enter and blur
  textWrap.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      textWrap.blur();
    }
  });
  textWrap.addEventListener('blur', () => {
    const newText = textWrap.textContent.trim();
    if (!newText) {
      // if cleared, remove todo
      todos = todos.filter(t => t.id !== todo.id);
    } else {
      todo.text = newText;
    }
    saveTodos();
    render();
  });

  const editHint = document.createElement('button');
  editHint.className = 'icon';
  editHint.title = 'Edit';
  editHint.innerHTML = '✎';
  editHint.addEventListener('click', () => {
    textWrap.focus();
    // place caret at end
    document.execCommand('selectAll', false, null);
    document.getSelection().collapseToEnd();
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'icon';
  delBtn.title = 'Delete';
  delBtn.innerHTML = '🗑';
  delBtn.addEventListener('click', () => {
    if (confirm('Delete this task?')) {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      render();
    }
  });

  li.appendChild(toggleBtn);
  li.appendChild(textWrap);
  li.appendChild(editHint);
  li.appendChild(delBtn);

  return li;
}

// Event handlers
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = input.value.trim();
  if (!val) return;
  todos.unshift(makeTodo(val));
  input.value = '';
  saveTodos();
  render();
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    render();
  });
});

searchEl.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  render();
});

clearCompletedBtn.addEventListener('click', () => {
  const done = todos.filter(t => t.completed).length;
  if (!done) return alert('No completed tasks to clear.');
  if (confirm(`Clear ${done} completed task${done>1?'s':''}?`)) {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    render();
  }
});

clearAllBtn.addEventListener('click', () => {
  if (!todos.length) return;
  if (confirm('Clear ALL tasks? This cannot be undone.')) {
    todos = [];
    saveTodos();
    render();
  }
});

// keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    input.focus();
  }
});

loadTodos();
render();
