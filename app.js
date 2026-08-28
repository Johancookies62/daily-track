const habits = [
  { id: "strength", title: "Strength training", target: "FULL WORKOUT OR 10-MINUTE MINIMUM" },
  { id: "protein", title: "Protein / planned meals", target: "FOLLOW YOUR DAILY MEAL TARGET" },
  { id: "deep-work", title: "Deep Work", target: "ONE 50 TO 90 MINUTE FOCUS BLOCK" },
  { id: "key-priority", title: "One Key Priority", target: "Complete One Important Task" },
  { id: "coding", title: "Coding / technical learning", target: "20 MINUTES MINIMUM" },
  { id: "sleep", title: "Sleep routine", target: "START WIND-DOWN AT YOUR TARGET TIME" }
];

const habitList = document.getElementById("habit-list");
const completedCount = document.getElementById("completed-count");
const habitCount = document.getElementById("habit-count");
const progressPercent = document.getElementById("progress-percent");
const progressRing = document.querySelector(".progress-ring");
const weeklyScore = document.getElementById("weekly-score");
const resetDayButton = document.getElementById("reset-day");
const clock = document.getElementById("clock");
const todayDate = document.getElementById("today-date");
const timerDisplay = document.getElementById("timer-display");
const timerButton = document.getElementById("timer-button");
const timerChoices = document.querySelectorAll(".timer-choice");
const ideaNote = document.getElementById("idea-note");
const saveNoteButton = document.getElementById("save-note");
const noteStatus = document.getElementById("note-status");

let selectedMinutes = 50;
let secondsRemaining = selectedMinutes * 60;
let timerInterval = null;

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getHabitStorageKey(date = new Date()) {
  return `bwg-habits-${getLocalDateKey(date)}`;
}

function loadHabitState(date = new Date()) {
  try {
    return JSON.parse(localStorage.getItem(getHabitStorageKey(date))) || {};
  } catch (error) {
    console.error("Could not load habit data:", error);
    return {};
  }
}

function saveHabitState(state, date = new Date()) {
  localStorage.setItem(getHabitStorageKey(date), JSON.stringify(state));
}

function getCompletedCount(date = new Date()) {
  const state = loadHabitState(date);
  return habits.filter((habit) => Boolean(state[habit.id])).length;
}

function renderHabits() {
  const state = loadHabitState();
  habitList.innerHTML = "";

  habits.forEach((habit) => {
    const completed = Boolean(state[habit.id]);
    const row = document.createElement("article");

    row.className = completed ? "habit-row completed" : "habit-row";
    row.innerHTML = `
      <span class="habit-indicator" aria-hidden="true"></span>
      <div>
        <p class="habit-title">${habit.title}</p>
        <p class="habit-target">${habit.target}</p>
      </div>
      <span class="toggle-label">${completed ? "DONE" : "OFF"}</span>
      <button
        class="toggle ${completed ? "is-on" : ""}"
        type="button"
        aria-label="Toggle ${habit.title}"
        aria-pressed="${completed}"
      ></button>
    `;

    row.querySelector(".toggle").addEventListener("click", () => {
      const currentState = loadHabitState();
      currentState[habit.id] = !currentState[habit.id];
      saveHabitState(currentState);
      renderHabits();
      renderWeeklyHistory();
      renderWeeklyGoals();
    });

    habitList.appendChild(row);
  });

  updateProgress();
}

function updateProgress() {
  const completed = getCompletedCount();
  const percent = Math.round((completed / habits.length) * 100);

  completedCount.textContent = completed;
  habitCount.textContent = habits.length;
  progressPercent.textContent = `${percent}%`;
  weeklyScore.textContent = `TODAY: ${completed} / ${habits.length}`;
  progressRing.style.setProperty("--progress", `${percent}%`);
}

function resetToday() {
  if (!window.confirm("Reset all of today's habits?")) return;

  localStorage.removeItem(getHabitStorageKey());
  renderHabits();
  renderWeeklyHistory();
  renderWeeklyGoals();
}

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  todayDate.textContent = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(secondsRemaining);
}

function selectTimer(minutes) {
  if (timerInterval !== null) return;

  selectedMinutes = minutes;
  secondsRemaining = minutes * 60;
  timerChoices.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.minutes) === minutes);
  });
  updateTimerDisplay();
}

function startOrPauseTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerButton.textContent = "RESUME FOCUS";
    return;
  }

  timerButton.textContent = "PAUSE FOCUS";
  timerInterval = setInterval(() => {
    secondsRemaining -= 1;
    updateTimerDisplay();

    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      timerButton.textContent = "START FOCUS";
      window.alert("Focus session complete. Good work.");
      secondsRemaining = selectedMinutes * 60;
      updateTimerDisplay();
    }
  }, 1000);
}

function loadNote() {
  ideaNote.value = localStorage.getItem("bwg-idea-note") || "";
}

function saveNote() {
  localStorage.setItem("bwg-idea-note", ideaNote.value);
  noteStatus.textContent = "SAVED";
  setTimeout(() => {
    noteStatus.textContent = "";
  }, 1800);
}

function getLastSevenDays() {
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    days.push(date);
  }
  return days;
}

