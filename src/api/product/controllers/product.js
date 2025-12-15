"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  async bulkStart(ctx) {
    const userId = ctx.state.user?.id;
    const { data, uploadSessionId } = ctx.request.body;

    if (!Array.isArray(data) || data.length === 0)
      return ctx.badRequest("Payload must not be empty");

    const result = await strapi
      .service("api::bulk-job.bulk-job")
      .startJobFromPayload(data, {
        userId,
        uploadSessionId,
      });

    return ctx.send({ jobId: result.jobId });
  },
  async activeJob(ctx) {
    const userId = ctx.state.user?.id;

    const result = await strapi
      .service("api::bulk-job.bulk-job")
      .activeJob(userId);

    return ctx.send(result);
  },
  async bulkProgress(ctx) {
    const { jobId, uploadSessionId } = ctx.query;
    const userId = ctx.state.user?.id;

    const progress = await strapi
      .service("api::bulk-job.bulk-job")
      .getProgress(jobId, userId, uploadSessionId);

    return ctx.send(progress);
  },
}));
