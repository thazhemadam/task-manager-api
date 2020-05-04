const path = require('path')
if (process.env.NODE_ENV !== 'production') require("dotenv").config({ path: path.resolve(__dirname, `../config/${process.env.NODE_ENV}.env`)})
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app