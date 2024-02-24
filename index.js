const SMTPServer = require('smtp-server').SMTPServer;
const nodemailer = require('nodemailer');
const spf = require('spf');
const dmarc = require('dmarc');
const dkim = require('dkim');

const server = new SMTPServer({
  onConnect(session, callback) {
    console.log('Connected from:', session.remoteAddress);
    callback(); 
  },

  onMailFrom(address, session, callback) {
    console.log('Mail from:', address.address);
    
    spf.resolve(address.address, session.remoteAddress, (err, result) => {
      if (err) {
        console.error('SPF verification error:', err);
        return callback(new Error('SPF verification failed'));
      }
      if (result && result.result !== 'pass') {
        console.error('SPF check failed:', result);
        return callback(new Error('SPF check failed'));
      }
      console.log('SPF verification passed');
      session.spfPassed = true; 
      callback(); 
    });
  },

  onRcptTo(address, session, callback) {
    console.log('Rcpt to:', address.address);
    
    dmarc.resolve(address.address, (err, result) => {
      if (err) {
        console.error('DMARC verification error:', err);
        return callback(new Error('DMARC verification failed'));
      }
      if (result && result.policy !== 'none') {
        console.error('DMARC check failed:', result);
        return callback(new Error('DMARC check failed'));
      }
      console.log('DMARC verification passed');
      session.dmarcPassed = true; 
      callback(); 
    });
  },

  onData(stream, session, callback) {
    let message = '';
    stream.on('data', chunk => {
      message += chunk;
    });
    stream.on('end', () => {
      console.log('Received message:', message);
      
      dkim.verify(message, (err, result) => {
        if (err) {
          console.error('DKIM verification error:', err);
          return callback(new Error('DKIM verification failed'));
        }
        if (!result || !result.success) {
          console.error('DKIM check failed:', result);
          return callback(new Error('DKIM check failed'));
        }
        console.log('DKIM verification passed');
        session.dkimPassed = true; 

        
        if (session.spfPassed && session.dmarcPassed && session.dkimPassed) {
          console.log('All verifications passed. Sending email...');
          sendMail();
        } else {
          console.log('One or more verifications failed. Email not sent.');
          callback(new Error('One or more verifications failed'));
        }
      });
    });
  }
});


function sendMail() {
  const transporter = nodemailer.createTransport({
    host: 'your_smtp_host',
    port: 587, 
    secure: false, 
    auth: {
      user: 'your_smtp_username',
      pass: 'your_smtp_password'
    }
  });

  const mailOptions = {
    from: 'your_email@example.com',
    to: 'recipient@example.com',
    subject: 'Test Email',
    text: 'This is a test email.'
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

server.listen(25, 'localhost', () => {
  console.log('SMTP server running on port 25');
});
