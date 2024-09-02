
        let users = {};
        let currentUser = null;
        let tasks = {};

        // Load data from localStorage
        if (localStorage.getItem('todoAppUsers')) {
            users = JSON.parse(localStorage.getItem('todoAppUsers'));
        }
        if (localStorage.getItem('todoAppTasks')) {
            tasks = JSON.parse(localStorage.getItem('todoAppTasks'));
        }

        function showRegisterForm() {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
            document.getElementById('reset-form').classList.add('hidden');
        }

        function showLoginForm() {
            document.getElementById('login-form').classList.remove('hidden');
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('reset-form').classList.add('hidden');
        }

        function showResetForm() {
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('reset-form').classList.remove('hidden');
        }

        function register() {
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!username || !email || !password) {
        alert('Please fill in all fields.');
        return;
    }

    if (users[username]) {
        alert('Username already exists.');
        return;
    }

    users[username] = { email, password };
    tasks[username] = [];
    saveData();
    alert('Registration successful. Please login.');
    showLoginForm();
}

function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    if (users[username] && users[username].password === password) {
        currentUser = username;
        document.getElementById('auth').classList.add('hidden');
        document.getElementById('todo-app').classList.remove('hidden');
        renderTasks();
        updateStats();
    } else {
        alert('Invalid username or password.');
    }
}


        function addTask() {
            const taskText = document.getElementById('task-input').value.trim();
            const dueDate = document.getElementById('due-date').value;
            const priority = document.getElementById('priority').value;

            if (taskText) {
                tasks[currentUser].push({
                    text: taskText,
                    completed: false,
                    dueDate: dueDate,
                    priority: priority
                });
                document.getElementById('task-input').value = '';
                document.getElementById('due-date').value = '';
                document.getElementById('priority').value = 'low';
                saveData();
                renderTasks();
                updateStats();
            }
        }

        function toggleTask(index) {
            tasks[currentUser][index].completed = !tasks[currentUser][index].completed;
            saveData();
            renderTasks();
            updateStats();
        }

        function deleteTask(index) {
            tasks[currentUser].splice(index, 1);
            saveData();
            renderTasks();
            updateStats();
        }

        function editTask(index) {
            const task = tasks[currentUser][index];
            const newText = prompt('Edit task:', task.text);
            if (newText !== null) {
                task.text = newText.trim();
                saveData();
                renderTasks();
            }
        }

        function renderTasks() {
            const taskList = document.getElementById('task-list');
            const searchTerm = document.getElementById('search').value.toLowerCase();
            const filterPriority = document.getElementById('filter-priority').value;
            const sortBy = document.getElementById('sort-by').value;

            let filteredTasks = tasks[currentUser].filter(task => 
                task.text.toLowerCase().includes(searchTerm) &&
                (filterPriority === 'all' || task.priority === filterPriority)
            );

            filteredTasks.sort((a, b) => {
                if (sortBy === 'dueDate') {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (sortBy === 'priority') {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                } else if (sortBy === 'alphabetical') {
                    return a.text.localeCompare(b.text);
                }
            });

            taskList.innerHTML = '';

            filteredTasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = `priority-${task.priority}`;
                li.innerHTML = `
                    <input type="checkbox" class="checkbox-custom" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                    <span class="task-text" style="text-decoration: ${task.completed ? 'line-through' : 'none'}">${task.text}</span>
                    <span>Due: ${task.dueDate}</span>
                    <button onclick="editTask(${index})">Edit</button>
                    <button onclick="deleteTask(${index})">Delete</button>
                `;
                taskList.appendChild(li);
            });
        }

        function updateStats() {
            const totalTasks = tasks[currentUser].length;
            const completedTasks = tasks[currentUser].filter(task => task.completed).length;
            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
        }

        function exportTasks() {
            const tasksString = JSON.stringify(tasks[currentUser], null, 2);
            const blob = new Blob([tasksString], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'tasks.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        function saveData() {
            localStorage.setItem('todoAppUsers', JSON.stringify(users));
            localStorage.setItem('todoAppTasks', JSON.stringify(tasks));
        }

        // Event listeners for search and filters
        document.getElementById('search').addEventListener('input', renderTasks);
        document.getElementById('filter-priority').addEventListener('change', renderTasks);
        document.getElementById('sort-by').addEventListener('change', renderTasks);
