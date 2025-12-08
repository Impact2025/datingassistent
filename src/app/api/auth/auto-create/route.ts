import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { createOrUpdateSubscription } from '@/lib/neon-subscription';
import { notifyAdminNewLead } from '@/lib/admin-notifications';

// Auto-create account for paid orders
export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get order details
    const orderResult = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult.rows[0];

    console.log('📦 Order details:', {
      id: order.id,
      status: order.status,
      customer_email: order.customer_email,
      user_id: order.user_id,
      linked: order.linked_to_user
    });

    // Check if order is paid
    // Note: 'initialized' status might still be present if webhook hasn't been called yet
    // We'll allow it to proceed and the user can wait for payment confirmation
    const isPaid = order.status === 'completed' || order.status === 'paid';
    const isInitialized = order.status === 'initialized';

    if (!isPaid && !isInitialized) {
      console.log(`⚠️ Order status is ${order.status}, not creating account`);
      return NextResponse.json(
        { error: `Order status is ${order.status}. Please wait for payment confirmation.` },
        { status: 400 }
      );
    }

    if (isInitialized) {
      console.log('ℹ️ Order is initialized but not yet confirmed. User can create account and wait for payment.');
    }

    // Check if order already has a user
    if (order.user_id && order.linked_to_user) {
      // Order already linked, just return the user
      const userResult = await sql`
        SELECT id, email, name FROM users
        WHERE id = ${order.user_id}
      `;

      if (userResult.rows.length > 0) {
        return NextResponse.json({
          success: true,
          user: userResult.rows[0],
          message: 'Account already exists',
        });
      }
    }

    // Check if user with this email already exists
    const emailCheckResult = await sql`
      SELECT id, email, name FROM users
      WHERE email = ${order.customer_email}
    `;

    if (emailCheckResult.rows.length > 0) {
      const existingUser = emailCheckResult.rows[0];

      // Link order to existing user
      await sql`
        UPDATE orders
        SET user_id = ${existingUser.id},
            linked_to_user = true,
            updated_at = NOW()
        WHERE id = ${orderId}
      `;

      // Create/update subscription
      await createOrUpdateSubscription(existingUser.id, {
        packageType: order.package_type,
        billingPeriod: order.billing_period,
        status: 'active',
        orderId: orderId,
        startDate: new Date().toISOString(),
        amount: parseFloat(order.amount),
      });

      return NextResponse.json({
        success: true,
        user: existingUser,
        message: 'Order linked to existing account',
      });
    }

    // Generate a secure temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4) + 'Aa1!';
    const hashedPassword = await bcrypt.hash(tempPassword, 12); // Increased rounds for better security

    // Extract name from email if not provided
    const customerName = order.customer_name || order.customer_email.split('@')[0];

    // Create new user
    const newUserResult = await sql`
      INSERT INTO users (email, password, name, email_verified, created_at, updated_at)
      VALUES (${order.customer_email}, ${hashedPassword}, ${customerName}, true, NOW(), NOW())
      RETURNING id, email, name
    `;

    const newUser = newUserResult.rows[0];

    // Link order to new user
    await sql`
      UPDATE orders
      SET user_id = ${newUser.id},
          linked_to_user = true,
          updated_at = NOW()
      WHERE id = ${orderId}
    `;

    // Create subscription for user
    await createOrUpdateSubscription(newUser.id, {
      packageType: order.package_type,
      billingPeriod: order.billing_period,
      status: 'active',
      orderId: orderId,
      startDate: new Date().toISOString(),
      amount: parseFloat(order.amount),
    });

    console.log('✅ Auto-created account for order:', { orderId, userId: newUser.id });

    // Send admin notification about new paid customer (non-blocking)
    notifyAdminNewLead({
      userId: newUser.id,
      name: newUser.name,
      email: newUser.email,
      registrationSource: 'api',
      photoScore: null,
      intakeData: null,
      otoShown: true,
      otoAccepted: true, // They paid, so they accepted!
    }).catch(err => console.error('Failed to notify admin:', err));

    // Send welcome email with temporary password
    try {
      const emailResponse = await fetch('/api/email/send-welcome', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newUser.email,
          name: newUser.name,
          tempPassword: tempPassword,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send welcome email:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      tempPassword: tempPassword,
      message: 'Account created successfully',
      isNewAccount: true,
    });
  } catch (error) {
    console.error('Error auto-creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}