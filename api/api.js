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

const drugInfo = require('../drugs.json');
router.post('/notification/add', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,DELETE,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');

    if (!req.body.drug || req.body.drug.length === 0) {
        res.status(500).json({ error: '請輸入藥品名稱' });
        return;
    }
    let valid = false;
    for (let index = 0; index < drugInfo.length; ++index) {
        valid = drugInfo[index][1]['藥物名稱'].indexOf(req.body.drug) !== -1;
        if (valid) break;
    }
    console.log(drugInfo[index][1]['藥物名稱'].indexOf(req.body.drug) !== -1);
    console.log(req.body.drug);
    if (!valid) {
        res.status(500).json({ error: '您輸入的藥品名稱未列舉' });
        return;
    }

    let notification = new Notification();
    notification.address = req.body.address;
    notification.latitude = req.body.latitude;
    notification.longitude = req.body.longitude;
    notification.drug = req.body.drug;
    notification.save()
        .then(() => { 
            console.log('> create new notification');
            res.json({ data: notification });
        })
        .catch((error) => {
            console.log(error.message);
            res.status(500).json({ error: '新增通報資料失敗' });
        });
});

module.exports = router;