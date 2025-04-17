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
        
        // Create some sample clients
        const clients = [
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                phone: '123-456-7890'
            },
            {
                first_name: 'Jane',
                last_name: 'Smith',
                email: 'jane.smith@example.com',
                phone: '098-765-4321'
            }
        ];

        // Insert clients
        for (const client of clients) {
            const { error } = await supabase
                .from('clients')
                .insert(client);
            if (error) throw error;
        }

        // Create some sample appointments
        const { data: insertedClients } = await supabase
            .from('clients')
            .select('id');

        if (insertedClients && insertedClients.length > 0) {
            const tomorrow = new Date(Date.now() + 86400000);
            const dayAfterTomorrow = new Date(Date.now() + 172800000);
            
            const appointments = [
                {
                    client_id: insertedClients[0].id,
                    title: 'Initial Consultation',
                    description: 'First meeting to discuss financial goals',
                    start_time: new Date(tomorrow.setHours(10, 0, 0, 0)).toISOString(),
                    end_time: new Date(tomorrow.setHours(11, 0, 0, 0)).toISOString(),
                    status: 'scheduled'
                },
                {
                    client_id: insertedClients[1].id,
                    title: 'Portfolio Review',
                    description: 'Quarterly portfolio review and rebalancing',
                    start_time: new Date(dayAfterTomorrow.setHours(14, 0, 0, 0)).toISOString(),
                    end_time: new Date(dayAfterTomorrow.setHours(15, 0, 0, 0)).toISOString(),
                    status: 'scheduled'
                }
            ];

            // Insert appointments
            for (const appointment of appointments) {
                const { error } = await supabase
                    .from('appointments')
                    .insert(appointment);
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