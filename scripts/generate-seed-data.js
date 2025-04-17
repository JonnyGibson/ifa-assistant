const firstNames = [
    'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'
];

const lastNames = [
    'Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright',
    'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke'
];

const cities = [
    { name: 'London', postcodePrefix: 'SW' },
    { name: 'Manchester', postcodePrefix: 'M' },
    { name: 'Birmingham', postcodePrefix: 'B' },
    { name: 'Leeds', postcodePrefix: 'LS' },
    { name: 'Glasgow', postcodePrefix: 'G' },
    { name: 'Liverpool', postcodePrefix: 'L' },
    { name: 'Bristol', postcodePrefix: 'BS' },
    { name: 'Edinburgh', postcodePrefix: 'EH' },
    { name: 'Cardiff', postcodePrefix: 'CF' },
    { name: 'Belfast', postcodePrefix: 'BT' }
];

const streets = [
    'High Street', 'Main Street', 'Park Lane', 'Church Road', 'Station Road', 'Victoria Road',
    'Green Lane', 'New Road', 'Mill Lane', 'Church Street', 'The Avenue', 'The Crescent',
    'Queens Road', 'Kings Road', 'School Lane', 'Bridge Street', 'George Street', 'Market Street'
];

function generateRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateRandomPhone() {
    return `+44 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`;
}

function generateRandomPostcode(city) {
    const number = Math.floor(Math.random() * 99) + 1;
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${city.postcodePrefix}${number} ${number}${letter}${letter}`;
}

function generateGuidPrefix() {
    return Math.random().toString(36).substring(2, 5);
}

function generateClients(count) {
    const clients = [];
    const riskProfiles = ['low', 'medium', 'high'];
    const statuses = ['active', 'inactive', 'prospect'];

    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const streetNumber = Math.floor(Math.random() * 200) + 1;
        const street = streets[Math.floor(Math.random() * streets.length)];
        const guidPrefix = generateGuidPrefix();

        const client = {
            first_name: firstName,
            last_name: lastName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${guidPrefix}@example.com`,
            phone: generateRandomPhone(),
            address: {
                street: `${streetNumber} ${street}`,
                city: city.name,
                postcode: generateRandomPostcode(city),
                country: 'UK'
            },
            date_of_birth: generateRandomDate(new Date(1940, 0, 1), new Date(2000, 0, 1)).toISOString().split('T')[0],
            risk_profile: riskProfiles[Math.floor(Math.random() * riskProfiles.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)]
        };

        clients.push(client);
    }

    return clients;
}

// Generate SQL insert statements
function generateSQLInserts(clients) {
    const inserts = clients.map(client => {
        return `INSERT INTO clients (first_name, last_name, email, phone, address, date_of_birth, risk_profile, status)
VALUES (
    '${client.first_name}',
    '${client.last_name}',
    '${client.email}',
    '${client.phone}',
    '${JSON.stringify(client.address)}',
    '${client.date_of_birth}',
    '${client.risk_profile}',
    '${client.status}'
);`;
    });

    return inserts.join('\n');
}

// Generate 50 clients
const clients = generateClients(50);
const sqlInserts = generateSQLInserts(clients);

console.log(sqlInserts); 