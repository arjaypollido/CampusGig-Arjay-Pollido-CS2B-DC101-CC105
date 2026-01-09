const userForm = document.getElementById("userForm");
const userTableBody = document.querySelector("#userTable tbody");

async function fetchUsers() {
  const res = await fetch("http://localhost:3000/users");
  const users = await res.json();
  userTableBody.innerHTML = "";

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.userId}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.number}</td>
      <td>${user.role}</td>
    `;
    userTableBody.appendChild(row);
  });
}

userForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const number = document.getElementById("number").value.trim();
  const role = document.getElementById("role").value;

  const confirmed = confirm(`Add this user?\nName: ${name}\nEmail: ${email}`);
  if (!confirmed) return;

  await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, role, number })
  });

  userForm.reset();
  fetchUsers();
});

fetchUsers();