function getCurrentStreak() {
  let streak = 0;
  const date = new Date();
  date.setHours(12, 0, 0, 0);

  if (getCompletedCount(date) === 0) {
    date.setDate(date.getDate() - 1);
  }

  while (getCompletedCount(date) > 0) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function createHistorySection() {
  const habitsSection = document.querySelector(".habits-section");
  if (!habitsSection || document.getElementById("weekly-history")) return;

  const section = document.createElement("section");
  section.id = "weekly-history";
  section.className = "weekly-history";
  habitsSection.insertAdjacentElement("afterend", section);
}

function renderWeeklyHistory() {
  createHistorySection();

  const historySection = document.getElementById("weekly-history");
  const days = getLastSevenDays();
  const streak = getCurrentStreak();
  const totalPossible = habits.length * days.length;
  const totalCompleted = days.reduce((total, day) => total + getCompletedCount(day), 0);
  const consistency = Math.round((totalCompleted / totalPossible) * 100);

  const headers = days.map((day) => {
    const weekday = day.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
    const dayNumber = day.getDate();
    const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
    return `<div class="history-day ${todayClass}"><span>${weekday}</span><strong>${dayNumber}</strong></div>`;
  }).join("");

  const rows = habits.map((habit) => {
    const cells = days.map((day) => {
      const completed = Boolean(loadHabitState(day)[habit.id]);
      const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
      return `<div class="history-cell ${completed ? "done" : ""} ${todayClass}" aria-label="${habit.title}: ${completed ? "done" : "not done"}"></div>`;
    }).join("");

    return `
      <div class="history-row">
        <div class="history-label">${habit.title}</div>
        <div class="history-cells">${cells}</div>
      </div>
    `;
  }).join("");

  historySection.innerHTML = `
    <div class="history-header">
      <div>
        <p class="eyebrow">LAST 7 DAYS</p>
        <h2>CONSISTENCY</h2>
      </div>
      <div class="history-metrics">
        <span><strong>${streak}</strong> DAY STREAK</span>
        <span><strong>${consistency}%</strong> WEEKLY</span>
      </div>
    </div>
    <div class="history-table">
      <div class="history-table-head">
        <div class="history-label">HABIT</div>
        <div class="history-cells">${headers}</div>
      </div>
      ${rows}
    </div>
    <p class="history-note">A filled circle means completed. Keep the system alive; do not chase perfection.</p>
  `;
}

resetDayButton.addEventListener("click", resetToday);
timerChoices.forEach((button) => {
  button.addEventListener("click", () => selectTimer(Number(button.dataset.minutes)));
});
timerButton.addEventListener("click", startOrPauseTimer);
saveNoteButton.addEventListener("click", saveNote);

updateClock();
setInterval(updateClock, 1000);
renderHabits();
renderWeeklyHistory();
updateTimerDisplay();
loadNote();
const weatherIcon = document.getElementById("weather-icon");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherHumidity = document.getElementById("weather-humidity");
const weatherRainRisk = document.getElementById("weather-rain-risk");
const weatherStatus = document.getElementById("weather-status");
const weatherUpdated = document.getElementById("weather-updated");
const refreshWeatherButton = document.getElementById("refresh-weather");

const FALLBACK_LOCATION = {
  name: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456
};

function getWeatherDetails(weatherCode) {
  const weatherCodes = {
    0: { label: "Clear sky", icon: "☀" },
    1: { label: "Mostly clear", icon: "☀" },
    2: { label: "Partly cloudy", icon: "⛅" },
    3: { label: "Overcast", icon: "☁" },
    45: { label: "Fog", icon: "☁" },
    48: { label: "Fog", icon: "☁" },
    51: { label: "Light drizzle", icon: "☂" },
    53: { label: "Drizzle", icon: "☂" },
    55: { label: "Heavy drizzle", icon: "☂" },
    61: { label: "Light rain", icon: "☂" },
    63: { label: "Rain", icon: "☂" },
    65: { label: "Heavy rain", icon: "☂" },
    80: { label: "Rain showers", icon: "☂" },
    81: { label: "Rain showers", icon: "☂" },
    82: { label: "Heavy showers", icon: "☂" },
    95: { label: "Thunderstorm", icon: "⚡" },
    96: { label: "Thunderstorm", icon: "⚡" },
    99: { label: "Thunderstorm", icon: "⚡" }
  };

  return weatherCodes[weatherCode] || {
    label: "Unknown",
    icon: "☁"
  };
}

function getCurrentHourRainRisk(hourlyData, currentTime) {
  if (!hourlyData || !hourlyData.time || !hourlyData.precipitation_probability) {
    return 0;
  }

  const currentHour = currentTime.slice(0, 13);

  const hourIndex = hourlyData.time.findIndex((time) => {
    return time.slice(0, 13) === currentHour;
  });

  if (hourIndex === -1) {
    return hourlyData.precipitation_probability[0] || 0;
  }

  return hourlyData.precipitation_probability[hourIndex] || 0;
}

function setWeatherLoadingState(message) {
  refreshWeatherButton.disabled = true;
  refreshWeatherButton.textContent = "LOADING";

  weatherIcon.textContent = "...";
  weatherTemperature.textContent = "--°";
  weatherHumidity.textContent = "--%";
  weatherRainRisk.textContent = "--%";
  weatherStatus.textContent = "Loading";
  weatherUpdated.textContent = message;
}

function finishWeatherLoading() {
  refreshWeatherButton.disabled = false;
  refreshWeatherButton.textContent = "REFRESH";
}

async function loadWeather(latitude, longitude, locationName, isFallback = false) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code` +
    `&hourly=precipitation_probability` +
    `&timezone=auto` +
    `&forecast_days=1`;

  try {
    const response = await fetch(weatherUrl);

    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const data = await response.json();

    const temperature = Math.round(data.current.temperature_2m);
    const humidity = Math.round(data.current.relative_humidity_2m);
    const weather = getWeatherDetails(data.current.weather_code);

    const rainRisk = getCurrentHourRainRisk(
      data.hourly,
      data.current.time
    );

    weatherIcon.textContent = weather.icon;
    weatherTemperature.textContent = `${temperature}°`;
    weatherHumidity.textContent = `${humidity}%`;
    weatherRainRisk.textContent = `${rainRisk}%`;
    weatherStatus.textContent = weather.label;

    const timeZone = data.timezone || "Asia/Jakarta";

    const updatedTime = new Date().toLocaleTimeString("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

    if (isFallback) {
      weatherUpdated.textContent =
        `LOCATION UNAVAILABLE · SHOWING ${locationName.toUpperCase()} · ${updatedTime}`;
    } else {
      weatherUpdated.textContent =
        `${locationName.toUpperCase()} · UPDATED ${updatedTime}`;
    }
  } catch (error) {
    console.error("Weather error:", error);

    weatherIcon.textContent = "!";
    weatherTemperature.textContent = "--°";
    weatherHumidity.textContent = "--%";
    weatherRainRisk.textContent = "--%";
    weatherStatus.textContent = "Offline";
    weatherUpdated.textContent = "Could not load weather. Check internet.";
  } finally {
    finishWeatherLoading();
  }
}

function loadFallbackWeather(reason) {
  console.warn("Using Jakarta weather fallback:", reason);

  loadWeather(
    FALLBACK_LOCATION.latitude,
    FALLBACK_LOCATION.longitude,
    FALLBACK_LOCATION.name,
    true
  );
}

function loadLocationWeather() {
  setWeatherLoadingState("Finding your current location...");

  if (!navigator.geolocation) {
    loadFallbackWeather("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      loadWeather(latitude, longitude, "Your location");
    },
    (error) => {
      let reason = "Location permission was not granted.";

      if (error.code === error.POSITION_UNAVAILABLE) {
        reason = "Your location is unavailable.";
      }

      if (error.code === error.TIMEOUT) {
        reason = "Location request timed out.";
      }

      loadFallbackWeather(reason);
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

refreshWeatherButton.addEventListener("click", loadLocationWeather);
loadLocationWeather();
const weeklyGoals = [
  { habitId: "strength", label: "Strength training", target: 3 },
  { habitId: "deep-work", label: "Deep Work", target: 5 },
  { habitId: "coding", label: "Coding / learning", target: 3 },
  { habitId: "sleep", label: "Sleep routine", target: 5 }
];

function getStartOfWeek(date = new Date()) {
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);

  const day = start.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysSinceMonday);

  return start;
}

function getWeekDays(date = new Date()) {
  const monday = getStartOfWeek(date);
  const weekDays = [];

  for (let index = 0; index < 7; index += 1) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    weekDays.push(day);
  }

  return weekDays;
}

function getWeekRangeLabel() {
  const weekDays = getWeekDays();
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  const firstMonth = firstDay.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
  const lastMonth = lastDay.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();

  if (firstMonth === lastMonth) {
    return `${firstDay.getDate()}–${lastDay.getDate()} ${lastMonth}`;
  }

  return `${firstDay.getDate()} ${firstMonth}–${lastDay.getDate()} ${lastMonth}`;
}

function getWeeklyHabitCount(habitId) {
  return getWeekDays().reduce((total, day) => {
    const state = loadHabitState(day);
    return total + (state[habitId] ? 1 : 0);
  }, 0);
}

function createWeeklyGoalsSection() {
  if (document.getElementById("weekly-goals")) return;

  const weeklyHistory = document.getElementById("weekly-history");
  const section = document.createElement("section");

  section.id = "weekly-goals";
  section.className = "weekly-goals";

  if (weeklyHistory) {
    weeklyHistory.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".habits-section").insertAdjacentElement("afterend", section);
  }
}

function renderWeeklyGoals() {
  createWeeklyGoalsSection();

  const weeklyGoalsSection = document.getElementById("weekly-goals");
  let goalsOnTrack = 0;

  const goalRows = weeklyGoals.map((goal) => {
    const completed = getWeeklyHabitCount(goal.habitId);
    const percent = Math.min(100, Math.round((completed / goal.target) * 100));
    const onTrack = completed >= goal.target;

    if (onTrack) goalsOnTrack += 1;

    return `
      <article class="goal-row ${onTrack ? "goal-complete" : ""}">
        <div class="goal-info">
          <p class="goal-title">${goal.label}</p>
          <p class="goal-detail">${onTrack ? "TARGET REACHED" : "WEEKLY TARGET"}</p>
        </div>

        <div class="goal-progress-area">
          <div class="goal-count">${completed} <span>/ ${goal.target}</span></div>
          <div class="goal-track" aria-label="${goal.label}: ${completed} of ${goal.target}">
            <span class="goal-fill" style="width: ${percent}%"></span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  weeklyGoalsSection.innerHTML = `
    <div class="goals-header">
      <div>
        <p class="eyebrow">WEEKLY DIRECTION</p>
        <h2>WEEKLY TARGETS</h2>
      </div>

      <div class="goals-summary">
        <span>WEEK OF ${getWeekRangeLabel()}</span>
        <strong>${goalsOnTrack} / ${weeklyGoals.length} ON TRACK</strong>
      </div>
    </div>

    <div class="goal-list">
      ${goalRows}
    </div>

    <p class="goals-note">Each habit counts once per day. The goal is consistent progress, not a perfect week.</p>
  `;
}

