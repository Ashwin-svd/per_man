const express = require('express')
const User=require('./models/user_model')
const Task=require('../models/task_model')
require('../db/mongoose')
const auth=require('./ex_mdlwr')
//const userRouter = require('../mongoose_rest_api/router')
//const app = express()
//const port = 3000
//app.use(userRouter)
//app.use(express.json())

const bcrypt= require('bcryptjs')
const jwt=require('jsonwebtoken')
//app.use((req,res,next)=>{
    //  console.log('middlware')
     // res.status(503).send('under maintainance')
   //next()//if commented then it will never end execution
 // })//


 const router = new express.Router()

const myFunction=async ()=>
{const token=jwt.sign({_id:'abc123'},'asdfghjkl',{expiresIn:'180 seconds'})
console.log(token.length)
const data=jwt.verify(token,'asdfghjkl')
console.log(data)
}
//myFunction()
//FOR LOGINREQUEST
router.post('/users/signup',async(req,res)=>{
    const user = new User(req.body)
    const token=await user.generateAuthToken()
 //console.log(JSON.stringify(req.body))
     user.save().then(() => {
         res.status(201).send(user.getPublicProfile())
     }).catch((e) => {
         res.status(400).send(e)
     })

})
router.post('/users/login',async(req,res)=>{
    try{
        const user= await User.findByCred(req.body.email,req.body.password)
        const token=await user.generateAuthToken()//for individual user////
        console.log({user,token})
        res.send ({user:user.getPublicProfile(),token})
       
    }
    catch(e){ 
        res.status(400).send()
    }
})
router.get('/users',async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        const users=await User.find({})
        res.send(users)
    }
    catch(e){
        res.status(500).send()
    }
})
router.post('/users/logout',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{return token.token!==req.token})
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})
router.get('/users/me',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        
        res.send(req.user)
    }
    catch(e){
        res.status(500).send()
    }
})

router.patch('/users/me',auth,async (req,res)=>{
    //for convertting object toan arrayofits properties
        const updates=Object.keys(req.body)
        const allw_updt=['name','age','password']
        const isvalidoprn=updates.every((update)=>{return allw_updt.includes(update)})
        if(!isvalidoprn)
        {return res.status(400).send("error:Invalid updates")}
        try{
            //find ques=ries in docs
            //const user =await User.findByIdAndUpdate(req.params.id,req.body,{new:true,unValidators:true})//only for id
            //console.log(req.user)
            updates.forEach((update)=>req.user[update]=req.body[update])
            await req.user.save()
     
            
            res.send(req.user)
        }
        catch(e){
            res.status(400).send(e)
    }
    })
    
router.delete('/users/me',auth,async (req,res)=>{
        try{
            //const user=await User.findByIdAndDelete(req.user._id)
          //  console.log(user)
          //OR
            await req.user.remove()
          
            res.send(req.user)
         }
        catch(e){
            res.status(400).send(e)
        }
    })

router.post('/upload',auth,upload.single('upload'), (req, res) => {
    req.user.avatar=req.file.buffer
    await req.user.save()
        res.send()
    },(error,req,res,next)=>{//handeles error frommiddleware 
        res.status(400).send({error:error.message})
    })

router.delete('users/me/avatar',auth,async(req,res)=>
{
    req.user.avatar=undefined//deleting picture
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
try{const user= await User.findById(req.param.id)
if(!user||user.avatar)
{
    throw new Error()
}
res.set('Content-Type','image/jpg')
res.send(user.avatar)
}
catch(e){res.status(404).send()}
})

    const main=async()=>{
        const user=await User.findById('61a3371f31944a9a54839b22')
        if(!user) 
        {console.log("not found")}
       // console.log(user)
        await user.populate('tasks')
        //await user.populate([{ path: 'mytasks' }])
        console.log(user.tasks)
    //     const task = await Task.findById('61a346ce09d371152046c61f') 
    //  await task.populate('owner')
    // console.log(task.owner)
        }

     //   main()

// app.listen(port, () => {
//     console.log('Server is up on port ' + port)
// })
module.exports=router