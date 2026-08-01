const addContactToList = async (email, name = null) => {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = parseInt(process.env.BREVO_LIST_ID, 10);

  if (!apiKey || isNaN(listId)) {
    console.error('Brevo configuration is missing (API Key or List ID)');
    return;
  }

  const payload = {
    email: email,
    listIds: [listId],
    updateEnabled: true
  };

  if (name) {
    // If a name is provided (e.g. from a contact form), we can optionally try to parse and send it.
    // Brevo usually accepts FIRSTNAME and LASTNAME attributes if they exist in the account.
    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    payload.attributes = {};
    if (firstName) payload.attributes.FIRSTNAME = firstName;
    if (lastName) payload.attributes.LASTNAME = lastName;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
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
      console.error('Brevo API Error:', errorData);
      throw new Error(`Brevo API returned status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to add contact to Brevo:', error);
    // Depending on requirements, we can swallow the error or throw it
    // Usually for newsletter signups, we don't want to fail the main request if the CRM sync fails
  }
};

module.exports = {
  addContactToList
};
