const expect = require('chai').expect;
const mongoose = require('mongoose');
const Task = require('../src/models/task');

describe('Task Model', () => {
    before(async () => {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    after(async () => {
        await mongoose.connection.close();
    });

    it('should create a new task', async () => {
        const task = new Task({ title: 'Test Task', description: 'Test Description', owner: new mongoose.Types.ObjectId() });
        const savedTask = await task.save();
        expect(savedTask._id).to.exist;
        expect(savedTask.title).to.equal('Test Task');
    });

    it('should not create a task without a title', async () => {
        try {
            const task = new Task({ description: 'No Title', owner: new mongoose.Types.ObjectId() });
            await task.save();
        } catch (error) {
            expect(error).to.exist;
        }
    });
});
