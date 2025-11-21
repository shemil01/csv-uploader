"use strict";

const { createCoreService } = require("@strapi/strapi").factories;
const { v4: uuidv4 } = require("uuid");

module.exports = createCoreService("api::bulk-job.bulk-job", ({ strapi }) => ({
  async startJobFromPayload(payloadArray, opts = {}) {
    // payloadArray: full array of items (could be very large)
    const chunkSize = opts.chunkSize || 100;

    const jobId = uuidv4();

    // create job record
    const job = await strapi.entityService.create("api::bulk-job.bulk-job", {
      data: {
        jobId,
        status: "pending",
        total_items: Array.isArray(payloadArray) ? payloadArray.length : 0,
        processed_items: 0,
        payload: payloadArray,  
      },
    });

    // run processor asynchronously (do not await)
    (async () => {
      try {
        await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
          data: { status: "processing" },
        });

        const total = payloadArray.length;
        for (let i = 0; i < total; i += chunkSize) {
          const batch = payloadArray.slice(i, i + chunkSize);
          // call product service batch upsert
          const result = await strapi.service("api::product.product").bulkUpsertBatch(batch);

          // update job processed count
          await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
            data: {
              processed_items: Math.min(total, (i + chunkSize)),
              meta: {
                ...(job.meta || {}),
                last_batch_result: result,
              },
            },
          });

          // optional: small delay to yield event loop (prevents blocking)
          await new Promise((r) => setImmediate(r));
        }

        await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
          data: { status: "completed" },
        });
      } catch (err) {
        strapi.log.error("Bulk job failed", err);
        await strapi.entityService.update("api::bulk-job.bulk-job", job.id, {
          data: { status: "failed", error: String(err) },
        });
      }
    })();   

    return { jobId, jobRecordId: job.id };
  },

  async getProgress(jobId) {
    const job = await strapi.db.query("api::bulk-job.bulk-job").findOne({ where: { jobId } });
    if (!job) return null;
    const percentage = job.total_items > 0 ? Math.round((job.processed_items / job.total_items) * 100) : 0;
    return {
      jobId: job.jobId,
      status: job.status,
      total_items: job.total_items,
      processed_items: job.processed_items,
      percentage,
      error: job.error,
    };
  },
}));
