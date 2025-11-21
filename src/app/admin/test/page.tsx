"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminTestPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    console.log('Admin Test Page - User state:', { user, loading });
    
    // Check if user is admin
    const isAdminUser = user?.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email);
    console.log('Admin Test Page - Is admin user:', isAdminUser);
    
    if (!loading) {
      if (!user) {
        console.log('Admin Test Page - No user, redirecting to admin login');
        router.push('/admin/login');
      } else if (!isAdminUser) {
        console.log('Admin Test Page - Not admin user, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('Admin Test Page - Admin user, staying on page');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Redirecting to login...</div>;
  }

  const isAdminUser = user?.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email);
  
  if (!isAdminUser) {
    return <div>Access denied. Redirecting to dashboard...</div>;
  }

  return (
    <div>
      <h1>Admin Test Page</h1>
      <p>This page is only accessible to admin users.</p>
      <p>User email: {user?.email}</p>
      <p>User ID: {user?.uid}</p>
    </div>
  );
}