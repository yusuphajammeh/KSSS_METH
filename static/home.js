document.addEventListener("DOMContentLoaded", () => {
  // 1. Math Icon Animation (Original Logic)
  const icons = document.querySelectorAll(".math-icon");
  icons.forEach((icon, index) => {
    icon.style.animationDelay = `${index * 0.3}s`;
  });

  // 2. Fetching Competition Data for Homepage
  const container = document.getElementById("live-updates-container");
  const gradeFiles = ['10', '11', '12'];
  let allMatches = [];

  // Fetch all JSON files simultaneously
  const requests = gradeFiles.map(grade => 
    fetch(`/data/competition-grade${grade}.json`).then(res => res.json())
  );

  Promise.all(requests)
    .then(dataList => {
      dataList.forEach(data => {
        data.rounds.forEach(round => {
          round.matches.forEach(match => {
            // Include grade level so we know where the match belongs
            match.gradeLevel = data.grade; 
            allMatches.push(match);
          });
        });
      });

      renderMatchCenter(allMatches);
    })
    .catch(err => {
      console.error("Error loading competition data:", err);
      container.innerHTML = "<p>Unable to load live matches right now.</p>";
    });

  function renderMatchCenter(matches) {
    // Filter out "panding" matches and sort by date
    // (Note: Grade 12 has Feb 11, Grade 10/11 have Feb 14)
    const activeMatches = matches.filter(m => 
      m.schedule && m.schedule.date !== "panding"
    ).slice(0, 6); // Take top 6 upcoming/recent matches

    if (activeMatches.length === 0) {
      container.innerHTML = "<p>No matches scheduled yet!</p>";
      return;
    }

    container.innerHTML = activeMatches.map(m => `
      <div class="live-card">
        <div class="card-tag">GRADE ${m.gradeLevel}</div>
        <div class="card-teams">
          <span>${m.teamA.name}</span>
          <span class="vs-label">vs</span>
          <span>${m.teamB.name}</span>
        </div>
        <div class="card-meta">
          📅 ${m.schedule.date} | ⏰ ${m.schedule.time}
          <br>
          📍 ${m.schedule.location}
        </div>
      </div>
    `).join('');
  }
});