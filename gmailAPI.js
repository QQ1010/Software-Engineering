const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const { profile } = require('console');
const { userInfo } = require('os');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://mail.google.com'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'gmail-api-token.json';

// Load client secrets from a local file.
function sendauthemail(emails) {
fs.readFile('client_credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  authorize(JSON.parse(content), listLabels, emails);
  // authorize(JSON.parse(content), sendMessage, emails);
});
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, emails) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback, emails);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client,emails);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback ,emails) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, emails);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth, emails) {
  const gmail = google.gmail({version: 'v1', auth});
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });
}

function sendMessage(auth, emails) {
  // console.log('test');
  console.log("check here" + emails);
  var gmail = google.gmail('v1');
  var email_lines = [];
  email_lines.push("From: asdfg335522@gmail.com");
  email_lines.push("To:" + emails);
  email_lines.push('Content-type: text/html;charset=utf-8');
  email_lines.push('MIME-Version: 1.0');
  email_lines.push("Subject: Test Mail");
  email_lines.push("");
  email_lines.push("<b>請不用緊張，本郵件僅測試使用</b>");
  email_lines.push("<b>同學晚安，我是QQ，在我不斷努力Google之後，我終於成功接好Gmail的API，太開心了吧！與你分享我的喜悅</b>");
  email_lines.push("https://www.google.com/url?sa=i&url=https%3A%2F%2Fmemes.tw%2Fimage%2F58&psig=AOvVaw10QUPwjgmYC9kxFpimEAol&ust=1635955895455000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCKj65uOI-vMCFQAAAAAdAAAAABAD");
var email = email_lines.join("\r\n").trim();
var base64EncodedEmail = new Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  console.log(base64EncodedEmail);
function sendDone(err, response) {
      if (err) {
          console.log('The API returned an error: ' + err);
          return;
      }
      console.log('send mail success', response);
  }
gmail.users.messages.send({
      auth: auth,
      userId: 'me',
      resource: {
          raw: base64EncodedEmail
      }
  }, sendDone);
}

module.exports = sendauthemail;