const feed = document.getElementById("projectFeed");
const slider = document.getElementById("budgetRange");
const sliderLabel = document.getElementById("budgetValue");

let projects = [];

async function loadProjects() {
  try {
    const res = await fetch("http://localhost:3000/projects");
    projects = await res.json();
    renderProjects();
  } catch (err) {
    console.error("Failed to load projects:", err);
    feed.innerHTML = "<p>Failed to load projects.</p>";
  }
}

function renderProjects() {
  const minBudget = Number(slider.value);
  sliderLabel.textContent = `₱${minBudget}`;
  feed.innerHTML = "";

  projects
    .filter(p => p.budget >= minBudget)
    .forEach(p => {
      let actionButton = "";

      if (p.status === "available") {
        actionButton = `<button onclick="acceptTask(${p.projectId}, ${p.budget})">Accept Task</button>`;
      } else if (p.status === "in_progress") {
        actionButton = `<button onclick="finishTask(${p.projectId})">Finish Project</button>`;
      } else {
        actionButton = `<button disabled>Finished ✔</button>`;
      }

      feed.innerHTML += `
        <div class="project-card">
          <h2>${p.title}</h2>
          <p>${p.description}</p>
          <div class="budget">Budget: ₱${p.budget}</div>
          <div class="status">Status: ${p.status}</div>
          <div class="owner">Client: ${p.ownerName} (${p.ownerEmail}) <br>Number: ${p.ownerNumber}</div>
          <div class="freelancer"> ${p.freelancerName && p.freelancerEmail ? `Freelancer: ${p.freelancerName} (${p.freelancerEmail}) <br>Number: ${p.freelancerNumber}` : "Freelancer: Not accepted yet"}</div>
          <div class="deadline">Deadline: ${new Date(p.deadline).toLocaleDateString()}</div>
          <div class="actions">
            ${actionButton}
            ${
              p.status !== "completed"
                ? `<button onclick="cancelProject(${p.projectId})">Cancel</button>`
                : ""
            }
          </div>
        </div>
      `;
    });
}

slider.addEventListener("input", renderProjects);

async function acceptTask(projectId, budget) {
  const freelancerId = prompt("Enter your Freelancer User ID:");
  if (!freelancerId) return;

  const confirmed = confirm("Do you want to accept this task?");
  if (!confirmed) return;

  try {
    const res = await fetch("http://localhost:3000/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        freelancerId: Number(freelancerId), 
        agreedAmount: budget
      })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed to accept project");
      return;
    }

    await loadProjects();
  } catch (err) {
    console.error("Failed to accept project:", err);
    alert("Failed to accept project.");
  }
}

async function finishTask(projectId) {
  const confirmed = confirm("Mark project as finished?");
  if (!confirmed) return;

  try {
    await fetch(`http://localhost:3000/projects/${projectId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" })
    });

    loadProjects();
  } catch (err) {
    console.error("Failed to finish project:", err);
    alert("Failed to finish project.");
  }
}

async function cancelProject(projectId) {
  const proj = projects.find(p => p.projectId === projectId);
  if (!proj) return;

  try {
    if (proj.status === "in_progress") {
      const confirmed = confirm(
        "This project is in progress. Confirm reset to available? It can be accepted again."
      );
      if (!confirmed) return;

      await fetch(`http://localhost:3000/projects/${projectId}/cancel`, {
        method: "PATCH"
      });
    } else {
      const confirmed = confirm("Are you sure you want to delete this project?");
      if (!confirmed) return;

      await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: "DELETE"
      });
    }

    loadProjects();
  } catch (err) {
    console.error("Failed to cancel project:", err);
    alert("Failed to cancel project.");
  }
}

loadProjects();
