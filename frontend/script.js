const API_BASE = "http://127.0.0.1:5000/api/students/";

const form = document.getElementById("student-form");
const idField = document.getElementById("student-id");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const courseField = document.getElementById("course");
const ageField = document.getElementById("age");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const formStatus = document.getElementById("form-status");
const tbody = document.getElementById("students-tbody");
const searchInput = document.getElementById("search");

function clearErrors() {
  ["name", "email", "course", "age"].forEach(
    (f) => (document.getElementById(`err-${f}`).textContent = "")
  );
  formStatus.textContent = "";
  formStatus.className = "status";
}

function showStatus(message, isError) {
  formStatus.textContent = message;
  formStatus.className = "status " + (isError ? "error" : "success");
}

// ---- Client-side validation ----
function validateClientSide() {
  clearErrors();
  let valid = true;

  if (nameField.value.trim().length < 2) {
    document.getElementById("err-name").textContent = "Name must be at least 2 characters.";
    valid = false;
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailField.value.trim())) {
    document.getElementById("err-email").textContent = "Enter a valid email.";
    valid = false;
  }
  if (courseField.value.trim() === "") {
    document.getElementById("err-course").textContent = "Course is required.";
    valid = false;
  }
  const age = Number(ageField.value);
  if (!age || age < 16 || age > 100) {
    document.getElementById("err-age").textContent = "Age must be between 16 and 100.";
    valid = false;
  }
  return valid;
}

// ---- Load / Read ----
async function loadStudents(search = "") {
  tbody.innerHTML = `<tr><td colspan="6" class="empty">Loading...</td></tr>`;
  try {
    const url = search ? `${API_BASE}?search=${encodeURIComponent(search)}` : API_BASE;
    const res = await fetch(url);
    const data = await res.json();
    renderStudents(data);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">Could not reach backend API. Is Flask running on port 5000?</td></tr>`;
  }
}

function renderStudents(students) {
  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = students
    .map(
      (s) => `
    <tr>
      <td>${s.id}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${s.age}</td>
      <td class="row-actions">
        <button class="edit-btn" onclick="startEdit(${s.id}, '${escapeAttr(s.name)}', '${escapeAttr(s.email)}', '${escapeAttr(s.course)}', ${s.age})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
      </td>
    </tr>`
    )
    .join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, "&#39;");
}

// ---- Create / Update ----
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateClientSide()) return;

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    course: courseField.value.trim(),
    age: Number(ageField.value),
  };

  const isEdit = !!idField.value;
  const url = isEdit ? `${API_BASE}${idField.value}/` : API_BASE;
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showStatus((data.errors || ["Something went wrong."]).join(" "), true);
      return;
    }

    showStatus(isEdit ? "Student updated successfully." : "Student added successfully.", false);
    resetForm();
    loadStudents(searchInput.value.trim());
  } catch (err) {
    showStatus("Could not reach backend API.", true);
  }
});

// ---- Edit ----
function startEdit(id, name, email, course, age) {
  idField.value = id;
  nameField.value = name;
  emailField.value = email;
  courseField.value = course;
  ageField.value = age;
  formTitle.textContent = "Edit Student";
  submitBtn.textContent = "Update Student";
  cancelBtn.classList.remove("hidden");
  clearErrors();
}

cancelBtn.addEventListener("click", resetForm);

function resetForm() {
  form.reset();
  idField.value = "";
  formTitle.textContent = "Add Student";
  submitBtn.textContent = "Add Student";
  cancelBtn.classList.add("hidden");
}

// ---- Delete ----
async function deleteStudent(id) {
  if (!confirm("Delete this student record?")) return;
  try {
    const res = await fetch(`${API_BASE}${id}/`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert((data.errors || ["Could not delete."]).join(" "));
      return;
    }
    loadStudents(searchInput.value.trim());
  } catch (err) {
    alert("Could not reach backend API.");
  }
}

// ---- Search ----
let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadStudents(searchInput.value.trim()), 300);
});

// Expose functions used inline in generated HTML
window.startEdit = startEdit;
window.deleteStudent = deleteStudent;

// ---- Init ----
loadStudents();
