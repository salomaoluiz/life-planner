/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = config;
