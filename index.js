/* ================================================================
   STUDENT DATA
   ================================================================ */
const STUDENTS = [
  { roll: "A1",  reg: "I25MA01", name: "PRITHVIRAJ SINGH" },
  { roll: "A4",  reg: "I25MA04", name: "SACHIN SHARMA" },
  { roll: "A5",  reg: "I25MA05", name: "KHUSHBU SADANI" },
  { roll: "A7",  reg: "I25MA07", name: "PRIYANSHI" },
  { roll: "A8",  reg: "I25MA08", name: "NITESH JANGID" },
  { roll: "A9",  reg: "I25MA09", name: "AMAN YADAV" },
  { roll: "A10", reg: "I25MA10", name: "VINEET LAMBA" },
  { roll: "A11", reg: "I25MA11", name: "RISHABH SHAH" },
  { roll: "A12", reg: "I25MA12", name: "SUNKARA HEMACHARAN" },
  { roll: "A13", reg: "I25MA13", name: "SINGH SATISH SATYENDRA" },
  { roll: "A14", reg: "I25MA14", name: "DUBEY ALOK MUKESHKUMAR" },
  { roll: "A15", reg: "I25MA15", name: "SAMARTH T K" },
  { roll: "A16", reg: "I25MA16", name: "ADITYA KUMAR SINHA" },
  { roll: "A17", reg: "I25MA17", name: "GAURI SHANKAR" },
  { roll: "A19", reg: "I25MA19", name: "MUSKAN CHAUHAN" },
  { roll: "A20", reg: "I25MA20", name: "JAYPRAKASH SAINI" },
  { roll: "A21", reg: "I25MA21", name: "PRAJAPAT MUKESH SUJARAM" },
  { roll: "A22", reg: "I25MA22", name: "ISHAAN HARSHAD SUKHTHANKER" },
  { roll: "A24", reg: "I25MA24", name: "SHELADIYA AKSH BHAVESHBHAI" },
  { roll: "A25", reg: "I25MA25", name: "MEET MANISHKUMAR PATEL" },
  { roll: "A26", reg: "I25MA26", name: "DEVANSH AGARWAL" },
  { roll: "A27", reg: "I25MA27", name: "NEEV RAVAL" },
  { roll: "A28", reg: "I25MA28", name: "VANSH SARAF" },
  { roll: "A29", reg: "I25MA29", name: "BHARAT SANKHLA" },
  { roll: "A30", reg: "I25MA30", name: "KUNAL R BHAIYA" },
  { roll: "A32", reg: "I25MA32", name: "UDYAN KUMAR SINGH" },
  { roll: "A33", reg: "I25MA33", name: "VISHAL KUMAR" },
  { roll: "A34", reg: "I25MA34", name: "ABDULLAH JAMAL" },
  { roll: "A35", reg: "I25MA35", name: "PRASANNAJEET CHOUDHARY" },
  { roll: "A36", reg: "I25MA36", name: "SACHIN VERMA" },
  { roll: "A38", reg: "I25MA38", name: "GAJANAND MEENA" }
];

/* ================================================================
   STATE & STORAGE (ATTENDANCE)
   ================================================================ */
const STORAGE_KEY = "attendanceRegister.present.v1";
const THEME_KEY   = "attendanceRegister.theme.v1";

STUDENTS.forEach((s, i) => s.id = i);

let presentIds  = new Set(loadPresent());
let searchQuery = "";
let breezeIds   = new Set();
let breezeTimer = null;

function scheduleBreezeClear(){
  clearTimeout(breezeTimer);
  breezeTimer = setTimeout(() => { breezeIds.clear(); }, 800);
}

const rosterEl     = document.getElementById("roster");
const emptyStateEl = document.getElementById("emptyState");
const searchInput  = document.getElementById("searchInput");
const toastEl      = document.getElementById("toast");
const visibleCountEl = document.getElementById("visibleCount");

function loadPresent(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch(e){ return []; }
}
function savePresent(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...presentIds])); } catch(e){}
}

/* ================================================================
   DATE / TIME
   ================================================================ */
