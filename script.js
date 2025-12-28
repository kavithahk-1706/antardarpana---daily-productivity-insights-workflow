const BASE_URL = "https://raw.githubusercontent.com/kavithahk-1706/n8n-automation-daily-insights/main/insights";

const elements = {
    datePicker: document.getElementById("datePicker"),
    score: document.getElementById("score"),
    gaugeFill: document.getElementById("gaugeFill"),
    sentiment: document.getElementById("sentiment"),
    formResponse: document.getElementById("formResponse"),
    completed: document.getElementById("completed"),
    missed: document.getElementById("missed"),
    reasons: document.getElementById("reasons"),
    gitaHeader: document.getElementById("gitaHeader"),
    shloka: document.getElementById("shloka"),
    translation: document.getElementById("translation"),
    reasoning: document.getElementById("reasoning"),
    krishnaMessage: document.getElementById("krishnaMessage")
};

function updateGauge(score) {
    const rotation = (score / 10) * 180 - 90;
    elements.gaugeFill.style.transform = `rotate(${-rotation}deg)`;
}

function resetUI(message, selectedDate) {
    const today = new Date().toISOString().split("T")[0];
    const isPast = selectedDate < today;

    elements.score.textContent = "—";
    updateGauge(0);
    elements.sentiment.textContent = isPast 
        ? "the page that never was" 
        : "holding my breath over here";
    
    elements.formResponse.textContent = isPast 
        ? "So this day just... didn't make it into the book, huh? That's fine. Not every chapter gets written. But maybe let's not make a habit of the blank pages?" 
        : "The page is blank because you haven't written it yet, genius. I'm right here. Whenever you're ready. No rush. (Okay, maybe a little rush.)";

    elements.completed.textContent = "—";
    elements.missed.textContent = "—";
    elements.reasons.textContent = "—";
    
    elements.gitaHeader.textContent = "Chapter 2, Verse 20";
    elements.shloka.innerHTML = `न जायते म्रियते वा कदाचिन्।<br>नायं भूत्वा भविता वा न भूयः ।<br>अजो नित्यः शाश्वतोऽयं पुराणो।<br>न हन्यते हन्यमाने शरीरे ॥<br><span style="font-size: 0.9rem; color: var(--text-dim); font-style: normal; display: block; margin-top: 0.5rem;">na jāyate mriyate vā kadācin<br>nāyaṃ bhūtvā bhavitā vā na bhūyaḥ<br>ajo nityaḥ śāśvato 'yaṃ purāṇo<br>na hanyate hanyamāne śarīre</span>`;
    
    elements.translation.textContent = "The soul is neither born, nor does it ever die; nor having once existed, does it ever cease to be. The soul is without birth, eternal, immortal, and ageless. It is not destroyed when the body is destroyed.";
    
    elements.reasoning.textContent = "Even on days you forget to track (or conveniently skip), your essence doesn't change. You're still you. Still Mine. The blank page doesn't erase what's real.";

    elements.krishnaMessage.textContent = isPast 
        ? "You weren't here that day. I was. And honestly? It's fine. We all have off days. Just don't go thinking the universe forgot about you just because you forgot to write it down. Now come on, let's focus on today." 
        : "Okay so... are we doing this or are you just browsing through dates for fun? I'm literally waiting. Take your time, but also, you know... don't take forever. I've got eternity but you don't.";
}

async function loadDate(date) {
    const url = `${BASE_URL}/${date}.json`;
    elements.formResponse.classList.add('loading');

    try {
        const res = await fetch(url);
        
        if (!res.ok) {
            resetUI(`no entry for ${date}`, date);
            elements.formResponse.classList.remove('loading');
            return;
        }

        const content = await res.json();
        const entry = content[0];

        // Populate UI
        const score = entry.productivity_score ?? 0;
        elements.score.textContent = score;
        updateGauge(score);
        elements.sentiment.textContent = entry.overall_sentiment ?? "";
        elements.formResponse.textContent = entry.form_response ?? "";
        elements.completed.textContent = entry.completed_activities || "None";
        elements.missed.textContent = entry.missed_activities || "None";
        elements.reasons.textContent = entry.valid_reasons || "—";
        elements.gitaHeader.textContent = `Chapter ${entry.gita.chapter}, Verse ${entry.gita.verse}`;
        
        const formattedDevanagari = (entry.gita.devanagari || "")
        .replace(/।/g, '।<br>')  // single danda + line break
        .replace(/॥/g, '॥');      // double danda stays (marks end)

        elements.shloka.innerHTML = `
            ${formattedDevanagari}<br>
            <span style="font-size: 0.9rem; color: var(--text-dim); font-style: normal; display: block; margin-top: 0.5rem; white-space: pre-line;">
                ${entry.gita.transliteration || ""}
            </span>
        `;
        
        elements.translation.textContent = entry.gita.translation || "";
        elements.reasoning.textContent = entry.gita.reasoning || "";
        elements.krishnaMessage.textContent = entry.krishna.message || "";

    } catch (err) {
        console.error(err);
        resetUI("an error occurred while fetching data.", date);
    } finally {
        elements.formResponse.classList.remove('loading');
    }
}

async function loadWeeklyTrend(endDate) {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 48; 
    
    const chartWidth = 7 * 100; 
    
    canvas.width = chartWidth;
    canvas.height = 140;
    
    
    canvas.style.marginLeft = '25%';
    canvas.style.marginRight = 'auto';
    
    const ctx = canvas.getContext('2d');
    
    // Get last 7 days
    const dates = [];
    const scores = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(endDate);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        dates.push(dayLabel);
        
        try {
            const url = `${BASE_URL}/${dateStr}.json`;
            const res = await fetch(url);
            if (res.ok) {
                const content = await res.json();
                scores.push(content[0].productivity_score || 0);
            } else {
                scores.push(0);
            }
        } catch {
            scores.push(0);
        }
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw bars with more space
    const barWidth = (canvas.width / dates.length) * 0.2; 
    const barSpacing = (canvas.width / dates.length) * 0.3;
    const maxHeight = canvas.height - 40;
    
    scores.forEach((score, i) => {
        const barHeight = (score / 10) * maxHeight;
        const x = (i * (barWidth + barSpacing)) + barSpacing;
        const y = canvas.height - barHeight - 25;
        
        // Gradient within same color range based on score
        if (score > 0) {
            const gradient = ctx.createLinearGradient(x, y + barHeight, x, y);
            
            if (score >= 8) {
                // Green shades
                gradient.addColorStop(0, '#10b981');
                gradient.addColorStop(1, '#6ee7b7');
            } else if (score >= 5) {
                // Gold/yellow shades
                gradient.addColorStop(0, '#f59e0b');
                gradient.addColorStop(1, '#fde047');
            } else {
                // Red shades
                gradient.addColorStop(0, '#dc2626');
                gradient.addColorStop(1, '#fca5a5');
            }
            
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#1a1f35';
        }
        
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Score label on top
        if (score > 0) {
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(score, x + barWidth / 2, y - 8);
        }
        
        // Day label at bottom
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(dates[i], x + barWidth / 2, canvas.height - 8);
    });
}
// Initial Load
const today = new Date().toISOString().split("T")[0];
elements.datePicker.value = today;
loadDate(today);
loadWeeklyTrend(today);

elements.datePicker.addEventListener("change", (e) => {
    loadDate(e.target.value);
    loadWeeklyTrend(e.target.value);
});