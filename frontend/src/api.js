// frontend/src/api.js
// SAHYOG 2.0 compatibility API file
// ---------------------------------
// Earlier, all API functions were written directly here.
// Now, we created a modular API folder:
//
// src/api/
//   client.js
//   auth.api.js
//   links.api.js
//   events.api.js
//   notifications.api.js
//   support.api.js
//   blood.api.js
//   feedback.api.js
//   ai.api.js
//   users.api.js
//   index.js
//
// This file exists only so old imports like:
// import { fetchEvents } from "../api";
// still keep working.
//
// Later, when all files are updated, we can directly import from "../api/index"
// or from specific feature API files.

export * from "./api";