function formatDate(d){
  const dd = String(d.getDate()).padStart(2,"0");
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function formatTime(d){
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2,"0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if(h === 0) h = 12;
  return `${String(h).padStart(2,"0")}:${m} ${ampm}`;
}
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function tickHeaderClock(){
  const now = new Date();
  const label = `${WEEKDAYS[now.getDay()]}, ${formatDate(now)} · ${formatTime(now)}`;
  const el = document.getElementById("todayLabel");
  if(el) el.textContent = label;
}
tickHeaderClock();
setInterval(tickHeaderClock, 30000);

/* ================================================================
   RENDERING
   ================================================================ */
function matchesSearch(s){
  if(!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return s.name.toLowerCase().includes(q) ||
         s.reg.toLowerCase().includes(q) ||
         s.roll.toLowerCase().includes(q);
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderRoster(){
  const visible = STUDENTS.filter(matchesSearch);
  rosterEl.innerHTML = "";
  emptyStateEl.style.display = visible.length ? "none" : "block";
  if (visibleCountEl) visibleCountEl.textContent = `${visible.length} student${visible.length === 1 ? "" : "s"}`;

  const frag = document.createDocumentFragment();
  visible.forEach(s => {
    const isPresent = presentIds.has(s.id);
    const showBreeze = isPresent && breezeIds.has(s.id);

    const row = document.createElement("div");
    row.className = "row" + (isPresent ? " present" : "") + (showBreeze ? " breeze" : "");
    row.dataset.id = s.id;
    row.setAttribute("role","button");
    row.tabIndex = 0;
    row.innerHTML = `
      <input type="checkbox" ${isPresent ? "checked" : ""} aria-label="Mark ${escapeHtml(s.name)} present">
      <span class="roll">${escapeHtml(s.roll)}</span>
      <span class="info">
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="reg">${escapeHtml(s.reg)}</div>
      </span>
      <span class="badge">${isPresent ? "Present" : "Absent"}</span>
    `;
    frag.appendChild(row);
  });
  rosterEl.appendChild(frag);
  updateStats();
}

function updateStats(){
  const total = STUDENTS.length;
  const present = presentIds.size;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statPresent").textContent = present;
  document.getElementById("statAbsent").textContent = total - present;
  const pct = total ? Math.round((present / total) * 100) : 0;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressPct").textContent = pct + "%";
}

/* ================================================================
   EVENT HANDLERS
   ================================================================ */
function toggleStudent(id){
  const wasPresent = presentIds.has(id);
  if(wasPresent){
    presentIds.delete(id);
    breezeIds.delete(id);
  } else {
    presentIds.add(id);
    breezeIds.add(id);
  }
  savePresent();
  scheduleBreezeClear();
  renderRoster();
}

rosterEl.addEventListener("click", (e) => {
  const row = e.target.closest(".row");
  if(!row) return;
  toggleStudent(Number(row.dataset.id));
});

rosterEl.addEventListener("keydown", (e) => {
  if(e.key !== "Enter" && e.key !== " ") return;
  const row = e.target.closest(".row");
  if(!row) return;
  e.preventDefault();
  toggleStudent(Number(row.dataset.id));
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim();
  renderRoster();
});

document.getElementById("selectAllBtn").addEventListener("click", () => {
  STUDENTS.filter(matchesSearch).forEach(s => {
    if(!presentIds.has(s.id)) breezeIds.add(s.id);
    presentIds.add(s.id);
  });
  savePresent();
  scheduleBreezeClear();
  renderRoster();
  showToast("All visible students marked present");
});

document.getElementById("clearAllBtn").addEventListener("click", () => {
  presentIds.clear();
  breezeIds.clear();
  savePresent();
  renderRoster();
  showToast("Attendance cleared");
});

let toastTimer = null;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2400);
}

/* ================================================================
   THEME
   ================================================================ */
function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").textContent = theme === "dark" ? "☀️" : "🌙";
  try { localStorage.setItem(THEME_KEY, theme); } catch(e){}
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  applyTheme(current === "dark" ? "light" : "dark");
});
(function initTheme(){
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch(e){}
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
})();

/* ================================================================
   SUBMIT / COPY / EXPORT / PRINT
   ================================================================ */
const outputPanel = document.getElementById("outputPanel");
const outputText  = document.getElementById("outputText");
const submitHint  = document.querySelector(".submit-bar .hint");

function regToNumber(reg){
  const match = reg.match(/(\d+)\s*$/);
  return match ? String(parseInt(match[1], 10)) : reg;
}

let lastSubmission = null;

