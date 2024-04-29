const {test,after,beforeEach} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blogs')
const {initialBlogs} = require('./test_helper')

const api = supertest(app)

const rootUrl = '/api/blogs'

beforeEach( async () => {
    await Blog.deleteMany({})

    const blogObjects = initialBlogs.map( blog => new Blog(blog))
    const promiseArray = blogObjects.map( blog => blog.save())

    await Promise.all(promiseArray)

})

test('blogs list has right number of blogs ', async () => {
// test.only('blogs list has right number of blogs ', async()=> {
    const blogs = await api
        .get(rootUrl)
        .expect(200)
        .expect('Content-Type',/application\/json/)
    
    // console.log('blogs = ', blogs.body)
    assert.strictEqual(blogs.body.length,initialBlogs.length)
})

test('Unique identifier key name is "id" ', async()=> {
    const blogs = await api
        .get(rootUrl)
        .expect(200)
        .expect('Content-Type',/application\/json/)
    
    // console.log('blogs = ', Object.keys(blogs.body[0]))

    const keys = Object.keys(blogs.body[0])
    assert(keys.includes('id') && ! keys.includes('_id'))
})

test('Post request correctly adds blog to the database ', async () => {
// test.only('Post request correctly adds blog to the database ', async () => {

    const newBlog = {
        title:   "A new blog!",
        author:  "clario",
        url:     "https://clareivers.com",
        likes:   10
    }

    const response = await api
        .post(rootUrl)
        .send(newBlog)

    const newBlogs = await api.get(rootUrl)

    // console.log('response = ',response)
    // console.log('init blogs = ',initialBlogs.body)
    // console.log('new blogs = ',newBlogs.body)

    const blogTitles = newBlogs.body.map( b => b.title )

    assert.strictEqual(initialBlogs.length, newBlogs.body.length-1)
    assert(blogTitles.includes(newBlog.title))

})

// test.only('like property defaults to zero when not sent ', async () => {
test('like property defaults to zero when not sent ', async () => {
    const newBlog = {
        title:   "A new blog!",
        author:  "clario",
        url:     "https://clareivers.com",
    }

    const response = await api
        .post(rootUrl)
        .send(newBlog)

    // console.log('PROPERTY DEFAULTS TO ZERO: ',response._body)

    assert.strictEqual( response.body?.likes, 0)
})

test('empty title returns 404', async () => {
// test.only('empty title returns 400', async () => {
    const newBlog = {
        author:  "clario",
        url:     "https://clareivers.com",
        likes:   3
    }

    const response = await api
        .post(rootUrl)
        .send(newBlog)
        .expect(400)

})

// test.only('empty url returns 400', async () => {
test('empty url returns 400', async () => {
    const newBlog = {
        author:  "clario",
        title:   "A blog title",
        likes:   3
    }

    const response = await api
        .post(rootUrl)
        .send(newBlog)
        .expect(400)

})

after(async () => {
    mongoose.connection.close()
})