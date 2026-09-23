import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({ error: 'No credential or access token provided' });
    }

    let googleId: string;
    let email: string;
    let name: string | undefined;
    let picture: string | undefined;

    if (credential) {
      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ error: 'Invalid Google token' });
      }

      googleId = payload.sub;
      email = payload.email || '';
      name = payload.name;
      picture = payload.picture;
    } else {
      // Verify via Google userinfo endpoint using accessToken
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userInfoRes.ok) {
        return res.status(400).json({ error: 'Invalid Google access token' });
      }

      const payload = await userInfoRes.json();
      googleId = payload.sub;
      email = payload.email || '';
      name = payload.name;
      picture = payload.picture;
    }

    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email or Google ID not found in token' });
    }

    // Find user by googleId or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }]
    });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId,
        email,
        displayName: name || 'User',
        avatarUrl: picture,
      });
    } else {
      // Update googleId and avatar if missing
      let updated = false;
      if (user.googleId !== googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        updated = true;
      }
      if (name && user.displayName !== name) {
        user.displayName = name;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Send back the user data
    res.json({
      _id: user._id,
      displayName: user.displayName,
      username: user.username, // Might be undefined/null for new users
      email: user.email,
      avatarUrl: user.avatarUrl,
      coins: user.coins,
      totalGames: user.totalGames,
      totalWins: user.totalWins,
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to set username after first login
router.post('/username', async (req, res) => {
  try {
    const { userId, username } = req.body;

    if (!userId || !username) {
      return res.status(400).json({ error: 'Missing userId or username' });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    // Update user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.username) {
      return res.status(400).json({ error: 'User already has a username' });
    }

    user.username = username;
    await user.save();

    res.json({ success: true, username: user.username });
  } catch (error: any) {
    console.error('Set Username Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