renderWeeklyGoals();
const checkInStoragePrefix = "daily-track-checkin-";

function getCheckInStorageKey(date = new Date()) {
  return `${checkInStoragePrefix}${getLocalDateKey(date)}`;
}

function loadCheckIn(date = new Date()) {
  try {
    return JSON.parse(localStorage.getItem(getCheckInStorageKey(date))) || {
      mood: 0,
      energy: 0,
      sleepHours: "",
      note: ""
    };
  } catch (error) {
    console.error("Could not load daily check-in:", error);
    return {
      mood: 0,
      energy: 0,
      sleepHours: "",
      note: ""
    };
  }
}

function saveCheckIn(checkIn) {
  localStorage.setItem(getCheckInStorageKey(), JSON.stringify(checkIn));
}

function createCheckInSection() {
  if (document.getElementById("daily-checkin")) return;

  const weeklyGoalsSection = document.getElementById("weekly-goals");
  const section = document.createElement("section");

  section.id = "daily-checkin";
  section.className = "daily-checkin";

  if (weeklyGoalsSection) {
    weeklyGoalsSection.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".habits-section").insertAdjacentElement("afterend", section);
  }
}

function scoreButtons(field, selectedScore) {
  let buttons = "";

  for (let score = 1; score <= 5; score += 1) {
    const selectedClass = score <= selectedScore ? "selected" : "";
    const description = field === "mood" ? "Mood" : "Energy";

    buttons += `
      <button
        class="score-button ${selectedClass}"
        type="button"
        data-field="${field}"
        data-score="${score}"
        aria-label="Set ${description} to ${score} out of 5"
        aria-pressed="${score === selectedScore}"
      >${score}</button>
    `;
  }

  return buttons;
}

function getCheckInDateLabel() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).toUpperCase();
}

function renderCheckIn() {
  createCheckInSection();

  const section = document.getElementById("daily-checkin");
  const checkIn = loadCheckIn();

  section.innerHTML = `
    <div class="checkin-header">
      <div>
        <p class="eyebrow">PERSONAL STATUS</p>
        <h2>DAILY CHECK-IN</h2>
      </div>
      <span class="checkin-date">${getCheckInDateLabel()}</span>
    </div>

    <div class="checkin-body">
      <div class="checkin-score-row">
        <div class="checkin-label">
          <p>MOOD</p>
          <span>HOW DO YOU FEEL?</span>
        </div>
        <div class="score-buttons" id="mood-scores">
          ${scoreButtons("mood", checkIn.mood)}
        </div>
        <strong class="score-value" id="mood-value">${checkIn.mood || "-"} <span>/ 5</span></strong>
      </div>

      <div class="checkin-score-row">
        <div class="checkin-label">
          <p>ENERGY</p>
          <span>USABLE MENTAL / PHYSICAL ENERGY</span>
        </div>
        <div class="score-buttons" id="energy-scores">
          ${scoreButtons("energy", checkIn.energy)}
        </div>
        <strong class="score-value" id="energy-value">${checkIn.energy || "-"} <span>/ 5</span></strong>
      </div>

      <div class="checkin-sleep-row">
        <div class="checkin-label">
          <p>SLEEP</p>
          <span>LAST NIGHT'S SLEEP DURATION</span>
        </div>
        <label class="sleep-input-wrap">
          <input
            id="sleep-hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            placeholder="0.0"
            value="${checkIn.sleepHours}"
            inputmode="decimal"
          >
          <span>HOURS</span>
        </label>
      </div>

      <div class="checkin-note-row">
        <label class="checkin-note-label" for="checkin-note">TODAY NOTE</label>
        <textarea
          id="checkin-note"
          placeholder="Main win, blocker, thought, or observation..."
        >${checkIn.note}</textarea>
      </div>
    </div>

    <div class="checkin-footer">
      <p>Simple self-observation, not a medical assessment.</p>
      <div>
        <span id="checkin-status" class="checkin-status"></span>
        <button id="save-checkin" class="secondary-button" type="button">SAVE CHECK-IN</button>
      </div>
    </div>
  `;

  section.querySelectorAll(".score-button").forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.field;
      const score = Number(button.dataset.score);
      const currentCheckIn = loadCheckIn();

      currentCheckIn[field] = score;
      saveCheckIn(currentCheckIn);
      renderCheckIn();
    });
  });

  section.querySelector("#save-checkin").addEventListener("click", () => {
    const currentCheckIn = loadCheckIn();
    const sleepInput = section.querySelector("#sleep-hours");
    const noteInput = section.querySelector("#checkin-note");
    const status = section.querySelector("#checkin-status");

    const sleepValue = sleepInput.value.trim();
    const sleepHours = Number(sleepValue);

    if (sleepValue !== "" && (Number.isNaN(sleepHours) || sleepHours < 0 || sleepHours > 24)) {
      status.textContent = "ENTER 0 TO 24 HOURS";
      return;
    }

    currentCheckIn.sleepHours = sleepValue;
    currentCheckIn.note = noteInput.value.trim();

    saveCheckIn(currentCheckIn);
    status.textContent = "SAVED";

    setTimeout(() => {
      status.textContent = "";
    }, 1800);
  });
}

renderCheckIn();
const dailyTrackSettingsKey = "daily-track-settings-v1";

const defaultDailyTrackSettings = {
  enabledHabits: {
    strength: true,
    protein: true,
    "deep-work": true,
    "bwg-priority": true,
    coding: true,
    sleep: true
  },
  weeklyTargets: {
    strength: 3,
    "deep-work": 5,
    coding: 3,
    sleep: 5
  }
};

function getDailyTrackSettings() {
  try {
    const savedSettings = JSON.parse(localStorage.getItem(dailyTrackSettingsKey));

    if (!savedSettings) {
      return structuredClone(defaultDailyTrackSettings);
    }

    return {
      enabledHabits: {
        ...defaultDailyTrackSettings.enabledHabits,
        ...savedSettings.enabledHabits
      },
      weeklyTargets: {
        ...defaultDailyTrackSettings.weeklyTargets,
        ...savedSettings.weeklyTargets
      }
    };
  } catch (error) {
    console.error("Could not load Daily Track settings:", error);
    return structuredClone(defaultDailyTrackSettings);
  }
}

function saveDailyTrackSettings(settings) {
  localStorage.setItem(dailyTrackSettingsKey, JSON.stringify(settings));
}

function getEnabledHabits() {
  const settings = getDailyTrackSettings();
  return habits.filter((habit) => settings.enabledHabits[habit.id] !== false);
}

function getEnabledWeeklyGoals() {
  const settings = getDailyTrackSettings();

  return weeklyGoals
    .filter((goal) => settings.enabledHabits[goal.habitId] !== false)
    .map((goal) => ({
      ...goal,
      target: Number(settings.weeklyTargets[goal.habitId]) || goal.target
    }));
}

