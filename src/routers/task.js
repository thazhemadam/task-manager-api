const express = require('express')


const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

//GET Tasks
//Filtering:    GET /tasks?completed={__bool__} 
//Pagination    GET /tasks?limit={__LIMIT_VALUE__}&skip={__SKIP_VALUE__}
//Sorting       GET /tasks?sortBy={__FIELD_NAME__}{SPECIAL_CHARACTER}{__ORDER__}
router.get('/tasks', auth,  async (req,res)=>{
    
    //Filtering
    const match = {}
    if(req.query.completed){
        match.completed = (req.query.completed === 'true')
    }

    //Sorting
    const sort = {}
    if(req.query.sortBy){
        
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'asc'?1:-1        
    }

    try {
        // const tasks = await Task.find({owner: req.userAuthenticated._id})
        
        //Filtering, Pagination, and Sorting
        await req.userAuthenticated.populate({
            path: 'tasks',
            match,                                  //Filtering
            options:{                               
                limit: parseInt(req.query.limit),   //Pagination
                skip: parseInt(req.query.skip),     //Pagination
                sort                       //Sorting 
            }    
        }).execPopulate()
        
        res.send(req.userAuthenticated.tasks)

    } catch (error) {
        res.status(500).send()
    }

    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((error)=>{
    //     res.status(500).send()
    // })
})

//GET Specific Task
router.get('/tasks/:id', auth, async (req, res)=>{
    const _id = req.params.id

    try {
        const task = await Task.findOne({_id, owner : req.userAuthenticated._id})

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
    // Task.findById(_id).then((task)=>{
    //     if(!value){
    //        return res.status(404).send()
    //     }
    //     res.send(task)
    // }).catch((error)=>{
    //     res.status(500).send()
    // })
})

//CREATE Task
router.post('/tasks', auth, async (req, res)=>{
    const task = new Task({
        ...req.body,
        owner: req.userAuthenticated._id
    })


    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(task)
    }
    // task.save().then((value)=>{
    //     res.status(200).send(value)
    // }).catch((error)=>{
    //     res.status(400).send(error)
    // })
})

//UPDATE Task
router.patch('/tasks/:id', auth, async (req, res)=>{
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidUpdate = updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidUpdate){
        return res.status(400).send({error:"Invalid update! Properties don't exist."})
    }

    try {
        
        const id = req.params.id
        const task = await Task.findOne({_id: req.params.id, owner:req.userAuthenticated._id })

        if(!task){
            return res.status(404).send()
        }
        updates.forEach((update)=> task[update]=req.body[update])

        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
        await task.save()


        res.send(task)


    } catch (error) {
        return res.status(400).send()
    }
})

//DELETE Task
router.delete('/tasks/:id', auth, async (req, res)=>{
    try {
        const deleteTask = await Task.findOneAndDelete({_id: req.params.id, "owner": req.userAuthenticated._id})
        
        if(!deleteTask){
            return res.status(404).send()
        }

        res.send(deleteTask)

    } catch (error) {
        res.status(401).send()
    }
})
module.exports = router