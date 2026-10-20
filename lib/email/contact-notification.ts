import { contactTopics, type ContactMessage } from '../data/contact-contract';

const CONTACT_INBOX = 'yuanchengli612@gmail.com';

export async function sendContactNotification(message: ContactMessage, messageId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ROOKIE_SIGNUP_FROM_EMAIL;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `rookie-contact/${messageId}`,
      },
      body: JSON.stringify({
        from,
        to: [CONTACT_INBOX],
        reply_to: message.email,
        subject: `New Rookie Rackets message: ${contactTopics[message.topic]} from ${message.fullName}`,
        text: [
          'New message from the Rookie Rackets contact form',
          `Topic: ${contactTopics[message.topic]}`,
          `Full name: ${message.fullName}`,
          `Email: ${message.email}`,
          '',
          message.message,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) console.error('Rookie Rackets contact email failed:', response.status);
    return response.ok;
  } catch {
    console.error('Rookie Rackets contact email could not be sent.');
    return false;
  }
}