function createSettingsSection() {
  if (document.getElementById("daily-track-settings")) return;

  const checkInSection = document.getElementById("daily-checkin");
  const section = document.createElement("section");

  section.id = "daily-track-settings";
  section.className = "daily-track-settings";

  if (checkInSection) {
    checkInSection.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function renderSettings() {
  createSettingsSection();

  const section = document.getElementById("daily-track-settings");
  const settings = getDailyTrackSettings();

  const habitRows = habits.map((habit) => {
    const enabled = settings.enabledHabits[habit.id] !== false;
    const isWeeklyGoal = weeklyGoals.some((goal) => goal.habitId === habit.id);
    const weeklyTarget = settings.weeklyTargets[habit.id] || "";

    return `
      <article class="settings-row ${enabled ? "" : "settings-row-disabled"}">
        <div class="settings-habit-info">
          <p>${habit.title}</p>
          <span>${habit.target}</span>
        </div>

        ${isWeeklyGoal ? `
          <label class="settings-target-wrap">
            <span>WEEKLY TARGET</span>
            <input
              class="weekly-target-input"
              type="number"
              min="1"
              max="7"
              step="1"
              data-habit-id="${habit.id}"
              value="${weeklyTarget}"
              ${enabled ? "" : "disabled"}
            >
          </label>
        ` : `
          <span class="no-weekly-target">DAILY ONLY</span>
        `}

        <button
          class="settings-toggle ${enabled ? "is-on" : ""}"
          type="button"
          data-habit-id="${habit.id}"
          aria-label="${enabled ? "Disable" : "Enable"} ${habit.title}"
          aria-pressed="${enabled}"
        ></button>
      </article>
    `;
  }).join("");

  section.innerHTML = `
    <div class="settings-header">
      <div>
        <p class="eyebrow">PERSONALIZE DAILY TRACK</p>
        <h2>SETTINGS</h2>
      </div>
      <button id="reset-settings" class="settings-reset" type="button">RESTORE DEFAULTS</button>
    </div>

    <div class="settings-intro">
      Turn habits on or off and set weekly targets. Disabled habits are hidden from Daily Track, but their saved history is kept safely.
    </div>

    <div class="settings-list">
      ${habitRows}
    </div>

    <p class="settings-note">Changes save automatically on this device. Habit names stay fixed in V6 so your existing history remains clean.</p>
  `;

  section.querySelectorAll(".settings-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const habitId = button.dataset.habitId;
      const updatedSettings = getDailyTrackSettings();

      updatedSettings.enabledHabits[habitId] = !updatedSettings.enabledHabits[habitId];
      saveDailyTrackSettings(updatedSettings);
      refreshDailyTrackAfterSettingsChange();
    });
  });

  section.querySelectorAll(".weekly-target-input").forEach((input) => {
    input.addEventListener("change", () => {
      const target = Number(input.value);
      const habitId = input.dataset.habitId;

      if (!Number.isInteger(target) || target < 1 || target > 7) {
        input.value = getDailyTrackSettings().weeklyTargets[habitId] || 1;
        return;
      }

      const updatedSettings = getDailyTrackSettings();
      updatedSettings.weeklyTargets[habitId] = target;
      saveDailyTrackSettings(updatedSettings);
      refreshDailyTrackAfterSettingsChange();
    });
  });

  section.querySelector("#reset-settings").addEventListener("click", () => {
    if (!window.confirm("Restore all Daily Track habit and weekly-target settings to defaults?")) return;

    localStorage.removeItem(dailyTrackSettingsKey);
    refreshDailyTrackAfterSettingsChange();
  });
}

function refreshDailyTrackAfterSettingsChange() {
  renderHabits();
  renderWeeklyHistory();
  renderWeeklyGoals();
  renderSettings();
}

/* Override existing renderHabits so it displays only enabled habits. */
const renderHabitsBeforeSettings = renderHabits;
renderHabits = function () {
  const state = loadHabitState();
  const enabledHabits = getEnabledHabits();

  habitList.innerHTML = "";

  enabledHabits.forEach((habit) => {
    const completed = Boolean(state[habit.id]);
    const row = document.createElement("article");

    row.className = completed ? "habit-row completed" : "habit-row";
    row.innerHTML = `
      <span class="habit-indicator" aria-hidden="true"></span>
      <div>
        <p class="habit-title">${habit.title}</p>
        <p class="habit-target">${habit.target}</p>
      </div>
      <span class="toggle-label">${completed ? "DONE" : "OFF"}</span>
      <button
        class="toggle ${completed ? "is-on" : ""}"
        type="button"
        aria-label="Toggle ${habit.title}"
        aria-pressed="${completed}"
      ></button>
    `;

    row.querySelector(".toggle").addEventListener("click", () => {
      const currentState = loadHabitState();
      currentState[habit.id] = !currentState[habit.id];
      saveHabitState(currentState);
      renderHabits();
      renderWeeklyHistory();
      renderWeeklyGoals();
    });

    habitList.appendChild(row);
  });

  updateProgress();
};

/* Override progress calculation so disabled habits do not affect the score. */
const updateProgressBeforeSettings = updateProgress;
updateProgress = function () {
  const state = loadHabitState();
  const enabledHabits = getEnabledHabits();
  const completed = enabledHabits.filter((habit) => state[habit.id]).length;
  const total = enabledHabits.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  completedCount.textContent = completed;
  habitCount.textContent = total;
  progressPercent.textContent = `${percent}%`;
  weeklyScore.textContent = `TODAY: ${completed} / ${total}`;
  progressRing.style.setProperty("--progress", `${percent}%`);
};

/* Override weekly history so disabled habits are hidden. */
const renderWeeklyHistoryBeforeSettings = renderWeeklyHistory;
renderWeeklyHistory = function () {
  createHistorySection();

  const historySection = document.getElementById("weekly-history");
  const days = getLastSevenDays();
  const enabledHabits = getEnabledHabits();
  const streak = getCurrentStreak();
  const totalPossible = enabledHabits.length * days.length;
  const totalCompleted = days.reduce((total, day) => {
    const state = loadHabitState(day);
    return total + enabledHabits.filter((habit) => state[habit.id]).length;
  }, 0);
  const consistency = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);

  const headers = days.map((day) => {
    const weekday = day.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
    const dayNumber = day.getDate();
    const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
    return `<div class="history-day ${todayClass}"><span>${weekday}</span><strong>${dayNumber}</strong></div>`;
  }).join("");

  const rows = enabledHabits.map((habit) => {
    const cells = days.map((day) => {
      const completed = Boolean(loadHabitState(day)[habit.id]);
      const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
      return `<div class="history-cell ${completed ? "done" : ""} ${todayClass}" aria-label="${habit.title}: ${completed ? "done" : "not done"}"></div>`;
    }).join("");

    return `
      <div class="history-row">
        <div class="history-label">${habit.title}</div>
        <div class="history-cells">${cells}</div>
      </div>
    `;
  }).join("");

  historySection.innerHTML = `
    <div class="history-header">
      <div>
        <p class="eyebrow">LAST 7 DAYS</p>
        <h2>CONSISTENCY</h2>
      </div>
      <div class="history-metrics">
        <span><strong>${streak}</strong> DAY STREAK</span>
        <span><strong>${consistency}%</strong> WEEKLY</span>
      </div>
    </div>
    <div class="history-table">
      <div class="history-table-head">
        <div class="history-label">HABIT</div>
        <div class="history-cells">${headers}</div>
      </div>
      ${rows || `<div class="settings-empty-state">NO HABITS ENABLED. OPEN SETTINGS TO TURN ONE ON.</div>`}
    </div>
    <p class="history-note">A filled circle means completed. Keep the system alive; do not chase perfection.</p>
  `;
};

