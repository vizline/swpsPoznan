# SMOG – Badanie 1 (korelacyjne): procedura online

Projekt: *Personalizacja komunikacji prośrodowiskowej przez GenAI w oparciu o profile psychologiczne* (FRBN 75/2026/FRBN/C).

- Kod strony: katalog `smogBadanie1/`. Po każdym pushu na `main` GitHub Actions wgrywa go przez FTP (`.github/workflows/deploy-smogbadanie1.yml`).
- Adres badania: **https://swpspoznan.pl/smogBadanie1/**
- Ten katalog (`smogBadanie1-dokumentacja/`) **nie** jest wgrywany na serwer.

## Przebieg

1. Świadoma zgoda (treść z Załącznika B wniosku KE, Badanie 1) → przycisk „Rozpocznij badanie”.
2. Ankieta demograficzna: płeć, wiek (18–100), lata formalnego kształcenia (0–30), wielkość miejscowości.
3. Pięć kwestionariuszy w **losowej kolejności**. Pozycje w obrębie każdego są **losowane**, a odpowiedzi wymagane. Format karuzeli: jedna pozycja na ekranie, odpowiedzi w poziomym rzędzie, automatyczne przejście dalej, przycisk „Wstecz” (tylko w obrębie kwestionariusza). Można też odpowiadać klawiszami 1–6.
   - PVQ-21, SPSRQ-SF (21 poz., TAK/NIE), REI-24, SZZP-10 + pozycja sprawdzająca uwagę (losowo wpleciona), moduł 14 działań.
   - Formy językowe dopasowane do płci z ankiety. Przy odpowiedzi „inna / wolę nie podawać” używane są formy podwójne (np. „podobna/podobny”).
4. Zapis danych → informacja końcowa (debriefing).

Parametry URL: `PROLIFIC_PID`, `STUDY_ID`, `SESSION_ID` (dodaje Prolific); `debug=1` pokazuje dane na ekranie końcowym.
Bez `PROLIFIC_PID` badanie działa w trybie testowym (`tryb = test`, identyfikator `TEST_xxxxxxxx`).

## Ustawienia – `smogBadanie1/config.js`

| Pole | Znaczenie |
|---|---|
| `ENDPOINT` | adres aplikacji Apps Script (…/exec). Puste = brak wysyłki, podgląd i pobranie JSON na końcu |
| `TOKEN` | musi być identyczny z `TOKEN` w `Code.gs` |
| `OPINIA_NR` | numer opinii KE wstawiany do zgody |
| `PROLIFIC_COMPLETION_URL` | link powrotny do Prolific (przycisk na ekranie końcowym) |
| `WERSJA` | etykieta wersji zapisywana w danych (np. zmień na `B1-pilot` przy pilotażu) |

## Wdrożenie zapisu do Google Sheets (ok. 5 min)

1. Utwórz nowy arkusz Google (np. „SMOG B1 – dane”).
2. **Rozszerzenia → Apps Script**. Usuń zawartość `Code.gs` i wklej kod z pliku `Code.gs` z tego katalogu.
3. Zmień `TOKEN` na własny losowy ciąg i wpisz ten sam ciąg w `config.js`.
   *Zalecane:* utwórz drugi, osobny arkusz na identyfikatory Prolific i wpisz jego ID (fragment adresu między `/d/` a `/edit`) w `ID_SPREADSHEET_ID`.
