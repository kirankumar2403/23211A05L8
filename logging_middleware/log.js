const LOG_URL = "http://4.224.186.213/evaluation-service/logs";
const STACKS = ["backend", "frontend"];
const LEVELS = ["debug", "info", "warn", "error", "fatal"];
const PACKAGES = {
  backend: ["cache", "controller", "cron_job", "db", "domain", "handler", "repository", "route", "service"],
  frontend: ["api", "component", "hook", "page", "state", "style"],
  shared: ["auth", "config", "middleware", "utils"],
};

async function Log(stack, level, pkg, message) {
  const allowed = [...PACKAGES.shared, ...(PACKAGES[stack] || [])];
  if (!STACKS.includes(stack)) throw new TypeError("stack must be backend or frontend");
  if (!LEVELS.includes(level)) throw new TypeError("invalid level");
  if (!allowed.includes(pkg)) throw new TypeError("invalid package for stack");
  if (typeof message !== "string" || !message.trim()) throw new TypeError("message required");
  const token = process.env.AUTH_TOKEN || process.env.ACCESS_TOKEN || process.env.TOKEN;
  if (!token) throw new Error("Missing AUTH_TOKEN");

  const res = await fetch(LOG_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stack, level, package: pkg, message }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json().catch(() => res.text());
}

module.exports = { Log };