/* Override weekly goals so target changes and disabled habits are respected. */
const renderWeeklyGoalsBeforeSettings = renderWeeklyGoals;
renderWeeklyGoals = function () {
  createWeeklyGoalsSection();

  const weeklyGoalsSection = document.getElementById("weekly-goals");
  const activeGoals = getEnabledWeeklyGoals();
  let goalsOnTrack = 0;

  const goalRows = activeGoals.map((goal) => {
    const completed = getWeeklyHabitCount(goal.habitId);
    const percent = Math.min(100, Math.round((completed / goal.target) * 100));
    const onTrack = completed >= goal.target;

    if (onTrack) goalsOnTrack += 1;

    return `
      <article class="goal-row ${onTrack ? "goal-complete" : ""}">
        <div class="goal-info">
          <p class="goal-title">${goal.label}</p>
          <p class="goal-detail">${onTrack ? "TARGET REACHED" : "WEEKLY TARGET"}</p>
        </div>
        <div class="goal-progress-area">
          <div class="goal-count">${completed} <span>/ ${goal.target}</span></div>
          <div class="goal-track" aria-label="${goal.label}: ${completed} of ${goal.target}">
            <span class="goal-fill" style="width: ${percent}%"></span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  weeklyGoalsSection.innerHTML = `
    <div class="goals-header">
      <div>
        <p class="eyebrow">WEEKLY DIRECTION</p>
        <h2>WEEKLY TARGETS</h2>
      </div>
      <div class="goals-summary">
        <span>WEEK OF ${getWeekRangeLabel()}</span>
        <strong>${goalsOnTrack} / ${activeGoals.length} ON TRACK</strong>
      </div>
    </div>
    <div class="goal-list">
      ${goalRows || `<div class="settings-empty-state">NO WEEKLY-GOAL HABITS ENABLED.</div>`}
    </div>
    <p class="goals-note">Each habit counts once per day. The goal is consistent progress, not a perfect week.</p>
  `;
};

renderHabits();
renderWeeklyHistory();
renderWeeklyGoals();
renderSettings();
const dailyTrackHabitTextKey = "daily-track-habit-text-v1";

function getHabitTextOverrides() {
  try {
    return JSON.parse(localStorage.getItem(dailyTrackHabitTextKey)) || {};
  } catch (error) {
    console.error("Could not load habit text settings:", error);
    return {};
  }
}

function saveHabitTextOverrides(overrides) {
  localStorage.setItem(dailyTrackHabitTextKey, JSON.stringify(overrides));
}

function getDisplayHabit(habit) {
  const overrides = getHabitTextOverrides()[habit.id] || {};

  return {
    ...habit,
    title: overrides.title || habit.title,
    target: overrides.target || habit.target
  };
}

function getDisplayHabits() {
  return habits.map(getDisplayHabit);
}

function getDisplayHabitById(habitId) {
  const originalHabit = habits.find((habit) => habit.id === habitId);
  return originalHabit ? getDisplayHabit(originalHabit) : null;
}

function createHabitEditorSection() {
  if (document.getElementById("habit-editor")) return;

  const settingsSection = document.getElementById("daily-track-settings");
  const section = document.createElement("section");

  section.id = "habit-editor";
  section.className = "habit-editor";

  if (settingsSection) {
    settingsSection.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function renderHabitEditor() {
  createHabitEditorSection();

  const section = document.getElementById("habit-editor");
  const settings = getDailyTrackSettings();
  const overrides = getHabitTextOverrides();

  const editorRows = habits.map((habit) => {
    const displayHabit = getDisplayHabit(habit);
    const enabled = settings.enabledHabits[habit.id] !== false;
    const changed = Boolean(overrides[habit.id]);

    return `
      <article class="editor-row ${enabled ? "" : "editor-row-disabled"}">
        <div class="editor-id">
          <span>${habit.id}</span>
          ${changed ? "<em>EDITED</em>" : ""}
        </div>

        <label class="editor-field">
          <span>HABIT NAME</span>
          <input
            class="habit-title-input"
            type="text"
            maxlength="42"
            data-habit-id="${habit.id}"
            value="${displayHabit.title.replace(/"/g, "&quot;")}" 
            ${enabled ? "" : "disabled"}
          >
        </label>

        <label class="editor-field editor-target-field">
          <span>DAILY TARGET / DESCRIPTION</span>
          <input
            class="habit-description-input"
            type="text"
            maxlength="80"
            data-habit-id="${habit.id}"
            value="${displayHabit.target.replace(/"/g, "&quot;")}" 
            ${enabled ? "" : "disabled"}
          >
        </label>

        <button
          class="editor-save-button"
          type="button"
          data-habit-id="${habit.id}"
          ${enabled ? "" : "disabled"}
        >SAVE</button>

        <button
          class="editor-reset-button"
          type="button"
          data-habit-id="${habit.id}"
          ${changed ? "" : "disabled"}
        >RESET</button>
      </article>
    `;
  }).join("");

  section.innerHTML = `
    <div class="editor-header">
      <div>
        <p class="eyebrow">SAFE PERSONALIZATION</p>
        <h2>HABIT EDITOR</h2>
      </div>
      <button id="reset-all-habit-text" class="editor-reset-all" type="button">RESET ALL NAMES</button>
    </div>

    <p class="editor-intro">
      Change the visible habit name and description. Internal IDs stay unchanged, so your past completion history and weekly targets remain connected.
    </p>

    <div class="editor-list">
      ${editorRows}
    </div>

    <p class="editor-note">For best tablet layout, keep names short. Example: “Deep Work” can become “CAD / R&D focus”.</p>
  `;

  section.querySelectorAll(".editor-save-button").forEach((button) => {
    button.addEventListener("click", () => {
      const habitId = button.dataset.habitId;
      const titleInput = section.querySelector(`.habit-title-input[data-habit-id="${habitId}"]`);
      const descriptionInput = section.querySelector(`.habit-description-input[data-habit-id="${habitId}"]`);

      const title = titleInput.value.trim();
      const target = descriptionInput.value.trim();

      if (!title || !target) {
        button.textContent = "FILL BOTH";
        setTimeout(() => {
          button.textContent = "SAVE";
        }, 1500);
        return;
      }

      const updatedOverrides = getHabitTextOverrides();
      updatedOverrides[habitId] = { title, target };
      saveHabitTextOverrides(updatedOverrides);

      button.textContent = "SAVED";
      refreshDailyTrackAfterHabitTextChange();

      setTimeout(() => {
        const visibleButton = document.querySelector(`.editor-save-button[data-habit-id="${habitId}"]`);
        if (visibleButton) visibleButton.textContent = "SAVE";
      }, 1200);
    });
  });

  section.querySelectorAll(".editor-reset-button").forEach((button) => {
    button.addEventListener("click", () => {
      const habitId = button.dataset.habitId;
      const updatedOverrides = getHabitTextOverrides();

      delete updatedOverrides[habitId];
      saveHabitTextOverrides(updatedOverrides);
      refreshDailyTrackAfterHabitTextChange();
    });
  });

  section.querySelector("#reset-all-habit-text").addEventListener("click", () => {
    if (!window.confirm("Reset all custom habit names and descriptions to the original text?")) return;

    localStorage.removeItem(dailyTrackHabitTextKey);
    refreshDailyTrackAfterHabitTextChange();
  });
}

function refreshDailyTrackAfterHabitTextChange() {
  renderHabits();
  renderWeeklyHistory();
  renderWeeklyGoals();
  renderSettings();
  renderHabitEditor();
}

/* Override V6 display functions so they use the edited visible text. */
renderHabits = function () {
  const state = loadHabitState();
  const enabledHabits = getEnabledHabits().map(getDisplayHabit);

  habitList.innerHTML = "";

  enabledHabits.forEach((habit) => {
    const completed = Boolean(state[habit.id]);
    const row = document.createElement("article");

    row.className = completed ? "habit-row completed" : "habit-row";
    row.innerHTML = `
      <span class="habit-indicator" aria-hidden="true"></span>
      <div>
        <p class="habit-title">${habit.title}</p>
        <p class="habit-target">${habit.target}</p>
      </div>
      <span class="toggle-label">${completed ? "DONE" : "OFF"}</span>
      <button
        class="toggle ${completed ? "is-on" : ""}"
        type="button"
        aria-label="Toggle ${habit.title}"
        aria-pressed="${completed}"
      ></button>
    `;

    row.querySelector(".toggle").addEventListener("click", () => {
      const currentState = loadHabitState();
      currentState[habit.id] = !currentState[habit.id];
      saveHabitState(currentState);
      renderHabits();
      renderWeeklyHistory();
      renderWeeklyGoals();
    });

    habitList.appendChild(row);
  });

  updateProgress();
};

renderWeeklyHistory = function () {
  createHistorySection();

  const historySection = document.getElementById("weekly-history");
  const days = getLastSevenDays();
  const enabledHabits = getEnabledHabits().map(getDisplayHabit);
  const streak = getCurrentStreak();
  const totalPossible = enabledHabits.length * days.length;
  const totalCompleted = days.reduce((total, day) => {
    const state = loadHabitState(day);
    return total + enabledHabits.filter((habit) => state[habit.id]).length;
  }, 0);
  const consistency = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);

  const headers = days.map((day) => {
    const weekday = day.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
    const dayNumber = day.getDate();
    const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
    return `<div class="history-day ${todayClass}"><span>${weekday}</span><strong>${dayNumber}</strong></div>`;
  }).join("");

  const rows = enabledHabits.map((habit) => {
    const cells = days.map((day) => {
      const completed = Boolean(loadHabitState(day)[habit.id]);
      const todayClass = getLocalDateKey(day) === getLocalDateKey() ? "today" : "";
      return `<div class="history-cell ${completed ? "done" : ""} ${todayClass}" aria-label="${habit.title}: ${completed ? "done" : "not done"}"></div>`;
    }).join("");

    return `
      <div class="history-row">
        <div class="history-label">${habit.title}</div>
        <div class="history-cells">${cells}</div>
      </div>
    `;
  }).join("");

  historySection.innerHTML = `
    <div class="history-header">
      <div>
        <p class="eyebrow">LAST 7 DAYS</p>
        <h2>CONSISTENCY</h2>
      </div>
      <div class="history-metrics">
        <span><strong>${streak}</strong> DAY STREAK</span>
        <span><strong>${consistency}%</strong> WEEKLY</span>
      </div>
    </div>
    <div class="history-table">
      <div class="history-table-head">
        <div class="history-label">HABIT</div>
        <div class="history-cells">${headers}</div>
      </div>
      ${rows || `<div class="settings-empty-state">NO HABITS ENABLED. OPEN SETTINGS TO TURN ONE ON.</div>`}
    </div>
    <p class="history-note">A filled circle means completed. Keep the system alive; do not chase perfection.</p>
  `;
};

renderWeeklyGoals = function () {
  createWeeklyGoalsSection();

  const weeklyGoalsSection = document.getElementById("weekly-goals");
  const activeGoals = getEnabledWeeklyGoals().map((goal) => {
    const displayHabit = getDisplayHabitById(goal.habitId);
    return {
      ...goal,
      label: displayHabit ? displayHabit.title : goal.label
    };
  });
  let goalsOnTrack = 0;

  const goalRows = activeGoals.map((goal) => {
    const completed = getWeeklyHabitCount(goal.habitId);
    const percent = Math.min(100, Math.round((completed / goal.target) * 100));
    const onTrack = completed >= goal.target;

    if (onTrack) goalsOnTrack += 1;

    return `
      <article class="goal-row ${onTrack ? "goal-complete" : ""}">
        <div class="goal-info">
          <p class="goal-title">${goal.label}</p>
          <p class="goal-detail">${onTrack ? "TARGET REACHED" : "WEEKLY TARGET"}</p>
        </div>
        <div class="goal-progress-area">
          <div class="goal-count">${completed} <span>/ ${goal.target}</span></div>
          <div class="goal-track" aria-label="${goal.label}: ${completed} of ${goal.target}">
            <span class="goal-fill" style="width: ${percent}%"></span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  weeklyGoalsSection.innerHTML = `
    <div class="goals-header">
      <div>
        <p class="eyebrow">WEEKLY DIRECTION</p>
        <h2>WEEKLY TARGETS</h2>
      </div>
      <div class="goals-summary">
        <span>WEEK OF ${getWeekRangeLabel()}</span>
        <strong>${goalsOnTrack} / ${activeGoals.length} ON TRACK</strong>
      </div>
    </div>
    <div class="goal-list">
      ${goalRows || `<div class="settings-empty-state">NO WEEKLY-GOAL HABITS ENABLED.</div>`}
    </div>
    <p class="goals-note">Each habit counts once per day. The goal is consistent progress, not a perfect week.</p>
  `;
};

