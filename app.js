const express = require('express');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const server = require("http").createServer(app);

app.get('/', (req, res) => {
    res.send('Welcome to the Big Fact Hunt API!')
});

const userRoutes = require('./routes/usersRoutes');

app.use('/users', userRoutes);

module.exports = app;
