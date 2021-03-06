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
        subject:'welcome to per_man,start manging your tasks',
        text:`hi ${name}, thanks for choosing us`//USE `` NOT''OR ""
    }
)  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

}

const send_goodbye=(email,name)=>
{

sendgrid.send(
    {
        to:email,
        from:"ashwinurewar123@gmail.com",
        subject:'see u again',
        text:`hi ${name}, thanks for taking our service`
    }
)  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

}

module.exports={send_welcome,send_goodbye}
