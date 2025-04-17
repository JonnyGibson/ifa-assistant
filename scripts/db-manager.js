const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    supabaseUrl: 'http://127.0.0.1:54321',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
    testUsers: [
        { email: 'user1@example.com', password: 'admin123' },
        { email: 'user2@example.com', password: 'admin123' },
        { email: 'user3@example.com', password: 'admin123' },
        { email: 'user4@example.com', password: 'admin123' },
        { email: 'user5@example.com', password: 'admin123' }
    ]
};

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

// Database management functions
async function resetDatabase() {
    console.log('Resetting database...');
    try {
        // Use Supabase CLI to reset the database
        execSync('supabase db reset', { stdio: 'inherit' });
        console.log('✅ Database reset complete');
    } catch (error) {
        console.error('❌ Error resetting database:', error.message);
        process.exit(1);
    }
}

async function runMigrations() {
    console.log('Running migrations...');
    try {
        // Use Supabase CLI to run migrations
        execSync('supabase db reset', { stdio: 'inherit' });
        console.log('✅ Migrations completed');
    } catch (error) {
        console.error('❌ Error running migrations:', error.message);
        process.exit(1);
    }
}

async function clearAllData() {
    console.log('Clearing all data...');
    try {
        // Clear all tables in the correct order to respect foreign key constraints
        const tables = [
            'documents',
            'client_notes',
            'appointments',
            'clients'
        ];

        for (const table of tables) {
            const { error } = await supabase
                .from(table)
                .delete()
                .not('id', 'is', null); // Delete all records
            if (error) throw error;
            console.log(`✅ Cleared ${table} table`);
        }
        console.log('✅ All data cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing data:', error.message);
        process.exit(1);
    }
}

