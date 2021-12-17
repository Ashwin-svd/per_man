require('./db/mongoose')
const userRouter = require('./routes/user_routes')
const taskRouter = require('./routes/task_routes')
const express = require('express')
const app = express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)
const user=require('./models/user_model')
const auth=require('./middleware/auth_ex_mdlwr')
const port = process.env.PORT

const multer = require('multer')
const upload = multer({
   // dest: 'images',
    //limits:{fileSize:10000000},//restriction
    fileFilter(req,file,cb,){
        if(!file.originalname.endsWith('.jpg'))//we can usefile.originalname.match(/\.(jpg|jpeg|png )$/)
      {
          return cb(new Error('must be jpg'))
        }
        cb(undefined,true)
     
    }

})

// const errorMiddleware=(req,res,next)=>
// {
//     throw new Error('from my middleware')
// }
// app.post('/upload_test', upload.single('upload'), (req, res) => {
   
//     res.send()
// })
app.post('/upload_test',auth,upload.single('upload'),async (req, res) => {
 req.user.avatar=req.file.buffer
 await req.user.save()
    res.send()
},(error,req,res,next)=>{//handeles error frommiddleware 
    res.status(400).send({error:error.message})
})

app.listen(port, () => {
    console.log('Server is up on port ' +port )
})