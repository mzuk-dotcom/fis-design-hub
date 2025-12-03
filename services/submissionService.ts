import { GradeLevel, SkillDomain, ATLSkill, Challenge } from '../types';

// CRITICAL: REPLACE THIS STRING WITH YOUR SPECIFIC GOOGLE APPS SCRIPT WEB APP URL
// If this is empty or incorrect, the app will automatically use the Offline Fallback.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzCsdujFoPgxpln4WCQl5yvtHMktmQ_kQhvM0cpSNRsb-W5OSBR1StPUSPzKXHir8v6Qw/exec';

export interface SubmissionPayload {
  studentName: string;
  studentId: string;
  grade: GradeLevel;
  domain: SkillDomain;
  challengeTitle: string;
  submissionText: string;
  aiFeedback: string;
  atlSkills: ATLSkill[];
  files: {
    name: string;
    type: string;
    base64: string;
  }[];
}

/**
 * Helper: Safely parse JSON from response
 */
async function safeJson(response: Response) {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false, message: "Invalid JSON returned", raw: text };
    }
  } catch (e) {
    return { success: false, message: "Network error reading response" };
  }
}

/**
 * Helper: Generate Local HTML for Print/PDF
 * This creates a standalone HTML page that looks like a document and auto-prints.
 */
function generateLocalDocUrl(challenge: Partial<Challenge>, studentName: string, grade: string, domain: string) {
    const htmlContent = `
      <html>
        <head>
          <title>${challenge.title} - Challenge Brief</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
            h1 { color: #111; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            h2 { color: #444; margin-top: 30px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 5px;}
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .rubric-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .rubric-table th, .rubric-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .rubric-table th { background-color: #f9f9f9; }
            .points { font-weight: bold; color: #2563eb; }
            @media print {
              body { margin: 0; padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${challenge.title}</h1>
          <div class="meta">
            <strong>Student:</strong> ${studentName} &nbsp;|&nbsp; 
            <strong>Grade:</strong> ${grade} &nbsp;|&nbsp; 
            <strong>Domain:</strong> ${domain}
          </div>

          <h2>The Scenario</h2>
          <p>${challenge.scenario || 'No scenario provided.'}</p>

          <h2>Instructions</h2>
          <p>${challenge.description || 'No instructions provided.'}</p>

          <h2>Tools Required</h2>
          <ul>
            ${challenge.tools?.map(t => `<li>${t}</li>`).join('') || '<li>None specified</li>'}
          </ul>

          <h2>Assessment Rubric</h2>
          <table class="rubric-table">
            <thead>
              <tr>
                <th width="15%">Criterion</th>
                <th>Description</th>
                <th width="10%">Points</th>
              </tr>
            </thead>
            <tbody>
              ${challenge.rubric?.map(r => `
                <tr>
                  <td><strong>${r.criterion}</strong></td>
                  <td>${r.description}</td>
                  <td class="points">${r.points}</td>
                </tr>
              `).join('') || '<tr><td colspan="3">No rubric items.</td></tr>'}
            </tbody>
          </table>
          
          <script>
             // Auto-print when opened
             window.onload = function() { setTimeout(function(){ window.print(); }, 500); }
          </script>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; 
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const submitToGoogleDrive = async (
  payload: Omit<SubmissionPayload, 'files'>, 
  rawFiles: File[]
): Promise<{ success: boolean; message: string }> => {
  
  if (GOOGLE_SCRIPT_URL.includes('PASTE_YOUR_WEB_APP_URL_HERE')) {
      return { success: false, message: "Configuration Error: Script URL not set." };
  }

  try {
    const processedFiles = await Promise.all(
      rawFiles.map(async (file) => ({
        name: file.name,
        type: file.type,
        base64: await fileToBase64(file),
      }))
    );

    const fullPayload: SubmissionPayload = {
      ...payload,
      files: processedFiles,
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(fullPayload),
      redirect: 'follow'
    });

    const result = await safeJson(response);
    return result;

  } catch (error) {
    console.error("Submission Error:", error);
    return { success: false, message: "Failed to connect to Google Drive." };
  }
};

export const createChallengeDoc = async (
  challenge: Partial<Challenge>,
  studentName: string,
  grade: GradeLevel,
  domain: SkillDomain
): Promise<{ success: boolean; docUrl?: string; message?: string; isFallback?: boolean }> => {
  
  // 1. Try Backend First
  try {
    if (GOOGLE_SCRIPT_URL.includes('PASTE_YOUR_WEB_APP_URL_HERE')) throw new Error("Config missing");

    const payload = {
      action: 'CREATE_DOC',
      studentName,
      grade,
      domain,
      title: challenge.title,
      description: challenge.description,
      scenario: challenge.scenario,
      rubric: challenge.rubric,
      tools: challenge.tools
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("Network response was not ok");

    const result = await safeJson(response);
    
    if (result && result.success && result.docUrl) {
        const copyUrl = result.docUrl.replace(/\/edit.*$|\/view.*$/, '/copy');
        return { ...result, docUrl: copyUrl };
    }
    
    // If we get here, backend failed or returned invalid data -> Fallback
    throw new Error(result?.message || "Backend failed");

  } catch (error) {
    console.warn("Generating local document due to:", error);
    
    // 2. Fallback to Local PDF/Print
    // Use the HTML method which is far more reliable than generating PDF binary blobs manually
    const localUrl = generateLocalDocUrl(challenge, studentName, grade, domain);
    
    return { 
        success: true, 
        docUrl: localUrl, 
        isFallback: true, 
        message: "Opened printable document." 
    };
  }
};