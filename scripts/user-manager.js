const { createClient } = require('@supabase/supabase-js');

// Configuration
const config = {
    supabaseUrl: 'http://127.0.0.1:54321',
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

// Run if called directly
if (require.main === module) {
    const command = process.argv[2];
    switch (command) {
        case 'reset':
            deleteAllUsers().then(createTestUsers);
            break;
        default:
            console.log('Available commands:');
            console.log('  reset - Delete all users and create test users');
            process.exit(1);
    }
} 