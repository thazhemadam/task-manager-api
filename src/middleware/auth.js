const jwt = require('jsonwebtoken')
const User = require('../models/user')


//"auth" is the middleware function used for verifying and authenticating users.
//1. auth gets the token (authentication token) from the request header.
//2. auth verifies the token, with the secret message (using jsonwebtokens module)
//3. auth searches the mongoose Model 'User' in the DB for matching "collections" and assigns it to "user"
//4. auth makes the "user" and "token" objects as properties  of the request itself (called userAuthenticated, authenticationToken respectively)
//5. auth calls the next() function, thus completing execution of middleware.
//Error: If there is an error at any step, auth sends back an error as a response.
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.authenticationToken = token
        req.userAuthenticated = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth