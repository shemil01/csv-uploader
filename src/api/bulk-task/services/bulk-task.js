'use strict';

/**
 * bulk-task service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bulk-task.bulk-task');
