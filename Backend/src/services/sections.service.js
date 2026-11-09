const pool = require("../config/db");

const getAllSections = async () => {

    const [sections] = await pool.query(
        `SELECT
            section_id,
            section_name,
            intake_strength,
            semester
         FROM sections
         ORDER BY semester ASC, section_name ASC`
    );

    return sections;
};

module.exports = {
    getAllSections
};