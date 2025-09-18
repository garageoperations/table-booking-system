fetch("positions.json")
  .then(res => res.json())
  .then(data => {
    const container = document.querySelector(".floorplan-container");

    data.tables.forEach(table => {
        // Create table group
        const tableGroup = document.createElement("div");
        tableGroup.className = "table-group";
        container.appendChild(tableGroup);

        // Table button
        const tableBtn = document.createElement("button");
        tableBtn.className = "table-btn";
        tableBtn.style.position = "absolute";
        tableBtn.style.top = (table.top + data.layout.table.top) + "px";
        tableBtn.style.left = (table.left + data.layout.table.left) + "px";
        tableGroup.appendChild(tableBtn);

        // Chairs (relative offsets)
        data.layout.chairs.forEach((chair, i) => {
            const chairBtn = document.createElement("button");
            chairBtn.className = "chair-btn";
            chairBtn.style.position = "absolute";
            chairBtn.style.top = (table.top + data.layout.table.top + chair.top) + "px";
            chairBtn.style.left = (table.left + data.layout.table.left + chair.left) + "px";
            tableGroup.appendChild(chairBtn);
      });
    });
  });
