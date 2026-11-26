/* =====================================================================
   SMOG – Badanie 1 (korelacyjne) – USTAWIENIA
   To jedyny plik, który trzeba edytować przed startem badania.
   ===================================================================== */
window.CONFIG = {
  // Wersja procedury – zapisywana w każdym wierszu danych.
  WERSJA: "B1-v1.1",

  // Adres aplikacji internetowej Google Apps Script (kończy się na /exec).
  // Puste = tryb offline: dane nie są nigdzie wysyłane, a na końcu pojawia
  // się podgląd danych i przycisk pobrania JSON (do testów).
  ENDPOINT: "https://script.google.com/macros/s/AKfycbyp_YD2kMglFv1cPHrZh_x57QoyCgBqJMDezzXRacdOXMNGfgiw6rTyByNpgaq50aAv/exec",

  // Ten sam ciąg co TOKEN w skrypcie Apps Script (prosty filtr przypadkowych
  // zapisów; nie jest to zabezpieczenie kryptograficzne, bo kod strony jest jawny).
  TOKEN: "smogB1-de3b287e0354d4ca",

  // Numer opinii Komisji ds. Etyki – wstawiany do treści zgody.
  OPINIA_NR: "[NR OPINII]",

  // Link powrotny do Prolific (np. https://app.prolific.com/submissions/complete?cc=XXXX).
  // Puste = brak przycisku powrotu na ekranie końcowym.
  PROLIFIC_COMPLETION_URL: ""
};
