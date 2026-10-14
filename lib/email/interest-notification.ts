import { signupTypes, type InterestSubmission } from '../data/interest-contract';

const SIGNUP_INBOX = 'yuanchengli612@gmail.com';

export async function sendInterestNotification(submission: InterestSubmission, reference: string, interestId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ROOKIE_SIGNUP_FROM_EMAIL;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `rookie-interest/${interestId}`,
      },
      body: JSON.stringify({
        from,
        to: [SIGNUP_INBOX],
        reply_to: submission.email,
        subject: `New Rookie Rackets signup: ${signupTypes[submission.signupType]} ${reference}`,
        text: [
          'New Rookie Rackets signup',
          `Signup type: ${signupTypes[submission.signupType]}`,
          `Reference: ${reference}`,
          `Full name: ${submission.fullName}`,
          `Email: ${submission.email}`,
          `Phone: ${submission.phone}`,
          `Grade: ${submission.signupType === 'adult-volunteer' || submission.signupType === 'coach' ? 'Not applicable' : submission.grade}`,
          `Age: ${submission.age}`,
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) console.error('Rookie Rackets signup email failed:', response.status);
    return response.ok;
  } catch {
    console.error('Rookie Rackets signup email could not be sent.');
    return false;
  }
}
