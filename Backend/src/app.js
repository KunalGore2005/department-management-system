const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require("./routes/users.routes");

const { startCleanupJob } = require("./services/cleanup.service");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

startCleanupJob();

module.exports = app;