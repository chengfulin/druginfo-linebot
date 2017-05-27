const router = require('express').Router();
const Notification = require('../app/models/Notification');

router.get('/notification/all', (req, res) => {
    Notification.find({})
        .then((notifications) => {
            res.json({ notifications: notifications });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

module.exports = router;