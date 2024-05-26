const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

describe('Auth Routes', () => {
    beforeEach(async () => {
        await User.deleteMany();
    });

    it('should register a new user', async () => {
        const response = await request(app).post('/users').send({
            username: 'testuser',
            password: 'TestPass123'
        }).expect(201);

        const user = await User.findById(response.body.user._id);
        expect(user).not.to.be.null;
    });

    it('should not register a user with invalid data', async () => {
        await request(app).post('/users').send({
            username: '',
            password: 'TestPass123'
        }).expect(400);
    });

    it('should login an existing user', async () => {
        const user = new User({ username: 'testuser', password: 'TestPass123' });
        await user.save();

        await request(app).post('/users/login').send({
            username: 'testuser',
            password: 'TestPass123'
        }).expect(200);
    });
});
