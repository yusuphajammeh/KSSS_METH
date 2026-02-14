const CONFIG = {
    owner: "KSSS-MTC", 
    repo: "KSSS_MATH_QUIZ_COMPETITION", // Change this if your repo name is different
    branch: "main"
};

let currentUser = "";
let githubToken = "";
let currentData = null;
let currentSha = "";

function login() {
    currentUser = document.getElementById("admin-name").value;
    githubToken = document.getElementById("gh-token").value.trim();
    if(!currentUser || !githubToken) return alert("Please select name and paste token");
    
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("grade-section").classList.remove("hidden");
}

async function loadMatches() {
    const grade = document.getElementById("grade-select").value;
    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/data/competition-grade${grade}.json`;
    
    updateStatus("Fetching data...", "#eee");

    try {
        const res = await fetch(url, {
            headers: { "Authorization": `token ${githubToken}` }
        });
        const json = await res.json();
        currentSha = json.sha;
        currentData = JSON.parse(atob(json.content));
        
        renderForm();
    } catch (e) {
        updateStatus("Error loading data. Check your token.", "#fee");
    }
}

function renderForm() {
    const container = document.getElementById("matches-list");
    container.innerHTML = `<h3>Editing Grade ${currentData.grade}</h3>`;
    
    currentData.rounds.forEach((round, rIdx) => {
        round.matches.forEach((m, mIdx) => {
            const div = document.createElement("div");
            div.className = "match-card";
            div.innerHTML = `
                <p><strong>${round.name} - Match ${m.id}</strong></p>
                ${m.teamA.name}: <input type="number" id="r${rIdx}m${mIdx}a" value="${m.teamA.points || ''}"> <br>
                ${m.teamB.name}: <input type="number" id="r${rIdx}m${mIdx}b" value="${m.teamB.points || ''}">
            `;
            container.appendChild(div);
        });
    });
    
    document.getElementById("grade-section").classList.add("hidden");
    document.getElementById("editor-section").classList.remove("hidden");
}

async function saveToGitHub() {
    if(!confirm("This will update the live website. Continue?")) return;

    // Update local data object
    currentData.rounds.forEach((round, rIdx) => {
        round.matches.forEach((m, mIdx) => {
            const valA = document.getElementById(`r${rIdx}m${mIdx}a`).value;
            const valB = document.getElementById(`r${rIdx}m${mIdx}b`).value;
            m.teamA.points = valA === "" ? null : parseInt(valA);
            m.teamB.points = valB === "" ? null : parseInt(valB);
            
            // Auto-Winner logic
            if(m.teamA.points > m.teamB.points) m.winner = m.teamA.name;
            else if(m.teamB.points > m.teamA.points) m.winner = m.teamB.name;
            else m.winner = null;
        });
    });

    const grade = currentData.grade;
    const path = `data/competition-grade${grade}.json`;
    
    // Audit Log: includes user name in the commit message
    const commitMsg = `Score Update by ${currentUser} (Grade ${grade})`;

    try {
        updateStatus("Uploading to MTC GitHub...", "#e0f7fa");
        const res = await fetch(`https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`, {
            method: "PUT",
            headers: {
                "Authorization": `token ${githubToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: commitMsg,
                content: btoa(JSON.stringify(currentData, null, 2)),
                sha: currentSha
            })
        });

        if(res.ok) {
            updateStatus("✅ SUCCESS! Website will update in 1 minute.", "#dcfce7");
            setTimeout(() => location.reload(), 3000);
        } else {
            throw new Error();
        }
    } catch (e) {
        updateStatus("❌ Failed to save. Ensure token has 'repo' permissions.", "#fee");
    }
}

function updateStatus(text, color) {
    const s = document.getElementById("status-msg");
    s.style.display = "block";
    s.style.backgroundColor = color;
    s.innerText = text;
}