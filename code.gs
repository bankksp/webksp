/**
 * Google Apps Script Backend for KSP Panyanukun Website
 * 
 * IMPORTANT: If you see "ไม่ได้รับอนุญาตให้เข้าถึง: DriveApp" (Not authorized to access: DriveApp):
 * 1. Open this script in the Google Apps Script editor.
 * 2. Click the "Run" button for the 'initScript' function below.
 * 3. A popup will appear asking for permissions. Click "Review Permissions" and allow everything.
 * 4. Click "Deploy" > "New Deployment".
 * 5. Select "Web App", set "Execute as: Me" and "Who has access: Anyone".
 * 6. Click "Deploy" and use the NEW URL in your React app.
 * 
 * Scopes required:
 * - https://www.googleapis.com/auth/drive
 * - https://www.googleapis.com/auth/spreadsheets
 */

const SECRET = "KSP_PANYA_SECRET_2026";
const FOLDER_ID = "17ZSTF_q9yal63BK1UdALLsh7MfYlNUdK";

/**
 * SECURITY NOTE:
 * To prevent unauthorized access:
 * 1. Change the SECRET above to a long random string.
 * 2. Set the same string as an environment variable named GAS_SECRET in your Vercel project settings.
 * 3. Ensure this script is deployed as "Execute as: Me" and "Who has access: Anyone".
 * 4. Regularly check your Google Drive for any unrecognized files.
 */

/**
 * Dummy function to trigger authorization prompt for DriveApp and SpreadsheetApp.
 * Run this manually in the GAS editor if you get permission errors.
 */
function initScript() {
  var root = DriveApp.getRootFolder();
  Logger.log('Root folder OK: ' + root.getName());

  var folder = resolveUploadFolder();
  Logger.log('Upload folder OK: ' + folder.getName() + ' (id=' + folder.getId() + ')');

  var testBlob = Utilities.newBlob('ksp-upload-test', 'text/plain', 'ksp-init-test.txt');
  var testFile = folder.createFile(testBlob);
  testFile.setTrashed(true);
  Logger.log('Drive upload test OK — อัปโหลดใช้งานได้แล้ว');
}

function resolveUploadFolder() {
  if (FOLDER_ID) {
    try {
      return DriveApp.getFolderById(FOLDER_ID);
    } catch (folderErr) {
      Logger.log('FOLDER_ID access failed: ' + folderErr.message);
    }
  }

  var root = DriveApp.getRootFolder();
  var folderName = 'KSP_Website_Uploads';
  var folders = root.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(folderName);
}

function checkDriveAccess() {
  try {
    var folder = resolveUploadFolder();
    return createResponse({
      success: true,
      folderName: folder.getName(),
      folderId: folder.getId(),
    });
  } catch (err) {
    var msg = String(err.message || err);
    return createResponse({
      error: msg.indexOf('DriveApp') !== -1
        ? 'ไม่มีสิทธิ์ Google Drive — เปิด code.gs แล้วรัน initScript() จากนั้น Deploy Web App ใหม่'
        : 'ตรวจสอบ Drive ไม่สำเร็จ: ' + msg,
      needsAuth: true,
    });
  }
}

