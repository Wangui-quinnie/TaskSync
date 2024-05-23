document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const authDiv = document.getElementById('auth');
    const tasksDiv = document.getElementById('tasks');

    let authToken = '';

    // Register User
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;

        const response = await fetch('/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            authDiv.style.display = 'none';
            tasksDiv.style.display = 'block';
            loadTasks();
        } else {
            alert(data.error || 'Registration failed');
        }
    });

    // Login User
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const response = await fetch('/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            authToken = data.token;
            authDiv.style.display = 'none';
            tasksDiv.style.display = 'block';
            loadTasks();
        } else {
            alert(data.error || 'Login failed');
        }
    });

    // Add Task
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;

        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ title, description }),
        });

        const data = await response.json();
        if (response.ok) {
            addTaskToList(data);
            socket.emit('taskAdded', data);
        } else {
            alert(data.error || 'Task creation failed');
        }
    });

    // Load Tasks
    async function loadTasks() {
        const response = await fetch('/tasks', {
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        const data = await response.json();
        if (response.ok) {
            taskList.innerHTML = '';
            data.forEach(task => addTaskToList(task));
        } else {
            alert(data.error || 'Failed to load tasks');
        }
    }

    // Add Task to List
    function addTaskToList(task) {
        const li = document.createElement('li');
        li.textContent = `${task.title} - ${task.description}`;
        li.className = task.completed ? 'completed' : '';
        li.addEventListener('click', () => toggleTaskCompletion(task._id, li));

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task._id, li);
        });

        li.appendChild(deleteButton);
        taskList.appendChild(li);
    }

    // Toggle Task Completion
    async function toggleTaskCompletion(taskId, listItem) {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ completed: !listItem.classList.contains('completed') }),
        });

        const data = await response.json();
        if (response.ok) {
            listItem.classList.toggle('completed');
            socket.emit('taskUpdated', data);
        } else {
            alert(data.error || 'Failed to update task');
        }
    }

    // Delete Task
    async function deleteTask(taskId, listItem) {
        const response = await fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` },
        });

        if (response.ok) {
            listItem.remove();
            socket.emit('taskDeleted', taskId);
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete task');
        }
    }

    // Real-time Updates
    socket.on('taskAdded', (task) => {
        if (task.owner !== getUserIdFromToken(authToken)) {
            addTaskToList(task);
        }
    });

    socket.on('taskUpdated', (task) => {
        const listItem = [...taskList.children].find(li => li.textContent.includes(task.title));
        if (listItem && task.owner !== getUserIdFromToken(authToken)) {
            listItem.classList.toggle('completed');
        }
    });

    socket.on('taskDeleted', (taskId) => {
        const listItem = [...taskList.children].find(li => li.textContent.includes(taskId));
        if (listItem && listItem.owner !== getUserIdFromToken(authToken)) {
            listItem.remove();
        }
    });

    // Utility function to get user ID from token
    function getUserIdFromToken(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload._id;
    }
});
