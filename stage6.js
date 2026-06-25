const fs = require("fs");
const path = require("path");

const API_URL = "http://4.224.186.213/evaluation-service/notifications";
const ENV_PATH = path.join(__dirname, ".env");

if (fs.existsSync(ENV_PATH)) {
  for (const line of fs.readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const [key, ...rest] = line.split("=");
    process.env[key] = rest.join("=").replace(/^"|"$/g, "");
  }
}

const PRIORITY_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

function normalize(item) {
  return {
    id: item.ID || item.id || "",
    type: item.Type || item.type || "",
    message: item.Message || item.message || "",
    timestamp: item.Timestamp || item.timestamp || "",
  };
}

function score(item, viewedIds = []) {
  const weight = PRIORITY_WEIGHT[item.type] || 0;
  const unreadBoost = viewedIds.includes(item.id) ? 0 : 1_000_000_000;
  const timeScore = Date.parse(item.timestamp) || 0;
  return unreadBoost + weight * 1_000_000 + timeScore;
}

async function fetchPage(page = 1, limit = 10, notificationType = "") {
  const url = new URL(API_URL);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(Math.min(Math.max(1, Number(limit) || 10), 10)));
  if (notificationType) url.searchParams.set("notification_type", notificationType);

  const token = process.env.AUTH_TOKEN || process.env.ACCESS_TOKEN || process.env.TOKEN || "";
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(await response.text());
  const payload = await response.json();
  return Array.isArray(payload.notifications) ? payload.notifications.map(normalize) : [];
}

async function loadPriorityInbox({ pages = 5, limit = 10, top = 10, notificationType = "" } = {}) {
  const list = [];
  for (let page = 1; page <= pages; page += 1) {
    const items = await fetchPage(page, limit, notificationType);
    list.push(...items);
    if (items.length < limit) break;
  }

  const viewedIds = [];
  const priority = [...list]
    .sort((a, b) => score(b, viewedIds) - score(a, viewedIds))
    .slice(0, top);

  return { total: list.length, notifications: priority };
}

(async () => {
  try {
    const result = await loadPriorityInbox({ pages: 5, limit: 20, top: 10 });
    console.log(`Loaded ${result.total} notifications`);
    console.table(result.notifications);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Stage 6 failed:", error.message);
    process.exitCode = 1;
  }
})();