renderHabits();
renderWeeklyHistory();
renderWeeklyGoals();
renderSettings();
renderHabitEditor();
function createNavigationDrawer() {
  if (document.getElementById("navigation-drawer")) return;

  const drawer = document.createElement("aside");
  drawer.id = "navigation-drawer";
  drawer.className = "navigation-drawer";
  drawer.setAttribute("aria-hidden", "true");

  drawer.innerHTML = `
    <div class="nav-drawer-header">
      <div>
        <p class="eyebrow">PERSONAL COMMAND CENTER</p>
        <h2>DAILY TRACK</h2>
      </div>
      <button id="close-navigation" class="nav-close-button" type="button" aria-label="Close navigation">×</button>
    </div>

    <nav class="nav-list" aria-label="Daily Track navigation">
      <button class="nav-link" type="button" data-target="top">
        <span>01</span> HOME
      </button>
      <button class="nav-link" type="button" data-target="habits-section">
        <span>02</span> HABITS
      </button>
      <button class="nav-link" type="button" data-target="weekly-history">
        <span>03</span> CONSISTENCY
      </button>
      <button class="nav-link" type="button" data-target="weekly-goals">
        <span>04</span> WEEKLY TARGETS
      </button>
      <button class="nav-link" type="button" data-target="daily-checkin">
        <span>05</span> DAILY CHECK-IN
      </button>
      <button class="nav-link" type="button" data-target="daily-track-settings">
        <span>06</span> SETTINGS
      </button>
      <button class="nav-link" type="button" data-target="habit-editor">
        <span>07</span> HABIT EDITOR
      </button>
    </nav>

    <div class="nav-drawer-footer">
      <span>DAILY TRACK</span>
      <span>LOCAL EDITION</span>
    </div>
  `;

  const overlay = document.createElement("div");
  overlay.id = "navigation-overlay";
  overlay.className = "navigation-overlay";

  document.body.append(overlay, drawer);
}

function openNavigationDrawer() {
  const drawer = document.getElementById("navigation-drawer");
  const overlay = document.getElementById("navigation-overlay");
  const menuButton = document.querySelector(".menu-button");

  drawer.classList.add("is-open");
  overlay.classList.add("is-visible");
  drawer.setAttribute("aria-hidden", "false");
  menuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("navigation-open");
}

function closeNavigationDrawer() {
  const drawer = document.getElementById("navigation-drawer");
  const overlay = document.getElementById("navigation-overlay");
  const menuButton = document.querySelector(".menu-button");

  drawer.classList.remove("is-open");
  overlay.classList.remove("is-visible");
  drawer.setAttribute("aria-hidden", "true");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("navigation-open");
}

function scrollToDashboardSection(target) {
  if (target === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const element = document.getElementById(target) || document.querySelector(`.${target}`);

  if (element) {
    const topPosition = element.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  }
}

function setupNavigationDrawer() {
  createNavigationDrawer();

  const menuButton = document.querySelector(".menu-button");
  const closeButton = document.getElementById("close-navigation");
  const overlay = document.getElementById("navigation-overlay");
  const navLinks = document.querySelectorAll(".nav-link");

  menuButton.setAttribute("aria-expanded", "false");
  menuButton.addEventListener("click", openNavigationDrawer);
  closeButton.addEventListener("click", closeNavigationDrawer);
  overlay.addEventListener("click", closeNavigationDrawer);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.dataset.target;
      closeNavigationDrawer();

      setTimeout(() => {
        scrollToDashboardSection(target);
      }, 180);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigationDrawer();
    }
  });
}

setupNavigationDrawer();
const workspaceStorageKey = "daily-track-workspace-v1";

const defaultWorkspaceLinks = [
  { id: "drive", label: "Google Drive", symbol: "DR", url: "https://drive.google.com/", enabled: true },
  { id: "calendar", label: "Calendar", symbol: "CA", url: "https://calendar.google.com/", enabled: true },
  { id: "whatsapp", label: "WhatsApp", symbol: "WA", url: "https://web.whatsapp.com/", enabled: true },
  { id: "spotify", label: "Spotify", symbol: "SP", url: "https://open.spotify.com/", enabled: true },
  { id: "notes", label: "Notes", symbol: "NO", url: "https://keep.google.com/", enabled: true },
  { id: "projects", label: "Projects", symbol: "PR", url: "https://trello.com/", enabled: true }
];

function getWorkspaceLinks() {
  try {
    const savedLinks = JSON.parse(localStorage.getItem(workspaceStorageKey));
    return Array.isArray(savedLinks) ? savedLinks : structuredClone(defaultWorkspaceLinks);
  } catch (error) {
    console.error("Could not load workspace links:", error);
    return structuredClone(defaultWorkspaceLinks);
  }
}

