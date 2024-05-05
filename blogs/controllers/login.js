const User = require('../models/users')
const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

loginRouter.post('/', async (request,response) => {
    const { username, password } = request.body
// console.log('u & p ',username,password)
    const user = await User.findOne({username: username})
// console.log('user = ',user)
    const rightPW = !user || !user.passwordHash ? false : await bcrypt.compare(password,user.passwordHash)

    if (!rightPW || !user) return response.status(401).json({error: 'Invalid username or password'})

    const token = jwt.sign({
        username,
        id: user._id.toString()
    }, process.env.SECRET)

    response.status(200).send({token,username: user.username,name: user.name})
})

module.exports = loginRouter