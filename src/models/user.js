const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {titleCase} = require('title-case')
const Task = require('./task')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Email is invalid')
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
        tokens: [{
            token: {
                type: String,
                required: true
            }
        }],
        avatar: {
            type: Buffer
        }
    },{
        timestamps: true
    }
)

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',  //The _id property of User model
            //is virtually related to the Task model
    foreignField: 'owner'//property called owner.
    
})

//.methods for functions that act on individual instance (or a "collection") of a model.
//.statics. for functions that act/work on a model entirely/on the whole (mongoose model)


//Generate Authentication Tokens. These Authentications are saved for each profile, and also sent back as response.
//.methods for functions that act on individual instance (or a "collection") of a model.
userSchema.methods.generateAuthToken = async function () {  //This function is binding to the object that it's called with.
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY, {expiresIn:'24h'})

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//Delete the password and authentication tokens from the object that is to be returned as response.
//This is the manual method which involves having to explicity call the function getPublicProfile for every route or every time the data of a collection in the User model is sent back as response.
// userSchema.methods.getPublicProfile = function (){
//     const user = this
//     const userObject = user.toObject()
//     delete userObject.password
//     delete userObject.tokens
//     return userObject
// }

//Delete the password and authentication tokens from the object that is to be returned as response.
//This is the relatively automated method, in which explicit calls aren't necessary, and the data abstraction is done automatically.
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


//Verify Input Credentials 
//.statics. for functions that act/work on a model entirely/on the whole (mongoose model)
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    var user = this
    if (user.isModified('name')) {
        user.name = await titleCase(user.name.toLowerCase())
    }
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

//Remove all the respective tasks when a User is deleted.
userSchema.pre('remove', async  function(next){
    const user = this
    await Task.deleteMany({"owner": user._id})
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User