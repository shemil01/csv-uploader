"use strict";

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::product.product", ({ strapi }) => ({
  // Upsert a single batch (array of items)
  async bulkUpsertBatch(items = []) {
    if (!Array.isArray(items)) {
      throw new Error("Batch must be an array");
    }
    let inserted = 0;
    let updated = 0;

    for (const item of items) {
      if (!item.name) {
        throw new Error("Each item must have name");
      }
      if (!item.category) {
        throw new Error("category missing");
      }

      // Category Resolution (accept numeric id or string id)
      let categoryId = item.category;
      if (typeof item.category === "string") {
        const categoryObj = await strapi.db.query("api::category.category").findOne({ where: { id: item.category } });
        if (!categoryObj) throw new Error(`Invalid category: ${item.category}`);
        categoryId = categoryObj.id;
      }
      item.category = categoryId;

      // Fetch prefix from category
      const categoryRecord = await strapi.db.query("api::category.category").findOne({ where: { id: categoryId } });
      const prefix = categoryRecord?.prefix || "";

      // Find existing by si_number or code_number
      let existing = null;
      if (item.si_number) {
        existing = await strapi.db.query("api::product.product").findOne({ where: { si_number: item.si_number } });
      }
      if (!existing && item.code_number) {
        existing = await strapi.db.query("api::product.product").findOne({ where: { code_number: item.code_number } });
      }

      if (existing) {
        await strapi.db.query("api::product.product").update({
          where: { id: existing.id },
          data: item,
        });
        updated++;
      } else {
        // Generate code_number if missing
        let code_number = item.code_number;
        if (!code_number) {
          // find max numeric part in existing code_number for this category
          const existingCodes = await strapi.db.query("api::product.product").findMany({ where: { category: item.category } });
          let max = 0;
          for (const prod of existingCodes) {
            const num = parseInt(String(prod.code_number || "").replace(/\D/g, ""), 10);
            if (!isNaN(num) && num > max) max = num;
          }
          code_number = `${prefix}${max + 1}`;
        }
        await strapi.db.query("api::product.product").create({
          data: {
            ...item,
            code_number,
            publishedAt: new Date(),
          },
        });
        inserted++;
      }
    } 

    return { inserted, updated, processed: items.length };
  },
}));
