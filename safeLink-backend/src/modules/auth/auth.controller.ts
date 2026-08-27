

import { Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from './auth.model.js';

export const register = async (req: Request, res: Response) =>{
    try{
        const { name, email, password, role} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: 'Email already in use.'});
        }
         
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'user'
        });
        res.status(201).json({message: 'User registered successfully.', userID: newUser._id});
    } catch (error) {
        res.status(500).json({message: 'Registration failed', error});
    }
};
export const login = async (req: Request, res: Response) =>{
    try{
        const { email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid email or password.'}); 
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid email or password.'});
        }
        const token = jwt.sign(
            {userId: user._id, role: user.role},
            process.env.JWT_SECRET || 'fallback_secret',
            {expiresIn: '7d'}
        );

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }catch (error) {
        res.status(500).json({message: 'Login failed', error});
    }
};
        