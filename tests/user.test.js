const request = require('supertest')
const app = require('../src/app')

const User = require('../src/models/user')
const {userOneID, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)


test('User Sign Up ', async () => {  
        const response = await request(app)
           .post('/users')
           .send({
                name: "Dragonjet",
                email: "dragonjetli@gmail.com",
                password: "P@ssw0rd"
            })
            .expect(201)

        const newUser = await User.findById(response.body.user._id)

        //Assert that the database was changed correctly
        expect(newUser).not.toBeNull()

        //Assertions about response body
        expect(response.body).toMatchObject({
            user:{
                name: 'Dragonjet',
                email:'dragonjetli@gmail.com',
            },
            token: newUser.tokens[0].token
        })
        

})

test('Login for Existing User', async ()=>{ 
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200)


        const loginUser = await User.findById(userOneID)
        expect(response.body.token).toBe(loginUser.tokens[1].token)
})

test('Login Prevent for Non-Existing User', async ()=>{
    await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: '232231342'
        })
        .expect(400)
})

test('Get profile for user', async ()=>{
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test("Don't get profile for unauthenticated user", async ()=>{
    await request(app)
        .get('/users/me')    
        .send()
        .expect(401)
})

test('Delete Account', async()=>{
    const response = await request(app)
            .delete('/users/me')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200)

    const deletedUser = await User.findById(response.body._id)
    expect(deletedUser).toBeNull()
})

test("Don't Delete Account for unauthenticated user", async ()=>{
    await request(app)
            .delete("/users/me")
            .send()
            .expect(401)
})

test('Upload Avatar Image', async ()=>{
    await request(app)
            .post('/users/me/avatar')
            .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
            .attach('avatar','./tests/fixtures/me.png')
            .expect(200)

    const user = await User.findById(userOneID)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update User Name', async ()=>{
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Drago'
        })
        .expect(200)

    expect(response.body.name).toBe('Drago')

})

test("Don't Update Invalid fields", async ()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Antartica'
    }).expect(400)
})