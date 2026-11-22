const pool = require("../config/db");
const bcrypt = require("bcrypt");
const defaultPasswords = require("../utils/defaultPasswords");

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validId = value => Number.isInteger(Number(value)) && Number(value) > 0;

const getOptions = async () => {
    const [batches] = await pool.query("SELECT batch_id, admission_year FROM batches ORDER BY admission_year DESC");
    const [sections] = await pool.query("SELECT section_id, batch_id, section_name FROM sections ORDER BY batch_id DESC, section_name ASC");
    return { statusCode: 200, message: "Enrollment options fetched successfully.", data: { batches, sections } };
};

const createRequest = async data => {
    const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const phoneNumber = typeof data.phoneNumber === "string" ? data.phoneNumber.trim() : "";
    const enrollmentNumber = typeof data.enrollmentNumber === "string" ? data.enrollmentNumber.trim() : "";
    const batchId = Number(data.batchId);
    const sectionId = Number(data.sectionId);

    if (!fullName || fullName.length > 150) throw fail("Enter your name (up to 150 characters).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) throw fail("Enter a valid email address.");
    if (!phoneNumber || phoneNumber.length > 30 || !/^[+\d().\s-]+$/.test(phoneNumber)) throw fail("Enter a valid phone number.");
    if (!enrollmentNumber || enrollmentNumber.length > 50) throw fail("Enter a valid enrollment number (up to 50 characters).");
    if (!validId(batchId) || !validId(sectionId)) throw fail("Choose a valid batch and section.");

    const [[section]] = await pool.query("SELECT section_id FROM sections WHERE section_id = ? AND batch_id = ?", [sectionId, batchId]);
    if (!section) throw fail("The selected section does not belong to the selected batch.");

    const [[existingUser]] = await pool.query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
    if (existingUser) throw fail("An account already exists with this email address.", 409);
    const [[existingStudent]] = await pool.query("SELECT student_id FROM students WHERE enrollment_number = ? LIMIT 1", [enrollmentNumber]);
    if (existingStudent) throw fail("This enrollment number is already in use.", 409);

    const [[existingRequest]] = await pool.query(
        "SELECT request_id FROM student_signup_requests WHERE (email = ? OR enrollment_number = ?) AND status IN ('PENDING', 'APPROVED') LIMIT 1",
        [email, enrollmentNumber]
    );
    if (existingRequest) throw fail("There is already an active application for this email or enrollment number.", 409);

    const [result] = await pool.query(
        `INSERT INTO student_signup_requests
            (full_name, email, phone_number, enrollment_number, batch_id, section_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [fullName, email, phoneNumber, enrollmentNumber, batchId, sectionId]
    );

    return {
        statusCode: 201,
        message: "Your application was submitted. The HOD will review it.",
        data: { requestId: result.insertId, status: "PENDING" }
    };
};

const getRequests = async status => {
    const allowedStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (status && status !== "ALL" && !allowedStatuses.includes(status)) throw fail("Invalid application status.");

    const params = [];
    let where = "";
    if (status && status !== "ALL") {
        where = "WHERE r.status = ?";
        params.push(status);
    }

    const [requests] = await pool.query(
        `SELECT r.request_id, r.full_name, r.email, r.phone_number, r.enrollment_number,
                r.batch_id, b.admission_year, r.section_id, s.section_name,
                r.status, r.submitted_at, r.reviewed_at
         FROM student_signup_requests r
         LEFT JOIN batches b ON b.batch_id = r.batch_id
         LEFT JOIN sections s ON s.section_id = r.section_id AND s.batch_id = r.batch_id
         ${where}
         ORDER BY CASE r.status WHEN 'PENDING' THEN 0 WHEN 'APPROVED' THEN 1 ELSE 2 END, r.submitted_at DESC`,
        params
    );

    return { statusCode: 200, message: "Student applications fetched successfully.", data: requests };
};

const reviewRequest = async (requestId, status) => {
    if (!/^\d+$/.test(String(requestId)) || Number(requestId) < 1) throw fail("A valid application ID is required.");
    const nextStatus = typeof status === "string" ? status.toUpperCase() : "";
    if (!["APPROVED", "REJECTED"].includes(nextStatus)) throw fail("Decision must be APPROVED or REJECTED.");

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const [[request]] = await connection.query(
            "SELECT * FROM student_signup_requests WHERE request_id = ? FOR UPDATE",
            [Number(requestId)]
        );
        if (!request) throw fail("Student application not found.", 404);
        if (request.status !== "PENDING") throw fail("This application has already been reviewed.", 409);

        let studentId = null;
        let userId = null;
        if (nextStatus === "APPROVED") {
            if (!request.enrollment_number || !request.batch_id || !request.section_id) {
                throw fail("This older application is missing enrollment details. Reject it and ask the applicant to submit the new form.", 409);
            }
            const [[existingUser]] = await connection.query("SELECT user_id FROM users WHERE email = ? LIMIT 1", [request.email]);
            if (existingUser) throw fail("An account already exists with this email address.", 409);
            const [[existingStudent]] = await connection.query("SELECT student_id FROM students WHERE enrollment_number = ? LIMIT 1", [request.enrollment_number]);
            if (existingStudent) throw fail("This enrollment number is already in use.", 409);
            const [[section]] = await connection.query("SELECT section_id FROM sections WHERE section_id = ? AND batch_id = ?", [request.section_id, request.batch_id]);
            if (!section) throw fail("The selected section is no longer available for this batch.", 409);

            const passwordHash = await bcrypt.hash(defaultPasswords.STUDENT, 10);
            const [userResult] = await connection.query(
                "INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'STUDENT')",
                [request.email, passwordHash]
            );
            userId = userResult.insertId;

            const [studentResult] = await connection.query(
                `INSERT INTO students (user_id, enrollment_number, name, phone, section_id, batch_id)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, request.enrollment_number, request.full_name, request.phone_number, request.section_id, request.batch_id]
            );
            studentId = studentResult.insertId;
        }

        await connection.query(
            "UPDATE student_signup_requests SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE request_id = ?",
            [nextStatus, Number(requestId)]
        );
        await connection.commit();

        return {
            statusCode: 200,
            message: nextStatus === "APPROVED" ? "Application approved and student account created." : "Application rejected.",
            data: { requestId: Number(requestId), status: nextStatus, userId, studentId }
        };
    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_DUP_ENTRY") throw fail("An account or student record already exists for this application.", 409);
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = { getOptions, createRequest, getRequests, reviewRequest };
