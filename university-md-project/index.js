import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'universityDB';

async function main() {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');

    const db = client.db(dbName);

    // Clean up existing collections for clean execution
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.collection(col.name).drop();
    }

    //================================================
    // task-1: schema validation & collection creation
    //================================================

    console.log('n--- TASK 1: SCHEMA VALIDATION & COLLECTION CREATION ---');

    await db.createCollection('students',{
      validator:{
        $jsonSchema:{
          bsonType:'object',
          required:['studentNumber','name','gpa', 'isEneolled'],
          properties:{
            studentNumber:{bsonType:'string'},
            name:{bsonType:'string'},
            gpa:{
              bsonType:['double','init'],
              minimum:0.0,
              maximum:4.0
          },
          isEnrolled:{bsonType:'bool'}
        }
      }
      }
    });

    const studentsCol = db.collection('students');
    const departmentsCol = db.collection('departments');
    const instructorCol = db.collection('instructors');
    const coursesCol = db.collection('courses');




   