4. Zapisz i uruchom funkcję `testZapisu` (przycisk ▶). Przy pierwszym uruchomieniu zaakceptuj uprawnienia. W arkuszu powinny pojawić się karty `dane` i `id_prolific` z jednym wierszem testowym (możesz go potem usunąć).
5. **Wdróż → Nowe wdrożenie → typ: Aplikacja internetowa**. Ustaw „Wykonaj jako: Ja” i „Kto ma dostęp: Każdy”. Skopiuj adres kończący się na `/exec`.
6. Wklej adres do `ENDPOINT` w `config.js` (albo przekaż go Claude'owi, a wypchnie zmianę).
7. Sprawdź: otwarcie adresu `/exec` w przeglądarce zwraca `{"ok":true,"status":"dziala"}`.

Po każdej zmianie kodu Apps Script trzeba wybrać **Wdróż → Zarządzaj wdrożeniami → Edytuj → Nowa wersja**, inaczej działa stara wersja. Adres `/exec` pozostaje bez zmian.

**Rozdzielenie ID Prolific.** Karta `dane` zawiera wyłącznie losowy `kod`. Para `kod ↔ prolific_pid` jest w `id_prolific` (albo w osobnym arkuszu). Usunięcie tej karty lub arkusza 28.02.2027 anonimizuje dane.

## Słownik zmiennych (karta `dane`)

**Meta:** `kod`, `zapis_serwer`, `duplikat` (1 = ten PROLIFIC_PID już wcześniej zapisał dane), `wersja`, `tryb` (prolific/test), `start_iso`, `end_iso`, `kolejnosc_kwest` (kolejność 5 kwestionariuszy).

**Demografia:** `plec` (1 kobieta, 2 mężczyzna, 3 inna/wolę nie podawać), `wiek`, `lata_edukacji`, `miejscowosc` (1 wieś, 2 miasto do 100 tys., 3 miasto powyżej 100 tys.).

**Pozycje surowe** (numeracja zgodna ze źródłami):
- `pvq_1`–`pvq_21`: **1 = bardzo podobna/y … 6 = zupełnie niepodobna/y** (jak w pliku PVQ-21; składnia SPSS z tego pliku działa bez zmian).
- `spsrq_2 … spsrq_24` (21 pozycji; bez 1, 6, 11): 1 = TAK, 0 = NIE.
- `rei_1`–`rei_24`: 1–5 (1 = zdecydowanie nieprawdziwe).
- `szzp_1`–`szzp_10`: 1–6 (1 = zdecydowanie się nie zgadzam); `szzp_attn`: pozycja sprawdzająca uwagę (poprawnie = 3).
- `dzial_1`–`dzial_14`: 1–5 (1 = wcale).

**Uważność:** `uwaga_ok` (1 = poprawna odpowiedź na pozycję sprawdzającą; **brak automatycznego wykluczania**). Czasy w sekundach: `t_zgoda`, `t_demografia`, `t_<kw>_instr` (czytanie instrukcji), `t_<kw>` (od pierwszej pozycji do ostatniej odpowiedzi), `t_calkowity`, gdzie `<kw>` ∈ {pvq, spsrq, rei, szzp, dzial}. `czasy_pozycji_ms` (JSON: czas odpowiedzi na każdą pozycję), `kolejnosc_pozycji` (JSON: kolejność prezentacji).

**Wskaźniki obliczone w przeglądarce** (do kontroli; w analizach liczyć ponownie z pozycji surowych):
- PVQ (wg składni z pliku PVQ-21: odwrócenie 7 − x, centrowanie względem średniej z 21 pozycji): `sc_pvq_mrat`, 10 wartości `sc_pvq_bezpieczenstwo … sc_pvq_wladza`, wymiary wyższego rzędu `sc_pvq_SelfTranscendence`, `sc_pvq_SelfEnhancement`, `sc_pvq_OpennessToChange`, `sc_pvq_Conservation`.
- SPSRQ: `sc_spsrq_SP` (suma 13 poz., 0–13), `sc_spsrq_SR` (suma 8 poz., 0–8).
- REI (sumy, odwrócenie 6 − x): `sc_rei_RA`, `sc_rei_RF`, `sc_rei_EA`, `sc_rei_EF`, `sc_rei_racjonalnosc` (12–60), `sc_rei_doswiadczeniowosc` (12–60).
- SZZP (średnie, odwrócone 5 i 10: 7 − x): `sc_szzp_afekt`, `sc_szzp_zachowania`, `sc_szzp_ogolny`.
- Działania: `sc_dzial_srednia`.

## Zmiany względem plików źródłowych (redakcyjne)

- PVQ-21: dodana wersja męska. Poprawki: „stopniu”, „jej bezpieczeństwu” (w wersji żeńskiej było „jego”), „lojalną”. Z pozycji 7 usunięto wariant w nawiasie („lub nikt ich nie widzi”). W pozycji 10 nawias „(nie odmawia sobie niczego)” pozostawiono jako doprecyzowanie.
- SPSRQ-SF: poprawki „zabawne”, „coś”, interpunkcja. Formy zależne od płci w poz. 10, 16, 17, 21, 22, 23. Instrukcja jest **autorska**, bo artykuł adaptacyjny jej nie podaje.
- REI-24: „zdecydowanie”, „muszę”, interpunkcja. Formy zależne od płci w poz. 9, 12, 13.
- SZZP i moduł działań: zwroty „Pan/Pani”, „skłonny/skłonna” dopasowane do płci.
