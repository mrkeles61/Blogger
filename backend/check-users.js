const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: { email: true, role: true, username: true }
        });
        console.log('Users in database:');
        console.log(JSON.stringify(users, null, 2));

        const count = await prisma.user.count();
        console.log(`\nTotal users: ${count}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
