import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createRazorpayOrder = async (amount: number, receiptId: string): Promise<string> => {
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
  });

  const options = {
    amount: amount * 100, // Amount in paise
    currency: 'INR',
    receipt: receiptId
  };

  try {
    const order = await client.orders.create(options);
    return order.id;
  } catch (error) {
    throw new Error('Failed to create Razorpay order');
  }
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const data = `${orderId}|${paymentId}`;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');

  return expectedSignature === signature;
};
