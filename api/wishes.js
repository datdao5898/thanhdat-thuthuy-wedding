const { createSign } = require("crypto");

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk";
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || "LoiChuc";
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL || "";
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const HEADERS = ["Created At", "Name", "Message", "Recipient", "Source"];

let cachedToken = {
  value: "",
  expiresAt: 0
};

const responseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

const sendJson = (res, statusCode, payload) => {
  Object.entries(responseHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
};

const base64Url = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const signJwt = (unsignedToken) => {
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  return signer
    .sign(PRIVATE_KEY)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

const assertGoogleConfig = () => {
  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    throw new Error("Missing Google Sheets service account configuration");
  }
};

const getAccessToken = async () => {
  assertGoogleConfig();

  const now = Math.floor(Date.now() / 1000);
  if (cachedToken.value && cachedToken.expiresAt - 60 > now) {
    return cachedToken.value;
  }

  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({
    iss: CLIENT_EMAIL,
    scope: SCOPES,
    aud: TOKEN_URL,
    exp: now + 3600,
    iat: now
  }));
  const unsignedToken = `${header}.${claim}`;
  const assertion = `${unsignedToken}.${signJwt(unsignedToken)}`;

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!response.ok) {
    throw new Error("Cannot create Google access token");
  }

  const data = await response.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: now + Number(data.expires_in || 3600)
  };

  return cachedToken.value;
};

const googleRequest = async (path, options = {}) => {
  const token = await getAccessToken();
  const response = await fetch(`${SHEETS_API}/${SHEET_ID}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Sheets request failed: ${response.status} ${body}`);
  }

  return response.status === 204 ? null : response.json();
};

const quoteSheetName = (sheetName) => `'${sheetName.replace(/'/g, "''")}'`;

const ensureSheet = async () => {
  const metadata = await googleRequest("?fields=sheets.properties.title");
  const exists = metadata.sheets?.some((sheet) => sheet.properties?.title === SHEET_NAME);

  if (!exists) {
    await googleRequest(":batchUpdate", {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }]
      })
    });
  }

  const headerRange = `${quoteSheetName(SHEET_NAME)}!A1:E1`;
  const currentHeader = await googleRequest(`/values/${encodeURIComponent(headerRange)}`).catch(() => null);
  const hasHeader = Array.isArray(currentHeader?.values?.[0]) && currentHeader.values[0].join("|") === HEADERS.join("|");

  if (!hasHeader) {
    await googleRequest(`/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [HEADERS] })
    });
  }
};

const normalizeText = (value, fallback, maxLength) => {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return (text || fallback).slice(0, maxLength);
};

const normalizeMessage = (value) => String(value || "").trim().slice(0, 500);

const normalizeRecipient = (value) => {
  if (value === "groom") return "Chú rể";
  return "Cô dâu";
};

const rowToWish = (row) => ({
  createdAt: row[0] || new Date().toISOString(),
  name: row[1] || "Khách mời",
  message: row[2] || "",
  recipient: row[3] || ""
});

const readWishes = async () => {
  await ensureSheet();
  const range = `${quoteSheetName(SHEET_NAME)}!A2:E`;
  const data = await googleRequest(`/values/${encodeURIComponent(range)}?majorDimension=ROWS`);
  const rows = Array.isArray(data.values) ? data.values : [];

  return rows
    .map(rowToWish)
    .filter((wish) => wish.message)
    .reverse()
    .slice(0, 50);
};

const appendWish = async (wish) => {
  await ensureSheet();
  const range = `${quoteSheetName(SHEET_NAME)}!A:E`;

  await googleRequest(`/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({
      values: [[
        wish.createdAt,
        wish.name,
        wish.message,
        wish.recipient,
        "wedding-landing-page"
      ]]
    })
  });
};

const readRequestBody = async (req) => {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return rawBody ? JSON.parse(rawBody) : {};
};

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(responseHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (req.method === "GET") {
      const wishes = await readWishes();
      sendJson(res, 200, { wishes });
      return;
    }

    if (req.method === "POST") {
      const body = await readRequestBody(req);
      const message = normalizeMessage(body.message);

      if (!message) {
        sendJson(res, 400, { error: "Wish message is required" });
        return;
      }

      const wish = {
        createdAt: body.createdAt || new Date().toISOString(),
        name: normalizeText(body.name, "Khách mời", 80),
        message,
        recipient: normalizeRecipient(body.recipient)
      };

      await appendWish(wish);
      const wishes = await readWishes();
      sendJson(res, 201, { ok: true, wish, wishes });
      return;
    }

    sendJson(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, {
      error: "Cannot access Google Sheet wishes storage",
      detail: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};
