module.exports = [
  "strapi::errors",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: [
        "Content-Type",
        "Authorization",
        "X-Device-Id",       // <--- ADD THIS
      ],
      expose: ["X-Device-Id"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      origin: "*", // or your frontend URL
    },
  },
  "strapi::security",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
