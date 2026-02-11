// 1️⃣ Detect grade from the HTML page name
let pageName = window.location.pathname.split("/").pop(); // e.g., "grade11.html"
let grade = pageName.replace(".html", ""); // "grade11"

// 2️⃣ Set JSON file path dynamically
let jsonFile = `/data/competition-${grade}.json`;

// 3️⃣ Fetch the correct JSON
fetch(jsonFile)
  .then(res => res.json())
  .then(data => {
    const bracket = document.getElementById("bracket");

    data.rounds.forEach(round => {
      const roundDiv = document.createElement("div");
      roundDiv.className = "round";

      const title = document.createElement("div");
      title.className = "round-title";
      title.textContent = round.name;
      roundDiv.appendChild(title);

      round.matches.forEach(match => {
        const matchDiv = document.createElement("div");
        matchDiv.className = "match";

        const teamA = createTeam(match.teamA);
        const teamB = createTeam(match.teamB);

        const vs = document.createElement("div");
        vs.className = "vs";
        vs.textContent = "VS";

        // Show points only if entered
        if (match.teamA.points !== null && match.teamB.points !== null) {
          teamA.querySelector(".points").style.display = "inline-block";
          teamB.querySelector(".points").style.display = "inline-block";

          if (match.teamA.points > match.teamB.points) {
            teamA.classList.add("leading");
          } else if (match.teamB.points > match.teamA.points) {
            teamB.classList.add("leading");
          }
        }

        // Highlight winner if selected
        if (match.winner === match.teamA.name) teamA.classList.add("winner");
        if (match.winner === match.teamB.name) teamB.classList.add("winner");

        matchDiv.appendChild(teamA);
        matchDiv.appendChild(vs);
        matchDiv.appendChild(teamB);

        roundDiv.appendChild(matchDiv);
      });

      bracket.appendChild(roundDiv);
    });
  });

// Function to create team elements
function createTeam(team) {
  const div = document.createElement("div");
  div.className = "team";

  const name = document.createElement("span");
  name.className = "team-name";
  name.textContent = team.name;

  const points = document.createElement("span");
  points.className = "points";
  points.textContent = team.points !== null ? `${team.points} pts` : "";

  div.appendChild(name);
  div.appendChild(points);

  return div;
}