function saveWorkspaceLinks(links) {
  localStorage.setItem(workspaceStorageKey, JSON.stringify(links));
}

function normalizeUrl(url) {
  const cleanUrl = url.trim();

  if (cleanUrl === "") return "";
  if (cleanUrl.startsWith("https://") || cleanUrl.startsWith("http://")) {
    return cleanUrl;
  }

  return `https://${cleanUrl}`;
}

function createWorkspaceSection() {
  if (document.getElementById("personal-workspace")) return;

  const habitEditor = document.getElementById("habit-editor");
  const section = document.createElement("section");

  section.id = "personal-workspace";
  section.className = "personal-workspace";

  if (habitEditor) {
    habitEditor.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function createWorkspaceEditorSection() {
  if (document.getElementById("workspace-editor")) return;

  const workspace = document.getElementById("personal-workspace");
  const section = document.createElement("section");

  section.id = "workspace-editor";
  section.className = "workspace-editor";

  if (workspace) {
    workspace.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function renderWorkspace() {
  createWorkspaceSection();

  const section = document.getElementById("personal-workspace");
  const activeLinks = getWorkspaceLinks().filter((link) => link.enabled && link.label && link.url);

  const linkCards = activeLinks.map((link) => `
    <a class="workspace-card" href="${link.url}" target="_blank" rel="noopener noreferrer">
      <span class="workspace-symbol">${link.symbol || "GO"}</span>
      <span class="workspace-label">${link.label}</span>
      <span class="workspace-arrow">↗</span>
    </a>
  `).join("");

  section.innerHTML = `
    <div class="workspace-header">
      <div>
        <p class="eyebrow">YOUR DAILY TOOLS</p>
        <h2>PERSONAL WORKSPACE</h2>
      </div>
      <button id="open-workspace-editor" class="workspace-edit-button" type="button">EDIT LINKS</button>
    </div>

    <div class="workspace-grid">
      ${linkCards || `<div class="workspace-empty-state">NO WORKSPACE LINKS ENABLED. OPEN EDIT LINKS TO ADD ONE.</div>`}
    </div>

    <p class="workspace-note">Open your most-used tools in one tap. Links open in a new browser tab while testing on a laptop.</p>
  `;

  section.querySelector("#open-workspace-editor").addEventListener("click", () => {
    renderWorkspaceEditor();
    const editor = document.getElementById("workspace-editor");
    const topPosition = editor.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  });
}

function renderWorkspaceEditor() {
  createWorkspaceEditorSection();

  const section = document.getElementById("workspace-editor");
  const links = getWorkspaceLinks();

  const editorRows = links.map((link, index) => `
    <article class="workspace-editor-row ${link.enabled ? "" : "workspace-link-disabled"}">
      <label class="workspace-editor-field workspace-symbol-field">
        <span>SYMBOL</span>
        <input class="workspace-symbol-input" type="text" maxlength="2" data-index="${index}" value="${link.symbol || ""}">
      </label>

      <label class="workspace-editor-field">
        <span>NAME</span>
        <input class="workspace-label-input" type="text" maxlength="28" data-index="${index}" value="${link.label || ""}">
      </label>

      <label class="workspace-editor-field workspace-url-field">
        <span>URL</span>
        <input class="workspace-url-input" type="text" maxlength="180" data-index="${index}" value="${link.url || ""}">
      </label>

      <button class="workspace-enabled-toggle ${link.enabled ? "is-on" : ""}" type="button" data-index="${index}" aria-label="Toggle ${link.label}" aria-pressed="${link.enabled}"></button>

      <button class="workspace-save-link" type="button" data-index="${index}">SAVE</button>
    </article>
  `).join("");

  section.innerHTML = `
    <div class="workspace-editor-header">
      <div>
        <p class="eyebrow">CUSTOMIZE SHORTCUTS</p>
        <h2>WORKSPACE EDITOR</h2>
      </div>
      <button id="restore-workspace-defaults" class="workspace-restore-button" type="button">RESTORE DEFAULTS</button>
    </div>

    <p class="workspace-editor-intro">Edit names and web links, then use the switch to show or hide each card. Use two letters for symbols, for example DR, CA, WA, SP, or a custom pair.</p>

    <div class="workspace-editor-list">
      ${editorRows}
    </div>

    <p class="workspace-editor-note">Changes save on this browser/device. Enter full URLs, or type a domain such as notion.so and Daily Track will add https:// automatically.</p>
  `;

  section.querySelectorAll(".workspace-save-link").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const currentLinks = getWorkspaceLinks();
      const labelInput = section.querySelector(`.workspace-label-input[data-index="${index}"]`);
      const symbolInput = section.querySelector(`.workspace-symbol-input[data-index="${index}"]`);
      const urlInput = section.querySelector(`.workspace-url-input[data-index="${index}"]`);

      const label = labelInput.value.trim();
      const symbol = symbolInput.value.trim().toUpperCase();
      const url = normalizeUrl(urlInput.value);

      if (!label || !url) {
        button.textContent = "ADD NAME + URL";
        setTimeout(() => {
          button.textContent = "SAVE";
        }, 1600);
        return;
      }

      currentLinks[index] = {
        ...currentLinks[index],
        label,
        symbol: symbol || "GO",
        url
      };

      saveWorkspaceLinks(currentLinks);
      renderWorkspace();
      renderWorkspaceEditor();

      const savedButton = document.querySelector(`.workspace-save-link[data-index="${index}"]`);
      if (savedButton) {
        savedButton.textContent = "SAVED";
        setTimeout(() => {
          savedButton.textContent = "SAVE";
        }, 1300);
      }
    });
  });

  section.querySelectorAll(".workspace-enabled-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const currentLinks = getWorkspaceLinks();

      currentLinks[index].enabled = !currentLinks[index].enabled;
      saveWorkspaceLinks(currentLinks);
      renderWorkspace();
      renderWorkspaceEditor();
    });
  });

  section.querySelector("#restore-workspace-defaults").addEventListener("click", () => {
    if (!window.confirm("Restore the original Personal Workspace links? Your custom workspace names and URLs will be replaced.")) return;

    localStorage.removeItem(workspaceStorageKey);
    renderWorkspace();
    renderWorkspaceEditor();
  });
}

function refreshDailyTrackWorkspace() {
  renderWorkspace();
  renderWorkspaceEditor();
}

/* Add workspace links to the V8 navigation drawer after it has been created. */
function addWorkspaceToNavigation() {
  const navList = document.querySelector(".nav-list");
  if (!navList || document.querySelector('[data-target="personal-workspace"]')) return;

  const workspaceLink = document.createElement("button");
  workspaceLink.className = "nav-link";
  workspaceLink.type = "button";
  workspaceLink.dataset.target = "personal-workspace";
  workspaceLink.innerHTML = "<span>08</span> WORKSPACE";

  const editorLink = document.createElement("button");
  editorLink.className = "nav-link";
  editorLink.type = "button";
  editorLink.dataset.target = "workspace-editor";
  editorLink.innerHTML = "<span>09</span> EDIT WORKSPACE";

  navList.append(workspaceLink, editorLink);

  [workspaceLink, editorLink].forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigationDrawer();
      setTimeout(() => {
        scrollToDashboardSection(link.dataset.target);
      }, 180);
    });
  });
}

renderWorkspace();
renderWorkspaceEditor();
addWorkspaceToNavigation();
const newsBriefingStorageKey = "daily-track-news-topics-v1";

const defaultNewsTopics = [
  {
    id: "indonesia",
    symbol: "ID",
    label: "Indonesia",
    description: "National news and current affairs",
    query: "Indonesia",
    enabled: true
  },
  {
    id: "business",
    symbol: "BU",
    label: "Business",
    description: "Business, markets, and economy",
    query: "business economy Indonesia",
    enabled: true
  },
  {
    id: "golf",
    symbol: "GO",
    label: "Golf",
    description: "Golf equipment and industry",
    query: "golf equipment industry",
    enabled: true
  },
  {
    id: "metal-am",
    symbol: "AM",
    label: "Metal 3D printing",
    description: "Additive manufacturing and engineering",
    query: "metal additive manufacturing 3D printing",
    enabled: true
  }
];

