const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API)

const sendWelcomeEmail = (email, name) => {
    const msg = {
          to: email,
          from: 'anant.thazhemadam@gmail.com',
          subject: 'Welcome to TaskerAha!',
          text: `Welcome to TaskerAha, ${name}. I hope you have a pleasant experience.`,
    }

    sgMail.send(msg).then(()=>{
        //   console.log('Welcome Mail Sent.')
      }).catch((error)=>{
          console.log('Error', error)
      })
}

const sendGoodbyeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'anant.thazhemadam@gmail.com',
    subject: 'Farewell from TaskerAha.',
    text: `TaskerAha bids you goodbye, ${name}. I hope you had a pleasant experience, and will consider returning soon.`,
}

    sgMail.send(msg)
    .then(()=>{
        // console.log('Goodbye Mail Sent.')
    }).catch((error)=>{
        console.log('Error', error)
    })
}
module.exports = {
    sendWelcomeEmail, 
    sendGoodbyeEmail 
}