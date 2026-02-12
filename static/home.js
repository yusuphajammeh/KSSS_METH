document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("live-updates-container");
  const grades = ['10', '11', '12'];
  let allMatches = [];

  const requests = grades.map(grade => 
    fetch(`./data/competition-grade${grade}.json`).then(res => {
      if (!res.ok) throw new Error(`Could not find Grade ${grade} file`);
      return res.json();
    })
  );

  Promise.all(requests)
    .then(dataList => {
      dataList.forEach(data => {
        data.rounds.forEach(round => {
          round.matches.forEach(match => {
            match.gradeLevel = data.grade; 
            allMatches.push(match);
          });
        });
      });

      // Sort by date (Soonest first)
      allMatches.sort((a, b) => {
        const dateA = new Date(`${a.schedule.date.split(', ')[1]}, 2026`);
        const dateB = new Date(`${b.schedule.date.split(', ')[1]}, 2026`);
        return dateA - dateB;
      });

      renderMatchCenter(allMatches);
    })
    .catch(err => {
      console.error("Data Load Error:", err);
      container.innerHTML = `<p style="color:red;">Error: Make sure your JSON files are in the /data/ folder.</p>`;
    });

  function renderMatchCenter(matches) {
    const activeMatches = matches.filter(m => {
      const dateStr = m.schedule?.date?.toLowerCase() || "";
      return dateStr !== "" && !dateStr.includes("pandin") && !dateStr.includes("pending");
    }).slice(0, 6); 

    if (activeMatches.length === 0) {
      container.innerHTML = "<p>No scheduled matches found yet.</p>";
      return;
    }

    container.innerHTML = activeMatches.map(m => {
      // Logic for Points Visibility and Leading/Winner Styling
      let stylePointsA = 'display: none';
      let stylePointsB = 'display: none';
      let classTeamA = 'team';
      let classTeamB = 'team';

      if (m.teamA.points !== null && m.teamB.points !== null) {
        stylePointsA = 'display: inline-block';
        stylePointsB = 'display: inline-block';

        if (m.teamA.points > m.teamB.points) classTeamA += ' leading';
        if (m.teamB.points > m.teamA.points) classTeamB += ' leading';
      }

      if (m.winner === m.teamA.name) classTeamA += ' winner';
      if (m.winner === m.teamB.name) classTeamB += ' winner';

      // HTML Structure Mirroring styles.css
      return `
      <div class="match">
        <div class="card-tag">GRADE ${m.gradeLevel}</div>
        
        <div class="match-schedule">
          <div class="schedule-date">${m.schedule.date}</div>
          <div class="schedule-time">${m.schedule.time}</div>
          <div class="schedule-location">${m.schedule.location}</div>
        </div>

        <div class="match-teams">
          <div class="${classTeamA}">
            <span class="team-name">${m.teamA.name}</span>
            <span class="points" style="${stylePointsA}">${m.teamA.points !== null ? m.teamA.points + ' pts' : ''}</span>
          </div>
          
          <span class="vs">VS</span>

          <div class="${classTeamB}">
            <span class="team-name">${m.teamB.name}</span>
            <span class="points" style="${stylePointsB}">${m.teamB.points !== null ? m.teamB.points + ' pts' : ''}</span>
          </div>
        </div>
      </div>
      `;
    }).join('');
  }
});