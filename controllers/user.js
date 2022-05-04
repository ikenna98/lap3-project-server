const User = require('../models/User');

async function index(req, res) {
    try {
        const users = await User.all
        res.status(200).json(users)
    } catch (error) {
        res.status(500).send({error})
    }
}

async function addUserScore(req, res) {
    try {
        const userScore = await User.addUserData(req.body)
        res.status(201).json(userScore)
    } catch (error) {
        res.status(422).json(error)
    }
}

module.exports = { index, addUserScore }
