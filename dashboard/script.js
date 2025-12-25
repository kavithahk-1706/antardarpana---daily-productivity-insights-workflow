const BASE_URL = "../insights";


const datePicker = document.getElementById("datePicker");

const scoreEl = document.getElementById("score");
const sentimentEl = document.getElementById("sentiment");
const formResponseEl = document.getElementById("formResponse");
const completedEl = document.getElementById("completed");
const missedEl = document.getElementById("missed");
const reasonsEl = document.getElementById("reasons");
const shlokaEl = document.getElementById("shloka");
const translationEl = document.getElementById("translation");
const reasoningEl = document.getElementById("reasoning");
const krishnaMessageEl = document.getElementById("krishnaMessage");

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

async function loadDate(date) {
  const url = `${BASE_URL}/${date}.json`;

  try {
    const res = await fetch(url);

    if (!res.ok) throw new Error("Not found");

    const data = await res.json();
    const entry = data[0];

    scoreEl.textContent = entry.productivity_score ?? "—";
    sentimentEl.textContent = entry.overall_sentiment ?? "";

    formResponseEl.textContent = entry.form_response ?? "";

    completedEl.textContent = entry.completed_activities ?? "";
    missedEl.textContent = entry.missed_activities ?? "";
    reasonsEl.textContent = entry.valid_reasons ?? "";

    shlokaEl.textContent =
      `Chapter ${entry.gita.chapter}, Verse ${entry.gita.verse}\n${entry.gita.devanagari}`;

    translationEl.textContent = entry.gita.translation;
    reasoningEl.textContent = entry.gita.reasoning;

    krishnaMessageEl.textContent = entry.krishna.message;

  } catch (err) {
    alert(`No insights found for ${date}`);
  }
}

// Initialize
const today = todayISO();
datePicker.value = today;
loadDate(today);

datePicker.addEventListener("change", (e) => {
  loadDate(e.target.value);
});
