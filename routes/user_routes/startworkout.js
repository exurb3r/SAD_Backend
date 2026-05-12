const express = require('express');
const router = express.Router();
const startworkoutHandler = require('../../controllers/user_controllers/startworkoutController');
const verifyJWT = require('../../middleware/verifyJWT');


router.get('/', verifyJWT, startworkoutHandler.getRoutine);
router.get('/:routineId', verifyJWT, startworkoutHandler.getIndividualRoutine);


router.post('/add', verifyJWT, startworkoutHandler.addRoutine);
router.post('/finishworkout', verifyJWT, startworkoutHandler.finishedWorkoutSession);
router.patch('/:routineId', verifyJWT, startworkoutHandler.updateIndividualRoutine);


router.delete('/', verifyJWT, startworkoutHandler.deleteRoutine);

module.exports = router;