const SHEET_ID = "18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk";
const SHEET_NAME = "LoiChuc";
const HEADERS = ["Created At", "Name", "Message", "Recipient", "Attendance", "Source"];
const LEGACY_HEADERS = ["Created At", "Name", "Message", "Recipient", "Source"];
const WISHES_CACHE_KEY = "tdtt_wedding_wishes";
const WISHES_CACHE_SECONDS = 60;
const GUEST_SHEET_NAME = "KhachMoi";
const GUEST_HEADERS = ["Code", "Name", "Audience", "Updated At"];
const GUEST_ADMIN_KEY_PROPERTY = "GUEST_ADMIN_KEY";

function doGet(event) {
  const action = event && event.parameter ? String(event.parameter.action || "") : "";

  if (action === "guest") {
    const guest = readGuest_(event.parameter.code);
    return json_({
      ok: Boolean(guest),
      guest: guest || null,
      error: guest ? "" : "Guest code not found"
    });
  }

  return json_({
    ok: true,
    wishes: readCachedWishes_()
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const body = parseBody_(event);

    if (body.action === "guest-upsert") {
      assertGuestAdminKey_(body.adminKey);
      const guest = upsertGuest_(body);
      return json_({
        ok: true,
        guest
      });
    }

    const message = normalizeMessage_(body.message);

    if (!message) {
      return json_({
        ok: false,
        error: "Wish message is required"
      });
    }

    const wish = {
      createdAt: body.createdAt || new Date().toISOString(),
      name: normalizeText_(body.name, "Khách mời", 80),
      message,
      recipient: normalizeRecipient_(body.recipient),
      attendance: normalizeAttendance_(body.attendance)
    };

    appendWish_(wish);
    const wishes = readWishes_();
    cacheWishes_(wishes);

    return json_({
      ok: true,
      wish,
      wishes
    });
  } catch (error) {
    return json_({
      ok: false,
      error: error.message || "Cannot save wish"
    });
  } finally {
    lock.releaseLock();
  }
}

function getGuestSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(GUEST_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(GUEST_SHEET_NAME);
  }

  const currentHeader = sheet.getRange(1, 1, 1, GUEST_HEADERS.length).getValues()[0];
  if (currentHeader.join("|") !== GUEST_HEADERS.join("|")) {
    sheet.getRange(1, 1, 1, GUEST_HEADERS.length).setValues([GUEST_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function normalizeGuestCode_(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 24);
}

function normalizeGuestAudience_(value) {
  return value === "senior" ? "senior" : "friend";
}

function rowToGuest_(row) {
  return {
    code: String(row[0] || ""),
    name: String(row[1] || ""),
    audience: normalizeGuestAudience_(row[2]),
    updatedAt: row[3] instanceof Date ? row[3].toISOString() : String(row[3] || "")
  };
}

function readGuest_(rawCode) {
  const code = normalizeGuestCode_(rawCode);
  if (!code) return null;

  const sheet = getGuestSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;

  const match = sheet
    .getRange(2, 1, lastRow - 1, 1)
    .createTextFinder(code)
    .matchEntireCell(true)
    .findNext();

  if (!match) return null;
  return rowToGuest_(sheet.getRange(match.getRow(), 1, 1, GUEST_HEADERS.length).getValues()[0]);
}

function assertGuestAdminKey_(providedKey) {
  const expectedKey = PropertiesService
    .getScriptProperties()
    .getProperty(GUEST_ADMIN_KEY_PROPERTY);

  if (!expectedKey) {
    throw new Error("Guest admin key is not configured");
  }
  if (String(providedKey || "") !== expectedKey) {
    throw new Error("Guest admin key is invalid");
  }
}

function upsertGuest_(body) {
  const code = normalizeGuestCode_(body.code);
  const name = normalizeText_(body.name, "", 100);
  const audience = normalizeGuestAudience_(body.audience);

  if (code.length < 2) throw new Error("Guest code must contain at least 2 characters");
  if (!name) throw new Error("Guest name is required");

  const sheet = getGuestSheet_();
  const guest = {
    code,
    name,
    audience,
    updatedAt: new Date().toISOString()
  };
  const lastRow = sheet.getLastRow();
  const match = lastRow < 2
    ? null
    : sheet
      .getRange(2, 1, lastRow - 1, 1)
      .createTextFinder(code)
      .matchEntireCell(true)
      .findNext();
  const targetRow = match ? match.getRow() : lastRow + 1;

  sheet.getRange(targetRow, 1, 1, GUEST_HEADERS.length).setValues([[
    guest.code,
    guest.name,
    guest.audience,
    guest.updatedAt
  ]]);

  return guest;
}

function parseBody_(event) {
  if (!event || !event.postData || !event.postData.contents) return {};
  return JSON.parse(event.postData.contents);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const currentHeader = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeader = currentHeader.join("|") === HEADERS.join("|");
  const hasLegacyHeader = currentHeader.slice(0, LEGACY_HEADERS.length).join("|") === LEGACY_HEADERS.join("|");

  if (hasLegacyHeader) {
    sheet.insertColumnBefore(5);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }

  if (!hasHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function appendWish_(wish) {
  const sheet = getSheet_();
  sheet.appendRow([
    wish.createdAt,
    wish.name,
    wish.message,
    wish.recipient,
    wish.attendance,
    "wedding-landing-page"
  ]);
}

function readWishes_() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();

  return rows
    .map(rowToWish_)
    .filter(function (wish) {
      return wish.message;
    })
    .reverse()
    .slice(0, 50);
}

function readCachedWishes_() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get(WISHES_CACHE_KEY);

  if (cached) {
    return JSON.parse(cached);
  }

  const wishes = readWishes_();
  cacheWishes_(wishes);
  return wishes;
}

function cacheWishes_(wishes) {
  CacheService
    .getScriptCache()
    .put(WISHES_CACHE_KEY, JSON.stringify(wishes), WISHES_CACHE_SECONDS);
}

function rowToWish_(row) {
  const createdAt = row[0] instanceof Date ? row[0].toISOString() : String(row[0] || new Date().toISOString());
  const legacySource = row[4] === "wedding-landing-page";

  return {
    createdAt,
    name: String(row[1] || "Khách mời"),
    message: String(row[2] || ""),
    recipient: String(row[3] || ""),
    attendance: legacySource ? "" : String(row[4] || "")
  };
}

function normalizeText_(value, fallback, maxLength) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return (text || fallback).slice(0, maxLength);
}

function normalizeMessage_(value) {
  return String(value || "").trim().slice(0, 500);
}

function normalizeRecipient_(value) {
  if (value === "groom" || value === "Chú rể") return "Chú rể";
  return "Cô dâu";
}

function normalizeAttendance_(value) {
  if (value === "declined") return "Không thể tham dự";
  if (value === "maybe") return "Chưa chắc";
  if (value === "attending") return "Sẽ tham dự";
  return "";
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
