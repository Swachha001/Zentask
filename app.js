(function() {
  // ─── State ───
  let tasks = JSON.parse(localStorage.getItem('zt_tasks') || '[]');
  let currentFilter = 'all';
  let editingId = null;
  let focusTaskId = null;

  // ─── Date ───
  function updateDate() {
    document.getElementById('dateBadge').textContent =
      new Date().toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
  }
  updateDate();
  setInterval(updateDate, 60000);

  // ─── Theme ───
  let lightMode = false;
  function applySelectColors(bg, text, checkedBg) {
    const styleId = 'zt-select-theme';
    let tag = document.getElementById(styleId);
    if (!tag) { tag = document.createElement('style'); tag.id = styleId; document.head.appendChild(tag); }
    tag.textContent =
      'select.task-input { background-color:' + bg + ' !important; color:' + text + ' !important; }' +
      'select.task-input option { background-color:' + bg + '; color:' + text + '; }' +
      'select.task-input option:checked { background-color:' + checkedBg + '; color:#fff; }' +
      '.break-select { background-color:' + bg + ' !important; color:' + text + ' !important; }' +
      '.break-select option { background-color:' + bg + '; color:' + text + '; }' +
      '.break-select option:checked { background-color:' + checkedBg + '; color:#fff; }';
  }
  document.getElementById('themeBtn').addEventListener('click', function() {
    lightMode = !lightMode;
    const r = document.documentElement.style;
    if (lightMode) {
      r.setProperty('--bg-primary','#f0f0f8');
      r.setProperty('--bg-secondary','#e8e8f5');
      r.setProperty('--bg-card','rgba(0,0,0,0.04)');
      r.setProperty('--bg-card-hover','rgba(0,0,0,0.07)');
      r.setProperty('--border','rgba(0,0,0,0.1)');
      r.setProperty('--text-primary','#1a1a2e');
      r.setProperty('--text-secondary','rgba(26,26,46,0.65)');
      r.setProperty('--text-muted','rgba(26,26,46,0.35)');
      r.setProperty('color-scheme','light');
      applySelectColors('#f0f0f8', '#1a1a2e', '#8264ff');
      this.textContent = '🌙';
    } else {
      r.setProperty('--bg-primary','#0d0d1a');
      r.setProperty('--bg-secondary','#13131f');
      r.setProperty('--bg-card','rgba(255,255,255,0.04)');
      r.setProperty('--bg-card-hover','rgba(255,255,255,0.07)');
      r.setProperty('--border','rgba(255,255,255,0.08)');
      r.setProperty('--text-primary','#f0eeff');
      r.setProperty('--text-secondary','rgba(240,238,255,0.55)');
      r.setProperty('--text-muted','rgba(240,238,255,0.3)');
      r.setProperty('color-scheme','dark');
      applySelectColors('#1a1a2e', '#f0eeff', '#8264ff');
      this.textContent = '☀️';
    }
  });

  // ─── Utils ───
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtSec(s) {
    if (s < 60) return s + 's';
    const m = Math.floor(s/60), r = s%60;
    if (m < 60) return m + 'm ' + r + 's';
    return Math.floor(m/60) + 'h ' + (m%60) + 'm';
  }
  function saveTasks() { localStorage.setItem('zt_tasks', JSON.stringify(tasks)); }

  // ─── Task CRUD ───
  document.getElementById('addTaskBtn').addEventListener('click', addTask);
  document.getElementById('taskTitleInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTask();
  });

  function addTask() {
    const title = document.getElementById('taskTitleInput').value.trim();
    if (!title) { showToast('⚠️','Oops!','Please enter a task title.',''); return; }
    const task = {
      id: uid(),
      title,
      category: document.getElementById('taskCategoryInput').value,
      priority: document.getElementById('taskPriorityInput').value,
      note: '', completed: false,
      createdAt: Date.now(), timeSpent: 0, focusStart: null
    };
    tasks.unshift(task);
    saveTasks();
    document.getElementById('taskTitleInput').value = '';
    renderTasks();
    updateStats();
    showToast('✅','Task Added','"' + task.title + '" is ready!','success');
  }

  function toggleTask(id) {
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    if (!t.completed) {
      t.completed = true;
      if (t.focusStart) {
        t.timeSpent += Math.floor((Date.now() - t.focusStart) / 1000);
        t.focusStart = null;
        if (focusTaskId === id) clearFocus(false);
      }
      confettiBurst();
      saveHeat();
      showToast('🎉','Task Done!','"' + t.title + '" completed! Great work!','success');
    } else {
      t.completed = false;
      showToast('🔄','Reopened','"' + t.title + '" moved back to active.','info');
    }
    saveTasks(); renderTasks(); updateStats();
  }

  // Bind key methods to task clicks dynamically or through event delegation
  function deleteTask(id) {
    if (focusTaskId === id) clearFocus(false);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(); renderTasks(); updateStats();
    showToast('🗑️','Deleted','Task removed.','');
  }

  function focusTask(id) {
    const t = tasks.find(t => t.id === id);
    if (!t || t.completed) return;
    if (focusTaskId === id) { clearFocus(true); return; }
    if (focusTaskId) clearFocus(false);
    t.focusStart = Date.now();
    focusTaskId = id;
    document.getElementById('focusBannerText').textContent = 'Focusing: ' + t.title;
    document.getElementById('focusBanner').classList.add('show');
    saveTasks(); renderTasks();
    showToast('🎯','Focus Mode','Stay focused! Break reminder will alert you.','info');
  }

  function clearFocus(notify) {
    if (focusTaskId) {
      const t = tasks.find(t => t.id === focusTaskId);
      if (t && t.focusStart) {
        t.timeSpent += Math.floor((Date.now() - t.focusStart) / 1000);
        t.focusStart = null;
        saveTasks();
      }
    }
    focusTaskId = null;
    document.getElementById('focusBanner').classList.remove('show');
    renderTasks();
    if (notify) showToast('⏹️','Focus Ended','Session recorded.','info');
  }

  document.getElementById('focusStopBtn').addEventListener('click', function() { clearFocus(true); });

  // ─── Filter ───
  document.getElementById('filterTabs').addEventListener('click', function(e) {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });

  // ─── Render ───
  function getEffectiveTime(t) {
    let s = t.timeSpent;
    if (t.focusStart) s += Math.floor((Date.now() - t.focusStart) / 1000);
    return s;
  }

  const catLabel = { work:'💼 Work', personal:'🏠 Personal', health:'💪 Health', study:'📚 Study', other:'⚡ Other' };
  const catClass = { work:'tag-work', personal:'tag-personal', health:'tag-health', study:'tag-study', other:'tag-other' };

  function renderTasks() {
    const list = document.getElementById('taskList');
    let filtered = tasks;
    if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
    else if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
    else if (currentFilter === 'high') filtered = tasks.filter(t => t.priority === 'high');
    else if (['work','personal','health','study','other'].includes(currentFilter))
      filtered = tasks.filter(t => t.category === currentFilter);

    if (!filtered.length) {
      list.innerHTML = '<div class="empty-state"><div class="emoji">🌟</div><div>Nothing here — add a task above!</div></div>';
      return;
    }
    list.innerHTML = filtered.map(t => {
      const ts = getEffectiveTime(t);
      const isFocus = t.id === focusTaskId;
      return '<div class="task-item' + (t.completed ? ' completed' : '') + ' priority-' + t.priority + (isFocus ? ' active-task' : '') + '" id="ti-' + t.id + '">' +
        '<div class="task-check" data-action="toggle" data-id="' + t.id + '">' + (t.completed ? '✓' : '') + '</div>' +
        '<div class="task-body" data-action="focus" data-id="' + t.id + '">' +
          '<div class="task-title">' + esc(t.title) + (isFocus ? ' 🎯' : '') + '</div>' +
          '<div class="task-meta">' +
            '<span class="task-tag ' + (catClass[t.category]||'tag-other') + '">' + (catLabel[t.category]||'Other') + '</span>' +
            '<span class="priority-badge badge-' + t.priority + '">' + t.priority + '</span>' +
            (ts > 0 ? '<span class="task-time-spent" id="ts-' + t.id + '">⏱ ' + fmtSec(ts) + '</span>' : '<span class="task-time-spent" id="ts-' + t.id + '" style="display:none"></span>') +
          '</div>' +
          (t.note ? '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:5px;">' + esc(t.note) + '</div>' : '') +
        '</div>' +
        '<div class="task-actions">' +
          '<button class="task-btn focus-btn" data-action="focus" data-id="' + t.id + '" title="Focus">' + (isFocus ? '⏹' : '🎯') + '</button>' +
          '<button class="task-btn" data-action="edit" data-id="' + t.id + '" title="Edit">✏️</button>' +
          '<button class="task-btn danger" data-action="delete" data-id="' + t.id + '" title="Delete">🗑️</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  document.getElementById('taskList').addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    e.stopPropagation();
    const id = el.dataset.id;
    const action = el.dataset.action;
    if (action === 'toggle') toggleTask(id);
    else if (action === 'focus') focusTask(id);
    else if (action === 'edit') openEdit(id);
    else if (action === 'delete') deleteTask(id);
  });

  // Focus time ticker
  setInterval(function() {
    if (!focusTaskId) return;
    const t = tasks.find(t => t.id === focusTaskId);
    if (!t) return;
    const el = document.getElementById('ts-' + focusTaskId);
    if (el) { el.style.display = ''; el.textContent = '⏱ ' + fmtSec(getEffectiveTime(t)); }
  }, 1000);

  function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const active = tasks.filter(t => !t.completed).length;
    const high = tasks.filter(t => t.priority === 'high' && !t.completed).length;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statActive').textContent = active;
    document.getElementById('statHigh').textContent = high;
    const pct = total ? Math.round(done/total*100) : 0;
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
  }

  // ─── Edit Modal ───
  function openEdit(id) {
    editingId = id;
    const t = tasks.find(t => t.id === id);
    if (!t) return;
    document.getElementById('editTitle').value = t.title;
    document.getElementById('editCategory').value = t.category;
    document.getElementById('editPriority').value = t.priority;
    document.getElementById('editNote').value = t.note;
    document.getElementById('editModal').classList.add('show');
  }
  function closeEdit() { editingId = null; document.getElementById('editModal').classList.remove('show'); }
  document.getElementById('cancelEditBtn').addEventListener('click', closeEdit);
  document.getElementById('editModal').addEventListener('click', function(e) { if (e.target === this) closeEdit(); });
  document.getElementById('saveEditBtn').addEventListener('click', function() {
    if (!editingId) return;
    const t = tasks.find(t => t.id === editingId);
    const title = document.getElementById('editTitle').value.trim();
    if (!t || !title) return;
    t.title = title;
    t.category = document.getElementById('editCategory').value;
    t.priority = document.getElementById('editPriority').value;
    t.note = document.getElementById('editNote').value.trim();
    saveTasks(); renderTasks(); updateStats(); closeEdit();
    showToast('✅','Updated','Task updated successfully.','success');
  });

  // ─── Stopwatch ───
  let swRunning = false, swStart = 0, swElapsed = 0, swInterval = null, laps = [];

  document.getElementById('swStartBtn').addEventListener('click', swToggle);
  document.getElementById('swLapBtn').addEventListener('click', swLap);
  document.getElementById('swResetBtn').addEventListener('click', swReset);

  function swToggle() {
    if (swRunning) {
      swRunning = false; swElapsed += Date.now() - swStart;
      clearInterval(swInterval);
      document.getElementById('swStartBtn').textContent = '▶ Resume';
      document.getElementById('swStartBtn').className = 'sw-btn start';
      document.getElementById('swLapBtn').disabled = true;
    } else {
      swRunning = true; swStart = Date.now();
      swInterval = setInterval(swTick, 16);
      document.getElementById('swStartBtn').textContent = '⏸ Pause';
      document.getElementById('swStartBtn').className = 'sw-btn stop';
      document.getElementById('swLapBtn').disabled = false;
      document.getElementById('swLapsLabel').textContent = 'Running…';
    }
  }
  function swTick() {
    document.getElementById('swDisplay').textContent = fmtSw(swElapsed + Date.now() - swStart);
  }
  function swLap() {
    if (!swRunning) return;
    laps.push(swElapsed + Date.now() - swStart);
    renderLaps();
    document.getElementById('swLapsLabel').textContent = 'Lap ' + laps.length + ' recorded';
  }
  function swReset() {
    swRunning = false; clearInterval(swInterval);
    swElapsed = 0; laps = [];
    document.getElementById('swDisplay').textContent = '00:00.00';
    document.getElementById('swLapsLabel').textContent = 'Ready to start';
    document.getElementById('swStartBtn').textContent = '▶ Start';
    document.getElementById('swStartBtn').className = 'sw-btn start';
    document.getElementById('swLapBtn').disabled = true;
    document.getElementById('lapsList').innerHTML = '';
  }
  function fmtSw(ms) {
    const cs = Math.floor((ms%1000)/10), sec = Math.floor(ms/1000)%60, min = Math.floor(ms/60000);
    return pad(min) + ':' + pad(sec) + '.' + pad(cs);
  }
  function pad(n) { return String(n).padStart(2,'0'); }
  function renderLaps() {
    document.getElementById('lapsList').innerHTML = [...laps].reverse().map((t,ri) => {
      const n = laps.length - ri;
      const prev = ri < laps.length-1 ? laps[laps.length-ri-2] : 0;
      return '<div class="lap-item"><span class="lap-n">Lap ' + n + '</span><span>' + fmtSw(t) + '</span><span style="color:var(--text-muted)">+' + fmtSw(t - prev) + '</span></div>';
    }).join('');
  }

  // ─── Break Timer ───
  let breakRunning = false, breakTotal = 0, breakRemain = 0, breakInterval = null;
  const CIRC = 2 * Math.PI * 55;

  document.getElementById('breakToggleBtn').addEventListener('click', function() {
    breakRunning ? stopBreak() : startBreak();
  });
  function startBreak() {
    const mins = parseInt(document.getElementById('breakIntervalSel').value, 10);
    breakTotal = mins * 60; breakRemain = breakTotal; breakRunning = true;
    document.getElementById('breakToggleBtn').textContent = 'Stop';
    document.getElementById('breakToggleBtn').className = 'break-btn stop';
    document.getElementById('breakLabel').textContent = 'Focus session: ' + mins + ' min';
    breakInterval = setInterval(breakTick, 1000);
    breakTick();
  }
  function stopBreak() {
    breakRunning = false; clearInterval(breakInterval);
    document.getElementById('breakToggleBtn').textContent = 'Start';
    document.getElementById('breakToggleBtn').className = 'break-btn start';
    document.getElementById('breakLabel').textContent = 'Session stopped. Rest if needed!';
    document.getElementById('breakTimeText').textContent = '—';
    document.getElementById('ringFill').style.strokeDashoffset = '0';
  }
  function breakTick() {
    if (breakRemain <= 0) {
      stopBreak();
      document.getElementById('breakLabel').textContent = '⏰ Time for a break!';
      showBreakAlert(); return;
    }
    const ratio = 1 - breakRemain / breakTotal;
    document.getElementById('ringFill').style.strokeDashoffset = CIRC * (1 - ratio);
    const m = Math.floor(breakRemain/60), s = breakRemain%60;
    document.getElementById('breakTimeText').textContent = pad(m) + ':' + pad(s);
    if (breakRemain === 300) showToast('⏳','Almost Done','5 minutes left in your session!','info');
    breakRemain--;
  }
  function showBreakAlert() {
    showToast('🌿','Break Time!','You\'ve worked hard! Take a 5-min break. Stretch & hydrate! 💧','break', 8000);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ZenTask – Break Time! 🌿', { body: "You've completed your focus session. Time to take a break!" });
    }
  }

  // ─── Toast ───
  function showToast(icon, title, msg, type, duration) {
    duration = duration || 4000;
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast ' + (type||'');
    t.innerHTML = '<div class="toast-icon">' + icon + '</div><div class="toast-body"><div class="toast-title">' + title + '</div><div class="toast-msg">' + msg + '</div></div><button class="toast-close">×</button>';
    t.querySelector('.toast-close').addEventListener('click', function() { t.remove(); });
    c.appendChild(t);
    setTimeout(function() { t.style.cssText = 'opacity:0;transform:translateX(60px);transition:all .4s;'; }, duration);
    setTimeout(function() { t.remove(); }, duration + 400);
  }

  // ─── Confetti ───
  function confettiBurst() {
    const colors = ['#8264ff','#c084fc','#38bdf8','#34d399','#fbbf24','#f87171'];
    const w = document.getElementById('confettiWrap');
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.cssText = 'left:' + Math.random()*100 + '%;top:' + Math.random()*40 + '%;background:' + colors[Math.floor(Math.random()*colors.length)] + ';animation-delay:' + Math.random()*0.5 + 's;animation-duration:' + (0.8+Math.random()*0.8) + 's;';
      w.appendChild(p);
      setTimeout(function() { p.remove(); }, 2000);
    }
  }

  // ─── Heatmap ───
  function saveHeat() {
    const key = new Date().toDateString();
    const heat = JSON.parse(localStorage.getItem('zt_heat') || '{}');
    heat[key] = (heat[key] || 0) + 1;
    localStorage.setItem('zt_heat', JSON.stringify(heat));
    renderHeat();
  }
  function renderHeat() {
    const heat = JSON.parse(localStorage.getItem('zt_heat') || '{}');
    const g = document.getElementById('heatGrid');
    let html = '';
    for (let i = 27; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = d.toDateString(), c = heat[k] || 0;
      const lvl = c === 0 ? '' : c < 2 ? 'h1' : c < 4 ? 'h2' : 'h3';
      html += '<div class="heat-cell ' + lvl + '" title="' + k + ': ' + c + ' completed"></div>';
    }
    g.innerHTML = html;
  }

  // ─── Quotes ───
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
    { text: "Eat the frog. Do the hardest task first thing in the morning.", author: "Brian Tracy" },
    { text: "Energy, not time, is the fundamental currency of high performance.", author: "Jim Loehr" },
    { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  ];
  let quoteIdx = Math.floor(Math.random() * quotes.length);
  function showQuote() {
    document.getElementById('quoteText').textContent = '"' + quotes[quoteIdx].text + '"';
    document.getElementById('quoteAuthor').textContent = '— ' + quotes[quoteIdx].author;
  }
  document.getElementById('nextQuoteBtn').addEventListener('click', function() {
    quoteIdx = (quoteIdx + 1) % quotes.length;
    showQuote();
  });

  // ─── Notifications ───
  if ('Notification' in window && Notification.permission === 'default') {
    setTimeout(function() { Notification.requestPermission(); }, 2000);
  }

  // ─── Auto-save focus ───
  setInterval(function() { if (focusTaskId) saveTasks(); }, 30000);

  // ─── Init ───
  showQuote();
  renderTasks();
  updateStats();
  renderHeat();
  setTimeout(function() {
    showToast('🚀','Welcome to ZenTask','Click a task body to focus. Use break reminder to stay healthy!','info');
  }, 800);
})();
