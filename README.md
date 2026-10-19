# Dienstplan · Dein Kalender

Statische PWA für textbasierte Dienstplan-PDFs mit Datum je Zeile und Person je Spalte. Gestaltung nach dem bereitgestellten CI (Jost, #02163C, #008FA2, #97CBD3, #F5F4EF).

## Start

`npm install` und `npm run prepare-assets`, dann `npm run dev`. Im Browser http://localhost:4173 öffnen. Für Mobilgeräte und Installation über HTTPS bereitstellen. `dist/` ist vollständig statisch hostbar. Es wird kein Backend benötigt.

## Datenschutz

PDF.js liest ausschließlich lokal. Keine Upload-Endpunkte, keine Telemetrie, kein Local Storage, keine IndexedDB. Der Service Worker speichert ausschließlich eine explizite Liste von App-Dateien. Original-PDFs und Styleguide liegen außerhalb des App-Projekts und werden nicht veröffentlicht. Reset und pagehide entfernen Referenzen auf eingelesene Daten. Garbage Collection wird vom Browser verwaltet. Exporte bleiben auf dem Gerät bzw. im gewählten Kalender; diese Kopien können von der PWA nicht gelöscht werden.

## Grenzen

Nur Tabellen mit Datum je Zeile und Namen je Spalte; keine OCR. Gedrehte Namen werden über PDF-Textkoordinaten gelesen. Mehrere Seiten werden nach Name und Datum zusammengeführt; widersprüchliche Versionen und leere Zellen werden zurückgewiesen. Fremde Layouts müssen geprüft werden; keine allgemeine PDF-Erkennung garantiert. Die bereitgestellte Beispiel-PDF ist Testeingabe, kein eingebauter Demo-Datensatz.

Der Beispieldienstplan enthält nur Beginne. Export erfordert eine bewusste Wahl zwischen Start ohne Ende und fester Dauer. `17br` wird als Beginn 17:00 mit dem Originalkürzel interpretiert. Office/Poker/Seminar und unbekannte Kürzel ohne Uhrzeit werden als ganztägig angezeigt und können abgewählt werden. Frei und U werden standardmäßig ausgeschlossen. Vorschau vor jedem Export prüfen.

ICS: RFC-5545-Zeilenenden, UTF-8-Zeilenfaltung, Text-Escaping, stabile UIDs, echte UTC-Termine mit Europe/Berlin-Umrechnung sowie exklusive Enddaten für ganztägige Einträge. Feste Dauer bedeutet verstrichene Stunden. Wiederholte Importe können trotz stabiler UIDs je nach Kalender Duplikate erzeugen.

Web Share öffnet das System-Teilen-Menü, wenn ICS unterstützt wird. Direktimport kann von einer PWA nicht erzwungen werden. Android Google Kalender bietet den Dateiimport in der Desktop-Weboberfläche. Auf iOS hängen ICS-Import und Teilen-Ziele von Version und Apps ab. Download-Fallback und Hilfe sind eingebaut. Tests auf echten iOS-/Android-Geräten stehen noch aus.

## Prüfung

`npm test` prüft Parser und ICS. `npm run test:pdf` prüft eine vollständig künstliche PDF mit gedrehten Namensspalten. `npm run test:browser` prüft lokalen Import, Auswahl, Export, Reset, Offline-Verarbeitung und mobile Darstellung mit Playwright (Chromium vorher mit `npx playwright install chromium` installieren). Kein Testdatensatz wird in dist ausgeliefert.

## GitHub Pages

Die App wird unter https://djgorex.github.io/br-dienstplan-import/ bereitgestellt. Der Workflow `.github/workflows/pages.yml` installiert Abhängigkeiten, erzeugt lokale PDF.js-/Schrift-Assets, prüft Parser/ICS und den vollständigen Browserablauf am Projekt-Unterpfad und veröffentlicht nur `dist/`. Jeder Push auf `main` aktualisiert die Seite. `Settings → Pages → Source` muss auf `GitHub Actions` stehen.

Das Repository und die Website sind öffentlich. Importierte Dienstpläne verbleiben lokal im Browser. Alle veröffentlichten Tests verwenden künstliche Daten. Originaldateien und interne Hosting-Metadaten sind nicht Teil des Repositorys. GitHub Pages unterstützt die Datei `_headers` nicht; deren HTTP-Header gelten dort nicht. Die App lädt weiterhin keine externen Skripte, Fonts oder Analysedienste.
