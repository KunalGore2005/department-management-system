const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require("./routes/users.routes");
const coordinatorsRoutes = require("./routes/coordinators.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const marksRoutes = require("./routes/marks.routes");

const { startCleanupJob } = require("./services/cleanup.service");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/coordinators', coordinatorsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
startCleanupJob();

module.exports = app;