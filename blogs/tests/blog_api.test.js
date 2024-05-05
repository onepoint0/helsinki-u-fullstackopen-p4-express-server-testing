const {test,after,beforeEach, describe} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const Blog = require('../models/blogs')
const User = require('../models/users')
const loginRouter = require('../controllers/login')
const { initialBlogs, initialUser, blogsInDb } = require('./test_helper')

const api = supertest(app)

const blogUrl = '/api/blogs'
const userUrl = '/api/users'

// RUN ONLY TESTS: npm test -- --test-only

describe.only('When creating blogs ', () => {

    const username = 'root'
    const password = 'sekret'
    let auth

    beforeEach( async () => {

        await User.deleteMany({})


        const passwordHash = await bcrypt.hash(password, 10)
        const user = new User({ username: username, passwordHash })
    
        await user.save()

        auth = await (await api.post('/api/login').send({username,password})).body.token
// console.log('autho = ',auth) 

        await Blog.deleteMany({})

        // https://fullstackopen.com/en/part4/testing_the_backend#optimizing-the-before-each-function
        const blogObjects = initialBlogs.map( blog => new Blog(blog))
        const promiseArray = blogObjects.map( blog => blog.save())

        await Promise.all(promiseArray)

    })
    //test('dummy to test beforeeach ', async () => {})

    test('blogs list has right number of blogs ', async () => {
    // test.only('blogs list has right number of blogs ', async()=> {
        const blogs = await api
            .get(blogUrl)
            .expect(200)
            .expect('Content-Type',/application\/json/)
        
        // console.log('blogs = ', blogs.body)
        assert.strictEqual(blogs.body.length,initialBlogs.length)
    })

    test('Unique identifier key name is "id" ', async()=> {
    // test.only('Unique identifier key name is "id" ', async()=> {
        const blogs = await api
            .get(blogUrl)
            .expect(200)
            .expect('Content-Type',/application\/json/)
        
        // console.log('blogs = ', Object.keys(blogs.body[0]))

        const keys = Object.keys(blogs.body[0])
        assert(keys.includes('id') && ! keys.includes('_id'))
    })

    // test('Post request correctly adds blog to the database ', async () => {
    test.only('Post request correctly adds blog to the database ', async () => {

        const newBlog = {
            title:   "Test blogs are correctly added to the database",
            author:  "test",
            url:     "https://test.com",
            likes:   10
        }

        const response = await api
            .post(blogUrl)
            .set('Authorization',`Bearer ${auth}`)
            .send(newBlog)

        const newBlogs = await api.get(blogUrl)

        const blogs = newBlogs.body.map( b => b.title + '#' + b.author + '#' + b.url + '#' + b.likes)

        assert.strictEqual(initialBlogs.length, newBlogs.body.length-1)
        assert(blogs.includes(newBlog.title + '#' + newBlog.author + '#' + newBlog.url + '#' + newBlog.likes))

    })

    test.only('likes property defaults to zero when not sent ', async () => {
    // test('likes property defaults to zero when not sent ', async () => {
        const newBlog = {
            title:   "A new blog!",
            author:  "clario",
            url:     "https://clareivers.com",
        }

        const response = await api
            .post(blogUrl)
            .set('Authorization',`Bearer ${auth}`)
            .send(newBlog)

        // console.log('PROPERTY DEFAULTS TO ZERO: ',response._body)

        assert.strictEqual( response.body?.likes, 0)
    })

    test('empty title returns 400', async () => {
    // test.only('empty title returns 400', async () => {
        const newBlog = {
            author:  "clario",
            url:     "https://clareivers.com",
            likes:   3
        }

        const response = await api
            .post(blogUrl)
            .send(newBlog)
            .set('Authorization',`Bearer ${auth}`)
            .expect(400)

    })

    //test.only('empty url returns 400', async () => {
    test('empty url returns 400', async () => {
        const newBlog = {
            author:  "clario",
            title:   "A blog title",
            likes:   3
        }

        const response = await api
            .post(blogUrl)
            .send(newBlog)
            .set('Authorization',`Bearer ${auth}`)
            .expect(400)

    })

    test.only('blog cannot be deleted without passing auth header', async () => {
        const toDelete = await Blog.find({}).limit(1)

        const res = await api
            .delete(`${blogUrl}/${toDelete[0]._id}`)
            .expect(401)

        assert.strictEqual(JSON.parse(res.error.text).error, 'Sorry, you are not permitted to delete this blog.')
        
    })

    test('blog post is successfully removed on delete request', async () => {
    // test.only('blog post is successfully removed on delete request', async () => {

        // need to create new blog here with current user because blog can only be deleted by owner
        const newBlog = {
            title:   "A blog to test deleting works",
            author:  "clario",
            url:     "http://test",
            likes:   3
        }

        const newBlogID = (await api
            .post(blogUrl)
            .send(newBlog)
            .set('Authorization',`Bearer ${auth}`)
            .expect(201))
            ._body.id

        await api
            .delete(`${blogUrl}/${newBlogID}`)
            .set('Authorization',`Bearer ${auth}`)
            .expect(204)

        await api
            .get(`${blogUrl}/${newBlogID}`)
            .expect(404)

    })

    // test.only('blog post is successfully updated on put request', async () => {
    test('blog post is successfully updated on put request', async () => {
        const currblogs = await blogsInDb();

        const id = currblogs[0].id;

        const updated = {
            title: currblogs[0].title + 'Updated',
            author: currblogs[0].author + 'Updated',
            url: currblogs[0].url + 'Updated',
            likes: currblogs[0].likes + 5,
            }

        await api
            .put(`${blogUrl}/${id}`)
            .send(updated)
            .expect(200)

        await api
            .get(`${blogUrl}/${id}`)
            .expect(200,{
                title:  updated.title,
                author: updated.author,
                url:    updated.url,
                likes:  updated.likes,
                id:     id
            })

    }) 

})

describe('When a user is created', () => {

    test('Username is required and must be at least 3 characters long', async () => {
        const newUser = {
            username: "2c",
            password: "morethan3chars"
        }

        const response = await api
            .post(userUrl)
            .send(newUser)
            .expect(400)

        assert.strictEqual(JSON.parse(response.error.text).error, 'Username is required and must be at least 3 characters long')
    })

    test('Password is required and must be at least 3 characters long', async () => {
        const newUser = {
            username: "morethan3chars",
            password: "2c"
        }

        const response = await api
            .post(userUrl)
            .send(newUser)
            .set('Accept', 'application/json')
            .expect(400)

        assert.strictEqual(JSON.parse(response.error.text).error, 'Password is required and must be at least 3 characters long')

    })

})

after(async () => {
    mongoose.connection.close()
})