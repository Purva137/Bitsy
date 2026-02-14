const habitsContainer = document.getElementById("habits");
const addHabitBtn = document.getElementById("addHabit");
const exportProgressBtn = document.getElementById("exportProgress");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("modal");
const habitNameInput = document.getElementById("habitName");
const createHabitBtn = document.getElementById("createHabitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const colorElements = document.querySelectorAll(".color");
const progressSwitch = document.getElementById("progressSwitch");
const modalTitle = document.getElementById("modalTitle");

const STORAGE_KEY = "bitsy_data";

let selectedColor = "#A8E6CF";
let showProgressValue = false;
let editingHabitId = null;
let currentHabitIndex = 0;
let habits = [];

function saveData() {
    const data = {
        habits,
        currentHabitIndex,
        darkMode: document.body.classList.contains("dark")
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const data = JSON.parse(raw);
            habits = (Array.isArray(data.habits) ? data.habits : []).map(migrateHabit);
            const maxIdx = Math.max(0, habits.length - 1);
            currentHabitIndex = Math.max(0, Math.min(data.currentHabitIndex ?? 0, maxIdx));
            if (data.darkMode) {
                document.body.classList.remove("light");
                document.body.classList.add("dark");
                themeToggle.textContent = "☀️";
            } else {
                document.body.classList.add("light");
                document.body.classList.remove("dark");
                themeToggle.textContent = "🌙";
            }
        } catch (_e) {
            initDefaults();
        }
    } else {
        const legacyHabits = localStorage.getItem("bitsyHabits");
        if (legacyHabits) {
            try {
                habits = JSON.parse(legacyHabits).map(migrateHabit);
                currentHabitIndex = 0;
                if (localStorage.getItem("bitsyTheme") === "dark") {
                    document.body.classList.remove("light");
                    document.body.classList.add("dark");
                    themeToggle.textContent = "☀️";
                } else {
                    document.body.classList.add("light");
                    themeToggle.textContent = "🌙";
                }
                saveData();
            } catch (_e) {
                initDefaults();
            }
        } else {
            initDefaults();
        }
    }
}

function initDefaults() {
    habits = [];
    currentHabitIndex = 0;
    document.body.classList.add("light");
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙";
}

const TOTAL_SQUARES = 90;

function migrateHabit(habit) {
    if (habit.totalSquares != null && habit.currentIndex != null) return habit;
    if (Array.isArray(habit.days)) {
        habit.totalSquares = TOTAL_SQUARES;
        habit.currentIndex = Math.min(habit.days.filter(Boolean).length, TOTAL_SQUARES);
        delete habit.days;
    }
    return habit;
}

loadData();

progressSwitch.addEventListener("click", () => {
    showProgressValue = !showProgressValue;
    progressSwitch.classList.toggle("active");
});

document.getElementById("themeToggle").onclick = function() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light", !document.body.classList.contains("dark"));
    this.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    saveData();
    renderHabit();
};

function createHabit(name, color, showProgress = false) {
    return {
        id: Date.now(),
        name,
        color,
        showProgress,
        totalSquares: TOTAL_SQUARES,
        currentIndex: 0
    };
}

function hexToRgba(hex, alpha) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return "rgba(91,111,147,0.7)";
    const r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function playClickSound() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "square";
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.04);
    } catch (_e) {}
}