function doGet(e) {
  try {
    const sheetName = e.parameter.sheet;
    const secret = e.parameter.secret;
    const id = e.parameter.id;
    const category = e.parameter.category;
    const matchColumns = e.parameter.matchColumns ? JSON.parse(e.parameter.matchColumns) : ['id'];

    if (secret !== SECRET) {
      return createResponse({ error: "Unauthorized" });
    }

    if (!sheetName) {
      return createResponse({ error: "Sheet name required" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return createResponse({ error: "Sheet not found: " + sheetName });
    }

    // Optimization: If fetching by ID, we can try to find the row directly
    if (id && matchColumns.length === 1 && matchColumns[0] === 'id') {
      const data = getSheetData(sheet);
      const item = data.find(row => String(row.id) === String(id));
      return createResponse(item || { error: "Not found" });
    }

    const data = getSheetData(sheet);

    if (id) {
      const item = data.find(row => matchColumns.some(col => String(row[col]) === String(id)));
      return createResponse(item || { error: "Not found" });
    }

    if (category) {
      const filtered = data.filter(row => row.category === category);
      return createResponse(filtered);
    }

    return createResponse(data);
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function doPost(e) {
  let postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    return createResponse({ error: "Invalid JSON" });
  }

  const { action, sheet: sheetName, secret, id, category, data, matchColumns = ['id'] } = postData;

  if (secret !== SECRET) {
    return createResponse({ error: "Unauthorized" });
  }

  if (action === "upload") {
    if (postData.uploadId !== undefined && postData.chunkIndex !== undefined) {
      return handleUploadChunk(postData);
    }
    return handleUpload(postData);
  }

  if (action === "uploadCheck") {
    return checkDriveAccess();
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // trackVisit and getDetailedStats handle their own sheet logic
  if (action === "trackVisit") {
    return handleTrackVisit(ss, data);
  }
  if (action === "getDetailedStats") {
    return handleGetDetailedStats(ss);
  }

  if (!sheetName) {
    return createResponse({ error: "Sheet name required" });
  }

  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    console.log("Created new sheet: " + sheetName);
  }

  try {
    // For write actions, ensure headers exist
    if (["create", "update", "set"].includes(action)) {
      ensureHeaders(sheet, data);
    }

    switch (action) {
      case "read":
        return handleRead(sheet, id, category, matchColumns);
      case "create":
        return handleCreate(sheet, data);
      case "update":
        return handleUpdate(sheet, id, data, matchColumns);
      case "delete":
        return handleDelete(sheet, id, matchColumns);
      case "set":
        return handleSet(sheet, data);
      case "incrementPostView":
        return handleIncrementPostView(sheet, id);
      default:
        return createResponse({ error: "Invalid action" });
    }
  } catch (err) {
    return createResponse({ error: err.message });
  }
}

function handleTrackVisit(ss, data) {
  // 1. Log Detailed Visit
  let detailedSheet = ss.getSheetByName("DetailedStats");
  if (!detailedSheet) {
    detailedSheet = ss.insertSheet("DetailedStats");
    detailedSheet.appendRow(["timestamp", "country", "device", "browser", "os", "page"]);
  }
  
  const timestamp = new Date().toISOString();
  const country = data.country || "Unknown";
  const device = data.device || "Unknown";
  const browser = data.browser || "Unknown";
  const os = data.os || "Unknown";
  const page = data.page || "Home";
  
  detailedSheet.appendRow([timestamp, country, device, browser, os, page]);

  // 2. Update Summary Stats
  let summarySheet = ss.getSheetByName("Stats");
  if (!summarySheet) {
    summarySheet = ss.insertSheet("Stats");
    summarySheet.appendRow(["key", "value"]);
    summarySheet.appendRow(["total_visits", "0"]);
    summarySheet.appendRow(["today_visits", "0"]);
    summarySheet.appendRow(["last_visit_date", ""]);
  }

  const summaryValues = summarySheet.getDataRange().getValues();
  const today = new Date().toLocaleDateString('th-TH');
  
  let totalIdx = -1, todayIdx = -1, dateIdx = -1;
  for (let i = 1; i < summaryValues.length; i++) {
    if (summaryValues[i][0] === "total_visits") totalIdx = i + 1;
    if (summaryValues[i][0] === "today_visits") todayIdx = i + 1;
    if (summaryValues[i][0] === "last_visit_date") dateIdx = i + 1;
  }

  // Use getLastRow() from DetailedStats to ensure total is always accurate
  const total = detailedSheet.getLastRow() - 1;
  
  const lastDate = dateIdx !== -1 ? summaryValues[dateIdx - 1][1] : "";
  let todayCount = todayIdx !== -1 ? parseInt(summaryValues[todayIdx - 1][1]) || 0 : 0;

  if (lastDate !== today) {
    todayCount = 1;
    if (dateIdx !== -1) summarySheet.getRange(dateIdx, 2).setValue(today);
  } else {
    todayCount++;
  }

  if (totalIdx !== -1) summarySheet.getRange(totalIdx, 2).setValue(total);
  if (todayIdx !== -1) summarySheet.getRange(todayIdx, 2).setValue(todayCount);

  return createResponse({ success: true, total, today: todayCount });
}

function handleGetDetailedStats(ss) {
  const sheet = ss.getSheetByName("DetailedStats");
  if (!sheet) return createResponse([]);
  return createResponse(getSheetData(sheet));
}

function handleIncrementPostView(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idCol = headers.indexOf("id");
  let viewsCol = headers.indexOf("views");

  if (viewsCol === -1) {
    viewsCol = headers.length;
    sheet.getRange(1, viewsCol + 1).setValue("views");
  }

  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(id)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) return createResponse({ error: "Post not found" });

  let currentViews = parseInt(values[rowIndex - 1][viewsCol]) || 0;
  currentViews++;
  sheet.getRange(rowIndex, viewsCol + 1).setValue(currentViews);

  return createResponse({ success: true, views: currentViews });
}

function handleRead(sheet, id, category, matchColumns) {
  const data = getSheetData(sheet);
  if (id) {
    const item = data.find(row => matchColumns.some(col => String(row[col]) === String(id)));
    return createResponse(item || { error: "Not found" });
  }
  if (category) {
    const filtered = data.filter(row => row.category === category);
    return createResponse(filtered);
  }
  return createResponse(data);
}

function getSheetData(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];
  
  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const rows = values.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function handleCreate(sheet, data) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const id = Utilities.getUuid();
  data.id = id;
  
  const row = headers.map(header => data[header] !== undefined ? data[header] : "");
  sheet.appendRow(row);
  
  return createResponse({ success: true, id: id });
}

function handleUpdate(sheet, id, data, matchColumns) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (matchColumns.some(col => {
      const colIdx = headers.indexOf(col);
      return colIdx !== -1 && String(values[i][colIdx]) === String(id);
    })) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex === -1) {
    return createResponse({ error: "Record not found" });
  }

  for (const key in data) {
    const colIndex = headers.indexOf(key);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(data[key]);
    }
  }

  return createResponse({ success: true });
}

