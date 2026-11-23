const assert = require("node:assert/strict");
const http = require("node:http");
const { test } = require("node:test");

const rag = require("./ragClient.service");

test("classifies college and academic questions without routing general questions", () => {
  assert.equal(
    rag.isCollegeRelated("Solve this integral from my syllabus"),
    true
  );
  assert.equal(rag.isCollegeRelated("Explain Newton's second law"), true);
  assert.equal(rag.isCollegeRelated("When is convocation?"), true);
  assert.equal(rag.isCollegeRelated("What is the attendance rule?"), true);
  assert.equal(
    rag.isCollegeRelated("Which documents are required for admission?"),
    true
  );
  assert.equal(
    rag.isCollegeRelated("When does the NIT Raipur library open?"),
    true
  );
  assert.equal(
    rag.isCollegeRelated("How should I study physics before my midterm?"),
    true
  );
  assert.equal(rag.isCollegeRelated("How do I make pancakes?"), false);
  assert.equal(rag.isCollegeRelated("Explain recursion"), false);
  assert.equal(
    rag.isCollegeRelatedWithHistory("What about that?", [
      "Tell me about attendance rules",
    ]),
    true
  );
  assert.equal(
    rag.isCollegeRelatedWithHistory("What about that?", [
      "How do I make pancakes?",
    ]),
    false
  );
});

test("does not render hidden or non-HTTP source URLs as links", () => {
  const reply = rag.appendCitations("Answer [1] [2]", [
    {
      document_name: "Academic Rules.pdf",
      page_number: 4,
      source_url: null,
    },
    {
      document_name: "Other.pdf",
      page_number: null,
      source_url: "javascript:alert(1)",
    },
  ]);

  assert.ok(reply.includes("Academic Rules"));
  assert.ok(reply.includes("p. 4"));
  assert.ok(reply.includes("Other"));
  assert.doesNotMatch(reply, /\]\((?:https?:|javascript:)/);
});

test("lists only cited sources and keeps citation numbers aligned", () => {
  const reply = rag.appendCitations("Supported by [2] and [8].", [
    {
      document_name: "Unused.pdf",
      page_number: 1,
      source_url: "https://example.test/unused",
    },
    {
      document_name: "Used.pdf",
      page_number: 6,
      source_url: "https://example.test/used",
    },
  ]);

  assert.ok(reply.includes("Supported by [2].") || reply.includes("Supported by [2]"));
  assert.ok(reply.includes("- [[2] Used\\.pdf, p. 6](https://example.test/used)"));
  assert.ok(!reply.includes("Unused"));
  assert.ok(!reply.includes("[8]"));
  assert.equal(rag.appendCitations("No citation.", [{}]), "No citation.");
});

test("distinguishes empty and unusable results from RAG failures", async () => {
  const empty = await rag.retrieveKnowledge(
    "What is the attendance rule?",
    [],
    async () => ({ count: 0, results: [] })
  );
  assert.equal(empty.status, "empty");
  assert.equal(empty.results.length, 0);

  const unusable = await rag.retrieveKnowledge(
    "What is the attendance rule?",
    [],
    async () => ({
      count: 1,
      results: [{ text: "  ", document_name: "Blank.pdf" }],
    })
  );
  assert.equal(unusable.status, "empty");
  assert.equal(unusable.results.length, 0);

  const unavailable = await rag.retrieveKnowledge(
    "What is the attendance rule?",
    [],
    async () => {
      const error = new rag.RagUnavailableError("RAG service returned HTTP 503.", 503);
      throw error;
    }
  );
  assert.equal(unavailable.status, "unavailable");
  assert.equal(unavailable.error.statusCode, 503);
});

test("uses a safe college prompt for empty results but preserves the base prompt on errors", () => {
  const safePrompt = rag.buildSystemPrompt("Base prompt", "empty");
  assert.ok(safePrompt.includes("available college documents did not verify it"));
  assert.ok(safePrompt.includes("general educational concepts usefully"));
  assert.equal(
    rag.buildSystemPrompt("Base prompt", "unavailable"),
    "Base prompt"
  );
});

test("skips oversized queries without invoking RAG", async () => {
  let called = false;
  const outcome = await rag.retrieveKnowledge(
    "attendance ".repeat(100),
    [],
    async () => {
      called = true;
      return { count: 1, results: [] };
    }
  );

  assert.equal(outcome.status, "oversized");
  assert.equal(called, false);
});

