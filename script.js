document.addEventListener('DOMContentLoaded', () => {

    const allViews = document.querySelectorAll('.view-section');
    const navItems = document.querySelectorAll('.nav-item');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    const notesGrid = document.getElementById('notes-grid');
    const taskList = document.getElementById('task-items');
    const archiveGrid = document.getElementById('archive-grid');
    const trashGrid = document.getElementById('trash-grid');

    const openNewNoteBtn = document.getElementById('open-new-note');
    const closeNewNoteBtn = document.getElementById('close-new-note');
    const saveNoteBtn = document.getElementById('save-note');
    const noteForm = document.getElementById('new-note-form');
    const noteList = document.getElementById('notes-grid-view');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const noteReminderInput = document.getElementById('note-reminder-time');

    const openNewTaskBtn = document.getElementById('open-new-task');
    const closeNewTaskBtn = document.getElementById('close-new-task');
    const saveTaskBtn = document.getElementById('save-task');
    const taskForm = document.getElementById('new-task-form');
    const taskListView = document.getElementById('tasks-list-view');
    const taskDescInput = document.getElementById('task-desc');
    const taskReminderInput = document.getElementById('task-reminder-time');

    const profileSaveBtn = document.getElementById('profile-save-btn');
    const profileNameInput = document.getElementById('profile-name-input');
    const greetingText = document.getElementById('user-greeting-text');
    const quoteText = document.getElementById('user-quote-text');

    const searchInput = document.getElementById('global-search');

    const getStore = (key) => {
        return JSON.parse(localStorage.getItem(key) || '[]');
    };
    const setStore = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    const showView = (viewName) => {
        allViews.forEach(view => view.style.display = 'none');
        
        const viewToShow = document.getElementById(viewName + '-view');
        if (viewToShow) {
            viewToShow.style.display = 'block';
        }

        navItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        showList('notes');
        showList('tasks');
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault(); 
            const viewName = item.dataset.view;
            if (viewName) {
                showView(viewName);
            }
        });
    });

    const showForm = (type) => {
        if (type === 'notes') {
            noteList.style.display = 'none';
            noteForm.style.display = 'block';
        } else if (type === 'tasks') {
            taskListView.style.display = 'none';
            taskForm.style.display = 'block';
        }
    };

    const showList = (type) => {
        if (type === 'notes') {
            noteList.style.display = 'block';
            noteForm.style.display = 'none';
        } else if (type === 'tasks') {
            taskListView.style.display = 'block';
            taskForm.style.display = 'none';
        }
    };

    openNewNoteBtn.addEventListener('click', (e) => { e.preventDefault(); showForm('notes'); });
    closeNewNoteBtn.addEventListener('click', (e) => { e.preventDefault(); showList('notes'); });
    openNewTaskBtn.addEventListener('click', (e) => { e.preventDefault(); showForm('tasks'); });
    closeNewTaskBtn.addEventListener('click', (e) => { e.preventDefault(); showList('tasks'); });

    const renderAll = (filter = '') => {
        const term = filter.toLowerCase();

        notesGrid.innerHTML = '';
        taskList.innerHTML = '';
        archiveGrid.innerHTML = '';
        trashGrid.innerHTML = '';

        const notes = getStore('zenboard_notes');
        const tasks = getStore('zenboard_tasks');
        const archive = getStore('zenboard_archive');
        const trash = getStore('zenboard_trash');

        const filteredNotes = notes.filter(n => 
            (n.title && n.title.toLowerCase().includes(term)) || 
            (n.content && n.content.toLowerCase().includes(term))
        );

        const filteredTasks = tasks.filter(t => 
            (t.text && t.text.toLowerCase().includes(term))
        );

        const filteredArchive = archive.filter(i => 
            (i.title && i.title.toLowerCase().includes(term)) || 
            (i.content && i.content.toLowerCase().includes(term)) ||
            (i.text && i.text.toLowerCase().includes(term))
        );

        filteredNotes.forEach(note => createCard(note, notesGrid));
        filteredTasks.forEach(task => createCard(task, taskList));
        filteredArchive.forEach(item => createCard(item, archiveGrid));
        trash.forEach(item => createCard(item, trashGrid)); 
    };

    const createCard = (item, container) => {
        if (item.type === 'note') {
            const article = document.createElement('article');
            const colorClass = item.colorCode || 'white'; 
            article.className = `note-card ${colorClass}`;
            article.dataset.id = item.id;
            article.dataset.type = 'note';
            
            article.innerHTML = `
                <h3 class="note-title">${item.title || 'Untitled'}</h3>
                <p class="note-text">${item.content || ''}</p>
                ${item.reminder ? `<div class="note-reminder"><i class="fas fa-bell"></i> ${formatDate(item.reminder)}</div>` : ''}
                <small class="note-timestamp">Created: ${formatDate(item.createdAt)}</small>
                <div class="note-card-actions">
                    ${container.id === 'notes-grid' ? `
                        <button class="card-action-btn archive"><i class="fas fa-archive"></i> Archive</button>
                        <button class="card-action-btn delete"><i class="fas fa-trash-alt"></i> Delete</button>
                    ` : ''}
                    ${container.id === 'archive-grid' ? `
                        <button class="card-action-btn unarchive"><i class="fas fa-box-open"></i> Unarchive</button>
                        <button class="card-action-btn delete"><i class="fas fa-trash-alt"></i> Delete</button>
                    ` : ''}
                    ${container.id === 'trash-grid' ? `
                        <button class="card-action-btn restore"><i class="fas fa-undo"></i> Restore</button>
                        <button class="card-action-btn perm-delete"><i class="fas fa-times-circle"></i> Delete Forever</button>
                    ` : ''}
                </div>
            `;
            container.prepend(article);
        } 
        else if (item.type === 'task') {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = item.id;
            li.dataset.type = 'task';

            li.innerHTML = `
                <div class="task-item-main">
                    <div class="task-item-left">
                        <input type="checkbox" class="task-checkbox" ${item.completed ? 'checked' : ''} />
                        <span style="${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            ${item.text}
                        </span>
                    </div>
                </div>
                ${item.reminder ? `<div class="task-reminder"><i class="fas fa-bell"></i> ${formatDate(item.reminder)}</div>` : ''}
                <div class="note-card-actions">
                    ${container.id === 'task-items' ? `
                        <button class="card-action-btn archive"><i class="fas fa-archive"></i> Archive</button>
                        <button class="card-action-btn delete"><i class="fas fa-trash-alt"></i> Delete</button>
                    ` : ''}
                    ${container.id === 'archive-grid' ? `
                        <button class="card-action-btn unarchive"><i class="fas fa-box-open"></i> Unarchive</button>
                        <button class="card-action-btn delete"><i class="fas fa-trash-alt"></i> Delete</button>
                    ` : ''}
                    ${container.id === 'trash-grid' ? `
                        <button class="card-action-btn restore"><i class="fas fa-undo"></i> Restore</button>
                        <button class="card-action-btn perm-delete"><i class="fas fa-times-circle"></i> Delete Forever</button>
                    ` : ''}
                </div>
            `;
            container.prepend(li);
        }
    };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value;
        renderAll(term);
    });

    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        if (!title && !content) return alert('Please enter a title or content.');
        
        const selectedColor = document.querySelector('input[name="note-color"]:checked').value;

        const note = {
            id: Date.now(),
            type: 'note',
            title, 
            content,
            colorCode: selectedColor, 
            createdAt: Date.now(),
            reminder: noteReminderInput.value || null,
            reminderFired: false
        };
        
        const notes = getStore('zenboard_notes');
        notes.push(note);
        setStore('zenboard_notes', notes);
        
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteReminderInput.value = '';
        document.querySelector('input[name="note-color"][value="white"]').checked = true;
        
        renderAll();
        showList('notes');
    });

    saveTaskBtn.addEventListener('click', () => {
        const text = taskDescInput.value.trim();
        if (!text) return alert('Please enter a task description.');

        const task = {
            id: Date.now(),
            type: 'task',
            text,
            completed: false,
            createdAt: Date.now(),
            reminder: taskReminderInput.value || null,
            reminderFired: false
        };

        const tasks = getStore('zenboard_tasks');
        tasks.push(task);
        setStore('zenboard_tasks', tasks);

        taskDescInput.value = '';
        taskReminderInput.value = '';

        renderAll();
        showList('tasks');
    });

    document.querySelector('.main-content').addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('[data-id]');
        if (!card) return; 

        const id = Number(card.dataset.id);
        const type = card.dataset.type; 

        if (target.classList.contains('task-checkbox')) {
            const tasks = getStore('zenboard_tasks');
            const updatedTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
            setStore('zenboard_tasks', updatedTasks);
            renderAll(searchInput.value); 
            return; 
        }

        if (!target.classList.contains('card-action-btn')) return;

        const sourceKey = `zenboard_${type}s`; 
        const archiveKey = 'zenboard_archive';
        const trashKey = 'zenboard_trash';

        let item;
        let sourceList;

        if (target.classList.contains('archive') || target.classList.contains('delete')) {
            sourceList = getStore(sourceKey);
            item = sourceList.find(i => i.id === id);
            setStore(sourceKey, sourceList.filter(i => i.id !== id));
        }
        else if (target.classList.contains('unarchive') || target.classList.contains('restore')) {
             const source = target.classList.contains('unarchive') ? archiveKey : trashKey;
            sourceList = getStore(source);
            item = sourceList.find(i => i.id === id);
            setStore(source, sourceList.filter(i => i.id !== id));
        }
        else if (target.classList.contains('perm-delete')) {
            const trash = getStore(trashKey);
            setStore(trashKey, trash.filter(i => i.id !== id));
            renderAll(searchInput.value);
            return;
        }

        if (!item) return; 

        if (target.classList.contains('archive')) {
            const archive = getStore(archiveKey);
            archive.push(item);
            setStore(archiveKey, archive);
        }
        else if (target.classList.contains('delete')) {
            const trash = getStore(trashKey);
            trash.push(item);
            setStore(trashKey, trash);
        }
        else if (target.classList.contains('unarchive') || target.classList.contains('restore')) {
            const dest = getStore(sourceKey); 
            dest.push(item);
            setStore(sourceKey, dest);
        }

        renderAll(searchInput.value);
    });

    const quotes = [
        "A good day starts with a good plan.",
        "The secret of getting ahead is getting started.",
        "Well begun is half done.",
        "Productivity is never an accident.",
        "You don't have to be great to start, but you have to start to be great."
    ];

    const loadProfile = () => {
        const name = localStorage.getItem('zenboard_username') || '';
        profileNameInput.value = name;
        
        if (name) {
            greetingText.textContent = `Hi ${name}, have a nice day!`;
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            quoteText.textContent = randomQuote;
        } else {
            greetingText.textContent = `Welcome to ZenBoard!`;
            quoteText.textContent = `Please set your name in the Profile section.`;
        }
    };

    profileSaveBtn.addEventListener('click', () => {
        const name = profileNameInput.value.trim();
        if (name) {
            localStorage.setItem('zenboard_username', name);
            loadProfile(); 
            alert('Name saved!');
            showView('notes'); 
        } else {
            alert('Please enter a name.');
        }
    });

    const checkReminders = () => {
        const now = new Date();
        const allStores = [
            { key: 'zenboard_notes', items: getStore('zenboard_notes') },
            { key: 'zenboard_tasks', items: getStore('zenboard_tasks') }
        ];

        allStores.forEach(store => {
            let storeUpdated = false;
            const updatedItems = store.items.map(item => {
                if (item.reminder && !item.reminderFired) {
                    const reminderTime = new Date(item.reminder);
                    if (now >= reminderTime) {
                        alert(`🔔 REMINDER 🔔\n\n${item.title || item.text}`);
                        storeUpdated = true;
                        return { ...item, reminderFired: true }; 
                    }
                }
                return item;
            });

            if (storeUpdated) {
                setStore(store.key, updatedItems);
                renderAll(searchInput.value); 
            }
        });
    };
    setInterval(checkReminders, 30000); 

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const dt = new Date(dateString);
        return dt.toLocaleDateString(undefined, { 
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const applyThemeFromStorage = () => {
        const dark = localStorage.getItem('zenboard_dark') === '1';
        darkModeToggle.checked = dark;
        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    };

    darkModeToggle.addEventListener('change', () => {
        const checked = darkModeToggle.checked;
        localStorage.setItem('zenboard_dark', checked ? '1' : '0');
        document.documentElement.setAttribute('data-theme', checked ? 'dark' : 'light');
    });

    applyThemeFromStorage();
    loadProfile();
    renderAll();
    checkReminders();
    showView('notes'); 

});
