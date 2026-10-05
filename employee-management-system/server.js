const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const dataFile = path.join(__dirname, "data", "employees.json");

if (!fs.existsSync(path.dirname(dataFile))) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
}
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, "[]");
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readEmployees() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return [];
  }
}

function writeEmployees(employees) {
  fs.writeFileSync(dataFile, JSON.stringify(employees, null, 2));
}

app.get("/api/employees", (req, res) => {
  res.json(readEmployees());
});

app.post("/api/employees", (req, res) => {
  const employees = readEmployees();
  const { employeeId, name, email, department, position, salary } = req.body;

  if (!employeeId || !name || !email || !department || !position || salary === undefined) {
    return res.status(400).json({ message: "Please fill all fields" });
  }

  if (employees.some(e => e.employeeId.toLowerCase() === employeeId.toLowerCase())) {
    return res.status(400).json({ message: "Employee ID already exists" });
  }

  const employee = {
    id: Date.now().toString(),
    employeeId,
    name,
    email,
    department,
    position,
    salary: Number(salary)
  };

  employees.push(employee);
  writeEmployees(employees);
  res.status(201).json({ message: "Employee added successfully", employee });
});

app.put("/api/employees/:id", (req, res) => {
  const employees = readEmployees();
  const index = employees.findIndex(e => e.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Employee not found" });
  }

  const { employeeId, name, email, department, position, salary } = req.body;

  if (employees.some(e =>
    e.employeeId.toLowerCase() === employeeId.toLowerCase() &&
    e.id !== req.params.id
  )) {
    return res.status(400).json({ message: "Employee ID already exists" });
  }

  employees[index] = {
    id: employees[index].id,
    employeeId,
    name,
    email,
    department,
    position,
    salary: Number(salary)
  };

  writeEmployees(employees);
  res.json({ message: "Employee updated successfully", employee: employees[index] });
});

app.delete("/api/employees/:id", (req, res) => {
  const employees = readEmployees();
  const newEmployees = employees.filter(e => e.id !== req.params.id);

  if (newEmployees.length === employees.length) {
    return res.status(404).json({ message: "Employee not found" });
  }

  writeEmployees(newEmployees);
  res.json({ message: "Employee deleted successfully" });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("Employee Management System");
  console.log("Server running at http://localhost:" + PORT);
});