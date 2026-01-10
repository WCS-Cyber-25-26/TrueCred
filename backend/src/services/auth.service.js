import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const authService = {
    async register(email, password) {

        //existing user check
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        //create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'UNIVERSITY',
            },
            //prevents password from being output
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        return user;
    },
    
    async login() {

    }
}

export default authService;