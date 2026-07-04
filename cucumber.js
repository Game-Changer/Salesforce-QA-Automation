const fs = require('fs');
const path = require('path');

// Get tags from command line or environment variable
const tags = process.env.CUCUMBER_TAGS || '';

module.exports = {
  default: {
    require: ['dist/step_definitions/**/*.js'],
    paths: ['features/**/*.feature'],
    format: [
      'progress-bar',
      'html:reports/cucumber-report.html',
      'json:reports/cucumber-report.json'
    ],
    // Must stay at 1: scenarios share the activated browser profile in .auth/
    // and Salesforce rotates the device activation token on every login
    parallel: 1,
    ...(tags && { tags })
  }
};
