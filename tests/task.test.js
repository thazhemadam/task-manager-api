const request = require('supertest')
const app = require('../src/app')

const Task = require('../src/models/task')

const {
    userOneID,
    userOne,
    userTwoID,
    userTwo,
    TaskOne,
    TaskTwo,
    TaskThree,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create Task for User', async ()=>{
    const response = await request(app)
                            .post('/tasks')        
                            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                            .send({
                                description: 'From Test'
                            })
                            .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)

})

test('Fetch User Tasks', async ()=>{
    const response = await request(app)
                        .get('/tasks')
                        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                        .send()
                        .expect(200)
    expect(response.body.length).toBe(1)
})


test("Failed Deletion of other Users' Tasks", async ()=>{
    const response = await request(app)
                        .delete(`/tasks/ ${TaskOne._id}`)
                        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
                        .send()
                        .expect(401)
    const task  = await Task.findById(TaskOne._id)
    expect(task).not.toBeNull()
})