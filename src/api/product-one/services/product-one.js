'use strict';

/**
 * product-one service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::product-one.product-one');
