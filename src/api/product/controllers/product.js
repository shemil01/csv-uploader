"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::product.product", ({ strapi }) => ({
  // Replace or add a route that accepts full payload and returns jobId
  async bulkStart(ctx) {
    try {
      const payload = ctx.request.body;
      if (!Array.isArray(payload) || payload.length === 0) {
        return ctx.badRequest("Request must be a non-empty array");
      }

      const chunkSize = Number(ctx.query.chunkSize) || 100;

      const result = await strapi.service("api::bulk-job.bulk-job").startJobFromPayload(payload, { chunkSize });

      return ctx.send({ message: "Job started", jobId: result.jobId });
    } catch (err) {
      strapi.log.error("bulkStart error", err);
      return ctx.internalServerError("Failed to start bulk job");
    }
  },

  // Polling endpoint: GET /products/bulk-progress?jobId=...
  async bulkProgress(ctx) {
    const { jobId } = ctx.query;
    if (!jobId) return ctx.badRequest("jobId is required");
    const progress = await strapi.service("api::bulk-job.bulk-job").getProgress(jobId);
    if (!progress) return ctx.notFound("Job not found");
    return ctx.send(progress);
  },
}));
