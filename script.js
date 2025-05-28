<script>
function ladeTrinkdaten() {
  fetch("unload.php")
    .then(res => res.json())
    .then(json => {
      const daten = json.daten;
      if (!Array.isArray(daten)) return;

      const heute = new Date().toISOString().split("T")[0]; // z.B. "2025-05-15"
      let summeHeute = 0;
      let letzterZeitpunkt = null;

      daten.forEach(eintrag => {
        const zeit = new Date(eintrag.zeit);
        const datum = zeit.toISOString().split("T")[0];

        if (datum === heute) {
          const ml = parseFloat(eintrag.wert);
          if (!isNaN(ml)) {
            summeHeute += ml;
          }
        }

        if (!letzterZeitpunkt || new Date(eintrag.zeit) > letzterZeitpunkt) {
          letzterZeitpunkt = new Date(eintrag.zeit);
        }
      });

      // Umwandlung in Liter
      const literHeute = summeHeute / 1000;
      const ziel = 2.5;

      // Anzeige aktualisieren
      document.querySelector(".stats .highlight").textContent = literHeute.toFixed(2) + " L";
      document.querySelector(".stats span:not(.highlight)").textContent = ziel + " L";

      // Fortschritt
      const prozent = Math.min((literHeute / ziel) * 100, 100);
      document.querySelector(".fill").style.width = prozent + "%";

      // Zeit seit letzter Eintragung
      if (letzterZeitpunkt) {
        const jetzt = new Date();
        const diffMinuten = Math.round((jetzt - letzterZeitpunkt) / 60000);
        document.querySelector(".stats div:last-child .highlight").textContent = `vor ${diffMinuten} min`;
      }
    })
}

ladeTrinkdaten();
setInterval(ladeTrinkdaten, 10000); // alle 10 Sekunden neu laden
</script>
