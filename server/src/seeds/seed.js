require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');
const Category = require('../models/Category');
const Complaint = require('../models/Complaint');
const ComplaintUpdate = require('../models/ComplaintUpdate');

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civiclens';
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing records
    await User.deleteMany({});
    await Department.deleteMany({});
    await Category.deleteMany({});
    await Complaint.deleteMany({});
    await ComplaintUpdate.deleteMany({});
    console.log('[Seed] Cleared existing collections');

    // 1. Create Departments
    const departments = await Department.insertMany([
      {
        name: 'Roads & Infrastructure',
        code: 'RND',
        description: 'Maintenance of arterial roadways, potholes, flyovers and asphalt resurfacing.',
        supportedCategories: ['Potholes & Damaged Roads'],
        contactEmail: 'roads@civiclens.gov.in',
        contactPhone: '+91-11-23456701'
      },
      {
        name: 'Sanitation & Solid Waste Management',
        code: 'SSW',
        description: 'Municipal garbage disposal, dustbin clearances, street sweeping and dumping prevention.',
        supportedCategories: ['Garbage Accumulation & Sanitation'],
        contactEmail: 'sanitation@civiclens.gov.in',
        contactPhone: '+91-11-23456702'
      },
      {
        name: 'Drainage & Sewerage Board',
        code: 'DSB',
        description: 'Stormwater drains, unclogging open drains, desilting and waterlogging prevention.',
        supportedCategories: ['Blocked Drainage & Waterlogging'],
        contactEmail: 'drainage@civiclens.gov.in',
        contactPhone: '+91-11-23456703'
      },
      {
        name: 'Electrical & Street Lighting',
        code: 'ESL',
        description: 'Public illumination, solar streetlights, electrical pole safety and timer maintenance.',
        supportedCategories: ['Broken Streetlights & Electrical'],
        contactEmail: 'lighting@civiclens.gov.in',
        contactPhone: '+91-11-23456704'
      },
      {
        name: 'Water Supply & Pipeline Division',
        code: 'WSD',
        description: 'Potable water pipelines, main distribution repair, pipeline bursts and valve control.',
        supportedCategories: ['Water Leakage & Pipeline Issues'],
        contactEmail: 'water@civiclens.gov.in',
        contactPhone: '+91-11-23456705'
      },
      {
        name: 'Public Works & Footpath Maintenance',
        code: 'PWM',
        description: 'Pedestrian footpaths, zebra crossings, divider kerb stones and public walkways.',
        supportedCategories: ['Damaged Footpaths & Public Infrastructure'],
        contactEmail: 'publicworks@civiclens.gov.in',
        contactPhone: '+91-11-23456706'
      }
    ]);
    console.log(`[Seed] Created ${departments.length} departments`);

    const deptMap = {};
    departments.forEach(d => { deptMap[d.code] = d._id; });

    // 2. Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Potholes & Damaged Roads',
        code: 'POTHOLE',
        description: 'Cratered roads, asphalt breakage, sinkholes and dangerous road fissures.',
        defaultDepartmentId: deptMap['RND'],
        defaultPriority: 'High',
        severityBaseScore: 8
      },
      {
        name: 'Garbage Accumulation & Sanitation',
        code: 'GARBAGE',
        description: 'Overflowing public bins, illegal open dumping and uncollected organic waste.',
        defaultDepartmentId: deptMap['SSW'],
        defaultPriority: 'Medium',
        severityBaseScore: 6
      },
      {
        name: 'Blocked Drainage & Waterlogging',
        code: 'DRAINAGE',
        description: 'Clogged roadside gutters, overflow of sewage onto roads and monsoon water stagnation.',
        defaultDepartmentId: deptMap['DSB'],
        defaultPriority: 'High',
        severityBaseScore: 8
      },
      {
        name: 'Broken Streetlights & Electrical',
        code: 'LIGHTING',
        description: 'Non-functional lamps, dangling electrical wires and dark road stretches causing safety risks.',
        defaultDepartmentId: deptMap['ESL'],
        defaultPriority: 'Medium',
        severityBaseScore: 7
      },
      {
        name: 'Water Leakage & Pipeline Issues',
        code: 'WATER',
        description: 'Freshwater pipeline leaks, valve bursts and pressure loss in municipal supply line.',
        defaultDepartmentId: deptMap['WSD'],
        defaultPriority: 'High',
        severityBaseScore: 7
      },
      {
        name: 'Damaged Footpaths & Public Infrastructure',
        code: 'FOOTPATH',
        description: 'Broken pedestrian pavers, missing inspection covers on walkways and barrier damage.',
        defaultDepartmentId: deptMap['PWM'],
        defaultPriority: 'Low',
        severityBaseScore: 5
      }
    ]);
    console.log(`[Seed] Created ${categories.length} categories`);

    // 3. Create Users
    const adminPass = await User.hashPassword('Admin@123');
    const staffPass = await User.hashPassword('Staff@123');
    const citizenPass = await User.hashPassword('Citizen@123');

    const adminUser = await User.create({
      name: 'Rajesh Verma (Chief Admin)',
      email: 'admin@civiclens.gov.in',
      passwordHash: adminPass,
      role: 'admin',
      designation: 'Municipal Executive Officer',
      phone: '+91-9811001122'
    });

    const roadsStaff = await User.create({
      name: 'Vikram Singh (Assistant Engineer)',
      email: 'officer.roads@civiclens.gov.in',
      passwordHash: staffPass,
      role: 'authority',
      departmentId: deptMap['RND'],
      designation: 'Executive Engineer - PWD Roads',
      phone: '+91-9811223344'
    });

    const sanitationStaff = await User.create({
      name: 'Sunita Mehra (Sanitation Inspector)',
      email: 'officer.sanitation@civiclens.gov.in',
      passwordHash: staffPass,
      role: 'authority',
      departmentId: deptMap['SSW'],
      designation: 'Chief Sanitary Inspector',
      phone: '+91-9811334455'
    });

    const waterStaff = await User.create({
      name: 'Anil Kumar (Water Board Officer)',
      email: 'officer.water@civiclens.gov.in',
      passwordHash: staffPass,
      role: 'authority',
      departmentId: deptMap['WSD'],
      designation: 'Zonal Water Maintenance Lead',
      phone: '+91-9811445566'
    });

    const citizen1 = await User.create({
      name: 'Aarav Sharma',
      email: 'citizen@example.com',
      passwordHash: citizenPass,
      role: 'citizen',
      phone: '+91-9922001144'
    });

    const citizen2 = await User.create({
      name: 'Priya Mukherjee',
      email: 'priya.sharma@example.com',
      passwordHash: citizenPass,
      role: 'citizen',
      phone: '+91-9933112255'
    });

    console.log('[Seed] Created default users: Admin, Staff, and Citizens');

    // 4. Create Complaints with Delhi NCR coordinates
    const complaintsSeed = [
      {
        complaintId: 'CIV-2026-0001',
        title: 'Deep crater pothole near Connaught Place Outer Circle',
        description: 'Large and dangerous pothole measuring roughly 3 feet across. Vehicles are swerving abruptly causing severe traffic bottlenecks and near accidents during rush hours.',
        category: 'Potholes & Damaged Roads',
        location: {
          type: 'Point',
          coordinates: [77.2185, 28.6328], // [lng, lat]
          address: 'Outer Circle, Near Block G, Connaught Place',
          landmark: 'Opposite Plaza Cinema',
          city: 'New Delhi',
          pincode: '110001'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['RND'],
        assignedTo: roadsStaff._id,
        status: 'In Progress',
        priority: 'High',
        priorityScore: 85,
        priorityReason: 'High traffic junction with repeated near-miss reports',
        aiCategory: 'Potholes & Damaged Roads',
        aiConfidence: 0.94,
        aiSuggestedDepartment: 'Roads & Infrastructure',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0002',
        title: 'Severe road surface breakage on Janpath Road',
        description: 'Tar has completely peeled off due to water stagnation. Two-wheelers are slipping repeatedly on loose gravel.',
        category: 'Potholes & Damaged Roads',
        location: {
          type: 'Point',
          coordinates: [77.2198, 28.6295],
          address: 'Janpath Road, Near Tibetan Market',
          landmark: 'Near Tolstoy Marg Crossing',
          city: 'New Delhi',
          pincode: '110001'
        },
        citizenId: citizen2._id,
        departmentId: deptMap['RND'],
        assignedTo: roadsStaff._id,
        status: 'Assigned',
        priority: 'High',
        priorityScore: 78,
        priorityReason: 'Heavy pedestrian and commuter corridor',
        aiCategory: 'Potholes & Damaged Roads',
        aiConfidence: 0.91,
        aiSuggestedDepartment: 'Roads & Infrastructure',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0003',
        title: 'Overflowing commercial dustbins on Barakhamba Road',
        description: 'Three large green municipal bins are overflowing with food waste and packaging. Stray animals are scattering trash across the sidewalk causing foul odor.',
        category: 'Garbage Accumulation & Sanitation',
        location: {
          type: 'Point',
          coordinates: [77.2255, 28.6310],
          address: 'Barakhamba Road, Near Metro Gate 2',
          landmark: 'Near Gopal Das Bhawan',
          city: 'New Delhi',
          pincode: '110001'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['SSW'],
        assignedTo: sanitationStaff._id,
        status: 'Under Review',
        priority: 'Medium',
        priorityScore: 62,
        priorityReason: 'Commercial area sanitation hazard',
        aiCategory: 'Garbage Accumulation & Sanitation',
        aiConfidence: 0.95,
        aiSuggestedDepartment: 'Sanitation & Solid Waste Management',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0004',
        title: 'Main water distribution pipe leaking continuously',
        description: 'High pressure drinking water pipe burst under the pavement. Potable water is flooding the street for the past 24 hours while pressure in adjacent residential quarters has dropped.',
        category: 'Water Leakage & Pipeline Issues',
        location: {
          type: 'Point',
          coordinates: [77.2050, 28.6480],
          address: 'Ajmal Khan Road, Karol Bagh',
          landmark: 'Near Metro Station Pillar 104',
          city: 'New Delhi',
          pincode: '110005'
        },
        citizenId: citizen2._id,
        departmentId: deptMap['WSD'],
        assignedTo: waterStaff._id,
        status: 'In Progress',
        priority: 'High',
        priorityScore: 88,
        priorityReason: 'Clean drinking water wastage and localized flooding',
        aiCategory: 'Water Leakage & Pipeline Issues',
        aiConfidence: 0.96,
        aiSuggestedDepartment: 'Water Supply & Pipeline Division',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0005',
        title: 'Complete block of storm drainage causing road waterlogging',
        description: 'The stormwater drain on Pusa Road is blocked with plastic debris and construction dust. Even mild rainfall leaves 1.5 feet of stagnant dirty water.',
        category: 'Blocked Drainage & Waterlogging',
        location: {
          type: 'Point',
          coordinates: [77.1985, 28.6420],
          address: 'Pusa Road, Near Karol Bagh Market',
          landmark: 'Opposite Sir Ganga Ram Hospital Gate 3',
          city: 'New Delhi',
          pincode: '110060'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['DSB'],
        status: 'Submitted',
        priority: 'High',
        priorityScore: 80,
        priorityReason: 'Proximity to major hospital entrance',
        aiCategory: 'Blocked Drainage & Waterlogging',
        aiConfidence: 0.92,
        aiSuggestedDepartment: 'Drainage & Sewerage Board',
        createdAt: new Date(Date.now() - 12 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0006',
        title: 'Streetlights out on residential stretch for 4 consecutive nights',
        description: 'A cluster of 6 LED streetlights along the park perimeter are dead. The road is pitch dark creating safety hazards for female commuters and elderly walkers.',
        category: 'Broken Streetlights & Electrical',
        location: {
          type: 'Point',
          coordinates: [77.2430, 28.5700],
          address: 'Block C, Central Market Road, Lajpat Nagar II',
          landmark: 'Near Community Center Park',
          city: 'New Delhi',
          pincode: '110024'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['ESL'],
        status: 'Resolved',
        priority: 'Medium',
        priorityScore: 65,
        priorityReason: 'Neighborhood safety concern at night',
        aiCategory: 'Broken Streetlights & Electrical',
        aiConfidence: 0.94,
        aiSuggestedDepartment: 'Electrical & Street Lighting',
        resolutionEvidence: {
          imageUrl: null,
          comment: 'Faulty MCB switch and loose wiring in feeder pillar replaced. All 6 lights illuminated and verified.',
          resolvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          resolvedBy: adminUser._id
        },
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0007',
        title: 'Broken interlocking footpath tiles with exposed iron rebar',
        description: 'Pedestrian pavement has caved in and multiple tiles are shattered. An elderly citizen tripped yesterday.',
        category: 'Damaged Footpaths & Public Infrastructure',
        location: {
          type: 'Point',
          coordinates: [77.2410, 28.5680],
          address: 'Feroze Gandhi Road, Lajpat Nagar III',
          landmark: 'Near National Heart Institute',
          city: 'New Delhi',
          pincode: '110024'
        },
        citizenId: citizen2._id,
        departmentId: deptMap['PWM'],
        status: 'Assigned',
        priority: 'Low',
        priorityScore: 40,
        priorityReason: 'Footpath damage on secondary road',
        aiCategory: 'Damaged Footpaths & Public Infrastructure',
        aiConfidence: 0.89,
        aiSuggestedDepartment: 'Public Works & Footpath Maintenance',
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0008',
        title: 'Illegal garbage dumping on open plot near school',
        description: 'Huge mountain of unsegregated municipal and commercial garbage being dumped daily. Stench is unbearable and creating health risks for students.',
        category: 'Garbage Accumulation & Sanitation',
        location: {
          type: 'Point',
          coordinates: [77.1220, 28.7150],
          address: 'Sector 8, Near Sarvodaya Vidyalaya, Rohini',
          landmark: 'Opposite Pocket C-9 Gate',
          city: 'New Delhi',
          pincode: '110085'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['SSW'],
        assignedTo: sanitationStaff._id,
        status: 'In Progress',
        priority: 'High',
        priorityScore: 82,
        priorityReason: 'Health hazard in direct vicinity of educational institution',
        aiCategory: 'Garbage Accumulation & Sanitation',
        aiConfidence: 0.97,
        aiSuggestedDepartment: 'Sanitation & Solid Waste Management',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0009',
        title: 'Open sewer manhole without cover on Rohini main road',
        description: 'Cover is completely missing and unbarricaded. Extreme safety danger for cars, bicycles and pedestrians.',
        category: 'Blocked Drainage & Waterlogging',
        location: {
          type: 'Point',
          coordinates: [77.1245, 28.7135],
          address: 'Outer Ring Road, Sector 8 Crossing, Rohini',
          landmark: 'Near Rohini West Metro Station',
          city: 'New Delhi',
          pincode: '110085'
        },
        citizenId: citizen2._id,
        departmentId: deptMap['DSB'],
        status: 'Under Review',
        priority: 'High',
        priorityScore: 92,
        priorityReason: 'Critical physical hazard: open manhole on active traffic road',
        aiCategory: 'Blocked Drainage & Waterlogging',
        aiConfidence: 0.93,
        aiSuggestedDepartment: 'Drainage & Sewerage Board',
        createdAt: new Date(Date.now() - 18 * 3600 * 1000)
      },
      {
        complaintId: 'CIV-2026-0010',
        title: 'Severe pipeline leak causing water pressure collapse',
        description: 'Clean drinking water is bubbling up from road joints. Colony residents have not received tap water for 2 days.',
        category: 'Water Leakage & Pipeline Issues',
        location: {
          type: 'Point',
          coordinates: [77.2065, 28.5280],
          address: 'Press Enclave Road, Saket',
          landmark: 'Near Max Hospital Red Light',
          city: 'New Delhi',
          pincode: '110017'
        },
        citizenId: citizen1._id,
        departmentId: deptMap['WSD'],
        assignedTo: waterStaff._id,
        status: 'Resolved',
        priority: 'High',
        priorityScore: 84,
        priorityReason: 'Drinking water distribution failure affecting colony',
        aiCategory: 'Water Leakage & Pipeline Issues',
        aiConfidence: 0.95,
        aiSuggestedDepartment: 'Water Supply & Pipeline Division',
        resolutionEvidence: {
          imageUrl: null,
          comment: 'Cracked 8-inch cast iron pipe excavated, clamped and reinforced. Full pressure restored to residential feeder line.',
          resolvedAt: new Date(Date.now() - 12 * 3600 * 1000),
          resolvedBy: waterStaff._id
        },
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000)
      }
    ];

    for (const cData of complaintsSeed) {
      const comp = await Complaint.create(cData);

      // Create initial update
      await ComplaintUpdate.create({
        complaintId: comp._id,
        updatedBy: comp.citizenId,
        previousStatus: 'None',
        newStatus: 'Submitted',
        comment: 'Complaint logged in CivicLens municipal portal.'
      });

      if (comp.status !== 'Submitted') {
        await ComplaintUpdate.create({
          complaintId: comp._id,
          updatedBy: comp.assignedTo || adminUser._id,
          previousStatus: 'Submitted',
          newStatus: comp.status,
          comment: comp.status === 'Resolved'
            ? 'Issue verified and repaired on site by municipal maintenance team.'
            : `Assigned to ${departments.find(d => d._id.equals(comp.departmentId))?.name || 'department'} field crew.`
        });
      }
    }

    console.log(`[Seed] Seeded ${complaintsSeed.length} realistic complaints with geospatial coordinates and timeline records!`);
    console.log('[Seed] Demo Credentials:');
    console.log('   Admin:      admin@civiclens.gov.in / Admin@123');
    console.log('   Roads:      officer.roads@civiclens.gov.in / Staff@123');
    console.log('   Sanitation: officer.sanitation@civiclens.gov.in / Staff@123');
    console.log('   Citizen:    citizen@example.com / Citizen@123');

    await mongoose.disconnect();
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