function buildSubmissionText(now, presentStudents){
  const numbers = presentStudents.map(s => regToNumber(s.reg)).join(",");
  const dateStr = formatDate(now);
  const timeStr = formatTime(now);
  const clip = `Attendance — ${dateStr}, ${timeStr}\nPresent:\n${numbers || "(none selected)"}`;
  return { dateStr, timeStr, numbers, count: presentStudents.length, clip };
}

async function submitAttendance(){
  const now = new Date();
  const presentStudents = STUDENTS.filter(s => presentIds.has(s.id));
  lastSubmission = buildSubmissionText(now, presentStudents);
  renderOutput(lastSubmission);
  outputPanel.classList.add("show");
  outputPanel.scrollIntoView({ behavior:"smooth", block:"nearest" });
  const copied = await copyToClipboard(lastSubmission.clip);
  showToast(copied ? "Attendance copied — date & time included ✅" : "Copy failed — copy manually below.");
  if(submitHint){
    submitHint.innerHTML = `Last submitted <kbd>${lastSubmission.timeStr}</kbd> · ${lastSubmission.count} present`;
    submitHint.classList.add("done");
  }
}

function launchConfetti() {
  const colors = ['#16834f', '#22a967', '#2563eb', '#c15d13', '#4dcc87', '#f09a59'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const pieceCount = 90;
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.3 + 's';
    piece.style.animationDelay = Math.random() * 0.3 + 's';
    piece.style.width = 6 + Math.random() * 6 + 'px';
    piece.style.height = 10 + Math.random() * 8 + 'px';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 3800);
}

document.getElementById("submitBtn").addEventListener("click", () => {
  launchConfetti();
  submitAttendance();
});

function renderOutput(sub){
  document.getElementById("metaDate").textContent = sub.dateStr;
  document.getElementById("metaTime").textContent = sub.timeStr;
  document.getElementById("metaCount").textContent = `${sub.count} / ${STUDENTS.length}`;
  outputText.textContent = sub.clip;
}

async function copyToClipboard(text){
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch(e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      return true;
    } catch(e2){ return false; }
  }
}

document.getElementById("copyAgainBtn").addEventListener("click", async () => {
  if(!lastSubmission) return;
  const copied = await copyToClipboard(lastSubmission.clip);
  showToast(copied ? "Copied again ✅" : "Copy failed");
});

