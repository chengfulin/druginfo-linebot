const router = require('express').Router();
const Notification = require('../app/models/Notification');

router.get('/notification/all', (req, res) => {
    req.header('Access-Control-Origin', '*');
    req.header('Access-Control-Methods', 'GET,PUT,DELETE,POST,OPTIONS');
    req.header('Access-Control-Headers', 'X-Requested-With,Content-Type,Accept');
    Notification.find({})
        .then((notifications) => {
            res.json({ notifications: notifications });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

module.exports = router;