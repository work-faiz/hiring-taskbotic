import emailjs from '@emailjs/browser';

export function sendInterviewUpdateEmail({
  to_email,
  to_name,
  interview_date,
  interview_link,
  login_url,
  company_name,
}: {
  to_email: string;
  to_name: string;
  interview_date: string;
  interview_link: string;
  login_url: string;
  company_name: string;
}) {
  return emailjs.send(
    'service_xeq3nk7',      // Replace with your EmailJS service ID
    'template_w0yt2vi',     // Replace with your EmailJS template ID
    {
      to_email,
      to_name,
      interview_date,
      interview_link,
      login_url,
      company_name,
    },
    'hMOvi4ZaxLvHSjW6Z'       // Replace with your EmailJS public key
  );
} 