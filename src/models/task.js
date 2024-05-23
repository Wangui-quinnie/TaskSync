const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true,
});
taskSchema.post('save', function(doc, next) {
    io.emit('taskAdded', doc);
    next();
});

taskSchema.post('findOneAndUpdate', function(doc, next) {
    io.emit('taskUpdated', doc);
    next();
});

taskSchema.post('findOneAndDelete', function(doc, next) {
    io.emit('taskDeleted', doc._id);
    next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
