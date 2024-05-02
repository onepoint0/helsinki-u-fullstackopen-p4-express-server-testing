const {test,after,beforeEach} = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Blog = require('../models/blogs')
const { initialBlogs, blogsInDb } = require('./test_helper')

const api = supertest(app)

const rootUrl = '/api/blogs'

// RUN ONLY TESTS: npm test -- --test-only

beforeEach( async () => {
    // https://fullstackopen.com/en/part4/testing_the_backend#optimizing-the-before-each-function
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
// test.only('Unique identifier key name is "id" ', async()=> {
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

    const blogs = newBlogs.body.map( b => b.title + '#' + b.author + '#' + b.url + '#' + b.likes)

    assert.strictEqual(initialBlogs.length, newBlogs.body.length-1)
    assert(blogs.includes(newBlog.title + '#' + newBlog.author + '#' + newBlog.url + '#' + newBlog.likes))

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

test('empty title returns 400', async () => {
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

//test.only('empty url returns 400', async () => {
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

test('blog post is successfully removed on delete request', async () => {
// test.only('blog post is successfully removed on delete request', async () => {
 
    const currblogs = await blogsInDb();

    await api
        .delete(`${rootUrl}/${currblogs[0].id}`)
        .expect(204)

    await api
        .get(`${rootUrl}/${currblogs[0].id}`)
        .expect(404)

})

test.only('blog post is successfully updated on put request', async () => {
// test('blog post is successfully updated on delete request', async () => {
    const currblogs = await blogsInDb();

    const id = currblogs[0].id;

    const updated = {
        title: currblogs[0].title + 'Updated',
        author: currblogs[0].author + 'Updated',
        url: currblogs[0].url + 'Updated',
        likes: currblogs[0].likes + 5,
        }

    await api
        .put(`${rootUrl}/${id}`)
        .send(updated)
        .expect(200)

    await api
        .get(`${rootUrl}/${id}`)
        .expect(200,{
            title:  updated.title,
            author: updated.author,
            url:    updated.url,
            likes:  updated.likes,
            id:     id
        })

})

after(async () => {
    mongoose.connection.close()
})