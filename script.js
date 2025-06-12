function ladeTrinkdaten() {
  fetch("unload.php")
    .then(res => res.json())
    .then(json => {
      const daten = json.daten;
      if (!Array.isArray(daten)) return;

      const heute = new Date().toISOString().split("T")[0];

      // Werte von heute filtern und sortieren
      const datenHeute = daten
        .filter(eintrag => eintrag.zeit.startsWith(heute))
        .sort((a, b) => new Date(a.zeit) - new Date(b.zeit));

      let summeHeute = 0;
      for (let i = 1; i < datenHeute.length; i++) {
        const vorher = parseFloat(datenHeute[i - 1].wert);
        const jetzt = parseFloat(datenHeute[i].wert);
        if (!isNaN(vorher) && !isNaN(jetzt)) {
          const diff = vorher - jetzt;
          if (diff > 0) {
            summeHeute += diff;
          }
        }
      }

      const literHeute = summeHeute / 1000;
      const zielLiter = 2.5;
      const maxLiter = 3;

      document.getElementById("menge-aktuell").textContent = literHeute.toFixed(2) + " L";
      document.getElementById("menge-ziel").textContent = zielLiter + " L";
      const prozent = Math.min((literHeute / maxLiter) * 100, 100);
      document.getElementById("progress-fill").style.width = prozent + "%";

      // Letzter Messzeitpunkt insgesamt (optional)
      let letzterZeitpunkt = null;
      daten.forEach(eintrag => {
        const zeit = new Date(eintrag.zeit);
        if (!letzterZeitpunkt || zeit > letzterZeitpunkt) {
          letzterZeitpunkt = zeit;
        }
      });
      if (letzterZeitpunkt) {
        const jetzt = new Date();
        const diffMin = Math.round((jetzt - letzterZeitpunkt) / 60000);
        document.getElementById("letzte-zeit").textContent = `vor ${diffMin} min`;
      }
    });
}

function ladeWochenstatistik() {
  fetch("unload.php")
    .then(res => res.json())
    .then(json => {
      const daten = json.daten;
      if (!Array.isArray(daten)) return;

      const heute = new Date();
      const tageMap = {
        0: "So", 1: "Mo", 2: "Di", 3: "Mi",
        4: "Do", 5: "Fr", 6: "Sa"
      };

      // Objekt für Summen pro Tag initialisieren
      const trinkMengenProTag = {
        "Mo": 0, "Di": 0, "Mi": 0,
        "Do": 0, "Fr": 0, "Sa": 0, "So": 0
      };

      // Alle Daten gruppieren nach Tag und sortieren pro Tag
      const datenNachTag = {};

      daten.forEach(eintrag => {
        const zeit = new Date(eintrag.zeit);
        const diffTage = Math.floor((heute - zeit) / (1000 * 60 * 60 * 24));
        if (diffTage < 7 && diffTage >= 0) {
          const datumStr = zeit.toISOString().split("T")[0];
          if (!datenNachTag[datumStr]) datenNachTag[datumStr] = [];
          datenNachTag[datumStr].push({
            zeit: zeit,
            wert: parseFloat(eintrag.wert)
          });
        }
      });

      // Für jeden Tag: sortieren, Differenzen (nur Abnahme) summieren
      Object.entries(datenNachTag).forEach(([datum, eintraege]) => {
        eintraege.sort((a, b) => a.zeit - b.zeit);

        let summeDiff = 0;
        for (let i = 1; i < eintraege.length; i++) {
          const diff = eintraege[i - 1].wert - eintraege[i].wert;
          if (diff > 0) summeDiff += diff;
        }

        // Tag der Woche ermitteln
        const tagNum = new Date(datum).getDay();
        const tagName = tageMap[tagNum];
        if (tagName) {
          trinkMengenProTag[tagName] = summeDiff / 1000; // in Liter
        }
      });

      const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const datenChart = labels.map(tag => trinkMengenProTag[tag] || 0);

      zeichneChart(labels, datenChart);
    });
}

function zeichneChart(labels, data) {
  const ctx = document.getElementById("chart").getContext("2d");
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Ø Trinkmenge pro Tag",
        data: data,
        backgroundColor: "#BE6C54",
        borderRadius: 7,
        barPercentage: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 3,
          ticks: {
            stepSize: 1,
            callback: value => value + " Liter",
            font: { family: "'Georgia', serif" }
          },
          grid: { drawBorder: false }
        },
        x: {
          ticks: { font: { family: "'Georgia', serif" } },
          grid: { drawBorder: false, display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          bodyFont: { family: "'Georgia', serif" },
          titleFont: { family: "'Georgia', serif" }
        }
      },
      font: { family: "'Georgia', serif" }
    }
  });
}

// Aufruf beim Laden der Seite
ladeTrinkdaten();
ladeWochenstatistik();
setInterval(ladeTrinkdaten, 10000);