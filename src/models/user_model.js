const mongoose = require('mongoose')
const validator = require('validator')
const Task=require('./task_model')
const bcrypt=require('bcryptjs')
mongoose.connect('mongodb://127.0.0.1:27017/task-manager')
const jwt=require('jsonwebtoken')
const userschema=new mongoose.Schema( {
    name: {
        type: String,
        required: true,
        trim: true 
    },
    email: {
        type: String,
        unique:true,
        required: true,
       
       // trim: true,
        validate(value) {
            if (!validator.isEmail(value)) 
            {
                throw new Error('email isinvalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens:[{
        token:{type:String,
        required:true}
    }],
    avatar:{type:Buffer}

},
{timestamps:true})


userschema.virtual('tasks',{//setup virtual property sets relationship betn two entities
    ref:'Task',//for popuate comand
    localField:'_id',//id of user
    foreignField:'owner'//
})
userschema.methods.getPublicProfile=function()//we are using this keyword hence we dont want to use arrow function
{ const user =this
    const userObject =user.toObject()

    delete userObject.password
    delete userObject.tokens
    return userObject
}
userschema.methods.generateAuthToken=async function(){//.method for instance of model
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
//console.log(token)
//const data=jwt.verify(token,'asdfghjkl')
//console.log(data)
}
userschema.statics.findByCred=async(email,password)=>{
    //.statics for  model
    const user=await User.findOne({email})
    if(!user)
    {
        throw new Error('unable to login')
    }
    //if user found then compare password
    const ismatch=await bcrypt.compare(password,user.password)
    if(!ismatch)
    {
        throw new Error('unable to login')
    }
    return user
}

userschema.statics.findByEmail=async(email)=>{
    //.statics for  model
    const user=await User.findOne({email})
    if(user)
    {
        throw new Error('email already exist')
    }

}
//FUNCTION FOR PASSWORD HASHING
//ARROW FUNCTION DONT BIND
userschema.pre('save',async function (next){
const user=this//this= individual user that about to save
// console.log('justbefore saving')

if(user.isModified('password'))// telis whre parameter changed or added
{user.password=await bcrypt.hash(user.password,8)}
next()
})

userschema.methods.deletealltasks=async function(){
   const user=this
    await Task.deleteMany({owner:user._id})

    }
userschema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})
const User = mongoose.model('User', userschema)

// var me = new User({
//     name: '   psdsddsd  ',
//     password: 'wdfcdword98!'
//     ,age:29
// })

// me.save().then(() => {
//     console.log(me)
// }).catch((error) => {
//     console.log('Error!', error)
// })

module.exports = User