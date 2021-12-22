const express = require('express')
const Task = require('../models/task_model')
const auth = require('../middleware/auth_ex_mdlwr')
const router = new express.Router()

const multer= require('multer')
    const upload = multer({
        limits:{fileSize:100000},//restriction
        fileFilter(req,file,cb){
            if(!file.originalname.match(/\.(jpg|jpeg|xlsx|csv|pdf|doc|docs|png )$/))//we can usefile.originalname.match(/\.(jpg|jpeg|png )$/)
          {return cb(new Error('must be jpg|jpeg|xlsx|csv|pdf|doc|docs|png'))}
          cb(undefined,true)
        }
         
    })

router.post('/plans', auth, async (req, res) => {
    const task = new Task({
        ...req.body,//...=es6 spread operator
        
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(200).send("success fully created ")
    } catch (e) {
        res.status(400).send("not saved")
    }
})


//PAGINATION= /tasks?limit=10&skip=0
//PAGINATION= /tasks?limit=10   gives only first 10
////PAGINATION= /tasks?sortedBy=createdAt :Asc
//get tasks belongingto user
//PAGINATION=/task givesdefault order
router.get('/plans',auth, async (req, res) => {
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
        res.status(200).send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send("unknown error")
    }
})

router.get('/plans/:id',auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findById({_id,owner:req.user._id})//with this we can access

        if (!task) {
            return res.status(404).send("plan not found")
        }

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send("unknown error")
    }
})

router.patch('/plans/:id',auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const task = await Task.findById({_id: req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send("plan not found")
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()

        res.status(200).send("updated successfully")
    } catch (e) {
        console.log(e)
        res.status(500).send("unknown error")
    }
})

router.delete('/plans/:id', auth,async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params._id)
     
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        //console.log(task)
        if (!task) {
            res.status(404).send("plan not found")
        }

        res.status(200).send("deleted successfully")
    } catch (e) {
        //console.log(e)
        res.status(500).send("unknown error")
    }
})

router.post('/plans/upload_doc/:id',auth,upload.single('upload'),async (req, res) =>
{ const _id = req.params.id

try {
    const task = await Task.findById({_id,owner:req.user._id})//with this we can access
    if (!task) {
        return res.status(404).send("plan not found")
    }
  
   task.job_files=task.job_files.concat({job_file:req.file.buffer})
    console.log(task.job_files)
    await task.save()
    res.status(200).send("successfully uploaded")
} catch (e) {
    res.status(500).send("unknown error")
}
},(error,req,res,next)=>{//handeles error frommiddleware 
        res.status(400).send("error from middleware")
    })

//  router.delete(' /delete_doc/:id/:docid',auth,async(req,res)=>
//  {try {
//     const task = await Task.findById({_id:req.params.id,owner:req.user._id})//with this we can access
//     if (!task) {
//         return res.status(404).send()
//     }
     
//      await task.save()
//      res.send()
//  })
// router.patch('/users/update_pic',auth,upload.single('upload'),async (req,res)=>
// {
//     req.user.avatar=undefined
//     req.user.avatar=req.file.buffer
//     await req.user.save()
//     res.send()
//     console.log("updated")
// },(error,req,res,next)=>{//handeles error frommiddleware 
//     res.status(400).send({error:error.message})
// })


router.get('/plans/get_upload_doc/:id',async(req,res)=>{
    
try{const task= await Task.findById(req.params.id)
   
if(!task||!task.job_files)
{
    throw new Error("bla bla")
}
//res.set('Content-Type','image/jpg')
//console.log( task.job_files.find(item => item.id === '61c1c5a519d2d47476fc71dc'))
res.status(200).send(task.job_files)
}
catch(e){
    res.status(404).send("no doc found ")}
})

 module.exports = router
