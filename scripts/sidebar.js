function openSidebar(content) {
  document.getElementById("sidebarMessage").innerHTML = content;
  document.getElementById("sidebar").classList.add("open");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}

// Define category sets
const categories = {
  table: ["DIP", "FYP", "Flagship"],
  chair: ["Individual"]
};

// Helper: populate dropdown with a given list
function populateDropdown(type) {
  const dropdown = document.getElementById("categorySelect");
  dropdown.innerHTML = ""; // clear old options

  // Placeholder
  const placeholder = document.createElement("option");
  placeholder.textContent = "-- choose an option --";
  placeholder.disabled = true;
  placeholder.selected = true;
  dropdown.appendChild(placeholder);

  // Add options for the given type
  categories[type].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.toLowerCase();
    opt.textContent = cat;
    dropdown.appendChild(opt);
  });
}

document.getElementById("closeSidebar").addEventListener("click", closeSidebar);

// Attach listeners to floor buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("table-btn")) {
    populateDropdown("table");
    openSidebar("You clicked " + e.target.id.replace("-", " ") + 
    ",\n reserving seats 1-" + e.target.parentElement.querySelectorAll(".chair-btn").length);
  }
  if (e.target.classList.contains("chair-btn")) {
    populateDropdown("chair");
    openSidebar("You clicked " + e.target.id + " at " + e.target.parentElement.querySelector(".table-btn").id.replace("-", " "));
  }
});