async function seedDatabase() {
    console.log('Seeding database...');
    try {
        // Generate seed data
        console.log('Generating seed data...');
        
        // Helper function to generate random date within range
        const randomDate = (start, end) => {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        };

        // Helper function to generate random phone number
        const randomPhone = () => {
            return `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
        };

        // Generate 50 clients with realistic data
        const clients = [];
        const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Jennifer', 'William', 'Elizabeth'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        
        for (let i = 0; i < 50; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
            
            // Generate random last contact date (some within 90 days, some older)
            const lastContactDate = randomDate(
                new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
                new Date() // today
            );
            
            // Determine status based on last contact
            const status = lastContactDate > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) 
                ? 'active' 
                : Math.random() > 0.3 ? 'inactive' : 'prospect';
            
            // Generate risk profile
            const riskProfiles = ['low', 'medium', 'high'];
            const riskProfile = riskProfiles[Math.floor(Math.random() * riskProfiles.length)];
            
            clients.push({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: randomPhone(),
                date_of_birth: randomDate(new Date(1950, 0, 1), new Date(2000, 0, 1)).toISOString().split('T')[0],
                risk_profile: riskProfile,
                status: status,
                address: {
                    street: `${Math.floor(Math.random() * 9999) + 1} Main St`,
                    city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)],
                    state: ['NY', 'CA', 'IL', 'TX', 'AZ'][Math.floor(Math.random() * 5)],
                    zip: Math.floor(Math.random() * 90000) + 10000
                }
            });
        }

        // Insert clients in batches of 10
        for (let i = 0; i < clients.length; i += 10) {
            const batch = clients.slice(i, i + 10);
            const { error } = await supabase
                .from('clients')
                .insert(batch);
            if (error) throw error;
        }

        // Create appointments for active clients
        const { data: activeClients } = await supabase
            .from('clients')
            .select('id')
            .eq('status', 'active');

        if (activeClients && activeClients.length > 0) {
            const appointmentTypes = [
                { title: 'Portfolio Review', duration: 60 },
                { title: 'Investment Strategy', duration: 45 },
                { title: 'Retirement Planning', duration: 90 },
                { title: 'Tax Planning', duration: 60 },
                { title: 'Risk Assessment', duration: 45 }
            ];

            const appointments = [];
            for (const client of activeClients) {
                // Create 1-3 appointments for each active client
                const numAppointments = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < numAppointments; i++) {
                    const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
                    const startTime = randomDate(
                        new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                    );
                    
                    appointments.push({
                        client_id: client.id,
                        title: type.title,
                        description: `${type.title} meeting to discuss financial goals and strategies`,
                        start_time: startTime.toISOString(),
                        end_time: new Date(startTime.getTime() + type.duration * 60 * 1000).toISOString(),
                        status: 'scheduled'
                    });
                }
            }

            // Insert appointments in batches of 10
            for (let i = 0; i < appointments.length; i += 10) {
                const batch = appointments.slice(i, i + 10);
                const { error } = await supabase
                    .from('appointments')
                    .insert(batch);
                if (error) throw error;
            }
        }

        // Create client notes for activity feed
        const { data: allClients } = await supabase
            .from('clients')
            .select('id');

        if (allClients && allClients.length > 0) {
            const noteTypes = ['meeting', 'call', 'email', 'review', 'urgent', 'research'];
            const noteTemplates = [
                'Discussed investment strategy and risk tolerance',
                'Reviewed portfolio performance and rebalancing needs',
                'Updated client on market conditions and opportunities',
                'Completed annual review and financial planning',
                'Addressed client concerns about market volatility',
                'Prepared retirement income projections',
                'Updated beneficiary information',
                'Reviewed insurance coverage needs',
                'Discussed tax planning strategies',
                'Prepared for upcoming compliance review'
            ];

            const notes = [];
            for (const client of allClients) {
                // Create 2-5 notes for each client
                const numNotes = Math.floor(Math.random() * 4) + 2;
                for (let i = 0; i < numNotes; i++) {
                    const noteDate = randomDate(
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                        new Date() // today
                    );
                    
                    notes.push({
                        client_id: client.id,
                        title: noteTemplates[Math.floor(Math.random() * noteTemplates.length)],
                        content: noteTemplates[Math.floor(Math.random() * noteTemplates.length)],
                        note_type: noteTypes[Math.floor(Math.random() * noteTypes.length)],
                        created_at: noteDate.toISOString()
                    });
                }
            }

            // Insert notes in batches of 10
            for (let i = 0; i < notes.length; i += 10) {
                const batch = notes.slice(i, i + 10);
                const { error } = await supabase
                    .from('client_notes')
                    .insert(batch);
                if (error) throw error;
            }
        }
        
        console.log('✅ Database seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
}

// User management functions
async function deleteAllUsers() {
    console.log('Deleting all users...');
    try {
        const { data: users, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        if (users && users.length > 0) {
            for (const user of users) {
                await supabase.auth.admin.deleteUser(user.id);
                console.log(`Deleted user: ${user.email}`);
            }
        }
        console.log('✅ All users deleted');
    } catch (error) {
        console.error('❌ Error deleting users:', error.message);
        process.exit(1);
    }
}

async function createTestUsers() {
    console.log('Creating test users...');
    try {
        for (const user of config.testUsers) {
            const { error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true
            });
            if (error) throw error;
            console.log(`Created user: ${user.email}`);
        }
        console.log('✅ All test users created');
    } catch (error) {
        console.error('❌ Error creating users:', error.message);
        process.exit(1);
    }
}

// Main function to run all tasks
async function resetAndSeed() {
    console.log('🚀 Starting database reset and seed process...');
    try {
        // Step 1: Reset database and run migrations
        await resetDatabase();
        
        // Step 2: Clear any existing data
        await clearAllData();
        
        // Step 3: Seed new data
        await seedDatabase();
        
        // Step 4: Reset users
        await deleteAllUsers();
        await createTestUsers();
        
        console.log('✨ Database reset and seeding complete!');
    } catch (error) {
        console.error('❌ Error in reset and seed process:', error.message);
        process.exit(1);
    }
}

async function resetDatabaseAndSeed() {
    console.log('🚀 Starting database reset and seed process...');
    try {
        // Step 1: Reset database and run migrations
        await resetDatabase();
        
        // Step 2: Clear any existing data
        await clearAllData();
        
        // Step 3: Seed new data
        await seedDatabase();
        
        console.log('✨ Database reset and seeding complete!');
    } catch (error) {
        console.error('❌ Error in reset and seed process:', error.message);
        process.exit(1);
    }
}

// Export functions for npm scripts
module.exports = {
    resetAndSeed,
    resetDatabaseAndSeed,
    resetDatabase,
    runMigrations,
    seedDatabase,
    deleteAllUsers,
    createTestUsers,
    clearAllData
};

// Run if called directly
if (require.main === module) {
    const command = process.argv[2];
    switch (command) {
        case 'reset':
            resetAndSeed();
            break;
        case 'reset-db':
            resetDatabaseAndSeed();
            break;
        case 'migrate':
            runMigrations();
            break;
        case 'seed':
            seedDatabase();
            break;
        case 'users:reset':
            deleteAllUsers().then(createTestUsers);
            break;
        case 'clear':
            clearAllData();
            break;
        default:
            console.log('Available commands:');
            console.log('  reset     - Reset database, run migrations, seed data, and reset users');
            console.log('  reset-db  - Reset database, run migrations, and seed data only (no user reset)');
            console.log('  migrate   - Run migrations only');
            console.log('  seed      - Seed the database with data');
            console.log('  users:reset - Reset users only');
            console.log('  clear     - Clear all data from tables');
            process.exit(1);
    }
} 