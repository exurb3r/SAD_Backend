const express = require('express');
const router = express.Router();
const gymCalendarHandler = require('../../controllers/user_controllers/gymcalendarController');
const verifyJWT = require('../../middleware/verifyJWT');


router.get('/', verifyJWT, gymCalendarHandler.gymcalendarData);
router.post('/', verifyJWT, gymCalendarHandler.addEvent);
router.patch('/:id', verifyJWT, gymCalendarHandler.editEvent);
router.delete('/:id', verifyJWT, gymCalendarHandler.deleteEvent);


module.exports = router;