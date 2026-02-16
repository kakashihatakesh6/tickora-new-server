import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User';
import dotenv from 'dotenv';
import { Op } from 'sequelize';

import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Serialize user for the session
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: number, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Debug logs removed

// Google Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            scope: ['profile', 'email']
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log('Using Google Callback URL:', process.env.GOOGLE_CALLBACK_URL);
            try {
                const email = profile.emails?.[0]?.value;
                const googleId = profile.id;
                const name = profile.displayName || 'Google User';
                const profilePicture = profile.photos?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found directly from Google'), undefined);
                }

                // Check if user exists by googleId
                let user = await User.findOne({ where: { googleId } });

                if (user) {
                    // Update profile picture if it changed or was missing
                    if (profilePicture && user.profilePicture !== profilePicture) {
                        user.profilePicture = profilePicture;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Check if user exists by email
                user = await User.findOne({ where: { email } });

                if (user) {
                    // Link googleId to existing user
                    user.googleId = googleId;
                    if (profilePicture && !user.profilePicture) {
                        user.profilePicture = profilePicture;
                    }
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name,
                    email,
                    googleId,
                    role: 'user',
                    password: '',
                    profilePicture
                } as any);

                return done(null, user);
            } catch (err) {
                return done(err, undefined);
            }
        }
    )
);

// GitHub Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
            callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/auth/github/callback',
            scope: ['user:email']
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            console.log('Using GitHub Callback URL:', process.env.GITHUB_CALLBACK_URL);
            try {
                const githubId = profile.id;
                const name = profile.displayName || profile.username || 'GitHub User';
                let email = profile.emails?.[0]?.value;
                const profilePicture = profile.photos?.[0]?.value;

                if (!email) {
                    // Sometimes GitHub doesn't return email in profile if it's private.
                    // In a real app we might fetch it from their API.
                    // For now, fail if no email.
                    return done(new Error('No email found from GitHub'), undefined);
                }

                // Check if user exists by githubId
                let user = await User.findOne({ where: { githubId } });

                if (user) {
                    // Update profile picture if it changed
                    if (profilePicture && user.profilePicture !== profilePicture) {
                        user.profilePicture = profilePicture;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Check if user exists by email
                user = await User.findOne({ where: { email } });

                if (user) {
                    // Link githubId to existing user
                    user.githubId = githubId;
                    if (profilePicture && !user.profilePicture) {
                        user.profilePicture = profilePicture;
                    }
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name,
                    email,
                    githubId,
                    role: 'user',
                    password: '',
                    profilePicture
                } as any);

                return done(null, user);

            } catch (err) {
                return done(err, undefined);
            }
        }
    )
);

export default passport;
