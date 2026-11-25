/* =====================================================================
   SMOG – Badanie 1 (korelacyjne) – USTAWIENIA
   To jedyny plik, który trzeba edytować przed startem badania.
   ===================================================================== */
window.CONFIG = {
  // Wersja procedury – zapisywana w każdym wierszu danych.
  WERSJA: "B1-v1.0",

  // Adres aplikacji internetowej Google Apps Script (kończy się na /exec).
  // Puste = tryb offline: dane nie są nigdzie wysyłane, a na końcu pojawia
  // się podgląd danych i przycisk pobrania JSON (do testów).
  ENDPOINT: "",

  // Ten sam ciąg co TOKEN w skrypcie Apps Script (prosty filtr przypadkowych
  // zapisów; nie jest to zabezpieczenie kryptograficzne, bo kod strony jest jawny).
  TOKEN: "smog-b1-zmien-mnie",

  // Numer opinii Komisji ds. Etyki – wstawiany do treści zgody.
  OPINIA_NR: "[NR OPINII]",

  // Link powrotny do Prolific (np. https://app.prolific.com/submissions/complete?cc=XXXX).
  // Puste = brak przycisku powrotu na ekranie końcowym.
  PROLIFIC_COMPLETION_URL: ""
};
