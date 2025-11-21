module.exports = {

  "routes": [
    {
      "method": "POST",
      "path": "/products/bulk-start",
      "handler": "product.bulkStart",
      "config": {
        "policies": []
      }
    },
    {
      "method": "GET",
      "path": "/products/bulk-progress",
      "handler": "product.bulkProgress",
      "config": {
        "policies": []
      }
    }
  ]


};