test("sends the search request using the shared-secret header", async () => {
  const previous = {
    enabled: process.env.RAG_ENABLED,
    url: process.env.RAG_SERVICE_URL,
    secret: process.env.RAG_SERVICE_SECRET,
    timeout: process.env.RAG_TIMEOUT_MS,
    nodeEnv: process.env.NODE_ENV,
  };
  let requestBody = "";
  let requestHeaders;
  const server = http.createServer((request, response) => {
    requestHeaders = request.headers;
    request.on("data", (chunk) => {
      requestBody += chunk.toString("utf8");
    });
    request.on("end", () => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          query: "attendance rule",
          rewritten_query: "attendance rule",
          count: 1,
          results: [
            {
              chunk_id: "chunk-1",
              text: "Attendance details",
              document_id: "doc-1",
              document_name: "Academic Rules.pdf",
              page_number: 4,
              source_url: null,
              score: 0.02,
              metadata: {},
            },
          ],
          retrieval: {},
        })
      );
    });
  });

  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    process.env.RAG_ENABLED = "true";
    process.env.RAG_SERVICE_URL = `http://127.0.0.1:${address.port}`;
    process.env.RAG_SERVICE_SECRET = "test-only-secret";
    process.env.NODE_ENV = "test";
    delete process.env.RAG_TIMEOUT_MS;

    const response = await rag.searchKnowledge("  attendance rule  ");

    assert.deepEqual(JSON.parse(requestBody), {
      query: "attendance rule",
      top_k: 5,
    });
    assert.equal(requestHeaders["x-rag-secret"], "test-only-secret");
    assert.equal(response.count, 1);
    assert.equal(response.results[0].document_name, "Academic Rules.pdf");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous.enabled === undefined) delete process.env.RAG_ENABLED;
    else process.env.RAG_ENABLED = previous.enabled;
    if (previous.url === undefined) delete process.env.RAG_SERVICE_URL;
    else process.env.RAG_SERVICE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.RAG_SERVICE_SECRET;
    else process.env.RAG_SERVICE_SECRET = previous.secret;
    if (previous.timeout === undefined) delete process.env.RAG_TIMEOUT_MS;
    else process.env.RAG_TIMEOUT_MS = previous.timeout;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
  }
});

test("rejects an insecure RAG URL in production", async () => {
  const previous = {
    enabled: process.env.RAG_ENABLED,
    url: process.env.RAG_SERVICE_URL,
    secret: process.env.RAG_SERVICE_SECRET,
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    process.env.RAG_ENABLED = "true";
    process.env.RAG_SERVICE_URL = "http://127.0.0.1:8000";
    process.env.RAG_SERVICE_SECRET = "test-only-secret";
    process.env.NODE_ENV = "production";

    await assert.rejects(
      rag.searchKnowledge("attendance rule"),
      /RAG service URL is invalid/
    );
  } finally {
    if (previous.enabled === undefined) delete process.env.RAG_ENABLED;
    else process.env.RAG_ENABLED = previous.enabled;
    if (previous.url === undefined) delete process.env.RAG_SERVICE_URL;
    else process.env.RAG_SERVICE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.RAG_SERVICE_SECRET;
    else process.env.RAG_SERVICE_SECRET = previous.secret;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
  }
});

test("reports the RAG HTTP status so callers can fall back", async () => {
  const previous = {
    enabled: process.env.RAG_ENABLED,
    url: process.env.RAG_SERVICE_URL,
    secret: process.env.RAG_SERVICE_SECRET,
    timeout: process.env.RAG_TIMEOUT_MS,
    nodeEnv: process.env.NODE_ENV,
  };
  const server = http.createServer((request, response) => {
    response.writeHead(503, { "Content-Type": "application/json" });
    response.end('{"detail":"No approved chunks"}');
  });

  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    process.env.RAG_ENABLED = "true";
    process.env.RAG_SERVICE_URL = `http://127.0.0.1:${address.port}`;
    process.env.RAG_SERVICE_SECRET = "test-only-secret";
    process.env.NODE_ENV = "test";
    delete process.env.RAG_TIMEOUT_MS;

    await assert.rejects(
      rag.searchKnowledge("attendance rule"),
      (error) => error.statusCode === 503
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous.enabled === undefined) delete process.env.RAG_ENABLED;
    else process.env.RAG_ENABLED = previous.enabled;
    if (previous.url === undefined) delete process.env.RAG_SERVICE_URL;
    else process.env.RAG_SERVICE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.RAG_SERVICE_SECRET;
    else process.env.RAG_SERVICE_SECRET = previous.secret;
    if (previous.timeout === undefined) delete process.env.RAG_TIMEOUT_MS;
    else process.env.RAG_TIMEOUT_MS = previous.timeout;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
  }
});

