const form = document.getElementById("employeeForm");
const table = document.getElementById("employeeTable");
const searchInput = document.getElementById("searchInput");
const employeeIndex = document.getElementById("employeeIndex");
const employeeId = document.getElementById("employeeId");
const nameInput = document.getElementById("name");
const email = document.getElementById("email");
const department = document.getElementById("department");
const position = document.getElementById("position");
const salary = document.getElementById("salary");
const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formTitle = document.getElementById("formTitle");
const totalEmployees = document.getElementById("totalEmployees");
const totalDepartments = document.getElementById("totalDepartments");
const averageSalary = document.getElementById("averageSalary");
const emptyMessage = document.getElementById("emptyMessage");
const message = document.getElementById("message");

let employees = [];

document.addEventListener("DOMContentLoaded", loadEmployees);
form.addEventListener("submit", saveEmployee);
searchInput.addEventListener("input", displayEmployees);
cancelButton.addEventListener("click", resetForm);

async function loadEmployees() {
  try {
    const response = await fetch("/api/employees");
    if (!response.ok) throw new Error();
    employees = await response.json();
    displayEmployees();
    updateStats();
  } catch {
    showMessage("Cannot connect to server. Run npm start.", true);
  }
}

async function saveEmployee(event) {
  event.preventDefault();

  const employee = {
    employeeId: employeeId.value.trim(),
    name: nameInput.value.trim(),
    email: email.value.trim(),
    department: department.value,
    position: position.value.trim(),
    salary: Number(salary.value)
  };

  const id = employeeIndex.value;

  try {
    const response = await fetch(
      id ? "/api/employees/" + id : "/api/employees",
      {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
      }
    );

    const data = await response.json();

    if (!response.ok) throw new Error(data.message);

    showMessage(data.message);
    resetForm();
    loadEmployees();
  } catch (error) {
    showMessage(error.message || "Something went wrong", true);
  }
}

function displayEmployees() {
  const search = searchInput.value.toLowerCase().trim();

  const filtered = employees.filter(e =>
    e.employeeId.toLowerCase().includes(search) ||
    e.name.toLowerCase().includes(search) ||
    e.department.toLowerCase().includes(search)
  );

  table.innerHTML = "";

  filtered.forEach(e => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHTML(e.employeeId)}</td>
      <td>${escapeHTML(e.name)}</td>
      <td>${escapeHTML(e.email)}</td>
      <td>${escapeHTML(e.department)}</td>
      <td>${escapeHTML(e.position)}</td>
      <td>₹${Number(e.salary).toLocaleString("en-IN")}</td>
      <td>
        <button class="edit" onclick="editEmployee('${e.id}')">Edit</button>
        <button class="delete" onclick="deleteEmployee('${e.id}')">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });

  emptyMessage.classList.toggle("hidden", filtered.length !== 0);
}

function editEmployee(id) {
  const e = employees.find(item => item.id === id);
  if (!e) return;

  employeeIndex.value = e.id;
  employeeId.value = e.employeeId;
  nameInput.value = e.name;
  email.value = e.email;
  department.value = e.department;
  position.value = e.position;
  salary.value = e.salary;

  formTitle.textContent = "Edit Employee";
  submitButton.textContent = "Update Employee";
  cancelButton.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteEmployee(id) {
  const e = employees.find(item => item.id === id);
  if (!e || !confirm("Delete employee " + e.name + "?")) return;

  try {
    const response = await fetch("/api/employees/" + id, {
      method: "DELETE"
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);

    showMessage(data.message);
    loadEmployees();
  } catch (error) {
    showMessage(error.message, true);
  }
}

function resetForm() {
  form.reset();
  employeeIndex.value = "";
  formTitle.textContent = "Add Employee";
  submitButton.textContent = "Add Employee";
  cancelButton.classList.add("hidden");
}

function updateStats() {
  totalEmployees.textContent = employees.length;

  totalDepartments.textContent =
    new Set(employees.map(e => e.department)).size;

  if (!employees.length) {
    averageSalary.textContent = "₹0";
    return;
  }

  const total = employees.reduce((sum, e) => sum + Number(e.salary), 0);
  averageSalary.textContent =
    "₹" + Math.round(total / employees.length).toLocaleString("en-IN");
}

function showMessage(text, error = false) {
  message.textContent = text;
  message.classList.remove("hidden");
  message.style.backgroundColor = error ? "#fee2e2" : "#e8f5e9";

  setTimeout(() => message.classList.add("hidden"), 3000);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}