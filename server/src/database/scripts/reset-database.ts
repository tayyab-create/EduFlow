import { AppDataSource } from '../data-source';

async function resetDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        await AppDataSource.initialize();

        console.log('🗑️  Dropping all tables...');
        await AppDataSource.dropDatabase();

        console.log('📦 Recreating database schema...');
        await AppDataSource.synchronize();

        console.log('✅ Database reset completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. The DatabaseSeeder will automatically create the Super Admin user');
        console.log('3. Use the testing UI to login and create organizations/users');

        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
}

resetDatabase();
