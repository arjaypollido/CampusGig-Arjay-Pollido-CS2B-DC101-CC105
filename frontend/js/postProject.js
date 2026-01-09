const postForm = document.getElementById("postForm");

postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    userId: Number(document.getElementById("userId").value),
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    budget: Number(document.getElementById("budget").value),
    deadline: document.getElementById("deadline").value
  };

  const confirmed = confirm(`Post this project?\nTitle: ${payload.title}\nBudget: ₱${payload.budget}`);
  if (!confirmed) return;

  await fetch("http://localhost:3000/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  postForm.reset();
  window.location.href = "marketplace.html";
});
