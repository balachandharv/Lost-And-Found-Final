
const db = require('../db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    console.log('🚀 Updating dummy users (23it001 - 23it030)...');
    
    const protectedNames = ['hariharan', 'krishna', 'saravana'];
    const adminRoll = '23it008';
    
    try {
        for (let i = 1; i <= 30; i++) {
            const rollNo = `23it${i.toString().padStart(3, '0')}`;
            const email = `${rollNo}@psr.edu.in`;
            const password = rollNo;
            
            // Skip Admin
            if (rollNo === adminRoll) {
                console.log(`⏩ Skipping admin: ${rollNo}`);
                continue;
            }
            
            const existingUser = await db.getOne('users', 'email', email);
            
            // Logic: Skip if name contains protected terms
            if (existingUser && protectedNames.some(name => existingUser.name.toLowerCase().includes(name.toLowerCase()))) {
                console.log(`🛡️ Skipping protected registered user: ${existingUser.name} (${email})`);
                continue;
            }

            // Always hash for dummy users
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            if (existingUser) {
                // Update existing dummy user
                await db.update('users', 'id', existingUser.id, {
                    password: hashedPassword,
                    name: existingUser.name || rollNo.toUpperCase()
                });
                console.log(`✅ Updated: ${email}`);
            } else {
                // Create new dummy user
                const userId = `U${Date.now()}${i}`;
                await db.insert('users', {
                    id: userId,
                    name: rollNo.toUpperCase(),
                    email: email,
                    password: hashedPassword,
                    role: 'Student',
                    status: 'Active',
                    createdAt: new Date()
                });
                console.log(`➕ Created: ${email}`);
            }
        }
        
        // Detailed Show
        const users = await db.getAll('users');
        console.log('\n📊 DATABASE USER LIST:');
        console.log(''.padEnd(65, '-'));
        console.log(`${'Name'.padEnd(20)} | ${'Email'.padEnd(30)} | Role`);
        console.log(''.padEnd(65, '-'));
        users.sort((a,b) => a.email.localeCompare(b.email)).forEach(u => {
            console.log(`${u.name.padEnd(20)} | ${u.email.padEnd(30)} | ${u.role}`);
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

seedUsers();
