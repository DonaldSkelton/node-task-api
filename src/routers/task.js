const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        })
        await task.save()
        res.status(201).send(task);
     } catch (e) {
        res.status(400).send(e);
    };
});

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    if (req.query.completed) match.completed = req.query.completed === 'true';
    const sort = {}
    if (req.query.sortBy) {
        const [sortBy, sortOrder] = req.query.sortBy.split(':');
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort,
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send();
    };
});

router.get('/tasks/:id', auth,  async (req, res) => {
    try {
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) return res.status(404).send();
        res.send(task);
    } catch(e) {
        res.status(500).send(e);
    };
});

router.patch('/tasks/:id', auth,  async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidUpdate) return res.status(400).send({error: 'Invalid updates!'});
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id});
        if (!task) return res.status(404).send();
        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id});
        if (!task) return res.status(404).send();
        res.send(task);        
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;