/**
 * ------------------------------------------------------------------
 * GOOGLE APPS SCRIPT BACKEND
 * Copy and paste this into script.google.com to create your API.
 * ------------------------------------------------------------------
 */

const FOLDER_NAME = "MYP_Design_Hub_Submissions";
const SHEET_FILENAME = "MYP_Design_Hub_Database"; // Name of the spreadsheet file
const LOG_SHEET_NAME = "Submission_Log"; // Name of the tab inside the spreadsheet

/**
 * 1. RUN THIS FUNCTION FIRST MANUALLY IN SCRIPT EDITOR
 * Select 'setup' from the toolbar dropdown and click 'Run'.
 * This creates the folders and sheet immediately so you can verify they exist.
 */
function setup() {
  const mainFolder = getOrCreateFolder(FOLDER_NAME);
  const ss = getOrCreateSpreadsheet();
  
  // Create a test log entry to ensure the Sheet is created
  logToSheet({
    studentName: "SYSTEM_TEST",
    studentId: "000",
    grade: "N/A",
    domain: "SETUP",
    challengeTitle: "System Setup Verification",
    aiFeedback: "System operational.",
    status: "SETUP"
  }, ["No files"]);
  
  Logger.log("SUCCESS! Folder created at: " + mainFolder.getUrl());
  Logger.log("SUCCESS! Database Sheet created at: " + ss.getUrl());
  Logger.log("You can now check your Google Drive.");
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // 1. Setup/Get Main Folder
    const mainFolder = getOrCreateFolder(FOLDER_NAME);
    
    // 2. Setup/Get Hierarchy: Grade > Challenge Title > Student Name_Grade
    // Sorted by grades (6-10)
    const gradeFolder = getOrCreateFolder(data.grade, mainFolder);
    
    // With the name of the task
    const challengeFolder = getOrCreateFolder(data.challengeTitle || "Untitled Challenge", gradeFolder);
    
    // And the name of the students, and the grade of the student
    const studentFolderName = `${data.studentName}_${data.grade}`;
    const studentFolder = getOrCreateFolder(studentFolderName, challengeFolder);
    
    // 3. Save Files
    const fileUrls = [];
    if (data.files && data.files.length > 0) {
      data.files.forEach(fileData => {
        const decoded = Utilities.base64Decode(fileData.base64);
        const blob = Utilities.newBlob(decoded, fileData.type, fileData.name);
        const file = studentFolder.createFile(blob);
        
        // CRITICAL FIX: Ensure Teacher can view the file via the link
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        
        fileUrls.push(file.getUrl());
      });
    }
    
    // 4. Log to Sheets (Feeding Looker Studio)
    logToSheet(data, fileUrls);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true, 
      message: "Submission processed successfully",
      folderUrl: studentFolder.getUrl(),
      fileUrls: fileUrls // Return the file URLs to the frontend
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false, 
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateFolder(name, parentFolder) {
  let folder;
  const parent = parentFolder || DriveApp;
  const folders = parent.getFoldersByName(name);
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = parent.createFolder(name);
  }
  return folder;
}

function getOrCreateSpreadsheet() {
  // Try to find the file by name
  const files = DriveApp.getFilesByName(SHEET_FILENAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  } else {
    // If not found, create a new standalone spreadsheet
    return SpreadsheetApp.create(SHEET_FILENAME);
  }
}

function logToSheet(data, fileUrls) {
  const ss = getOrCreateSpreadsheet(); // Use the helper to get the specific file
  let sheet = ss.getSheetByName(LOG_SHEET_NAME);
  
  // Create tab if not exists
  if (!sheet) {
    sheet = ss.insertSheet(LOG_SHEET_NAME);
    sheet.appendRow([
      "Timestamp", 
      "Student Name", 
      "Student ID", 
      "Grade", 
      "Domain", 
      "Challenge Title", 
      "Status", 
      "AI Feedback", 
      "File URLs",
      "XP Earned",
      "ATL Skills"
    ]);
  }
  
  sheet.appendRow([
    new Date(),
    data.studentName,
    data.studentId,
    data.grade,
    data.domain,
    data.challengeTitle,
    data.status || "SUBMITTED",
    data.aiFeedback,
    fileUrls.join(", "),
    data.xpEarned || 0,
    (data.atlSkills || []).join(", ")
  ]);
}

/**
 * ------------------------------------------------------------------
 * AUTOMATED FILE ORGANIZER (Separate Feature)
 * ------------------------------------------------------------------
 * Instructions:
 * 1. Define the 'Inbox' folder ID below (where files are dropped).
 * 2. Set up a Time-driven trigger (e.g., Every 10 Minutes) to run 'organizeInboxFiles'.
 */

// REPLACE THIS ID with the actual ID of your source folder
const INBOX_FOLDER_ID = "REPLACE_WITH_YOUR_INBOX_FOLDER_ID"; 
const TARGET_ROOT_NAME = "Student Submissions";

function organizeInboxFiles() {
  // 1. Get Source Folder
  // Note: If you haven't set the ID yet, this will fail.
  let inbox;
  try {
    inbox = DriveApp.getFolderById(INBOX_FOLDER_ID);
  } catch (e) {
    Logger.log("Inbox ID not set or invalid.");
    return;
  }
  
  const files = inbox.getFiles();
  const rootTarget = getOrCreateFolder(TARGET_ROOT_NAME);

  while (files.hasNext()) {
    const file = files.next();
    const owner = file.getOwner();
    
    // Safety check for files without typical ownership (e.g. Shared Drives)
    if (!owner) {
      Logger.log("Skipping file (No Owner): " + file.getName());
      continue;
    }

    const email = owner.getEmail();
    const studentName = owner.getName();
    
    // 2. Determine Grade Level
    const gradeFolderName = getGradeFromEmail(email);

    if (gradeFolderName) {
      // 3. Get/Create Grade Subfolder
      const gradeFolder = getOrCreateFolder(gradeFolderName, rootTarget);
      
      // 4. Rename File: [Name] - [Original Filename]
      const originalName = file.getName();
      // Avoid double-renaming if script runs multiple times or student names it correctly
      let newName = originalName;
      if (!originalName.startsWith(studentName)) {
        newName = `${studentName} - ${originalName}`;
        file.setName(newName);
      }

      // 5. Move File (AddTo target, RemoveFrom source)
      file.moveTo(gradeFolder);
      
      Logger.log(`Moved: ${newName} -> ${gradeFolderName}`);
    } else {
      Logger.log(`Skipped: ${file.getName()} (Email ${email} did not match pattern)`);
    }
  }
}

function getGradeFromEmail(email) {
  if (email.includes("32@")) return "Grade 6";
  if (email.includes("31@")) return "Grade 7";
  if (email.includes("30@")) return "Grade 8";
  if (email.includes("29@")) return "Grade 9";
  if (email.includes("28@")) return "Grade 10";
  return null;
}