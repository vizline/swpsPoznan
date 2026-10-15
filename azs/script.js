const PUBLIC_API_URL = "https://script.google.com/macros/s/AKfycbxght7_jio1c4jCHeFFP5Ols0lDUkpGXBs5iZY0HNRUyfQSE8QQZWgAqZCD0lfgpvGp4Q/exec";

const tabButtons = [...document.querySelectorAll("[data-tab-button]")];
const tabPanels = [...document.querySelectorAll("[data-tab-panel]")];

function openTab(tabName, updateHash = true) {
  const targetPanel = tabPanels.find((panel) => panel.dataset.tabPanel === tabName);
  if (!targetPanel) return;

  tabButtons.forEach((button) => {
    const isActive = button.dataset.tabButton === tabName;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  tabPanels.forEach((panel) => {
    const isActive = panel === targetPanel;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
  if (updateHash) history.replaceState(null, "", `#${tabName}`);
}

tabButtons.forEach((button) => button.addEventListener("click", () => openTab(button.dataset.tabButton)));
document.querySelectorAll("[data-open-tab]").forEach((control) => control.addEventListener("click", () => openTab(control.dataset.openTab)));

function renderAnnouncements(announcements) {
  const mount = document.getElementById("announcements-list");
  mount.replaceChildren();
  if (!announcements.length) {
    const empty = document.createElement("article");
    empty.className = "empty-card";
    empty.innerHTML = "<p>Obecnie nie ma żadnych aktywnych komunikatów.</p>";
    mount.appendChild(empty);
    return;
  }
  announcements.forEach((announcement) => {
    const article = document.createElement("article");
    article.className = "announcement-card";
    const date = document.createElement("p");
    date.className = "announcement-card__date";
    date.textContent = `Opublikowano: ${announcement.publishedAt || "-"}`;
    const message = document.createElement("p");
    message.className = "announcement-card__message";
    message.textContent = announcement.message || "";
    article.append(date, message);
    mount.appendChild(article);
  });
}

function linkifyText(text) {
  const fragment = document.createDocumentFragment();
  const urlPattern = /https?:\/\/[^\s)]+/g;
  let cursor = 0;
  for (const match of text.matchAll(urlPattern)) {
    fragment.append(document.createTextNode(text.slice(cursor, match.index)));
    const link = document.createElement("a");
    link.href = match[0].replace(/[.,;]+$/, "");
    link.textContent = link.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    fragment.append(link);
    cursor = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(cursor)));
  return fragment;
}

function renderMembershipInfo(content) {
  if (!content) return;
  const mount = document.getElementById("membership-content");
  mount.replaceChildren();
  content.split(/\n\s*\n/).filter(Boolean).forEach((paragraph) => {
    const element = document.createElement("p");
    element.append(linkifyText(paragraph.trim()));
    mount.appendChild(element);
  });
}

function setSyncStatus(message, isError = false) {
  const badge = document.getElementById("announcements-status");
  badge.textContent = message;
  badge.classList.toggle("is-error", isError);
}

function showLoadError() {
  setSyncStatus("Brak połączenia", true);
  document.getElementById("announcements-list").innerHTML = '<article class="empty-card"><p>Nie udało się teraz pobrać komunikatów. Spróbuj ponownie później.</p></article>';
}

function loadPublicContent() {
  const callbackName = `azsPublicData_${Date.now()}`;
  const request = document.createElement("script");
  const timeout = window.setTimeout(() => {
    cleanup();
    showLoadError();
  }, 10000);

  function cleanup() {
    window.clearTimeout(timeout);
    request.remove();
    delete window[callbackName];
  }

  window[callbackName] = (data) => {
    cleanup();
    renderAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
    renderMembershipInfo(data.membershipInfo || "");
    setSyncStatus("Dane aktualne");
  };
  request.onerror = () => {
    cleanup();
    showLoadError();
  };
  request.src = `${PUBLIC_API_URL}?api=public-portal&callback=${encodeURIComponent(callbackName)}&t=${Date.now()}`;
  document.head.appendChild(request);
}

const initialTab = location.hash.slice(1);
openTab(tabPanels.some((panel) => panel.dataset.tabPanel === initialTab) ? initialTab : "announcements", false);
loadPublicContent();
window.setInterval(loadPublicContent, 5 * 60 * 1000);
