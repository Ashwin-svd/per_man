const express = require('express')
const Task = require('../models/task_model')
const auth = require('../middleware/auth_ex_mdlwr')
const router = new express.Router()
//const app = express()
//const port = 3000
//app.use(userRouter)
//app.use(express.json())
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,//...=es6 spread operator
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


//PAGINATION= /tasks?limit=10&skip=0
//PAGINATION= /tasks?limit=10   gives only first 10
////PAGINATION= /tasks?sortedBy=createdAt :Asc
//get tasks belongingto user
//PAGINATION=/task givesdefault order
router.get('/tasks',auth, async (req, res) => {
    //give query=?completed=false/true or dont give any query.
    //eg=/tasks?completed=false 
    const match={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    try {
        //const tasks = await Task.find({owner:req.user._id})
                 //OR
        await req.user.populate(
            {
                path:'tasks',
                match,
                options:{
                    limit:parseInt(req.query.limit),//limit just2 tasks
                    skip:parseInt(req.query.skip)
                },
                sort:{
                    createdAt:-1//decsending by created
                    //,completed:1
                }
            }
        )
        //console.log(user.tasks)
        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/tasks/:id',auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById({_id,owner:req.user._id})//with this we can access

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findById({_id: req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth,async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params._id)
       // console.log("a==",req.params.id)
        //console.log("b==",req.user._id)
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        //console.log(task)
        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        //console.log(e)
        res.status(500).send()
    }
})

 module.exports = router