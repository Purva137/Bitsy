const habitsContainer = document.getElementById("habits");
const addHabitBtn = document.getElementById("addHabit");
const themeToggle = document.getElementById("themeToggle");
const modal = document.getElementById("modal");
const habitNameInput = document.getElementById("habitName");
const createHabitBtn = document.getElementById("createHabitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const colorElements = document.querySelectorAll(".color");
const progressSwitch = document.getElementById("progressSwitch");
const modalTitle = document.getElementById("modalTitle");

let selectedColor = "#A8E6CF";
let showProgressValue = false;
let editingHabitId = null;
let currentHabitIndex = 0;
let habits = JSON.parse(localStorage.getItem("bitsyHabits")) || [];

if (localStorage.getItem("bitsyTheme") === "dark") {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
} else {
    document.body.classList.add("light");
}

// PWA install prompt (fallback when browser doesn't show install icon)
let deferredInstallPrompt = null;
const installBtn = document.getElementById("installBtn");

if (installBtn) {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        if (!window.matchMedia("(display-mode: standalone)").matches) {
            installBtn.style.display = "flex";
        }
    });

    installBtn.addEventListener("click", () => {
        if (!deferredInstallPrompt) return;
        deferredInstallPrompt.prompt();
        deferredInstallPrompt.userChoice.then((choice) => {
            if (choice.outcome === "accepted") installBtn.style.display = "none";
            deferredInstallPrompt = null;
        });
    });

    if (window.matchMedia("(display-mode: standalone)").matches) {
        installBtn.style.display = "none";
    }
}

progressSwitch.addEventListener("click", () => {
    showProgressValue = !showProgressValue;
    progressSwitch.classList.toggle("active");
});

document.getElementById("themeToggle").onclick = function() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light", !document.body.classList.contains("dark"));
    if (document.body.classList.contains("dark")) {
        localStorage.setItem("bitsyTheme", "dark");
    } else {
        localStorage.setItem("bitsyTheme", "light");
    }
    this.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
    renderHabit();
};

function saveHabits() {
    localStorage.setItem("bitsyHabits", JSON.stringify(habits));
}

function createHabit(name, color, showProgress = false) {
    return {
        id: Date.now(),
        name,
        color,
        showProgress,
        days: Array(90).fill(false)
    };
}

function renderHabit() {
    const counterEl = document.getElementById("habitCounter");
    habitsContainer.innerHTML = "";

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

    const isDark = document.body.classList.contains("dark");

    habit.days.forEach((filled, index) => {
        const pixel = document.createElement("div");
        pixel.className = "pixel";
        if (filled) {
            pixel.classList.add("active");
            pixel.style.backgroundColor = habit.color;
        } else {
            if (isDark) {
                pixel.style.backgroundColor = "rgba(255,255,255,0.08)";
            }
        }

        pixel.addEventListener("click", () => {
            habit.days[index] = !habit.days[index];

            const completed = habit.days.filter(d => d).length;

            if (completed === 90) {
                celebrate(habit);
                habit.days = Array(90).fill(false);
            }

            saveHabits();
            renderHabit();
        });

        grid.appendChild(pixel);
    });

    if (habit.showProgress) {
        const completed = habit.days.filter(d => d).length;
        const percent = Math.round((completed / 90) * 100);
        progressText.textContent = `Day ${completed} / 90 • ${percent}%`;
        progressText.style.marginTop = "10px";
        progressText.style.fontSize = "14px";
    }

    const settingsBtn = card.querySelector(".settings-btn");
    settingsBtn.addEventListener("click", () => {
        habit.showProgress = !habit.showProgress;
        saveHabits();
        renderHabit();
    });

    card.querySelector(".delete-btn").addEventListener("click", () => {
        if (confirm("Delete this habit?")) {
            habits = habits.filter(h => h.id !== habit.id);
            saveHabits();
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

document.getElementById("prevHabit").onclick = () => {
    if (currentHabitIndex > 0) {
        currentHabitIndex--;
        renderHabit();
    }
};

document.getElementById("nextHabit").onclick = () => {
    if (currentHabitIndex < habits.length - 1) {
        currentHabitIndex++;
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

    saveHabits();
    if (!editingHabitId) {
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