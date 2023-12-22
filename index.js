const express = require('express');
const {google} = require('googleapis');
const cors = require('cors');

const app = express();

const clientId = process.env.clientId
const clientSecret = process.env.clientSecret
const redirectUrl = process.env.redirectUrl

const scopes = [
  'https://www.googleapis.com/auth/blogger',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email'
];

app.get("/login", async(req,res)=>{
    try {
        const authUrl = getAuthUrl();
        res.redirect(authUrl);      
    } catch (error) {
        console.error(error);
    }
})

app.get("/google/callback", async(req,res)=>{
    const code = req.query.code;

    try {
  
      const tokens = await exchangeCodeForTokens(code);
      const email = await getUserEmail(tokens.access_token);
        res.send({ tokens, email });
  
    } catch (error) {
  
      console.error('Error exchanging code for tokens:', error);
      res.status(500).send('Error occurred during authentication');
    }
})

async function exchangeCodeForTokens(code) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    return tokens;
  }
  
  async function getUserEmail(accessToken ) {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const userInfo = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await userInfo.userinfo.get();
    
    return data.email || "";
  }
  

function getAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    return authUrl;
  }

app.listen(8080, ()=>{
    console.log('Server running at 8080');
})