function renderHabit() {
    const counterEl = document.getElementById("habitCounter");
    habitsContainer.innerHTML = "";

    if (exportProgressBtn) exportProgressBtn.style.display = habits.length > 0 ? "" : "none";
    if (habits.length === 0) {
        counterEl.textContent = "0 / 0";
        return;
    }

    currentHabitIndex = Math.max(0, Math.min(currentHabitIndex, habits.length - 1));
    counterEl.textContent = `${currentHabitIndex + 1} / ${habits.length}`;

    const habit = habits[currentHabitIndex];
    const card = document.createElement("div");
    card.className = "habit-card";

    card.innerHTML = `
    <div class="habit-title">
        <span class="habit-name">${habit.name}</span>
        <div class="habit-actions">
          <button class="edit-btn">✏️</button>
          <button class="delete-btn">🗑</button>
          <button class="settings-btn">⚙</button>
        </div>
    </div>
    <div class="grid"></div>
    <div class="progress"></div>
    `;

    const grid = card.querySelector(".grid");
    const progressText = card.querySelector(".progress");

    grid.style.setProperty("--habit-color", habit.color);

    const total = habit.totalSquares ?? TOTAL_SQUARES;
    const curIdx = Math.min(habit.currentIndex ?? 0, total);
    const isDark = document.body.classList.contains("dark");

    for (let i = 0; i < total; i++) {
        const pixel = document.createElement("div");
        pixel.className = "pixel";
        pixel.dataset.index = String(i);

        if (i < curIdx) {
            pixel.classList.add("completed");
            pixel.style.backgroundColor = habit.color;
            pixel.style.cursor = "default";
        } else if (i === curIdx) {
            pixel.classList.add("active-square");
            pixel.style.backgroundColor = isDark ? "rgba(255,255,255,0.08)" : "#bfb6a5";
            pixel.style.boxShadow = `0 0 6px ${hexToRgba(habit.color, 0.7)}`;
        } else {
            pixel.classList.add("locked");
            pixel.style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(191,182,165,0.5)";
            pixel.style.cursor = "default";
        }

        grid.appendChild(pixel);
    }

    grid.addEventListener("click", function onGridClick(e) {
        const pixel = e.target.closest(".pixel");
        if (!pixel || !pixel.classList.contains("active-square")) return;
        const idx = parseInt(pixel.dataset.index, 10);
        if (idx !== (habit.currentIndex ?? 0)) return;

        playClickSound();
        pixel.classList.remove("active-square");
        pixel.classList.add("completed", "square-unlock");
        pixel.style.backgroundColor = habit.color;
        pixel.style.boxShadow = "";
        pixel.style.cursor = "default";

        habit.currentIndex = idx + 1;

        if (habit.currentIndex >= total) {
            celebrate(habit);
            habit.currentIndex = 0;
            saveData();
            renderHabit();
            return;
        }

        const nextPixel = grid.querySelector(`[data-index="${habit.currentIndex}"]`);
        if (nextPixel) {
            nextPixel.classList.remove("locked");
            nextPixel.classList.add("active-square");
            nextPixel.style.backgroundColor = isDark ? "rgba(255,255,255,0.08)" : "#bfb6a5";
            nextPixel.style.boxShadow = `0 0 6px ${hexToRgba(habit.color, 0.7)}`;
            nextPixel.style.cursor = "pointer";
        }

        if (habit.showProgress) {
            const pct = Math.round((habit.currentIndex / total) * 100);
            progressText.textContent = `Day ${habit.currentIndex} / ${total} • ${pct}%`;
            progressText.style.marginTop = "10px";
            progressText.style.fontSize = "14px";
        }

        saveData();
    });

    if (habit.showProgress) {
        const pct = Math.round((curIdx / total) * 100);
        progressText.textContent = `Day ${curIdx} / ${total} • ${pct}%`;
        progressText.style.marginTop = "10px";
        progressText.style.fontSize = "14px";
    }

    const settingsBtn = card.querySelector(".settings-btn");
    settingsBtn.addEventListener("click", () => {
        habit.showProgress = !habit.showProgress;
        saveData();
        renderHabit();
    });

    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this habit?")) {
            habits = habits.filter(h => h.id !== habit.id);
            saveData();
            currentHabitIndex = Math.min(currentHabitIndex, Math.max(0, habits.length - 1));
            renderHabit();
        }
    });

    card.querySelector(".edit-btn").addEventListener("click", () => {
        editingHabitId = habit.id;

        modalTitle.textContent = "Edit Habit ✏️";
        habitNameInput.value = habit.name;
        showProgressValue = habit.showProgress;
        if (showProgressValue) {
            progressSwitch.classList.add("active");
        } else {
            progressSwitch.classList.remove("active");
        }
        selectedColor = habit.color;

        colorElements.forEach(c => {
            c.classList.toggle("selected", c.dataset.color === habit.color);
        });

        modal.classList.remove("hidden");
    });

    habitsContainer.appendChild(card);
}

