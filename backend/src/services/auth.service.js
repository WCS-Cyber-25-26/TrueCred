import prisma from '../../prisma/client.js';
import { generateSessionToken, hashSessionToken } from '../utils/token.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const SESSION_DURATION_HOURS = 1;

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

    async login({ email, password }) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error('Invalid credentials');

        const rawToken = generateSessionToken();
        const hashedToken = hashSessionToken(rawToken);
        const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

        await prisma.session.create({
            data: {
                token: hashedToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            message: 'Login successful',
            token: rawToken,
            expiresAt,
        };
    },

    async logout(hashedToken) {
        if (!hashedToken) throw new Error('Authorization token missing');

        const result = await prisma.session.updateMany({
            where: { token: hashedToken }, // token column stores hashed value
            data: { revoked: true },
        });

        if (result.count === 0) throw new Error('Session not found');

        return { message: 'Logged out successfully' };
    },
}

export default authService;