function handleDelete(sheet, id, matchColumns) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (matchColumns.some(col => {
      const colIdx = headers.indexOf(col);
      return colIdx !== -1 && String(values[i][colIdx]) === String(id);
    })) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex !== -1) {
    sheet.deleteRow(rowIndex);
    return createResponse({ success: true });
  }

  return createResponse({ error: "Not found" });
}

function handleSet(sheet, data) {
  // Clears all data and sets new data (useful for single-row config sheets)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  const row = headers.map(header => data[header] !== undefined ? data[header] : "");
  sheet.appendRow(row);
  
  return createResponse({ success: true });
}

function handleUpload(postData) {
  const { base64Data, contentType, fileName } = postData;

  if (!base64Data) {
    return createResponse({ error: "ไม่พบข้อมูลไฟล์ — กรุณาเลือกไฟล์แล้วลองใหม่" });
  }
  if (!fileName) {
    return createResponse({ error: "ไม่พบชื่อไฟล์" });
  }
  
  try {
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, contentType || "application/octet-stream", fileName);
    const folder = resolveUploadFolder();
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const url = "https://drive.google.com/uc?export=view&id=" + file.getId();
    
    return createResponse({ success: true, url: url });
  } catch (err) {
    var msg = String(err.message || err);
    if (msg.indexOf("DriveApp") !== -1) {
      return createResponse({
        error: "ไม่มีสิทธิ์ Google Drive — เปิด code.gs แล้วรัน initScript() จากนั้น Deploy Web App ใหม่"
      });
    }
    return createResponse({ error: "อัปโหลดไม่สำเร็จ: " + msg });
  }
}

var CHUNK_TEMP_PREFIX = "__chunk__";

function getTempUploadFolder() {
  var parent = resolveUploadFolder();
  var name = "_upload_chunks";
  var it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return parent.createFolder(name);
}

function trashFilesByName(folder, name) {
  var it = folder.getFilesByName(name);
  while (it.hasNext()) {
    it.next().setTrashed(true);
  }
}

function handleUploadChunk(postData) {
  var uploadId = String(postData.uploadId || "");
  var chunkIndex = Number(postData.chunkIndex);
  var totalChunks = Number(postData.totalChunks);
  var base64Data = postData.base64Data;
  var contentType = postData.contentType || "application/octet-stream";
  var fileName = postData.fileName || "upload";

  if (!uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || totalChunks < 1 || !base64Data) {
    return createResponse({ error: "ข้อมูลชิ้นส่วนไฟล์ไม่ครบ" });
  }

  try {
    var tempFolder = getTempUploadFolder();
    var chunkName = CHUNK_TEMP_PREFIX + uploadId + "_" + chunkIndex;
    trashFilesByName(tempFolder, chunkName);

    var chunkBlob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      "application/octet-stream",
      chunkName
    );
    tempFolder.createFile(chunkBlob);

    if (chunkIndex < totalChunks - 1) {
      return createResponse({ success: true, done: false, chunkIndex: chunkIndex });
    }

    var allBytes = [];
    for (var i = 0; i < totalChunks; i++) {
      var files = tempFolder.getFilesByName(CHUNK_TEMP_PREFIX + uploadId + "_" + i);
      if (!files.hasNext()) {
        return createResponse({ error: "ชิ้นส่วนไฟล์หายไป กรุณาอัปโหลดใหม่" });
      }
      var bytes = files.next().getBlob().getBytes();
      for (var j = 0; j < bytes.length; j++) {
        allBytes.push(bytes[j]);
      }
    }

    var destFolder = resolveUploadFolder();
    var finalBlob = Utilities.newBlob(allBytes, contentType, fileName);
    var file = destFolder.createFile(finalBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    for (var k = 0; k < totalChunks; k++) {
      trashFilesByName(tempFolder, CHUNK_TEMP_PREFIX + uploadId + "_" + k);
    }

    var url = "https://drive.google.com/uc?export=view&id=" + file.getId();
    return createResponse({ success: true, done: true, url: url });
  } catch (err) {
    var msg = String(err.message || err);
    if (msg.indexOf("DriveApp") !== -1) {
      return createResponse({
        error: "ไม่มีสิทธิ์ Google Drive — เปิด code.gs แล้วรัน initScript() จากนั้น Deploy Web App ใหม่"
      });
    }
    return createResponse({ error: "อัปโหลดไฟล์ใหญ่ไม่สำเร็จ: " + msg });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ensures all keys in the data object exist as headers in the sheet.
 */
function ensureHeaders(sheet, data) {
  if (!data || typeof data !== 'object') return;
  
  const lastCol = sheet.getLastColumn();
  let headers = [];
  if (lastCol > 0) {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }
  
  const keys = Object.keys(data);
  const missingHeaders = keys.filter(key => headers.indexOf(key) === -1);
  
  if (missingHeaders.length > 0) {
    const newHeaders = headers.concat(missingHeaders);
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    console.log("Added headers: " + missingHeaders.join(", "));
  }
}
