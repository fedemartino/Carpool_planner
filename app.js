/**
 * Carpool Planner – app.js
 * Manages parents, children, and weekly carpool schedule generation.
 */

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  parents: [],   // { id, name, phone, capacity, days: string[] }
  children: [],  // { id, name, school, parentId }
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function saveState() {
  localStorage.setItem('carpoolPlanner', JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem('carpoolPlanner');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.parents = parsed.parents || [];
      state.children = parsed.children || [];
    }
  } catch {
    // ignore corrupt data
  }
}

function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Tab navigation ───────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });
}

// ─── Day-checkbox pill toggle ─────────────────────────────────────────────────

function initDayCheckboxes() {
  document.querySelectorAll('.day-checkbox').forEach(label => {
    label.addEventListener('click', () => {
      label.classList.toggle('selected');
      const cb = label.querySelector('input[type="checkbox"]');
      cb.checked = !cb.checked;
    });
  });
}

// ─── Parents ──────────────────────────────────────────────────────────────────

function renderParents() {
  const container = document.getElementById('parents-list');
  if (state.parents.length === 0) {
    container.innerHTML = '<p class="empty-msg">No parents added yet.</p>';
    return;
  }
  container.innerHTML = state.parents.map(p => `
    <div class="list-item" data-id="${p.id}">
      <div class="list-item-info">
        <strong>${escHtml(p.name)}</strong>
        <small>
          ${p.phone ? `📞 ${escHtml(p.phone)} &nbsp;|&nbsp; ` : ''}
          🚗 ${p.capacity} seat${p.capacity !== 1 ? 's' : ''} &nbsp;|&nbsp;
          📅 ${p.days.length ? p.days.join(', ') : 'No days set'}
        </small>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-danger" onclick="removeParent('${p.id}')">Remove</button>
      </div>
    </div>
  `).join('');
}

function updateChildParentSelect() {
  const select = document.getElementById('child-parent');
  const current = select.value;
  select.innerHTML = '<option value="">-- Select a parent --</option>' +
    state.parents.map(p => `<option value="${p.id}">${escHtml(p.name)}</option>`).join('');
  if (current) select.value = current;
}

function addParent(e) {
  e.preventDefault();
  const name = document.getElementById('parent-name').value.trim();
  const phone = document.getElementById('parent-phone').value.trim();
  const capacity = parseInt(document.getElementById('parent-capacity').value, 10);
  const days = Array.from(
    document.querySelectorAll('#parent-form .day-checkbox input:checked')
  ).map(cb => cb.value);

  if (!name) return showToast('Please enter a name.', 'error');
  if (!capacity || capacity < 1) return showToast('Please enter a valid seat count.', 'error');

  state.parents.push({ id: uid(), name, phone, capacity, days });
  saveState();
  renderParents();
  updateChildParentSelect();
  e.target.reset();

  // Reset day pills
  document.querySelectorAll('#parent-form .day-checkbox').forEach(l => {
    l.classList.remove('selected');
    l.querySelector('input').checked = false;
  });

  showToast(`${name} added successfully.`);
}

function removeParent(id) {
  const parent = state.parents.find(p => p.id === id);
  if (!parent) return;
  // Also remove their children
  const removed = state.children.filter(c => c.parentId === id).length;
  state.parents = state.parents.filter(p => p.id !== id);
  state.children = state.children.filter(c => c.parentId !== id);
  saveState();
  renderParents();
  renderChildren();
  updateChildParentSelect();
  showToast(`${parent.name} removed${removed ? ` (and ${removed} child${removed > 1 ? 'ren' : ''})` : ''}.`);
}

// ─── Children ─────────────────────────────────────────────────────────────────

