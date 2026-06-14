const Task = require('../models/Task');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;

  if (!title) {
    return next(new AppError('Task title is required.', 400));
  }

  const task = await Task.create({ title, description, owner: req.user._id });

  res.status(201).json({ status: 'success', data: { task } });
});

exports.getTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({ owner: req.user._id }).sort('-createdAt');

  res.status(200).json({ status: 'success', results: tasks.length, data: { tasks } });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new AppError('No task found with that ID.', 404));
  }

  // Ownership check — only the owner may delete
  if (task.owner.toString() !== req.user._id.toString()) {
    return next(new AppError('You do not have permission to delete this task.', 403));
  }

  await task.deleteOne();

  res.status(204).json({ status: 'success', data: null });
});
