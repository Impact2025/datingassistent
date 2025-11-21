import * as React from 'react';
import { NotificationEmailTemplate } from '@/components/emails';

interface VerificationEmailProps {
  firstName: string;
  verificationCode: string;
  verificationUrl?: string;
  expiresIn?: string;
}

export const VerificationEmail = ({
  firstName = 'Dating Expert',
  verificationCode = '123456',
  verificationUrl,
  expiresIn = '24 uur',
}: VerificationEmailProps) => {
  return (
    <NotificationEmailTemplate
      userName={firstName}
      type="info"
      title="Verificeer je email adres"
      message={`Welkom bij DatingAssistent! Gebruik deze verificatiecode om je account te activeren: ${verificationCode}. Deze code verloopt over ${expiresIn}.`}
      action={verificationUrl ? {
        primary: {
          text: 'Account Verificeren',
          url: verificationUrl,
        },
      } : undefined}
      details={[
        { label: 'Verificatiecode', value: verificationCode },
        { label: 'Verloopt over', value: expiresIn },
        { label: 'Stappen', value: '1. Code kopiëren, 2. Inloggen, 3. Code invoeren' },
      ]}
      tips={[
        'Bewaar deze code veilig en deel hem niet met anderen',
        'De code is eenmalig geldig voor je account',
        'Na verificatie heb je direct toegang tot alle functies',
        'Check je spam folder als je deze email niet ziet',
      ]}
    />
  );
};

export default VerificationEmail;