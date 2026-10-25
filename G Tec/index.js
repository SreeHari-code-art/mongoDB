import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'gtecDB';

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

    // =========================================================================
    // TASK 1: SCHEMA VALIDATION & COLLECTION CREATION
    // =========================================================================
    console.log('\n--- Task 1: Setting up Schema Validation ---');

    await db.createCollection('staff', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['staffNumber', 'name', 'salary', 'isActive'],
          properties: {
            staffNumber: { bsonType: 'string' },
            name: { bsonType: 'string' },
            salary: {
              bsonType: ['double', 'int'],
              minimum: 0
            },
            isActive: { bsonType: 'bool' }
          }
        }
      }
    });

    const staffCol = db.collection('staff');
    const departmentsCol = db.collection('departments');
    const centersCol = db.collection('centers');
    const programsCol = db.collection('programs');

    // =========================================================================
    // TASK 2: DATA POPULATION
    // =========================================================================
    console.log('--- Task 2: Populating Documents ---');

    // 1. Insert Departments
    const swDeptId = new ObjectId();
    const netDeptId = new ObjectId();
    await departmentsCol.insertMany([
      { _id: swDeptId, deptCode: 'SW', name: 'Software & Data Science' },
      { _id: netDeptId, deptCode: 'NW', name: 'Networking & Hardware' }
    ]);

    // 2. Insert Centers/Branches
    const center1Id = new ObjectId();
    const center2Id = new ObjectId();
    await centersCol.insertMany([
      { _id: center1Id, centerCode: 'TEC-01', location: 'Kochi Hub', city: 'Kochi' },
      { _id: center2Id, centerCode: 'TEC-02', location: 'Calicut Center', city: 'Kozhikode' }
    ]);

    // 3. Insert Staff Members
    const staff1Id = new ObjectId();
    const staff2Id = new ObjectId();
    const staff3Id = new ObjectId();
    const staff4Id = new ObjectId();
    const staff5Id = new ObjectId();

    await staffCol.insertMany([
      {
        _id: staff1Id,
        staffNumber: 'GTEC-101',
        name: 'Arun R',
        age: 32,
        salary: 65000,
        isActive: true,
        joinDate: new Date('2021-03-15'),
        contact: { email: 'arun@gtec.edu', phone: '9876543210', address: 'Kochi, Kerala' },
        departmentId: swDeptId,
        centerId: center1Id,
        certifications: [
          { certCode: 'AWS-DEV', year: 2022, status: 'Completed' },
          { certCode: 'MOG-DB', year: 2023, status: 'Completed' }
        ]
      },
      {
        _id: staff2Id,
        staffNumber: 'GTEC-102',
        name: 'Swathi T',
        age: 28,
        salary: 45000,
        isActive: true,
        joinDate: new Date('2022-06-10'),
        contact: { email: 'swathi@gtec.edu', phone: '9876543211', address: 'Kochi, Kerala' },
        departmentId: swDeptId,
        centerId: center1Id,
        certifications: [
          { certCode: 'HR-MGMT', year: 2022, status: 'Completed' }
        ]
      },
      {
        _id: staff3Id,
        staffNumber: 'GTEC-103',
        name: 'Kannan Sreelekha',
        age: 35,
        salary: 72000,
        isActive: true,
        joinDate: new Date('2020-01-10'),
        contact: { email: 'kannan@gtec.edu', phone: '9876543212', address: 'Calicut, Kerala' },
        departmentId: swDeptId,
        centerId: center2Id,
        certifications: [
          { certCode: 'JAVA-ADV', year: 2021, status: 'Completed' },
          { certCode: 'PYTHON-PRO', year: 2023, status: 'Completed' }
        ]
      },
      {
        _id: staff4Id,
        staffNumber: 'GTEC-104',
        name: 'Akhil Jishnu K P',
        age: 30,
        salary: 50000,
        isActive: false,
        joinDate: new Date('2019-11-01'),
        contact: { email: 'akhil@gtec.edu', phone: '9876543213', address: 'Pattambi, Kerala' },
        departmentId: netDeptId,
        centerId: center2Id,
        certifications: [
          { certCode: 'CAD-PRO', year: 2020, status: 'Completed' }
        ]
      },
      {
        _id: staff5Id,
        staffNumber: 'GTEC-105',
        name: 'Sanika M Baby',
        age: 27,
        salary: 42000,
        isActive: true,
        joinDate: new Date('2023-02-20'),
        contact: { email: 'sanika@gtec.edu', phone: '9876543214', address: 'Kochi, Kerala' },
        departmentId: swDeptId,
        centerId: center1Id,
        certifications: [
          { certCode: 'ACC-TALLY', year: 2023, status: 'Completed' }
        ]
      }
    ]);

    // 4. Insert Training Programs
    await programsCol.insertMany([
      {
        programCode: 'PROG-SW1',
        title: 'Full Stack Development',
        durationMonths: 6,
        departmentId: swDeptId,
        leadInstructorId: staff1Id,
        assignedStaffIds: [staff1Id, staff3Id]
      },
      {
        programCode: 'PROG-NW1',
        title: 'Advanced Networking & Hardware',
        durationMonths: 4,
        departmentId: netDeptId,
        leadInstructorId: staff4Id,
        assignedStaffIds: [staff4Id]
      }
    ]);

    // =========================================================================
    // TASK 3: QUERIES & PAGINATION
    // =========================================================================
    console.log('\n--- Task 3: Query Execution ---');

    // Query 1: Staff with MongoDB Certification ('MOG-DB')
    const certifiedStaff = await staffCol.find({
      certifications: { $elemMatch: { certCode: 'MOG-DB', status: 'Completed' } }
    }).toArray();
    console.log('Staff with MongoDB Certification:', certifiedStaff.map(s => s.name));

    // Query 2: Pagination (Page 2, 2 items per page sorted by salary descending)
    const paginatedStaff = await staffCol.find()
      .sort({ salary: -1 })
      .skip(2)
      .limit(2)
      .toArray();
    console.log('Paginated Staff (Page 2):', paginatedStaff.map(s => ({ name: s.name, salary: s.salary })));

    // =========================================================================
    // TASK 4: AGGREGATION PIPELINE
    // =========================================================================
    console.log('\n--- Task 4: Aggregation Pipeline ---');

    const analyticsPipeline = [
      {
        $group: {
          _id: '$isActive',
          totalStaff: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          maxSalary: { $max: '$salary' }
        }
      },
      {
        $project: {
          _id: 0,
          isActive: '$_id',
          totalStaff: 1,
          averageSalary: { $round: ['$avgSalary', 2] },
          highestSalary: '$maxSalary'
        }
      }
    ];

    const analyticsResult = await staffCol.aggregate(analyticsPipeline).toArray();
    console.log('Staff Employment Analytics:', analyticsResult);

    // =========================================================================
    // TASK 5: INDEXES & ATOMIC UPDATES
    // =========================================================================
    console.log('\n--- Task 5: Indexing & Document Update ---');

    // Create Compound Index
    await staffCol.createIndex({ isActive: 1, salary: -1 });
    console.log('Compound Index on (isActive, salary) created.');

    // Atomic Push to Array & Salary Update
    await staffCol.updateOne(
      { staffNumber: 'GTEC-101' },
      {
        $push: { certifications: { certCode: 'KUBERNETES', year: 2026, status: 'Completed' } },
        $set: { salary: 70000 }
      }
    );
    console.log("Updated GTEC-101's salary to 70000 and appended new certification record.");

  } catch (error) {
    console.error('Execution Error:', error);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed.');
  }
}

main();