function exportProgressAsImage() {
    if (typeof html2canvas !== "function" || habits.length === 0) return;

    const card = habitsContainer.querySelector(".habit-card");
    if (!card) return;

    const habit = habits[currentHabitIndex];
    const total = habit.totalSquares ?? TOTAL_SQUARES;
    const completed = habit.currentIndex ?? 0;
    const isDark = document.body.classList.contains("dark");

    const clone = card.cloneNode(true);
    const progressEl = clone.querySelector(".progress");
    if (progressEl) {
        const pct = Math.round((completed / total) * 100);
        progressEl.textContent = `Day ${completed} / ${total} • ${pct}%`;
        progressEl.style.marginTop = "10px";
        progressEl.style.fontSize = "14px";
    }

    const wrapper = document.createElement("div");
    wrapper.className = isDark ? "export-wrapper dark" : "export-wrapper";
    wrapper.style.cssText = "position:fixed;left:-9999px;top:0;padding:24px;";
    wrapper.style.background = isDark ? "#141b26" : "#e7e2d9";

    clone.style.marginBottom = "0";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    html2canvas(wrapper, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
    }).then((canvas) => {
        document.body.removeChild(wrapper);

        const name = (habit.name || "habit").replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 40) || "habit";
        const filename = `bitsy-${name}-progress.png`;

        canvas.toBlob((blob) => {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            a.click();
            URL.revokeObjectURL(a.href);
        }, "image/png");
    }).catch(() => {
        if (wrapper.parentNode) document.body.removeChild(wrapper);
    });
}

if (exportProgressBtn) {
    exportProgressBtn.addEventListener("click", exportProgressAsImage);
}

document.getElementById("prevHabit").onclick = () => {
    if (currentHabitIndex > 0) {
        currentHabitIndex--;
        saveData();
        renderHabit();
    }
};

document.getElementById("nextHabit").onclick = () => {
    if (currentHabitIndex < habits.length - 1) {
        currentHabitIndex++;
        saveData();
        renderHabit();
    }
};

addHabitBtn.addEventListener("click", () => {
    editingHabitId = null;
    modalTitle.textContent = "New Habit 🌱";
    habitNameInput.value = "";
    showProgressValue = false;
    progressSwitch.classList.remove("active");
    selectedColor = "#A8E6CF";
    colorElements.forEach(c => c.classList.toggle("selected", c.dataset.color === selectedColor));
    modal.classList.remove("hidden");
});

cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    habitNameInput.value = "";
    showProgressValue = false;
    progressSwitch.classList.remove("active");
});

colorElements.forEach(color => {
    color.addEventListener("click", () => {
        colorElements.forEach(c => c.classList.remove("selected"));
        color.classList.add("selected");
        selectedColor = color.dataset.color;
    });
});

createHabitBtn.addEventListener("click", () => {
    const name = habitNameInput.value.trim();
    if (!name) return;

    const wasEditing = !!editingHabitId;
    if (editingHabitId) {
        const habit = habits.find(h => h.id === editingHabitId);
        habit.name = name;
        habit.color = selectedColor;
        habit.showProgress = showProgressValue;
        editingHabitId = null;
        modalTitle.textContent = "New Habit 🌱";
    } else {
        habits.push(createHabit(name, selectedColor, showProgressValue));
    }

    saveData();
    if (!wasEditing) {
        currentHabitIndex = habits.length - 1;
    }
    renderHabit();

    modal.classList.add("hidden");
    habitNameInput.value = "";
    showProgressValue = false;
    progressSwitch.classList.remove("active");
});

renderHabit();

function celebrate(habit) {
    const overlay = document.createElement("div");
    overlay.className = "celebration";
    overlay.innerHTML = `
        <div class="celebration-box">
            <h2>🪴 3 Months Complete! Don't forget to reward yourself!</h2>
            <p>You built "${habit.name}" for 90 days! 🎉</p>
            <button id="closeCelebration">Start New Cycle</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeCelebration").addEventListener("click", () => {
        overlay.remove();
    });
}

// PWA: register service worker (relative path for GitHub Pages)
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
            .then((reg) => { if (reg.installing) console.log("Bitsy SW installing"); })
            .catch((err) => console.warn("SW registration failed:", err));
    });
}