import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing database connection and coupons table...');
    
    // Test database connection
    const testResult = await sql`SELECT NOW() as current_time`;
    console.log('Database connection successful:', testResult.rows[0]);
    
    // Check if coupons table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'coupons'
      );
    `;
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('Coupons table exists:', tableExists);
    
    if (tableExists) {
      // Try to fetch coupons
      const couponsResult = await sql`SELECT * FROM coupons LIMIT 5`;
      console.log('Coupons fetched successfully:', couponsResult.rows.length);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and coupons table are working',
        tableExists: true,
        couponCount: couponsResult.rows.length,
        sampleCoupons: couponsResult.rows
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Coupons table does not exist',
        tableExists: false
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}