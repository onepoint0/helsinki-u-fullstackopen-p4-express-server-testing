const User = require('../models/users')
const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')

usersRouter.post('/', async (request,response) => {

    const { username, name, password } = request.body
// console.log('user deets ',request.body,username,name,password)

    if (!username || username.length < 3) return response.status(400).json({error: 'Username is required and must be at least 3 characters long'})

    if (!password || password.length < 3) return response.status(400).json({error: 'Password is required and must be at least 3 characters long'})

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password,saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()


    response.status(201).json(savedUser)

})

usersRouter.get('/', async (request,response) => {
    const users = await User.find({})
        .populate('blogs',{user: 0})

    response.status(200).send(users)
})

usersRouter.delete('/:id', async (request,response) => {
    const users = await User.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

module.exports = usersRouter