document.getElementById("exportBtn").addEventListener("click", () => {
  if(!lastSubmission) return;
  const blob = new Blob([lastSubmission.clip], { type:"text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${lastSubmission.dateStr}-${lastSubmission.timeStr.replace(/[: ]/g,"")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

document.getElementById("printBtn").addEventListener("click", () => window.print());

document.addEventListener("keydown", (e) => {
  if((e.ctrlKey || e.metaKey) && e.key === "Enter"){
    e.preventDefault();
    launchConfetti();
    submitAttendance();
  }
});

/* ================================================================
   CGPA TRACKER LOGIC
   ================================================================ */
const curriculum = {
    1: { subjects: [{ name: 'Foundation Course in Mathematics-I', code: 'MA101', credits: 4 }, { name: 'Calculus-I', code: 'MA103', credits: 4 }, { name: 'Computer Programming using C/C++', code: 'MA131', credits: 4 }, { name: 'English and Professional Communication', code: 'HS110', credits: 4 }, { name: 'Fundamentals of Physics', code: 'PH113', credits: 4 }] },
    2: { subjects: [{ name: 'Foundation Course in Mathematics-II', code: 'MA102', credits: 4 }, { name: 'Calculus-II', code: 'MA104', credits: 4 }, { name: 'Python Programming', code: 'MA132', credits: 4 }, { name: 'Fundamentals of Physics-II', code: 'PH106', credits: 4 }, { name: 'Chemistry', code: 'CY112', credits: 4 }, { name: 'Indian Value System and Social Consciousness', code: 'HS120', credits: 2 }] },
    3: { subjects: [{ name: 'Element of Analysis', code: 'MA201', credits: 4 }, { name: 'Analytical Geometry', code: 'MA203', credits: 4 }, { name: 'Discrete Mathematical Structure', code: 'MA205', credits: 4 }, { name: 'Data Structure', code: 'MA231', credits: 4 }, { name: 'English and Professional Communication-II', code: 'HS201', credits: 4 }] },
    4: { subjects: [{ name: 'Numerical Analysis', code: 'MA202', credits: 4 }, { name: 'Linear Algebra', code: 'MA204', credits: 4 }, { name: 'Elementary Number Theory', code: 'MA232', credits: 4 }, { name: 'Computational Life Science', code: 'MA233', credits: 4 }, { name: 'Computer Networks', code: 'CS208', credits: 4 }] },
    5: { subjects: [{ name: 'Ordinary Differential Equations', code: 'MA301', credits: 4 }, { name: 'Mechanics', code: 'MA303', credits: 4 }, { name: 'Probability and Statistics-I', code: 'MA331', credits: 4 }, { name: 'Analysis of Algorithms', code: 'MA332', credits: 4 }, { name: 'Elective', code: 'MA3AA', credits: 4, isElective: true }] },
    6: { subjects: [{ name: 'Complex Analysis', code: 'MA302', credits: 4 }, { name: 'Continuum Mechanics', code: 'MA304', credits: 4 }, { name: 'Metric Space', code: 'MA333', credits: 4 }, { name: 'Fundamentals of Artificial Intelligence', code: 'CS300', credits: 4 }, { name: 'Elective', code: 'MA3BB', credits: 4, isElective: true }] },
    7: { subjects: [{ name: 'Topology', code: 'MA401', credits: 4 }, { name: 'Abstract Algebra', code: 'MA403', credits: 4 }, { name: 'Fluid Dynamics', code: 'MA405', credits: 4 }, { name: 'Optimization Techniques', code: 'MA431', credits: 4 }, { name: 'Elective', code: 'MA4AA', credits: 4, isElective: true }] },
    8: { subjects: [{ name: 'Functional Analysis', code: 'MA402', credits: 4 }, { name: 'Higher Transcendental Functions', code: 'MA404', credits: 4 }, { name: 'Partial Differential Equations', code: 'MA406', credits: 4 }, { name: 'Calculus of Variations & Integral Equations', code: 'MA432', credits: 4 }, { name: 'Elective', code: 'MA4CC', credits: 4, isElective: true }] },
    9: { subjects: [{ name: 'Measure Theory and Integration', code: 'MA501', credits: 4 }, { name: 'Advanced Mathematical Modelling and Simulation', code: 'MA503', credits: 4 }, { name: 'Probability and Statistics-II', code: 'MA531', credits: 4 }, { name: 'Communication and Technical Writing Skill', code: 'HS501', credits: 4 }, { name: 'Elective', code: 'MA5AA', credits: 4, isElective: true }] },
    10: { subjects: [{ name: 'Dissertation', code: 'MAP10', credits: 20 }] }
};

const electives = [
    { name: 'Advance Mathematical Methods-I', code: 'MA351' }, { name: 'Stochastic Differential Equations', code: 'MA352' },
    { name: 'Mathematical Modelling', code: 'MA353' }, { name: 'Integral and Wavelet Transform', code: 'MA354' },
    { name: 'Mathematical Finance', code: 'MA355' }, { name: 'Fuzzy Set Theory', code: 'MA356' },
    { name: 'Block Chain Technology', code: 'CS360' }, { name: 'Sobolev Space', code: 'MA451' },
    { name: 'Advance Mathematical Methods-II', code: 'MA452' }, { name: 'Natural Language Processing', code: 'CS461' },
    { name: 'Data Analytics', code: 'MA453' }, { name: 'Multi Objective Optimization', code: 'MA454' },
    { name: 'Evolutionary Algorithms', code: 'MA455' }, { name: 'Advance Operations Research', code: 'MA551' },
    { name: 'Fluid Dynamics in Porous Media', code: 'MA552' }, { name: 'Advanced Numerical Analysis', code: 'MA553' },
    { name: 'Linear Operator and Approximation Theory', code: 'MA554' }
];

const gradeSystem = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };

let cgpaData = { grades: {}, electives: {}, target: 0 };
const CGPA_STORAGE_KEY = 'attendanceRegister.cgpa.v1';

function loadCGPAData() {
    const saved = localStorage.getItem(CGPA_STORAGE_KEY);
    if (saved) cgpaData = JSON.parse(saved);
}

function saveCGPAData() {
    localStorage.setItem(CGPA_STORAGE_KEY, JSON.stringify(cgpaData));
}

// Modal Handlers
const cgpaModal = document.getElementById('cgpaModal');
document.getElementById('cgpaToggleBtn').addEventListener('click', () => {
    loadCGPAData();
    renderCGPA();
    cgpaModal.classList.add('active');
});
document.getElementById('closeCgpaBtn').addEventListener('click', () => cgpaModal.classList.remove('active'));
cgpaModal.addEventListener('click', (e) => { if(e.target === cgpaModal) cgpaModal.classList.remove('active'); });

function renderCGPA() {
    renderSemesters();
    renderWhatIf();
    calculateCGPA();
    document.getElementById('targetCGPA').value = cgpaData.target || '';
    calculateTarget();
}

function renderSemesters() {
    const container = document.getElementById('semestersContainer');
    container.innerHTML = '';

    for (let sem = 1; sem <= 10; sem++) {
        const semData = curriculum[sem];
        const totalCredits = semData.subjects.reduce((sum, s) => sum + s.credits, 0);
        
        const card = document.createElement('div');
        card.className = 'sem-card';
        card.innerHTML = `
            <div class="sem-header" onclick="this.nextElementSibling.classList.toggle('active')">
                <div class="sem-title">Semester ${sem}</div>
                <div class="sem-meta">${totalCredits} Credits</div>
            </div>
            <div class="sem-body" id="sem${sem}Body">
                ${semData.subjects.map((subject, idx) => renderSubjectRow(sem, idx, subject)).join('')}
                <div class="sgpa-display">
                    <div class="sgpa-val" id="sgpa${sem}">0.00</div>
                    <div class="sgpa-lbl">Semester GPA</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function renderSubjectRow(sem, idx, subject) {
    const key = `${sem}_${idx}`;
    const grade = cgpaData.grades[key] || '';
    
    let electiveSelect = '';
    if (subject.isElective) {
        const selectedElective = cgpaData.electives[key] || '';
        electiveSelect = `
            <select class="cgpa-select" onchange="window.selectElective(${sem}, ${idx}, this.value)" style="max-width: 130px; font-weight: normal;">
                <option value="">Elective...</option>
                ${electives.map(e => `<option value="${e.code}" ${selectedElective === e.code ? 'selected' : ''}>${e.code}</option>`).join('')}
            </select>
        `;
    }

    return `
        <div class="subj-row">
            <div class="subj-info">
                <div class="subj-name">${subject.name}</div>
                <div class="subj-code">${subject.code} • ${subject.credits} Credits</div>
            </div>
            <div class="subj-selects">
                ${electiveSelect}
                <select class="cgpa-select" onchange="window.updateGrade(${sem}, ${idx}, this.value)">
                    <option value="">Grade</option>
                    ${Object.entries(gradeSystem).map(([g, p]) => `<option value="${g}" ${grade === g ? 'selected' : ''}>${g} (${p})</option>`).join('')}
                </select>
            </div>
        </div>
    `;
}

window.updateGrade = function(sem, idx, grade) {
    const key = `${sem}_${idx}`;
    if (grade) cgpaData.grades[key] = grade;
    else delete cgpaData.grades[key];
    saveCGPAData();
    calculateCGPA();
};

window.selectElective = function(sem, idx, code) {
    const key = `${sem}_${idx}`;
    if (code) cgpaData.electives[key] = code;
    else delete cgpaData.electives[key];
    saveCGPAData();
};

function calculateCGPA() {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let completedSemesters = 0;

    for (let sem = 1; sem <= 10; sem++) {
        const semData = curriculum[sem];
        let semGradePoints = 0;
        let semCredits = 0;
        let allGraded = true;

        semData.subjects.forEach((subject, idx) => {
            const key = `${sem}_${idx}`;
            const grade = cgpaData.grades[key];
            
            if (grade) {
                const points = gradeSystem[grade];
                semGradePoints += points * subject.credits;
                semCredits += subject.credits;
            } else {
                allGraded = false;
            }
        });

        if (semCredits > 0) {
            const sgpa = semGradePoints / semCredits;
            document.getElementById(`sgpa${sem}`).textContent = sgpa.toFixed(2);
            totalGradePoints += semGradePoints;
            totalCredits += semCredits;
            if (allGraded) completedSemesters++;
        } else {
            document.getElementById(`sgpa${sem}`).textContent = '0.00';
        }
    }

    const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    document.getElementById('currentCGPA').textContent = cgpa.toFixed(2);
    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('semestersCompleted').textContent = `${completedSemesters}/10`;
    calculateTarget();
}

// Target Logic
document.getElementById('targetCGPA').addEventListener('input', (e) => {
    cgpaData.target = parseFloat(e.target.value);
    saveCGPAData();
    calculateTarget();
});

function calculateTarget() {
    const target = cgpaData.target;
    const result = document.getElementById('targetResult');
    
    if (!target || target <= 0) {
        result.classList.remove('show');
        return;
    }
    result.classList.add('show');

    let totalGradePoints = 0, totalCredits = 0, remainingCredits = 0;
    for (let sem = 1; sem <= 10; sem++) {
        curriculum[sem].subjects.forEach((subj, idx) => {
            const grade = cgpaData.grades[`${sem}_${idx}`];
            if (grade) {
                totalGradePoints += gradeSystem[grade] * subj.credits;
                totalCredits += subj.credits;
            } else {
                remainingCredits += subj.credits;
            }
        });
    }

    const currentCGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    
    if (currentCGPA >= target && remainingCredits === 0) {
        result.innerHTML = `<span style="color: var(--green)">✓ Target achieved!</span>`;
        result.style.background = 'var(--green-tint)';
    } else if (remainingCredits === 0) {
        result.innerHTML = `<span style="color: var(--amber)">Target missed. No remaining credits.</span>`;
        result.style.background = 'var(--amber-tint)';
    } else {
        const requiredPoints = (target * (totalCredits + remainingCredits)) - totalGradePoints;
        const requiredAverage = requiredPoints / remainingCredits;
        
        if (requiredAverage > 10) {
            result.innerHTML = `<span style="color: var(--amber)">Not achievable. Required average: ${requiredAverage.toFixed(2)} (max 10)</span>`;
            result.style.background = 'var(--amber-tint)';
        } else {
            result.innerHTML = `To achieve <strong>${target.toFixed(2)}</strong> overall, you need an average of <strong>${requiredAverage.toFixed(2)}</strong> in your remaining ${remainingCredits} credits.`;
            result.style.background = 'var(--paper-card)';
        }
    }
}

// What-If Calculator
function renderWhatIf() {
    const container = document.getElementById('whatifContainer');
    container.innerHTML = '';
    for (let sem = 5; sem <= 10; sem++) {
        container.innerHTML += `
            <div class="whatif-item">
                <label>Sem ${sem}</label>
                <input type="number" placeholder="SGPA" step="0.01" min="0" max="10" id="whatif${sem}" oninput="calculateWhatIf()">
            </div>
        `;
    }
}

window.calculateWhatIf = function() {
    let totalGradePoints = 0, totalCredits = 0;
    for (let sem = 1; sem <= 10; sem++) {
        curriculum[sem].subjects.forEach((subj, idx) => {
            const grade = cgpaData.grades[`${sem}_${idx}`];
            if (grade) {
                totalGradePoints += gradeSystem[grade] * subj.credits;
                totalCredits += subj.credits;
            }
        });
    }

    let projectedPoints = 0, projectedCredits = 0;
    for (let sem = 5; sem <= 10; sem++) {
        const input = document.getElementById(`whatif${sem}`);
        const sgpa = parseFloat(input.value);
        if (sgpa && sgpa > 0) {
            const semCredits = curriculum[sem].subjects.reduce((sum, s) => sum + s.credits, 0);
            projectedPoints += sgpa * semCredits;
            projectedCredits += semCredits;
        }
    }

    const result = document.getElementById('whatifResult');
    if (projectedCredits > 0) {
        const projectedCGPA = (totalGradePoints + projectedPoints) / (totalCredits + projectedCredits);
        result.innerHTML = `Projected CGPA: <strong>${projectedCGPA.toFixed(2)}</strong>`;
        result.classList.add('show');
    } else {
        result.classList.remove('show');
    }
};

document.getElementById('resetCGPABtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all CGPA grades and predictions?')) {
        cgpaData = { grades: {}, electives: {}, target: 0 };
        saveCGPAData();
        renderCGPA();
    }
});

/* ================================================================
   INIT
   ================================================================ */
renderRoster();