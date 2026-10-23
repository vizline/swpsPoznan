const NBP_API = "https://api.nbp.pl/api/exchangerates/rates/a";
const STORAGE_KEY = "prolific-calculator-v2";
const defaults = {
  participants: 250,
  duration: 5,
  hourlyRate: 6,
  includeVat: false,
  includeReserve: false,
  reserveRate: 15,
  gbpPln: 5.2498,
  gbpEur: 1.1954,
};

const fields = {
  participants: document.getElementById("participants"),
  duration: document.getElementById("duration"),
  hourlyRate: document.getElementById("hourly-rate"),
  includeVat: document.getElementById("include-vat"),
  includeReserve: document.getElementById("include-reserve"),
  reserveRate: document.getElementById("reserve-rate"),
  gbpPln: document.getElementById("gbp-pln"),
  gbpEur: document.getElementById("gbp-eur"),
};

const output = {
  totalGbp: document.getElementById("total-gbp"),
  totalPln: document.getElementById("total-pln"),
  totalEur: document.getElementById("total-eur"),
  rewardTotal: document.getElementById("reward-total"),
  feeTotal: document.getElementById("fee-total"),
  vatTotal: document.getElementById("vat-total"),
  perPerson: document.getElementById("per-person"),
  reservePln: document.getElementById("reserve-pln"),
  reserveLabel: document.getElementById("reserve-label"),
  totalCaption: document.getElementById("total-caption"),
};

