import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    var signin: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'test-env-key-random-123';

    mongo = await MongoMemoryServer.create();

    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {
        dbName: 'test-database',
      });

    console.log("Mongo Db connected!")
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for(let collection of collections){
        await collection.deleteMany({});
    }
})

afterAll(async () => {
    if(mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
})

global.signin= async () => {
    const email = 'test@test.com'
    const password = 'password123'

    const response = await request(app)
        .post('/api/auth/signup')
        .send({
            email: email,
            password: password
        })
        .expect(201);

    const cookie = response.get('Set-Cookie');

    return cookie;
}