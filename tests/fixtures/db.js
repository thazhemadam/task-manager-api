const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user') 
const Task = require('../../src/models/task')
//Test User Credentials
const userOneID = new mongoose.Types.ObjectId()
const userOne = {
        _id: userOneID,
        name: "ABC",
        email: "abc@tests.com",
        password: "Us3rTestSuite!",
        tokens:[{
            token:jwt.sign({_id:userOneID}, process.env.JWT_SECRET_KEY)
        }]
}
const userTwoID = new mongoose.Types.ObjectId()
const userTwo = {
        _id: userTwoID,
        name: "XYZ",
        email: "xyz@tests.com",
        password: "T@$KTestSuite?!",
        tokens:[{
            token:jwt.sign({_id:userTwoID}, process.env.JWT_SECRET_KEY)
        }]
}

const TaskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task 1',
    completed: true,
    owner: userOneID

}

const TaskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task 2',
    completed: true,
    owner: userTwo._id

}


const TaskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task 1',
    completed: true,
    owner: userTwo._id

}
//Clear database of previously created values. Add new test collection for testing.
const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(TaskOne).save()
    await new Task(TaskTwo).save()
    await new Task(TaskThree).save()
}

module.exports = {
    userOneID,
    userOne,
    userTwo,
    userTwoID,
    TaskOne,
    TaskTwo,
    TaskThree,
    setupDatabase
}