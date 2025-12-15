"use strict";

const { createCoreService } = require("@strapi/strapi").factories;
const { v4: uuidv4 } = require("uuid");

module.exports = createCoreService("api::bulk-job.bulk-job", ({ strapi }) => ({
  async startJobFromPayload(payloadArray, opts = {}) {
    const jobId = uuidv4();

    const sessionId = opts.uploadSessionId;

    const jobData = {
      jobId,
      status: "processing",
      uploadSessionId: sessionId,
      total_items: payloadArray.length,
      processed_items: 0,
      payload: payloadArray,
      user: opts.userId,
    };

    const job = await strapi.entityService.create("api::bulk-job.bulk-job", {
      data: jobData,
    });

    (async () => {
      try {
        for (let i = 0; i < payloadArray.length; i += 100) {
          const batch = payloadArray.slice(i, i + 100);

          await strapi.service("api::product.product").bulkUpsertBatch(batch);

          await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
            data: {
              processed_items: Math.min(i + 100, payloadArray.length),
            },
          });

          await new Promise((res) => setImmediate(res));
        }

        await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
          data: { status: "completed" },
        });
      } catch (err) {
        await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
          data: { status: "failed", error: String(err) },
        });
      }
    })();

    return { jobId };
  },

  async getProgress(jobId, userId, uploadSessionId) {
    const job = await strapi.db
      .query("api::bulk-job.bulk-job")
      .findOne({ where: { jobId }, populate: ["user"] });

    if (!job) return { status: "not_found" };

    if (job.user?.id !== userId) return { status: "unauthorized" };

    if (job.uploadSessionId !== uploadSessionId)
      return { status: "not_found_for_session" };

    const percentage =
      job.total_items > 0 ? (job.processed_items / job.total_items) * 100 : 0;

    return {
      jobId,
      status: job.status,
      percentage: percentage.toFixed(1),
      processed_items: job.processed_items,
      total_items: job.total_items,
    };
  },
}));
