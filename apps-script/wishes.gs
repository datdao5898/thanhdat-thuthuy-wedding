const SHEET_ID = "18YsBG6xZqaX2qS4_bRT212362QT1cyvLOqnyBwBcNAk";
const SHEET_NAME = "LoiChuc";
const HEADERS = ["Created At", "Name", "Message", "Recipient", "Attendance", "Source"];
const LEGACY_HEADERS = ["Created At", "Name", "Message", "Recipient", "Source"];
const WISHES_CACHE_KEY = "tdtt_wedding_wishes";
const WISHES_CACHE_SECONDS = 60;

function doGet() {
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
  return "Sẽ tham dự";
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
