const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

// User registration
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error code
            res.status(400).send({ error: 'Username already exists' });
        } else {
            res.status(400).send(error);
        }
    }
});

// User login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (error) {
        res.status(400).send({ error: 'Invalid login credentials' });
    }
});

// User logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send({ error: 'Failed to log out' });
    }
});

// User logout all
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send({ error: 'Failed to log out of all sessions' });
    }
});

module.exports = router;