const money = {
  GBP: new Intl.NumberFormat("pl-PL", { style: "currency", currency: "GBP" }),
  PLN: new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }),
  EUR: new Intl.NumberFormat("pl-PL", { style: "currency", currency: "EUR" }),
};
const plainNumber = new Intl.NumberFormat("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
let latestCalculation = null;

function numeric(field, fallback = 0) {
  const value = Number.parseFloat(field.value);
  return Number.isFinite(value) ? Math.max(0, value) : fallback;
}

function calculate() {
  const participants = Math.max(1, Math.round(numeric(fields.participants, 1)));
  const duration = numeric(fields.duration);
  const hourlyRate = numeric(fields.hourlyRate);
  const platformFeeRate = 0.333;
  const includeVat = fields.includeVat.checked;
  const includeReserve = fields.includeReserve.checked;
  const reserveRate = includeReserve ? numeric(fields.reserveRate) / 100 : 0;
  const gbpPln = numeric(fields.gbpPln, defaults.gbpPln);
  const gbpEur = numeric(fields.gbpEur, defaults.gbpEur);

  const perPerson = duration / 60 * hourlyRate;
  const participantRewards = participants * perPerson;
  const platformFee = participantRewards * platformFeeRate;
  const netCost = participantRewards + platformFee;
  const vat = includeVat ? netCost * 0.23 : 0;
  const total = netCost + vat;
  const totalPln = total * gbpPln;
  const totalEur = total * gbpEur;
  const reservePln = totalPln * (1 + reserveRate);

  latestCalculation = { participants, duration, hourlyRate, perPerson, participantRewards, platformFee, vat, total, totalPln, totalEur, reservePln, reserveRate, includeVat, includeReserve, gbpPln };
  output.totalGbp.textContent = money.GBP.format(total);
  output.totalPln.textContent = plainNumber.format(totalPln);
  output.totalEur.textContent = money.EUR.format(totalEur);
  output.rewardTotal.textContent = money.PLN.format(participantRewards * gbpPln);
  output.feeTotal.textContent = money.PLN.format(platformFee * gbpPln);
  output.vatTotal.textContent = money.PLN.format(vat * gbpPln);
  output.perPerson.textContent = money.PLN.format(perPerson * gbpPln);
  output.reservePln.textContent = money.PLN.format(reservePln);
  output.reserveLabel.textContent = `${plainNumber.format(reserveRate * 100).replace(",00", "")}%`;
  output.totalCaption.textContent = includeVat ? "Z doliczonym VAT 23%" : "Bez VAT";
  document.getElementById("hourly-rate-value").textContent = `£${plainNumber.format(hourlyRate).replace(",00", "")}/h`;
  document.getElementById("reserve-field").classList.toggle("hidden", !includeReserve);
  document.getElementById("reserve-card").classList.toggle("hidden", !includeReserve);

  const guidance = document.getElementById("rate-guidance");
  guidance.textContent = hourlyRate < 6
    ? "Stawka jest niższa niż dopuszczalne minimum Prolific (£6/h)."
    : hourlyRate < 9
      ? "Stawka spełnia minimum £6/h; Prolific rekomenduje co najmniej £9/h."
      : "Stawka jest zgodna z rekomendacją Prolific wynoszącą co najmniej £9/h.";
  guidance.style.color = hourlyRate < 6 ? "#c4381d" : "";
  saveState();
}

function saveState() {
  const state = Object.fromEntries(Object.entries(fields).map(([key, field]) => [
    key,
    field.type === "checkbox" ? field.checked : field.value,
  ]));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function restoreState() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!state) return;
    Object.entries(state).forEach(([key, value]) => {
      if (!fields[key] || value === "") return;
      if (fields[key].type === "checkbox") fields[key].checked = Boolean(value);
      else fields[key].value = value;
    });
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function setRateStatus(message, state = "") {
  const status = document.getElementById("rate-status");
  status.className = `rate-status${state ? ` is-${state}` : ""}`;
  status.querySelector("span:last-child").textContent = message;
}

async function fetchRate(currency) {
  const response = await fetch(`${NBP_API}/${currency}/?format=json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`NBP: ${response.status}`);
  return response.json();
}

async function refreshRates() {
  setRateStatus("Pobieranie kursów NBP...");
  const button = document.getElementById("refresh-rates");
  button.disabled = true;
  try {
    const [gbp, eur] = await Promise.all([fetchRate("gbp"), fetchRate("eur")]);
    const gbpRate = gbp.rates[0].mid;
    const eurRate = eur.rates[0].mid;
    fields.gbpPln.value = gbpRate.toFixed(4);
    fields.gbpEur.value = (gbpRate / eurRate).toFixed(4);
    setRateStatus(`Kurs NBP z ${gbp.rates[0].effectiveDate}`, "ready");
    calculate();
  } catch (_) {
    setRateStatus("Nie udało się pobrać NBP — użyto wartości zapisanych", "error");
    calculate();
  } finally {
    button.disabled = false;
  }
}

function resetCalculator() {
  fields.participants.value = defaults.participants;
  fields.duration.value = defaults.duration;
  fields.hourlyRate.value = defaults.hourlyRate;
  fields.includeVat.checked = defaults.includeVat;
  fields.includeReserve.checked = defaults.includeReserve;
  fields.reserveRate.value = defaults.reserveRate;
  localStorage.removeItem(STORAGE_KEY);
  refreshRates();
}

async function copySummary() {
  if (!latestCalculation) return;
  const c = latestCalculation;
  const summary = [
    "Kosztorys badania Prolific",
    `Uczestnicy: ${c.participants}`,
    `Czas badania: ${c.duration} min`,
    `Stawka: ${money.GBP.format(c.hourlyRate)}/h`,
    `Wynagrodzenia: ${money.PLN.format(c.participantRewards * c.gbpPln)}`,
    `Opłata Prolific: ${money.PLN.format(c.platformFee * c.gbpPln)}`,
    `VAT: ${c.includeVat ? money.PLN.format(c.vat * c.gbpPln) : "nie doliczono"}`,
    `Razem: ${money.PLN.format(c.totalPln)} / ${money.GBP.format(c.total)} / ${money.EUR.format(c.totalEur)}`,
  ];
  if (c.includeReserve) summary.push(`Budżet z rezerwą ${plainNumber.format(c.reserveRate * 100)}%: ${money.PLN.format(c.reservePln)}`);
  await navigator.clipboard.writeText(summary.join("\n"));
  const button = document.getElementById("copy-summary");
  button.textContent = "Skopiowano";
  window.setTimeout(() => { button.textContent = "Kopiuj podsumowanie"; }, 1800);
}

Object.values(fields).forEach((field) => field.addEventListener("input", calculate));
document.getElementById("refresh-rates").addEventListener("click", refreshRates);
document.getElementById("reset-calculator").addEventListener("click", resetCalculator);
document.getElementById("copy-summary").addEventListener("click", copySummary);

restoreState();
calculate();
refreshRates();
