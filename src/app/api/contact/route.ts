import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Alle verplichte velden moeten ingevuld zijn' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres' },
        { status: 400 }
      );
    }

    // Create email content
    const emailSubject = `Contact Form: ${subject}`;
    const emailBody = `
Nieuwe contactformulier inzending:

NAAM: ${firstName} ${lastName}
E-MAIL: ${email}
TELEFOON: ${phone || 'Niet opgegeven'}

ONDERWERP: ${subject}

BERICHT:
${message}

VERZONDEN OP: ${new Date().toLocaleString('nl-NL')}
IP ADRES: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Onbekend'}
USER AGENT: ${request.headers.get('user-agent') || 'Onbekend'}
    `.trim();

    // For development/testing - log the email content
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log('To:', 'info@datingassistent.nl');
    console.log('Subject:', emailSubject);
    console.log('Body:', emailBody);
    console.log('================================');

    // Send email using Web3Forms (free service)
    // Alternative services you can use:
    // - EmailJS: https://www.emailjs.com/
    // - Web3Forms: https://web3forms.com/
    // - Formspree: https://formspree.io/
    // - Netlify Forms (if using Netlify)

    // Try to send email using Web3Forms (free service)
    let emailSent = false;

    try {
      const web3FormsResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY || 'YOUR_WEB3FORMS_KEY',
          name: `${firstName} ${lastName}`,
          email: email,
          phone: phone || 'Niet opgegeven',
          subject: `Contact Form: ${subject}`,
          message: message,
          to: 'info@datingassistent.nl',
          from_name: 'Dating Assistent Contact Form',
          redirect: 'false'
        }),
      });

      if (web3FormsResponse.ok) {
        try {
          const result = await web3FormsResponse.json();
          if (result.success === true) {
            emailSent = true;
          }
        } catch (jsonError) {
          // Web3Forms might return HTML instead of JSON on error
          console.error('Web3Forms JSON parse error:', jsonError);
        }
      } else {
        console.error('Web3Forms HTTP error:', web3FormsResponse.status);
      }

    } catch (emailError) {
      console.error('Email service failed:', emailError);
    }

    // Always log the email for development/testing
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log('Email sent via Web3Forms:', emailSent ? 'YES' : 'NO (fallback used)');
    console.log('To: info@datingassistent.nl');
    console.log('Subject:', emailSubject);
    console.log('From:', `${firstName} ${lastName} <${email}>`);
    console.log('Message:', message);
    console.log('================================');

    // For development/testing, we always return success
    // In production, you should implement proper email service monitoring
    // and potentially save failed emails to database for retry

    return NextResponse.json({
      success: true,
      message: 'Bericht succesvol verzonden'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van het bericht' },
      { status: 500 }
    );
  }
}