function renderChildren() {
  const container = document.getElementById('children-list');
  if (state.children.length === 0) {
    container.innerHTML = '<p class="empty-msg">No children added yet.</p>';
    return;
  }
  container.innerHTML = state.children.map(c => {
    const parent = state.parents.find(p => p.id === c.parentId);
    return `
      <div class="list-item" data-id="${c.id}">
        <div class="list-item-info">
          <strong>${escHtml(c.name)}</strong>
          <small>
            🏫 ${escHtml(c.school)} &nbsp;|&nbsp;
            👤 ${parent ? escHtml(parent.name) : 'Unknown parent'}
          </small>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-danger" onclick="removeChild('${c.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

function addChild(e) {
  e.preventDefault();
  const name = document.getElementById('child-name').value.trim();
  const school = document.getElementById('child-school').value.trim();
  const parentId = document.getElementById('child-parent').value;

  if (!name) return showToast('Please enter the child\'s name.', 'error');
  if (!school) return showToast('Please enter the school.', 'error');
  if (!parentId) return showToast('Please select a parent.', 'error');

  state.children.push({ id: uid(), name, school, parentId });
  saveState();
  renderChildren();
  e.target.reset();
  showToast(`${name} added successfully.`);
}

function removeChild(id) {
  const child = state.children.find(c => c.id === id);
  if (!child) return;
  state.children = state.children.filter(c => c.id !== id);
  saveState();
  renderChildren();
  showToast(`${child.name} removed.`);
}

// ─── Schedule generation ──────────────────────────────────────────────────────

/**
 * Assigns a driver for each school day over the requested number of weeks.
 * Algorithm: for each day, pick the available parent who has driven the least
 * so far (round-robin with fairness). If nobody is available, the slot is empty.
 */
function generateSchedule() {
  if (state.parents.length === 0) {
    return showToast('Add at least one parent before generating a schedule.', 'error');
  }

  const weeks = parseInt(document.getElementById('schedule-weeks').value, 10) || 4;
  const driveCounts = {};
  state.parents.forEach(p => { driveCounts[p.id] = 0; });

  const schedule = []; // [{ week, day, driver | null }]

  for (let w = 1; w <= weeks; w++) {
    for (const day of DAYS) {
      const available = state.parents.filter(p => p.days.includes(day));
      let driver = null;
      if (available.length > 0) {
        // Pick the driver with the fewest drives so far (ties broken by order added)
        available.sort((a, b) => driveCounts[a.id] - driveCounts[b.id]);
        driver = available[0];
        driveCounts[driver.id]++;
      }
      schedule.push({ week: w, day, driver });
    }
  }

  renderSchedule(schedule, driveCounts, weeks);
}

function renderSchedule(schedule, driveCounts, weeks) {
  const tableContainer = document.getElementById('schedule-table-container');
  const summaryContainer = document.getElementById('summary-container');

  // Build table – one row per week, one column per day
  let html = '<div class="schedule-table-wrapper"><table class="schedule-table"><thead><tr><th>Week</th>';
  DAYS.forEach(d => { html += `<th>${d}</th>`; });
  html += '</tr></thead><tbody>';

  for (let w = 1; w <= weeks; w++) {
    html += `<tr><td><strong>Week ${w}</strong></td>`;
    DAYS.forEach(day => {
      const slot = schedule.find(s => s.week === w && s.day === day);
      if (slot && slot.driver) {
        html += `<td><div class="driver-cell"><span class="dot dot-driving"></span>${escHtml(slot.driver.name)}</div></td>`;
      } else {
        html += '<td><span class="no-driver">No driver</span></td>';
      }
    });
    html += '</tr>';
  }
  html += '</tbody></table></div>';
  tableContainer.innerHTML = html;

  // Build summary
  const summaryHtml = '<div class="summary-grid">' +
    state.parents.map(p => `
      <div class="summary-card">
        <div class="summary-name">${escHtml(p.name)}</div>
        <div class="summary-count">${driveCounts[p.id]}</div>
        <div class="summary-label">drive${driveCounts[p.id] !== 1 ? 's' : ''}</div>
      </div>
    `).join('') +
  '</div>';
  summaryContainer.innerHTML = summaryHtml;

  document.getElementById('schedule-output').style.display = 'flex';
  document.getElementById('schedule-output').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Security helper ──────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  // Toast container
  const toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);

  loadState();
  initTabs();
  initDayCheckboxes();

  document.getElementById('parent-form').addEventListener('submit', addParent);
  document.getElementById('child-form').addEventListener('submit', addChild);
  document.getElementById('generate-btn').addEventListener('click', generateSchedule);

  renderParents();
  renderChildren();
  updateChildParentSelect();
}

document.addEventListener('DOMContentLoaded', init);
