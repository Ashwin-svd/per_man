const express = require('express')
const User=require('../models/user_model')
const Task=require('../models/task_model')
require('../db/mongoose')
const auth=require('../middleware/auth_ex_mdlwr')

//const userRouter = require('../mongoose_rest_api/router')
//const app = express()
//const port = 3000
//app.use(userRouter)
//app.use(express.json())
const mail=require('../email/email')
const bcrypt= require('bcryptjs')
const jwt=require('jsonwebtoken')
//app.use((req,res,next)=>{
    //  console.log('middlware')
     // res.status(503).send('under maintainance')
   //next()//if commented then it will never end execution
 // })//


 const router = new express.Router()

// const myFunction=async ()=>
// {const token=jwt.sign({_id:'abc123'},'asdfghjkl',{expiresIn:'180 seconds'})
// console.log(token.length)
// const data=jwt.verify(token,'asdfghjkl')
// console.log(data)
// }
//myFunction()
//FOR LOGINREQUEST
router.post('/users/signup',async(req,res)=>{
   // console.log(typeof(req.body.email))
   try{ const a=await User.findByEmail(req.body.email)}
   catch(e){
     //  console.log("s")
     //  console.log(e)
    
    return res.status(400).send("email aready exist")
   }
    try{
    const  user = new User(req.body)
     const token=await user.generateAuthToken()

    
 //console.log(JSON.stringify(req.body))
     user.save().then(() => {mail.send_welcome(req.body.email,req.body.name)
         res.status(201).send({user:user.getPublicProfile(),token})
     }).catch((e) => {
         
        return  res.status(500).send("unknown error")
     })}
     catch(e){res.status(401).send("invalid credentials")
         }

}
)

router.post('/users/login',async(req,res)=>{
    try{
        const user= await User.findByCred(req.body.email,req.body.password)
    
        const token=await user.generateAuthToken()//for individual user////
        //console.log({user,token})
        res.status(200).send ({user:user.getPublicProfile(),token})
       
    }
    catch(e){ 
       // console.log(e,typeof(e))
        res.status(400).send("credentials are incorrect")
    }
})
router.get('/users/get_all',async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        const users=await User.find({})
        res.status(200).send(users)
    }
    catch(e){
        res.status(500).send("unknown error")
    }
})
router.post('/users/logout',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{return token.token!==req.token})
        await req.user.save()
        res.status(200).send("logged out successfully")
    }
    catch(e){
        res.status(500).send("unknown error")
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        req.user.tokens=[]
        await req.user.save()
        res.status(200).send("logged out from all")
    }
    catch(e){
        res.status(500).send("unknown error")
    }
})
router.get('/users/me',auth,async(req,res)=>{//first it will going to run auth then it willhandel routs
    try{
        
        res.status(200).send(req.user)
    }
    catch(e){
        res.status(500).send("unknown error")
    }
})

router.patch('/users/update_profile',auth,async (req,res)=>{
    //for convertting object toan arrayofits properties
        const updates=Object.keys(req.body)
        const allw_updt=['name','age','password','email','phone_number']
        const isvalidoprn=updates.every((update)=>{return allw_updt.includes(update)})
        if(!isvalidoprn)
        {return res.status(400).send("error:Invalid updates")}
        try{
            //find ques=ries in docs
            //const user =await User.findByIdAndUpdate(req.params.id,req.body,{new:true,unValidators:true})//only for id
            //console.log(req.user)
            updates.forEach((update)=>req.user[update]=req.body[update])
            await req.user.save()
     
            
            res.send("profile updated successfully")
        }
        catch(e){
            res.status(500).send("unknown error")
    }
    })
    
router.delete('/users/delete_all_plans',auth,async (req,res)=>{
        try{
            const user=await User.findById(req.user._id)
          //  console.log(user)
          //OR
            await user.deletealltasks()
          await user.save()
            res.send("all plans deleted")
         }
        catch(e){
            res.status(500).send("unnown error")
        }
    })
    
    const multer= require('multer')
    const upload = multer({
        //dest: 'images',
        limits:{fileSize:100000},//restriction
        fileFilter(req,file,cb){
            if(!file.originalname.match('.jpg'))//we can usefile.originalname.match(/\.(jpg|jpeg|png )$/)
          {return cb(new Error('must be jpg,jpeg,png'))}
          cb(undefined,true)
        }
         
    })

//IMP=const base64Img = Buffer.from(user.avatar).toString('base64')
    
router.post('/users/upload',auth,upload.single('upload'),async (req, res) => {
    req.user.profile=req.file.buffer
    await req.user.save()
        res.send("uploaded successfully")
    },(error,req,res,next)=>{//handeles error frommiddleware 
        res.status(400).send("error from middleware")
    })

router.delete('/users/delete_profile_pic',auth,async(req,res)=>
{
    req.user.profile=undefined//deleting picture
    await req.user.save()
    res.send("profile pic deleted")
})
router.patch('/users/update_pic',auth,upload.single('upload'),async (req,res)=>
{
    req.user.profile=undefined
    req.user.profile=req.file.buffer
    await req.user.save()
    res.send("updated sucess fully")
  
},(error,req,res,next)=>{//handeles error frommiddleware 
    res.status(500).send("unknown error")
})


router.get('/users/:id/pic',async(req,res)=>{
    console.log(req.params.id)
try{const user= await User.findById(req.params.id)
    console.log(req.params.id)
   // console.log(user)
  //  console.log(user.avatar)
if(!user||!user.profile)
{
    throw new Error("bla bla")
}
res.set('Content-Type','image/jpg')
res.send(user.profile)
}
catch(e){
    res.status(404).send("not found")}
})

router.get('/users/my_pic',auth,async(req,res)=>{
    
try{const user= await User.findById(req.user._id)
   
if(!user||!user.profile)
{
    throw new Error("bla bla")
}
res.set('Content-Type','image/jpg')
res.send(user.profile)
}
catch(e){
    res.status(404).send("not found")}
})

router.delete('/users/deleteprofile', auth, async (req, res) => {
    try {
        await req.user.remove()
        mail.send_goodbye(req.user.email, req.user.name)
        res.send("delted")
    } catch (e) {
        res.status(500).send("unknown error")
    }
})
    // const main=async()=>{
    //     const user=await User.findById('61b8913a64f517b4a6edcfdb')
    //     if(!user) 
    //     {console.log("not found")}
    //    // console.log(user)
    //     await user.populate('tasks')
    //  //   await user.populate([{ path: 'tasks' }])
    //     console.log(user.tasks)
    // //     const task = await Task.findById('61a346ce09d371152046c61f') 
    // //  await task.populate('owner')
    // // console.log(task.owner)//print owner id only,to get whole owner info run above populate command
    //     }

    //    main()

// app.listen(port, () => {
//     console.log('Server is up on port ' + port)
// })
module.exports=router