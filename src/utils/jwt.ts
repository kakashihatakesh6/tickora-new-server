import jwt from 'jsonwebtoken';

interface TokenPayload {
  user_id: number;
}

export const generateToken = (userId: number): string => {
  const payload: TokenPayload = {
    user_id: userId
  };

  const secret = process.env.JWT_SECRET || 'changeme_in_production';
  
  return jwt.sign(payload, secret, {
    expiresIn: '24h'
  });
};

export const validateToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'changeme_in_production';
  
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
};
