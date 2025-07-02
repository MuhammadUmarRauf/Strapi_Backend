'use strict';

/**
 * custom-password service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::custom-password.custom-password');
