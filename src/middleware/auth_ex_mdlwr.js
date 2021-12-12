const jwt=require('jsonwebtoken')
const User=require('../models/user_model')
const auth=async(req,res,next)=>{
  //  console.log('middlware')
   // res.status(503).send('under maintainance')
try{
    //console.log(req)
    const token =req.header('Authorization').replace('Bearer ','')
    console.log(token)
    console.log(token.length)
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    console.log("decoded:",decoded)
    const user=await User.findOne({'_id':decoded._id,'tokens.token':token})
    //console.log(user)
    if(!user)
    {throw new Error()}
    req.token=token
req.user=user
next()//if commented then it will never end execution
}
catch(e){
    res.status(401).send({error:'do authenticate'})
}
}
module.exports=auth