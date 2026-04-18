const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://carecore.dpdns.org', 
        'https://carecore-production.vercel.app'
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
    credentials: true
}));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: `You are an elite Clinical Database Architect. Your only job is to translate human questions into raw, executable MySQL.

SCHEMA CONTEXT: The database contains 7 tables with the following EXACT columns:
- Patients (Patient_ID, First_Name, Last_Name, DOB, Gender, Blood_Type, Emergency_Contact)
- Admissions (Admission_ID, Patient_ID, Bed_ID, Attending_Doctor_ID, Admitted_At, Discharged_At, Status)
- Beds (Bed_ID, Room_Number, Ward_Type, Is_Occupied)
- Medications (Medication_ID, Drug_Name, Standard_Route)
- Medication_Schedules (Schedule_ID, Admission_ID, Medication_ID, Scheduled_Time, Administered_Time, Dosage, Status, Administered_By_Nurse_ID)
- Staff (Staff_ID, First_Name, Last_Name, Role, Specialization)
- Audit_Logs (Log_ID, Record_ID, Table_Modified, Action_Type, Old_Value, New_Value, Modified_By_Staff_ID, Log_Timestamp)

Construct accurate JOINs based on standard clinical logic using ONLY these specific columns.

FORMATTING RULE: You must return ONLY the raw SQL string. Do NOT use markdown formatting (no \`\`\`sql tags). Do NOT include any explanations.

SECURITY RULE: You are strictly limited to 'SELECT' statements. If a prompt requires altering data, return exactly 'ERROR: UNAUTHORIZED'.`
});

/**
 * Common AI Model for generic queries
 */
const assistantModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: 'You are an AI assistant. Reply briefly.'
});

// Endpoints

/**
 * GET /api/health
 * Connectivity handshake. Verifies the DB pool is alive.
 */
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (err) {
    console.error('[Health Check Error]', err);
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

/**
 * GET /api/medications-due
 * Fetches pending medications with Patient and Medication details using raw JOINs.
 */
app.get('/api/medications-due', async (req, res) => {
  try {
    const query = `
      SELECT 
        ms.Schedule_ID, 
        ms.Scheduled_Time, 
        ms.Dosage, 
        ms.Status,
        p.First_Name AS Patient_First_Name, 
        p.Last_Name AS Patient_Last_Name,
        p.Patient_ID,
        m.Drug_Name,
        m.Standard_Route,
        b.Room_Number,
        b.Bed_ID
      FROM Medication_Schedules ms
      JOIN Admissions a ON ms.Admission_ID = a.Admission_ID
      JOIN Patients p ON a.Patient_ID = p.Patient_ID
      JOIN Beds b ON a.Bed_ID = b.Bed_ID
      JOIN Medications m ON ms.Medication_ID = m.Medication_ID
      WHERE ms.Status = 'Pending' AND a.Status = 'Admitted'
      ORDER BY ms.Scheduled_Time ASC
    `;

    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * PUT /api/medications-due/:scheduleId/mark-given
 * Updates the status to 'Given', triggering the Audit_Logs inherently via the DB trigger.
 */
app.put('/api/medications-due/:scheduleId/mark-given', async (req, res) => {
  const { scheduleId } = req.params;
  const { staffId } = req.body; // Mocked staff ID or from auth

  try {
    // We update Administered_Time as well.
    const query = `
      UPDATE Medication_Schedules 
      SET 
        Status = 'Given', 
        Administered_By_Nurse_ID = ?, 
        Administered_Time = NOW() 
      WHERE Schedule_ID = ?
    `;

    const [result] = await db.execute(query, [staffId || 1, scheduleId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Schedule ID not found' });
    }

    res.json({ message: 'Medication marked as given successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * POST /api/query
 * Secure NLP to SQL Router. Generates SQL via Gemini, sanitizes it, and executes.
 */
app.post('/api/query', async (req, res) => {
  // 1. THE ALARM BELL: This proves the request actually made it inside the server
  console.log("\n========================================");
  console.log("🛎️  NEW REQUEST RECEIVED AT /api/query");
  console.log("Body payload:", req.body);

  try {
    const userPrompt = req.body.prompt;
    if (!userPrompt) {
      throw new Error("No prompt provided in the request body");
    }

    // 1. Ask Gemini to generate the SQL
    const result = await model.generateContent(userPrompt);
    const sqlString = result.response.text().trim();

    console.log(`[Gemini Engine] Prompt: "${userPrompt}" -> Generated SQL: "${sqlString}"`);

    // 2. The Regex Trap (CRITICAL)
    if (/DROP|DELETE|UPDATE|INSERT|ALTER|TRUNCATE/i.test(sqlString)) {
      console.warn('[Security Trap] Blocked unauthorized SQL operation:', sqlString);
      return res.status(403).json({ error: "Unauthorized operation" });
    }

    // 3. Execution (Safe SELECT only)
    const [rows] = await db.query(sqlString);

    // 4. Response with visual delay for frontend animation
    setTimeout(() => {
      res.status(200).json({ success: true, query: sqlString, data: rows });
    }, 1500);

    console.log("✅ Request completed successfully.");

  } catch (error) {
    // 2. THE ERROR MEGAPHONE: This forces the terminal to print the crash
    console.error("🚨 CRASH IN /api/query 🚨");
    console.error("Error Message:", error.message);
    console.error("Full Stack Trace:", error);

    res.status(500).json({
      error: 'AI SQL translation or execution failed.',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
