// ------------------------------------------
// CAMPUS BUS TRACKER
// ------------------------------------------

const collegeLocation = [8.8932, 76.6141];

// ------------------------------------------
// MAP
// ------------------------------------------

const map = L.map("map").setView(collegeLocation, 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// ------------------------------------------
// BUS DATA
// ------------------------------------------

const buses = [
  {
    id: "BUS01",
    name: "Sandhanam",
    route: "Kollam → Perumon College",
    eta: 45,
    nextStop: "Perumon Campus",
    departure: "6:40 AM",
    arrival: "7:30 AM",
    delayMinutes: 0,
    position: [8.9000, 76.6200],
    color: "#2563eb"
  },
  {
    id: "BUS02",
    name: "Thejas",
    route: "City → College",
    eta: 50,
    nextStop: "Library Junction",
    departure: "8:30 AM",
    arrival: "9:15 AM",
    delayMinutes: 0,
    position: [8.8850, 76.6050],
    color: "#16a34a"
  },
  {
    id: "BUS03",
    name: "Usha",
    route: "College → City",
    eta: 50,
    nextStop: "Railway Station",
    departure: "5:00 PM",
    arrival: "5:50 PM",
    delayMinutes: 0,
    position: [8.8870, 76.6000],
    color: "#f97316"
  }
];

const busList = document.getElementById("busList");
let selectedBusId = "BUS01";

function createBusIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background:${color};
        width:42px;
        height:42px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-size:21px;
        border:4px solid white;
        box-shadow:0 4px 12px rgba(0,0,0,.3);
      ">
        🚌
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

// ------------------------------------------
// CREATE MARKERS
// ------------------------------------------

buses.forEach(bus => {
  bus.marker = L.marker(bus.position, {
    icon: createBusIcon(bus.color)
  }).addTo(map);

  bus.marker.bindPopup(`
    <strong>${bus.name}</strong><br>
    ${bus.route}<br>
    ETA: ${bus.eta} minutes
  `);
});

function getDelayLabel(delayMinutes) {
  if (delayMinutes > 0) {
    return `Delayed +${delayMinutes} min`;
  }

  return "On time";
}

function updateSelectedBusCard() {
  const selectedBus = buses.find(bus => bus.id === selectedBusId) || buses[0];
  const delayStatus = document.getElementById("busDelayStatus");
  const delayRow = document.getElementById("delayRow");

  document.getElementById("selectedBus").textContent = selectedBus.name;
  document.getElementById("eta").textContent = `${selectedBus.eta} min`;
  document.getElementById("nextStop").textContent = selectedBus.nextStop;

  delayStatus.textContent = getDelayLabel(selectedBus.delayMinutes);
  delayRow.classList.toggle("delayed", selectedBus.delayMinutes > 0);
  delayStatus.style.color = selectedBus.delayMinutes > 0 ? "#dc2626" : "#16a34a";

  const cards = document.querySelectorAll(".bus-card");
  cards.forEach(card => {
    const isActive = card.dataset.busId === selectedBus.id;
    card.classList.toggle("active", isActive);
  });
}

function renderBusList(search = "") {
  busList.innerHTML = "";

  buses
    .filter(bus => bus.name.toLowerCase().includes(search.toLowerCase()))
    .forEach(bus => {
      const card = document.createElement("div");
      card.className = "bus-card";
      card.dataset.busId = bus.id;

      if (bus.id === selectedBusId) {
        card.classList.add("active");
      }

      const delayText = getDelayLabel(bus.delayMinutes);
      const delayClass = bus.delayMinutes > 0 ? "delayed" : "on-time";

      card.innerHTML = `
        <div class="bus-header">
          <span class="bus-name">🚌 ${bus.name}</span>
          <span class="bus-status">LIVE</span>
        </div>

        <div class="bus-route">${bus.route}</div>

        <div class="bus-eta">
          <span>📍 ${bus.nextStop}</span>
          <strong>${bus.eta} min</strong>
        </div>

        <div class="status-pill ${delayClass}">${delayText}</div>

        <div class="bus-route" style="margin-top: 6px; color: #2563eb; font-weight: 600;">
          Starts: ${bus.departure || "6:40 AM"} · Arrives: ${bus.arrival || "7:30 AM"}
        </div>
      `;

      card.addEventListener("click", () => selectBus(bus));
      busList.appendChild(card);
    });
}

// ------------------------------------------
// SELECT BUS
// ------------------------------------------

function selectBus(bus) {
  selectedBusId = bus.id;
  updateSelectedBusCard();
  renderBusList(document.getElementById("searchBus").value);
  map.flyTo(bus.position, 15, { duration: 1 });
  bus.marker.openPopup();
}

// ------------------------------------------
// SEARCH
// ------------------------------------------

document.getElementById("searchBus").addEventListener("input", event => {
  renderBusList(event.target.value);
});

// ------------------------------------------
// SIMULATE LIVE BUS MOVEMENT
// ------------------------------------------

setInterval(() => {
  buses.forEach(bus => {
    const latitudeChange = (Math.random() - 0.5) * 0.0007;
    const longitudeChange = (Math.random() - 0.5) * 0.0007;

    bus.position = [
      bus.position[0] + latitudeChange,
      bus.position[1] + longitudeChange
    ];

    bus.marker.setLatLng(bus.position);

    if (Math.random() > 0.7) {
      bus.delayMinutes = 5 + Math.floor(Math.random() * 10);
    } else if (bus.delayMinutes > 0 && Math.random() > 0.5) {
      bus.delayMinutes = Math.max(0, bus.delayMinutes - 2);
    } else {
      bus.delayMinutes = 0;
    }

    bus.eta = Math.max(2, Math.min(15, Math.round(bus.eta + (Math.random() - 0.5) * 3 + (bus.delayMinutes > 0 ? 4 : 0))));

    if (bus.id === selectedBusId) {
      updateSelectedBusCard();
    }
  });

  renderBusList(document.getElementById("searchBus").value);
}, 3000);

renderBusList();
updateSelectedBusCard();
selectBus(buses[0]);
