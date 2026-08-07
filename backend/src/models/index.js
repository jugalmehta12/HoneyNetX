/**
 * Models barrel export.
 * Import from here: const { AttackLog, Honeypot, Report, User } = require("./models");
 */

const AttackLog = require("./AttackLog");
const Honeypot = require("./Honeypot");
const Report = require("./Report");
const User = require("./User");

module.exports = { AttackLog, Honeypot, Report, User };
