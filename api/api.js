const router = require('express').Router();
const Notification = require('../app/models/Notification');

router.get('/notification/all', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
    Notification.find({})
        .then((notifications) => {
            res.json({ notifications: notifications });
        })
        .catch((error) => {
            res.json({ error: error.message });
        });
});

const drugsInfo = require('../drugs.json');
router.get('/drugimgs', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
    const imgs = [];
    for (let index = 0; index < drugsInfo.length; ++index) {
        imgs.push(encodeURI(drugsInfo[index][7]['圖片'].split(';')[0]));
    }
    res.json(imgs);
});

module.exports = router;