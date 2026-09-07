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

STUDENTS.forEach((s, i) => (s.id = i));

let presentIds  = new Set(loadPresent());
let searchQuery = "";
let breezeIds   = new Set();
let breezeTimer = null;

function scheduleBreezeClear(){
  clearTimeout(breezeTimer);
  breezeTimer = setTimeout(() => breezeIds.clear(), 800);
}

const rosterEl       = document.getElementById("roster");
const emptyStateEl   = document.getElementById("emptyState");
const searchInput    = document.getElementById("searchInput");
const toastEl        = document.getElementById("toast");
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
  const dd   = String(d.getDate()).padStart(2, "0");
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function formatTime(d){
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12; if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}
const WEEKDAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function tickHeaderClock(){
  const now = new Date();
  const label = `${WEEKDAYS[now.getDay()]}, ${formatDate(now)} · ${formatTime(now)}`;
  const el = document.getElementById("todayLabel");
  if (el) el.textContent = label;
}
tickHeaderClock();
setInterval(tickHeaderClock, 30000);

/* ================================================================
   RENDERING
================================================================ */
function matchesSearch(s){
  if (!searchQuery) return true;
  const q = searchQuery.toLowerCase();
  return s.name.toLowerCase().includes(q) ||
         s.reg.toLowerCase().includes(q) ||
         s.roll.toLowerCase().includes(q);
}
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({
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
    const isPresent  = presentIds.has(s.id);
    const showBreeze = isPresent && breezeIds.has(s.id);
    const row = document.createElement("div");
    row.className = "row" + (isPresent ? " present" : "") + (showBreeze ? " breeze" : "");
    row.dataset.id = s.id;
    row.setAttribute("role", "button");
    row.tabIndex = 0;
    row.innerHTML = `
      <input type="checkbox" ${isPresent ? "checked" : ""} aria-label="Mark ${escapeHtml(s.name)} present" tabindex="-1">
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
  const total   = STUDENTS.length;
  const present = presentIds.size;
  document.getElementById("statTotal").textContent   = total;
  document.getElementById("statPresent").textContent = present;
  document.getElementById("statAbsent").textContent  = total - present;
  const pct = total ? Math.round((present / total) * 100) : 0;
  document.getElementById("progressFill").style.width = pct + "%";
  document.getElementById("progressPct").textContent  = pct + "%";
}

/* ================================================================
   EVENT HANDLERS (ATTENDANCE)
================================================================ */
function toggleStudent(id){
  if (presentIds.has(id)){
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
rosterEl.addEventListener("click", e => {
  const row = e.target.closest(".row");
  if (!row) return;
  toggleStudent(Number(row.dataset.id));
});
rosterEl.addEventListener("keydown", e => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const row = e.target.closest(".row");
  if (!row) return;
  e.preventDefault();
  toggleStudent(Number(row.dataset.id));
});
searchInput.addEventListener("input", e => {
  searchQuery = e.target.value.trim();
  renderRoster();
});
document.getElementById("selectAllBtn").addEventListener("click", () => {
  STUDENTS.filter(matchesSearch).forEach(s => {
    if (!presentIds.has(s.id)) breezeIds.add(s.id);
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
  outputPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  const copied = await copyToClipboard(lastSubmission.clip);
  showToast(copied ? "Attendance copied — date & time included ✅" : "Copy failed — copy manually below.");
  if (submitHint){
    submitHint.innerHTML = `Last submitted <kbd>${lastSubmission.timeStr}</kbd> · ${lastSubmission.count} present`;
    submitHint.classList.add("done");
  }
}

function launchConfetti(){
  const colors = ['#16834f', '#22a967', '#2563eb', '#c15d13', '#4dcc87', '#f09a59'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  for (let i = 0; i < 90; i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 1.3 + 's';
    piece.style.animationDelay = Math.random() * 0.3 + 's';
    piece.style.width  = 6 + Math.random() * 6 + 'px';
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
  document.getElementById("metaDate").textContent  = sub.dateStr;
  document.getElementById("metaTime").textContent  = sub.timeStr;
  document.getElementById("metaCount").textContent = `${sub.count} / ${STUDENTS.length}`;
  outputText.textContent = sub.clip;
}

async function copyToClipboard(text){
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch(e){
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
  if (!lastSubmission) return;
  const copied = await copyToClipboard(lastSubmission.clip);
  showToast(copied ? "Copied again ✅" : "Copy failed");
});
document.getElementById("exportBtn").addEventListener("click", () => {
  if (!lastSubmission) return;
  const blob = new Blob([lastSubmission.clip], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance-${lastSubmission.dateStr}-${lastSubmission.timeStr.replace(/[: ]/g, "")}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
document.getElementById("printBtn").addEventListener("click", () => window.print());

document.addEventListener("keydown", e => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter"){
    e.preventDefault();
    launchConfetti();
    submitAttendance();
  }
});

/* ================================================================
   SIMPLE CGPA TARGET CALCULATOR
   10 semesters · equal weight per semester
   Required Avg SGPA = (Target × 10 − Current × Passed) ÷ Remaining
================================================================ */
const TOTAL_SEMS = 10;
const CGPA_KEY   = "attendanceRegister.cgpaSimple.v1";

const cgpaModal   = document.getElementById("cgpaModal");
const cgpaCurrent = document.getElementById("cgpaCurrent");
const cgpaSems    = document.getElementById("cgpaSemesters");
const cgpaTarget  = document.getElementById("cgpaTarget");

const cgpaEls = {
  heroBox:  document.getElementById("cgpaHero"),
  heroNum:  document.getElementById("cgpaRequired"),
  heroLbl:  document.getElementById("cgpaRequiredLbl"),
  current:  document.getElementById("cCurrent"),
  target:   document.getElementById("cTarget"),
  done:     document.getElementById("cCompleted"),
  left:     document.getElementById("cRemaining"),
  status:   document.getElementById("cgpaStatus"),
  sentence: document.getElementById("cgpaSentence"),
  iTarget:  document.getElementById("iTarget"),
  iNeed:    document.getElementById("iNeed"),
  iMargin:  document.getElementById("iMargin")
};

/* ---- persisted state ---- */
const cgpaState = { current: "", sems: "4", target: "" };
try {
  const raw = localStorage.getItem(CGPA_KEY);
  if (raw) Object.assign(cgpaState, JSON.parse(raw));
} catch(e){}
function saveCgpaState(){
  try { localStorage.setItem(CGPA_KEY, JSON.stringify(cgpaState)); } catch(e){}
}

/* ---- helpers ---- */
const toNum  = v => { const n = parseFloat(v); return isFinite(n) ? n : null; };
const clamp  = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const fx     = n => (n == null || !isFinite(n) ? "—" : n.toFixed(2));
const setText = (el, t) => { el.textContent = t; };

let lastHeroText = "";
function paintHero(text, tone, label){
  setText(cgpaEls.heroNum, text);
  setText(cgpaEls.heroLbl, label);
  cgpaEls.heroBox.className = "cgpa-hero " + tone;
  if (text !== lastHeroText){
    cgpaEls.heroNum.classList.remove("pop");
    void cgpaEls.heroNum.offsetWidth;           /* restart animation */
    cgpaEls.heroNum.classList.add("pop");
    lastHeroText = text;
  }
}
function paintStatus(tone, text){
  cgpaEls.status.className = "cgpa-status " + tone;
  setText(cgpaEls.status, text);
}
function difficultyFor(req){
  if (req <= 7)  return ["tone-green", "Comfortable target — you have a good margin."];
  if (req <= 8)  return ["tone-blue",  "Achievable target — consistent performance should be enough."];
  if (req <= 9)  return ["tone-amber", "Challenging target — you'll need strong and consistent semesters."];
  if (req <= 10) return ["tone-amber", "Very challenging target — you'll need excellent performance."];
  return ["tone-red", "Target is mathematically impossible because the maximum SGPA is 10."];
}

/* ---- live calculation ---- */
function calcCGPA(){
  const cRaw = toNum(cgpaCurrent.value);
  const tRaw = toNum(cgpaTarget.value);
  const current = cRaw == null ? null : clamp(cRaw, 0, 10);
  const target  = tRaw == null ? null : clamp(tRaw, 0, 10);
  const passed  = clamp(parseInt(cgpaSems.value, 10) || 0, 0, TOTAL_SEMS);
  const remaining = TOTAL_SEMS - passed;

  /* analysis chips */
  setText(cgpaEls.current, fx(current));
  setText(cgpaEls.target,  fx(target));
  setText(cgpaEls.done,    `${passed} / ${TOTAL_SEMS}`);
  setText(cgpaEls.left,    remaining === 0 ? "None" : `${remaining} sem${remaining === 1 ? "" : "s"}`);
  setText(cgpaEls.iTarget, fx(target));

  /* missing input */
  if (current == null || target == null){
    paintHero("—", "tone-neutral", "Required average SGPA");
    paintStatus("tone-neutral", "Enter your CGPA details to see the plan.");
    setText(cgpaEls.sentence, "Fill in your current CGPA and target CGPA — the result updates live.");
    setText(cgpaEls.iNeed, "—");
    setText(cgpaEls.iMargin, "—");
    return;
  }

  /* target already met */
  if (current >= target){
    paintHero("✓", "tone-green", "Target already achieved");
    paintStatus("tone-green", "Target already achieved ✓");
    setText(cgpaEls.sentence,
      `Your current CGPA of ${fx(current)} already meets your target of ${fx(target)}. Nice work ✓`);
    setText(cgpaEls.iNeed, "Nothing more");
    setText(cgpaEls.iMargin, `+${fx(current - target)} above target`);
    return;
  }

  /* no semesters left */
  if (remaining === 0){
    paintHero("—", "tone-neutral", "No semesters remaining");
    paintStatus("tone-amber", "All semesters completed.");
    setText(cgpaEls.sentence, "Target cannot be changed because all semesters are completed.");
    setText(cgpaEls.iNeed, "—");
    setText(cgpaEls.iMargin, "—");
    return;
  }

  /* main formula */
  const required = (target * TOTAL_SEMS - current * passed) / remaining;
  const margin   = required - target;
  const [tone, msg] = difficultyFor(required);

  paintHero(fx(required), tone, "Required average SGPA");
  paintStatus(tone, msg);
  setText(cgpaEls.sentence,
    required > 10
      ? `To reach ${fx(target)} CGPA you would need an average SGPA of ${fx(required)} — above the maximum of 10.`
      : `To reach ${fx(target)} CGPA, you need to maintain an average SGPA of ${fx(required)} over your remaining ${remaining} semester${remaining === 1 ? "" : "s"}.`);
  setText(cgpaEls.iNeed, `${fx(required)} average`);
  setText(cgpaEls.iMargin, `${margin >= 0 ? "+" : ""}${fx(margin)} above target`);
}

/* ---- input events (live) ---- */
function onCgpaInput(){
  cgpaState.current = cgpaCurrent.value;
  cgpaState.target  = cgpaTarget.value;
  saveCgpaState();
  calcCGPA();
}
cgpaCurrent.addEventListener("input", onCgpaInput);
cgpaTarget.addEventListener("input", onCgpaInput);
cgpaSems.addEventListener("change", () => {
  cgpaState.sems = cgpaSems.value;
  saveCgpaState();
  calcCGPA();
});

/* clamp out-of-range typing on blur */
[cgpaCurrent, cgpaTarget].forEach(inp => {
  inp.addEventListener("blur", () => {
    const n = toNum(inp.value);
    if (n != null) inp.value = String(clamp(n, 0, 10));
    onCgpaInput();
  });
});

/* ---- open / close ---- */
document.getElementById("cgpaToggleBtn").addEventListener("click", () => {
  cgpaModal.classList.add("active");
  calcCGPA();
});
document.getElementById("closeCgpaBtn").addEventListener("click", () => cgpaModal.classList.remove("active"));
cgpaModal.addEventListener("click", e => { if (e.target === cgpaModal) cgpaModal.classList.remove("active"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") cgpaModal.classList.remove("active"); });

/* ---- init inputs from saved state ---- */
cgpaCurrent.value = cgpaState.current || "";
cgpaSems.value    = String(clamp(parseInt(cgpaState.sems, 10) || 0, 0, TOTAL_SEMS));
cgpaTarget.value  = cgpaState.target || "";
calcCGPA();

/* ================================================================
   INIT
================================================================ */
renderRoster();