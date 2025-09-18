function openSidebar(content) {
  document.getElementById("sidebarContent").innerHTML = content;
  document.getElementById("sidebar").classList.add("open");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}

document.getElementById("closeSidebar").addEventListener("click", closeSidebar);

// Attach listeners to floor buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("table-btn")) {
    openSidebar("You clicked " + e.target.id.replace("-", " "));
  }
  if (e.target.classList.contains("chair-btn")) {
    openSidebar("You clicked " + e.target.id + " at " + e.target.parentElement.querySelector(".table-btn").id.replace("-", " "));
  }
});