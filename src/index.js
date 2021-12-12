require('./mongoose')
const userRouter = require('../routes/user_routes')
const taskRouter = require('./routes/task_routes')
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const express = require('express')

const app = express()
const port = process.env.PORT

const multer = require('multer')
const upload = multer({
    //dest: 'images',
    limits:{fileSize:100},//restriction
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith('.pdf'))//we can usefile.originalname.match(/\.(jpg|jpeg|png )$/)
      {return cb(new Error('must be pdf'))}
    }
})

// const errorMiddleware=(req,res,next)=>
// {
//     throw new Error('from my middleware')
// }
app.post('/upload',auth,upload.single('upload'), (req, res) => {
 req.user.avatar=req.file.buffer
 await req.user.save()
    res.send()
},(error,req,res,next)=>{//handeles error frommiddleware 
    res.status(400).send({error:error.message})
})

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})