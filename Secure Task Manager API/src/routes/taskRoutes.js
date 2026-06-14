const express = require('express');
const taskController = require('../controllers/taskController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.use(verifyToken);

router.route('/').get(taskController.getTasks).post(taskController.createTask);
router.route('/:id').delete(taskController.deleteTask);

module.exports = router;
