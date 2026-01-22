import prisma from '../../prisma/client.js';
import bcrypt from 'bcrypt';
import {signJwt} from '../utils/jwt.js';

const SALT_ROUNDS = 10;
const SESSION_DURATION_HOURS = 1;

const authService = {
    async login({email, password}) {
        const user = await prisma.user.findUnique({ where: {email}});
        if (!user) throw new Error('Invalid credentials');

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error('Invalid credentials');

        const token = signJwt({
            sub: user.id,
            role: user.role,
            email: user.email
        })

        return token;
    },
}

export default authService;