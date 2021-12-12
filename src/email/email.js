//const email_key=process.env.EMAIL_KEY
const sendgrid= require('@sendgrid/mail')
sendgrid.setApiKey(process.env.EMAIL_KEY)
// sendgrid.send(
//     {
//         to:"ashwinurewar123@gmail.com",
//         from:"ashwinurewar123@gmail.com",
//         subject:'email assignment',
//         text:"sdjjdsdcjsdmismskcmsdkcmsdk"
//     }
// )  .then(() => {
//     console.log('Email sent')
//   })
//   .catch((error) => {
//     console.error(error)
//   })
const send_welcome=(email,name)=>
{

sendgrid.send(
    {
        to:email,
        from:"ashwinurewar123@gmail.com",
        subject:'welcome to task manager',
        text:" hi ${name}, thanks for choosing us"
    }
)  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

}

module.exports=send_welcome