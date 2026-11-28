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

test("classifies common academic subject names for the existing RAG route", () => {
  for (const query of [
    "Data Structures",
    "Maths II",
    "Applied Chemistry",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
  ]) {
    assert.equal(rag.isCollegeRelated(query), true, query);
    assert.equal(rag.isCollegeRelatedWithHistory(query, []), true, query);
  }

  assert.equal(rag.isCollegeRelated("How do I make pancakes?"), false);
  assert.equal(
    rag.isCollegeRelatedWithHistory("How do I make pancakes?", []),
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

test("uses a safe college prompt for empty results and RAG failures", () => {
  const safePrompt = rag.buildSystemPrompt("Base prompt", "empty");
  assert.ok(safePrompt.includes("available college documents did not verify it"));
  assert.ok(safePrompt.includes("general educational concepts usefully"));
  assert.equal(rag.buildSystemPrompt("Base prompt", "unavailable"), safePrompt);
  assert.equal(rag.buildSystemPrompt("Base prompt", "not_attempted"), "Base prompt");
});

test("routes Hinglish subject queries to RAG but not small talk", () => {
  for (const query of [
    "Data Structures ke important topics batao",
    "Maths II ke first year PYQ batao",
    "DBMS",
  ]) {
    assert.equal(rag.isCollegeRelatedWithHistory(query, []), true, query);
  }
  for (const query of ["Tell me a joke", "Hello, how are you?"]) {
    assert.equal(rag.isCollegeRelatedWithHistory(query, []), false, query);
  }
});

test("grounded prompt carries passages and requires citations", () => {
  const prompt = rag.buildSystemPrompt("Base prompt", "matched", [
    { document_name: "DS U4.pdf", page_number: 8, text: "Graph Traversal" },
  ]);
  assert.ok(prompt.includes("[1] Source: DS U4.pdf, page 8\nGraph Traversal"));
  assert.ok(prompt.includes("Put the passage number in square brackets right after every statement"));
  assert.ok(prompt.includes("Build the main answer only from the passages"));
  assert.ok(prompt.includes("If a common topic of the subject is missing from the passages, do not list it."));
  assert.ok(prompt.includes("### General explanation (not verified from college notes)"));
  assert.ok(prompt.includes("### Quick Revision"));
  assert.ok(prompt.includes("Never write document names, page numbers or a Sources/References list yourself"));
  assert.ok(prompt.includes("Do not use tables"));
  assert.ok(!prompt.includes("For general educational questions, give a useful general explanation"));
});

test("requests more passages only for overview questions", () => {
  assert.equal(rag.getTopK("Data Structures ke important topics batao"), 10);
  assert.equal(rag.getTopK("Maths II ke first year PYQ batao"), 10);
  assert.equal(rag.getTopK("DS U4 syllabus"), 10);
  assert.equal(rag.getTopK("Data Structures"), 5);
  assert.equal(rag.getTopK("What is the attendance rule?"), 5);
});

test("normalizes ranged and labelled citation markers and drops invalid ones", () => {
  assert.equal(rag.normalizeCitationMarkers("A [1-3] B [2–4]"), "A [1][2][3] B [2][3][4]");
  assert.equal(rag.normalizeCitationMarkers("A [1, 3-4]"), "A [1][3][4]");
  assert.equal(rag.normalizeCitationMarkers("A [Passage 2] B [source 1]"), "A [2] B [1]");
  assert.equal(rag.normalizeCitationMarkers("A [5-2] B [1-40]"), "A  B ");

  const reply = rag.appendCitations("Trees [1-2], Hashing [9], Graphs [0].", [
    { document_name: "DS U4.pdf", page_number: 1 },
    { document_name: "DS U4.pdf", page_number: 2 },
  ]);
  assert.ok(reply.startsWith("Trees [1][2], Hashing , Graphs ."));
  assert.ok(reply.includes("- [1] DS U4\\.pdf, p. 1\n- [2] DS U4\\.pdf, p. 2"));
  assert.ok(!reply.includes("[9]"));
});

test("drops a Sources list written by the model and keeps the validated one", () => {
  const modelReply = [
    "### Data Structures — Notes mein covered topics",
    "**1. Trees**",
    "- Binary Tree [1]",
    "",
    "### Sources",
    "- DS U4.pdf, p. 99",
    "- Invented Notes.pdf",
    "",
    "### Quick Revision",
    "- Trees [1]",
  ].join("\n");

  assert.ok(!rag.stripModelSources(modelReply).includes("Invented Notes"));
  assert.ok(rag.stripModelSources(modelReply).includes("### Quick Revision"));

  const reply = rag.appendCitations(modelReply, [{ document_name: "DS U4.pdf", page_number: 1 }]);
  assert.ok(!reply.includes("p. 99"));
  assert.ok(!reply.includes("Invented Notes"));
  assert.ok(reply.includes("- Trees [1]"));
  assert.ok(reply.endsWith("**Sources**\n\n- [1] DS U4\\.pdf, p. 1"));
  assert.equal(rag.stripModelSources("No list here [1]."), "No list here [1].");
});

test("normalizes grouped and full-width citation markers", () => {
  assert.equal(rag.normalizeCitationMarkers("A [1, 3] B [2;4]"), "A [1][3] B [2][4]");
  assert.equal(rag.normalizeCitationMarkers("A 【2】 B 【1†L3-L5】"), "A [2] B [1]");
  assert.equal(rag.normalizeCitationMarkers("array[0] [x, y]"), "array[0] [x, y]");

  const reply = rag.appendCitations("Trees [1, 2].", [
    { document_name: "DS U4.pdf", page_number: 11 },
    { document_name: "DS U4.pdf", page_number: 8 },
  ]);
  assert.ok(reply.includes("- [1] DS U4\\.pdf, p. 11"));
  assert.ok(reply.includes("- [2] DS U4\\.pdf, p. 8"));
});

test("labels unverified college answers by RAG status", () => {
  assert.match(rag.getUnverifiedNotice("empty"), /could not find this/);
  assert.match(rag.getUnverifiedNotice("unavailable"), /could not be reached/);
  assert.equal(rag.getUnverifiedNotice("matched"), null);
  assert.equal(rag.getUnverifiedNotice("not_attempted"), null);
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
