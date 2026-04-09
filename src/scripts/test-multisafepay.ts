import { logger } from '@/lib/logger';
import { createMultiSafePayOrder } from '@/lib/multisafepay';

async function testMultiSafepay() {
  logger.log('🔍 Testing MultiSafepay connection...');
  
  // Check if MULTISAFEPAY_API_KEY is set
  const mspApiKey = process.env.MULTISAFEPAY_API_KEY;
  logger.log('🔑 MULTISAFEPAY_API_KEY:', mspApiKey ? `Set (length: ${mspApiKey.length})` : 'Not set');
  
  if (!mspApiKey) {
    console.error('❌ MULTISAFEPAY_API_KEY is not set in environment variables');
    return;
  }
  
  try {
    // Test with a simple order creation attempt
    const testOrder = {
      type: 'redirect' as const,
      order_id: `TEST-${Date.now()}`,
      currency: 'EUR',
      amount: 1000, // €10.00
      description: 'Test order',
      payment_options: {
        notification_url: 'http://localhost:9002/api/payment/webhook',
        redirect_url: 'http://localhost:9002/payment/success',
        cancel_url: 'http://localhost:9002/payment/cancelled',
      },
      customer: {
        locale: 'nl_NL',
        email: 'test@example.com',
      },
    };
    
    logger.log('📤 Sending test request to MultiSafepay...');
    const result = await createMultiSafePayOrder(testOrder);
    
    logger.log('📥 Response:', {
      success: result.success,
      error: result.error_info,
      data: result.data ? 'Present' : 'Missing'
    });
    
    if (result.success) {
      logger.log('✅ MultiSafepay connection successful!');
    } else {
      console.error('❌ MultiSafepay connection failed:', result.error_info);
    }
  } catch (error) {
    console.error('💥 Error testing MultiSafepay:', error);
  }
}

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

testMultiSafepay();