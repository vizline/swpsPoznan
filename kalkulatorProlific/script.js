const NBP_API = "https://api.nbp.pl/api/exchangerates/rates/a";
const defaults = {
  participants: 250,
  duration: 5,
  hourlyRate: 6,
  platformFee: 33.3,
  vatRate: 23,
  reserveRate: 15,
  vatBase: "fee",
  gbpPln: 5.2498,
  gbpEur: 1.1954,
};

const fields = {
  participants: document.getElementById("participants"),
  duration: document.getElementById("duration"),
  hourlyRate: document.getElementById("hourly-rate"),
  platformFee: document.getElementById("platform-fee"),
  vatRate: document.getElementById("vat-rate"),
  reserveRate: document.getElementById("reserve-rate"),
  vatBase: document.getElementById("vat-base"),
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
  const platformFeeRate = numeric(fields.platformFee) / 100;
  const vatRate = numeric(fields.vatRate) / 100;
  const reserveRate = numeric(fields.reserveRate) / 100;
  const gbpPln = numeric(fields.gbpPln, defaults.gbpPln);
  const gbpEur = numeric(fields.gbpEur, defaults.gbpEur);

  const perPerson = duration / 60 * hourlyRate;
  const participantRewards = participants * perPerson;
  const platformFee = participantRewards * platformFeeRate;
  const netCost = participantRewards + platformFee;
  const vatBase = fields.vatBase.value === "total" ? netCost : platformFee;
  const vat = vatBase * vatRate;
  const total = netCost + vat;
  const totalPln = total * gbpPln;
  const totalEur = total * gbpEur;
  const reservePln = totalPln * (1 + reserveRate);

  latestCalculation = { participants, duration, hourlyRate, perPerson, participantRewards, platformFee, vat, total, totalPln, totalEur, reservePln, reserveRate };
  output.totalGbp.textContent = plainNumber.format(total);
  output.totalPln.textContent = money.PLN.format(totalPln);
  output.totalEur.textContent = money.EUR.format(totalEur);
  output.rewardTotal.textContent = money.GBP.format(participantRewards);
  output.feeTotal.textContent = money.GBP.format(platformFee);
  output.vatTotal.textContent = money.GBP.format(vat);
  output.perPerson.textContent = money.GBP.format(perPerson);
  output.reservePln.textContent = money.PLN.format(reservePln);
  output.reserveLabel.textContent = `${plainNumber.format(reserveRate * 100).replace(",00", "")}%`;
  output.totalCaption.textContent = fields.vatBase.value === "total"
    ? "Z VAT naliczonym od całego kosztu, jak w arkuszu"
    : "Z VAT naliczonym od opłaty platformowej";

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
  const state = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
  localStorage.setItem("prolific-calculator", JSON.stringify(state));
}

function restoreState() {
  try {
    const state = JSON.parse(localStorage.getItem("prolific-calculator"));
    if (!state) return;
    Object.entries(state).forEach(([key, value]) => {
      if (fields[key] && value !== "") fields[key].value = value;
    });
  } catch (_) {
    localStorage.removeItem("prolific-calculator");
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
  fields.platformFee.value = defaults.platformFee;
  fields.vatRate.value = defaults.vatRate;
  fields.reserveRate.value = defaults.reserveRate;
  fields.vatBase.value = defaults.vatBase;
  localStorage.removeItem("prolific-calculator");
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
    `Wynagrodzenia: ${money.GBP.format(c.participantRewards)}`,
    `Opłata Prolific: ${money.GBP.format(c.platformFee)}`,
    `VAT: ${money.GBP.format(c.vat)}`,
    `Razem: ${money.GBP.format(c.total)} / ${money.PLN.format(c.totalPln)} / ${money.EUR.format(c.totalEur)}`,
    `Budżet z rezerwą: ${money.PLN.format(c.reservePln)}`,
  ].join("\n");
  await navigator.clipboard.writeText(summary);
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
