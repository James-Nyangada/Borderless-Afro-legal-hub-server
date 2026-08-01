const sendEmail = async ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('Brevo API key is missing');
    return;
  }

  const payload = {
    sender: {
      name: 'Borderless Afro Legal Hub',
      email: process.env.COMPANY_EMAIL || 'info@richworldsafaris.com'
    },
    to: [
      {
        email: to
      }
    ],
    subject: subject,
    htmlContent: html
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo Email API Error:', errorData);
      throw new Error(`Brevo API returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail;
