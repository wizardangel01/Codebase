// Written by tools/set-password.mjs. Do not edit by hand: run the tool again to change the password.
//
// The site asks for a password before it starts (js/auth.js, js/views/login.js). Only a salted PBKDF2 hash is kept
// here, never the password itself. This is a door for casual visitors, not a vault: the lessons are ordinary files on
// a public web host, so anyone who knows how to read them can. See docs/DEV_NOTES.md ("The password screen").
export const AUTH = {
  enabled: true,
  algorithm: 'PBKDF2-SHA256',
  iterations: 250000,
  salt: 'HKjD+3F07jeSuvJi7tOVvg==',
  hash: 'm54fcFPm4W6BedFHMnbxvwlLiSHMoiTwNDqPFlvGBwc=',
};
