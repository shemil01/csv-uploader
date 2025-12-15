# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```
# Bulk Upload System

This Strapi backend provides APIs for bulk product upload with background processing, progress tracking, with user login and role based access.
It is designed to support page refresh recovery.

🚀 Features


Bulk product upload API

Background job processing

Real-time progress polling

Supports:

Multiple uploads by the same user

Multiple browsers

Page refresh without losing progress

# 📡 API Endpoints

1️⃣ Start Bulk Upload

POST /api/products/bulk-start

2️⃣ Get Upload Progress

GET /api/products/bulk-progress

Query Params
jobId=uuid
uploadSessionId=uuid

# How Background Processing Works

User uploads file from frontend

Frontend sends parsed data + uploadSessionId

Backend:

Creates a bulk-job record

Starts async processing

Inserts data in batches (e.g., 100 records)

Progress is updated in DB (processed_items)

Frontend polls /bulk-progress every few seconds

#  Progress Recovery (Refresh Safe)

jobId and uploadSessionId are stored on frontend

On page refresh:

Frontend re-polls /bulk-progress

Backend validates job ownership + session

Upload continues without interruption

