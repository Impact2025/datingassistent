import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { email, name, tempPassword } = await request.json();

    if (!email || !name || !tempPassword) {
      return NextResponse.json(
        { error: 'Email, name, and tempPassword are required' },
        { status: 400 }
      );
    }

    // Create email content
    const msg = {
      to: email,
      from: 'welcome@datingassistent.nl', // Use the verified sender
      subject: 'Welkom bij DatingAssistent! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #FF7B54;">Welkom bij DatingAssistent!</h1>
            <p style="font-size: 18px; color: #333;">Hallo ${name},</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Je account is aangemaakt</h2>
            <p>Je betaling is succesvol verwerkt en je account is aangemaakt. Hier zijn je inloggegevens:</p>
            
            <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>E-mailadres:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Tijdelijk wachtwoord:</strong> ${tempPassword}</p>
            </div>
            
            <p><strong>Belangrijk:</strong> Bewaar deze gegevens op een veilige plek. Na het inloggen kun je je wachtwoord wijzigen in je profielinstellingen.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" 
               style="background-color: #FF7B54; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Inloggen op DatingAssistent
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px;">
              Heb je vragen? Neem contact op met onze support via 
              <a href="mailto:support@datingassistent.nl" style="color: #FF7B54;">support@datingassistent.nl</a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} DatingAssistent. Alle rechten voorbehouden.
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await sgMail.send(msg);
    
    console.log('✅ Welcome email sent to:', email);
    
    return NextResponse.json({ success: true, message: 'Welcome email sent' });
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    
    // Return success even if email fails to avoid breaking the flow
    return NextResponse.json(
      { 
        success: true, 
        message: 'Account created but email failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 200 }
    );
  }
}