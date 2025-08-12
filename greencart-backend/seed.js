const Driver = require('./models/Driver');
const Route = require('./models/Route');
const Order = require('./models/Order');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const INITIAL_DATA = {
    drivers: [
        { id_num: 1, name: 'Visista', shiftHours: 6, pastWeekHours: 38, isFatigued: false },
        { id_num: 2, name: 'Teja', shiftHours: 7, pastWeekHours: 42, isFatigued: true },
        { id_num: 3, name: 'Reddy', shiftHours: 4, pastWeekHours: 30, isFatigued: false },
    ],
    routes: [
        { id_num: 101, name: 'Ahobilam Puram', distance: 15, traffic: 'Medium', baseTime: 45 },
        { id_num: 102, name: 'Shadnagar', distance: 25, traffic: 'Low', baseTime: 60 },
        { id_num: 103, name: 'Hitech City', distance: 20, traffic: 'High', baseTime: 55 },
    ],
    orders: [
        { id_num: 1001, value: 800, routeId: 101 },
        { id_num: 1002, value: 1200, routeId: 102 },
        { id_num: 1003, value: 500, routeId: 103 },
    ],
};

const seedDatabase = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('Database already seeded.');
            return;
        }
        console.log('Seeding database...');
        await Driver.deleteMany({});
        await Route.deleteMany({});
        await Order.deleteMany({});
        await User.deleteMany({});

        await Driver.insertMany(INITIAL_DATA.drivers);
        await Route.insertMany(INITIAL_DATA.routes);
        await Order.insertMany(INITIAL_DATA.orders);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Teja1234', salt);
        await User.create({
            username: 'Teja',
            password: hashedPassword,
            name: 'Visista Teja Reddy',
        });
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};

module.exports = { seedDatabase };