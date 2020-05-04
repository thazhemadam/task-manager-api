const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')

const User = require('../models/user')

const router = new express.Router()


//Note: In order to access your profile, first you've to be authenticated, to prove you are you, and not somebody else.
//      For this purpose, the middleware function "auth" is called. If authentication fails at any given point, an error is returned.

//CREATE - SIGN UP
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email,user.name)
        //In case data abstraction for not sending sensitive data like "password"/"tokens" (all tokens), is done manually, by calling the method getPublicProfile().
        // res.status(201).send({ user: user.getPublicProfile(), token })
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

//LOGIN
router.post('/users/login', async (req, res) => {
    try {
        
        const user = await User.findByCredentials(req.body.email, req.body.password)    //user refers to the user who just got logged in.
        const token = await user.generateAuthToken()    //Generate an Authentication Token for the currently logged in user. The Authentication token is saved by default.
        //In case data abstraction for not sending sensitive data like "password"/"tokens" (all tokens), is done manually, by calling the method getPublicProfile().
        // res.send({ user: user.getPublicProfile(), token })   
        res.status(200).send({ user, token }) //In addition to saving (done by generateAuthToken()); send the user details, and Authentication Token generated as response.
    } catch (error) {
        res.status(400).send()
    }
})

//LOGOUT
router.post('/users/logout', auth, async (req, res)=>{
    try {
        req.userAuthenticated.tokens = req.userAuthenticated.tokens.filter((token)=>{
            return token.token !== req.authenticationToken
        })
        await req.userAuthenticated.save()
        res.send('User logged out!')

    } catch (error) {
        res.status(500).send()
    }
})

//LOGOUT - All sessions
router.post('/users/logoutall', auth, async(req, res)=>{
    try {
        req.userAuthenticated.tokens = []
        await req.userAuthenticated.save()
        res.send('Logged out of all sessions successfully!')
    } catch (error) {
        console.log(req.userAuthenticated)
        res.status(500).send()
    }
})
//READ PROFILE
router.get('/users/me', auth, async (req, res) => {
    res.send(req.userAuthenticated)  
})

//UPDATE Profile
router.patch('/users/me', auth, async (req, res) => {
    
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.userAuthenticated[update] = req.body[update])
        await req.userAuthenticated.save()
        res.send(req.userAuthenticated)

    } catch (error) {
        res.status(400).send(error)
    }
})

//DELETE Profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        sendGoodbyeEmail(req.userAuthenticated.email, req.userAuthenticated.name)
        await req.userAuthenticated.remove()
        res.send(req.userAuthenticated)
    } catch (error) {
        console.log('error.')
        res.status(500).send()
    }
})


//Multer configuration
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('Incorrect File extension'))
        }
        callback(undefined, true)
    }
})

//Upload Profile Pic
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
        req.userAuthenticated.avatar = buffer
        await req.userAuthenticated.save()
        res.status(200).send()
    }, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

//Delete Profile Pic
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.userAuthenticated.avatar = undefined
    await req.userAuthenticated.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{
    try {
           const user = await User.findById(req.params.id)
           if(!user || !user.avatar){
                throw new Error('User Avatar not found!')
           }
           res.set('Content-Type','image/png')
           res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router