function getNewsTopics() {
  try {
    const savedTopics = JSON.parse(localStorage.getItem(newsBriefingStorageKey));
    return Array.isArray(savedTopics) ? savedTopics : structuredClone(defaultNewsTopics);
  } catch (error) {
    console.error("Could not load News Briefing topics:", error);
    return structuredClone(defaultNewsTopics);
  }
}

function saveNewsTopics(topics) {
  localStorage.setItem(newsBriefingStorageKey, JSON.stringify(topics));
}

function getGoogleNewsUrl(query) {
  return `https://news.google.com/search?q=${encodeURIComponent(query)}&hl=en-ID&gl=ID&ceid=ID%3Aen`;
}

function createNewsBriefingSection() {
  if (document.getElementById("news-briefing")) return;

  const workspaceEditor = document.getElementById("workspace-editor");
  const section = document.createElement("section");

  section.id = "news-briefing";
  section.className = "news-briefing";

  if (workspaceEditor) {
    workspaceEditor.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function createNewsEditorSection() {
  if (document.getElementById("news-editor")) return;

  const newsBriefing = document.getElementById("news-briefing");
  const section = document.createElement("section");

  section.id = "news-editor";
  section.className = "news-editor";

  if (newsBriefing) {
    newsBriefing.insertAdjacentElement("afterend", section);
  } else {
    document.querySelector(".dashboard").appendChild(section);
  }
}

function renderNewsBriefing() {
  createNewsBriefingSection();

  const section = document.getElementById("news-briefing");
  const activeTopics = getNewsTopics().filter((topic) => topic.enabled && topic.label && topic.query);

  const topicCards = activeTopics.map((topic) => `
    <a
      class="news-card"
      href="${getGoogleNewsUrl(topic.query)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="news-symbol">${topic.symbol || "NW"}</span>
      <span class="news-card-content">
        <strong>${topic.label}</strong>
        <small>${topic.description || "Current headlines"}</small>
      </span>
      <span class="news-arrow">↗</span>
    </a>
  `).join("");

  const updatedTime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  section.innerHTML = `
    <div class="news-header">
      <div>
        <p class="eyebrow">ON-DEMAND INTELLIGENCE</p>
        <h2>NEWS BRIEFING</h2>
      </div>
      <button id="open-news-editor" class="news-edit-button" type="button">EDIT TOPICS</button>
    </div>

    <div class="news-summary">
      <span>SELECT A TOPIC TO OPEN LIVE HEADLINES</span>
      <span>READY ${updatedTime}</span>
    </div>

    <div class="news-grid">
      ${topicCards || `<div class="news-empty-state">NO NEWS TOPICS ENABLED. OPEN EDIT TOPICS TO TURN ONE ON.</div>`}
    </div>

    <p class="news-note">News opens in Google News so headlines are current every time. Daily Track does not track your reading activity.</p>
  `;

  section.querySelector("#open-news-editor").addEventListener("click", () => {
    renderNewsEditor();
    const editor = document.getElementById("news-editor");
    const topPosition = editor.getBoundingClientRect().top + window.scrollY - 18;
    window.scrollTo({ top: topPosition, behavior: "smooth" });
  });
}

function renderNewsEditor() {
  createNewsEditorSection();

  const section = document.getElementById("news-editor");
  const topics = getNewsTopics();

  const topicRows = topics.map((topic, index) => `
    <article class="news-editor-row ${topic.enabled ? "" : "news-topic-disabled"}">
      <label class="news-editor-field news-symbol-field">
        <span>SYMBOL</span>
        <input class="news-symbol-input" type="text" maxlength="2" data-index="${index}" value="${topic.symbol || ""}">
      </label>

      <label class="news-editor-field">
        <span>TOPIC NAME</span>
        <input class="news-label-input" type="text" maxlength="28" data-index="${index}" value="${topic.label || ""}">
      </label>

      <label class="news-editor-field news-query-field">
        <span>GOOGLE NEWS SEARCH</span>
        <input class="news-query-input" type="text" maxlength="100" data-index="${index}" value="${topic.query || ""}">
      </label>

      <label class="news-editor-field news-description-field">
        <span>SHORT DESCRIPTION</span>
        <input class="news-description-input" type="text" maxlength="52" data-index="${index}" value="${topic.description || ""}">
      </label>

      <button class="news-enabled-toggle ${topic.enabled ? "is-on" : ""}" type="button" data-index="${index}" aria-label="Toggle ${topic.label}" aria-pressed="${topic.enabled}"></button>

      <button class="news-save-topic" type="button" data-index="${index}">SAVE</button>
    </article>
  `).join("");

  section.innerHTML = `
    <div class="news-editor-header">
      <div>
        <p class="eyebrow">CHOOSE YOUR SOURCES</p>
        <h2>NEWS TOPIC EDITOR</h2>
      </div>
      <button id="restore-news-defaults" class="news-restore-button" type="button">RESTORE DEFAULTS</button>
    </div>

    <p class="news-editor-intro">Set a label and a Google News search phrase. For example: “Indonesia technology”, “golf equipment”, “K-pop”, “coffee”, or any topic you want to check.</p>

    <div class="news-editor-list">
      ${topicRows}
    </div>

    <p class="news-editor-note">Each topic opens live Google News results in a new tab. Changes save only on this browser/device.</p>
  `;

  section.querySelectorAll(".news-save-topic").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const currentTopics = getNewsTopics();
      const symbol = section.querySelector(`.news-symbol-input[data-index="${index}"]`).value.trim().toUpperCase();
      const label = section.querySelector(`.news-label-input[data-index="${index}"]`).value.trim();
      const query = section.querySelector(`.news-query-input[data-index="${index}"]`).value.trim();
      const description = section.querySelector(`.news-description-input[data-index="${index}"]`).value.trim();

      if (!label || !query) {
        button.textContent = "ADD NAME + SEARCH";
        setTimeout(() => {
          button.textContent = "SAVE";
        }, 1700);
        return;
      }

      currentTopics[index] = {
        ...currentTopics[index],
        symbol: symbol || "NW",
        label,
        query,
        description: description || "Current headlines"
      };

      saveNewsTopics(currentTopics);
      renderNewsBriefing();
      renderNewsEditor();

      const savedButton = document.querySelector(`.news-save-topic[data-index="${index}"]`);
      if (savedButton) {
        savedButton.textContent = "SAVED";
        setTimeout(() => {
          savedButton.textContent = "SAVE";
        }, 1300);
      }
    });
  });

  section.querySelectorAll(".news-enabled-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.index);
      const currentTopics = getNewsTopics();

      currentTopics[index].enabled = !currentTopics[index].enabled;
      saveNewsTopics(currentTopics);
      renderNewsBriefing();
      renderNewsEditor();
    });
  });

  section.querySelector("#restore-news-defaults").addEventListener("click", () => {
    if (!window.confirm("Restore the original News Briefing topics? Your custom topic names and searches will be replaced.")) return;

    localStorage.removeItem(newsBriefingStorageKey);
    renderNewsBriefing();
    renderNewsEditor();
  });
}

function addNewsToNavigation() {
  const navList = document.querySelector(".nav-list");
  if (!navList || document.querySelector('[data-target="news-briefing"]')) return;

  const newsLink = document.createElement("button");
  newsLink.className = "nav-link";
  newsLink.type = "button";
  newsLink.dataset.target = "news-briefing";
  newsLink.innerHTML = "<span>10</span> NEWS BRIEFING";

  const editorLink = document.createElement("button");
  editorLink.className = "nav-link";
  editorLink.type = "button";
  editorLink.dataset.target = "news-editor";
  editorLink.innerHTML = "<span>11</span> EDIT NEWS";

  navList.append(newsLink, editorLink);

  [newsLink, editorLink].forEach((link) => {
    link.addEventListener("click", () => {
      closeNavigationDrawer();
      setTimeout(() => {
        scrollToDashboardSection(link.dataset.target);
      }, 180);
    });
  });
}

renderNewsBriefing();
renderNewsEditor();
addNewsToNavigation();