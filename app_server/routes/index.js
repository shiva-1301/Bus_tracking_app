const express = require('express');
const router = express.Router();

const ctrlMain = require('../controllers/main');
console.log(ctrlMain); 

/*GET homepage*/
router.get('/', ctrlMain.home);
router.get('/login', ctrlMain.login);
router.get('/faculty_login', ctrlMain.faculty_login);
router.get('/roadmaps', ctrlMain.roadmaps);



module.exports = router;
