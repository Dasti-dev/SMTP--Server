# SMTP Server with Email Verification and Sending Functionality

This is a Node.js SMTP server implementation with email verification using SPF, DMARC, and DKIM, as well as email sending functionality.

## Dependencies

- `smtp-server`: A lightweight SMTP server implementation for Node.js.
- `nodemailer`: A module for sending emails with Node.js.
- `spf`: A module for Sender Policy Framework (SPF) verification.
- `dmarc`: A module for Domain-based Message Authentication, Reporting, and Conformance (DMARC) verification.
- `dkim`: A module for DomainKeys Identified Mail (DKIM) verification.

## SMTP Server Configuration

The SMTP server is configured with the following event handlers:

### `onConnect`

- Logs the IP address of the connecting client.

### `onMailFrom`

- Logs the sender's email address.
- Verifies the SPF record for the sender's domain.
- If SPF verification fails, returns an error.

### `onRcptTo`

- Logs the recipient's email address.
- Resolves the DMARC policy for the recipient's domain.
- If DMARC verification fails, returns an error.

### `onData`

- Receives the email data stream.
- Verifies the DKIM signature of the email.
- If DKIM verification fails, returns an error.
- If all verifications (SPF, DMARC, DKIM) pass, calls the `sendMail` function.

## Email Sending Functionality

The `sendMail` function uses the `nodemailer` module to send an email.

- Creates a transporter with SMTP server details (host, port, authentication credentials).
- Defines email options including sender, recipient, subject, and text content.
- Sends the email using the transporter.
- Logs any errors or the response upon successful sending.

## Server Initialization

The SMTP server is initialized to listen on port 25 of the localhost.

```javascript
const server = new SMTPServer({
  // SMTP server configuration as explained above
});

// Function to send mail as explained above
function sendMail() {
  // Mail sending logic
}

// Start the SMTP server
server.listen(25, 'localhost', () => {
  console.log('SMTP server running on port 25');
});
```
## For Better explanation -
https://www.notion.so/SMTP-Server-25-960d93656a214330817677b784c10c46?pvs=4
