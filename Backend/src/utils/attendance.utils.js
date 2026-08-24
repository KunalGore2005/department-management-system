const db = require("../config/db");

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const generateSessionCode = async () => {

    while (true) {

        let code = "";

        for (let i = 0; i < 6; i++) {
            code += characters.charAt(
                Math.floor(Math.random() * characters.length)
            );
        }

        const [existing] = await db.query(
            `SELECT session_id
             FROM attendance_sessions
             WHERE session_code = ?`,
            [code]
        );

        if (existing.length === 0) {
            return code;
        }
    }
};

module.exports = {
    generateSessionCode
};