test("sends college history for a follow-up and accepts a zero-result response", async () => {
  let requestBody = "";
  const server = http.createServer((request, response) => {
    request.on("data", (chunk) => {
      requestBody += chunk.toString("utf8");
    });
    request.on("end", () => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          query: "What about that?",
          rewritten_query: "attendance rules What about that?",
          count: 0,
          results: [],
          retrieval: {},
        })
      );
    });
  });

  const previous = {
    enabled: process.env.RAG_ENABLED,
    url: process.env.RAG_SERVICE_URL,
    secret: process.env.RAG_SERVICE_SECRET,
    timeout: process.env.RAG_TIMEOUT_MS,
    nodeEnv: process.env.NODE_ENV,
  };
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    process.env.RAG_ENABLED = "true";
    process.env.RAG_SERVICE_URL = `http://127.0.0.1:${address.port}`;
    process.env.RAG_SERVICE_SECRET = "test-only-secret";
    process.env.NODE_ENV = "test";
    delete process.env.RAG_TIMEOUT_MS;

    const response = await rag.searchKnowledge("What about that?", [
      "Tell me about attendance rules",
      "How do I make pancakes?",
    ]);

    assert.deepEqual(JSON.parse(requestBody), {
      query: "What about that?",
      top_k: 5,
      history: ["Tell me about attendance rules"],
    });
    assert.equal(response.count, 0);
    assert.deepEqual(response.results, []);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous.enabled === undefined) delete process.env.RAG_ENABLED;
    else process.env.RAG_ENABLED = previous.enabled;
    if (previous.url === undefined) delete process.env.RAG_SERVICE_URL;
    else process.env.RAG_SERVICE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.RAG_SERVICE_SECRET;
    else process.env.RAG_SERVICE_SECRET = previous.secret;
    if (previous.timeout === undefined) delete process.env.RAG_TIMEOUT_MS;
    else process.env.RAG_TIMEOUT_MS = previous.timeout;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
  }
});

test("enforces a total deadline while the server continues sending data", async () => {
  let chunksSent = 0;
  const server = http.createServer((request, response) => {
    const heartbeat = setInterval(() => {
      if (!response.destroyed) {
        response.write(" ");
        chunksSent += 1;
      }
    }, 5);
    const finish = setTimeout(() => response.end(), 400);
    response.on("close", () => {
      clearInterval(heartbeat);
      clearTimeout(finish);
    });
  });

  const previous = {
    enabled: process.env.RAG_ENABLED,
    url: process.env.RAG_SERVICE_URL,
    secret: process.env.RAG_SERVICE_SECRET,
    timeout: process.env.RAG_TIMEOUT_MS,
    nodeEnv: process.env.NODE_ENV,
  };
  try {
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    process.env.RAG_ENABLED = "true";
    process.env.RAG_SERVICE_URL = `http://127.0.0.1:${address.port}`;
    process.env.RAG_SERVICE_SECRET = "test-only-secret";
    process.env.RAG_TIMEOUT_MS = "100";
    process.env.NODE_ENV = "test";

    await assert.rejects(
      rag.searchKnowledge("attendance rule"),
      /RAG request timed out/
    );
    assert.ok(chunksSent > 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (previous.enabled === undefined) delete process.env.RAG_ENABLED;
    else process.env.RAG_ENABLED = previous.enabled;
    if (previous.url === undefined) delete process.env.RAG_SERVICE_URL;
    else process.env.RAG_SERVICE_URL = previous.url;
    if (previous.secret === undefined) delete process.env.RAG_SERVICE_SECRET;
    else process.env.RAG_SERVICE_SECRET = previous.secret;
    if (previous.timeout === undefined) delete process.env.RAG_TIMEOUT_MS;
    else process.env.RAG_TIMEOUT_MS = previous.timeout;
    if (previous.nodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous.nodeEnv;
  }
});
