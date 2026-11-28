// End-to-end tests for POST /api/ai/chat with a local fake RAG service and a stubbed Groq API.
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const http = require("node:http");
const https = require("node:https");
const { after, before, beforeEach, test } = require("node:test");

const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "ai-route-test-secret";
process.env.GROQ_API_KEY = "test-groq-key";
process.env.RAG_ENABLED = "true";
process.env.RAG_SERVICE_SECRET = "test-rag-secret";
process.env.RAG_TIMEOUT_MS = "2000";

const aiRoutes = require("./aiRoutes");

const DS_RESULTS = [
  { page: 1, text: "Hashing: value stores at next free slot." },
  { page: 8, text: "Graph Traversal: BFS and DFS." },
  { page: 11, text: "Trees / Binary Tree." },
].map(({ page, text }, index) => ({
  chunk_id: `ds-${index}`,
  text,
  document_id: "ds-u4",
  document_name: "DS U4.pdf",
  page_number: page,
  source_url: null,
  score: 0.5 - index * 0.1,
  metadata: { subject: "Data Structures" },
}));

let ragServer;
let appServer;
let ragRequests;
let ragReply;
let groqRequests;
let groqReply;
const originalHttpsRequest = https.request;

function stubGroq() {
  https.request = (options, onResponse) => {
    assert.equal(options.hostname, "api.groq.com");
    const request = new EventEmitter();
    let body = "";
    request.setTimeout = () => request;
    request.destroy = (error) => request.emit("error", error);
    request.write = (chunk) => {
      body += chunk;
    };
    request.end = () => {
      groqRequests.push(JSON.parse(body));
      const response = new EventEmitter();
      response.statusCode = 200;
      onResponse(response);
      response.emit(
        "data",
        JSON.stringify({ choices: [{ message: { content: groqReply } }] })
      );
      response.emit("end");
    };
    return request;
  };
}

async function chat(message, history = []) {
  const token = jwt.sign({ user: { id: "student-1" } }, process.env.JWT_SECRET);
  const response = await fetch(`http://127.0.0.1:${appServer.address().port}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-auth-token": token },
    body: JSON.stringify({ message, history }),
  });
  return { status: response.status, body: await response.json() };
}

before(async () => {
  ragServer = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      ragRequests.push({ secret: req.headers["x-rag-secret"], body: JSON.parse(body) });
      const { status, payload } = ragReply();
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    });
  });
  await new Promise((resolve) => ragServer.listen(0, "127.0.0.1", resolve));
  process.env.RAG_SERVICE_URL = `http://127.0.0.1:${ragServer.address().port}`;

  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRoutes);
  appServer = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => appServer.once("listening", resolve));
  stubGroq();
});

after(async () => {
  https.request = originalHttpsRequest;
  await new Promise((resolve) => appServer.close(resolve));
  await new Promise((resolve) => ragServer.close(resolve));
});

beforeEach(() => {
  ragRequests = [];
  groqRequests = [];
  ragReply = () => ({
    status: 200,
    payload: { query: "q", rewritten_query: "q", count: DS_RESULTS.length, results: DS_RESULTS },
  });
  groqReply = "Important topics from your notes: hashing [1], graph traversal [2] and binary trees [1, 3].";
});

test("Hinglish Data Structures query is grounded in RAG passages with only cited sources", async () => {
  const { status, body } = await chat("Data Structures ke important topics batao");

  assert.equal(status, 200);
  assert.equal(ragRequests.length, 1);
  assert.equal(ragRequests[0].secret, "test-rag-secret");
  assert.equal(ragRequests[0].body.query, "Data Structures ke important topics batao");

  const [groq] = groqRequests;
  assert.equal(groq.temperature, 0.2);
  const systemPrompt = groq.messages[0].content;
  assert.match(systemPrompt, /\[2\] Source: DS U4\.pdf, page 8\nGraph Traversal: BFS and DFS\./);
  assert.match(systemPrompt, /Build the main answer only from the passages/);
  assert.match(groq.messages[1].content, /^Data Structures ke important topics batao/);
  assert.equal(groq.max_tokens, 1600);
  assert.equal(ragRequests[0].body.top_k, 10);

  assert.match(body.reply, /binary trees \[1\]\[3\]/);
  assert.match(body.reply, /\*\*Sources\*\*/);
  assert.ok(body.reply.includes("- [1] DS U4\\.pdf, p. 1"));
  assert.ok(body.reply.includes("- [2] DS U4\\.pdf, p. 8"));
  assert.ok(body.reply.includes("- [3] DS U4\\.pdf, p. 11"));
  assert.doesNotMatch(body.reply, /not verified/);
});

// Same shape as production DS U4.pdf: nine one-line topic headings, returned in page order.
const DS_U4_FULL = [
  [1, "Trees Binary Tree"],
  [2, "Expression Tree"],
  [3, "Array Representation of Binary Tree"],
  [4, "Linked List Representation of Binary Tree Tree Traversal"],
  [5, "Binary Search Tree"],
  [6, "Graphs Sequential Representation"],
  [8, "Graph Traversal"],
  [9, "Hashing"],
  [11, "Value stores at next free slot."],
].map(([page, text], index) => ({
  chunk_id: `ds-full-${index}`,
  text,
  document_id: "ds-u4",
  document_name: "DS U4.pdf",
  page_number: page,
  source_url: null,
  score: 0.1,
  metadata: { subject: "Data Structures", study_year: 1 },
}));

test("structured notes answer keeps every DS U4 passage aligned with its page", async () => {
  ragReply = () => ({
    status: 200,
    payload: { query: "q", rewritten_query: "q", count: DS_U4_FULL.length, results: DS_U4_FULL },
  });
  groqReply = [
    "### Data Structures — Notes mein covered topics",
    "**1. Trees**",
    "- Binary Tree [1], Expression Tree [2]",
    "- Representation: array [3] aur linked list [4]; Tree Traversal [4]",
    "- Binary Search Tree [5]",
    "**2. Graphs**",
    "- Sequential Representation [6], Graph Traversal [7]",
    "**3. Hashing**",
    "- Hashing [8]; notes mein likha hai value next free slot mein store hoti hai [9]",
    "### General explanation (not verified from college notes)",
    "- BST: left subtree mein chhoti values hoti hain.",
    "### Quick Revision",
    "- Trees [1-5], Graphs [6, 7], Hashing [8][9]",
    "### Sources",
    "- DS U4.pdf, p. 12",
  ].join("\n");

  const { body } = await chat("Data Structures ke important topics batao");

  const systemPrompt = groqRequests[0].messages[0].content;
  DS_U4_FULL.forEach((result, index) => {
    assert.ok(
      systemPrompt.includes(`[${index + 1}] Source: DS U4.pdf, page ${result.page_number}\n${result.text}`),
      result.text
    );
  });
  assert.match(body.reply, /### General explanation \(not verified from college notes\)\n- BST: left subtree/);
  assert.match(body.reply, /Trees \[1\]\[2\]\[3\]\[4\]\[5\], Graphs \[6\]\[7\]/);
  assert.ok(!body.reply.includes("p. 12"), "model-written source list must be dropped");

  const sources = body.reply.split("**Sources**\n\n")[1].split("\n");
  assert.deepEqual(sources, [
    "- [1] DS U4\\.pdf, p. 1",
    "- [2] DS U4\\.pdf, p. 2",
    "- [3] DS U4\\.pdf, p. 3",
    "- [4] DS U4\\.pdf, p. 4",
    "- [5] DS U4\\.pdf, p. 5",
    "- [6] DS U4\\.pdf, p. 6",
    "- [7] DS U4\\.pdf, p. 8",
    "- [8] DS U4\\.pdf, p. 9",
    "- [9] DS U4\\.pdf, p. 11",
  ]);
});

test("grounded prompt forbids unsupported generic topics and asks for insufficiency notes", async () => {
  await chat("Data Structures ke important topics batao");
  const systemPrompt = groqRequests[0].messages[0].content;

  assert.match(systemPrompt, /If a common topic of the subject is missing from the passages, do not list it\./);
  assert.match(systemPrompt, /the available notes do not establish the rest/);
  assert.match(systemPrompt, /Never put \[n\] markers in that section/);
  assert.match(systemPrompt, /a Hinglish question gets a natural Hinglish answer/);
  assert.match(systemPrompt, /LANGUAGE: The student's question is in Hinglish/);
  assert.equal(
    groqRequests[0].messages[1].content,
    "Data Structures ke important topics batao\n\n(Hinglish mein jawab do.)"
  );
});

test("English college questions get no Hinglish language hint", async () => {
  await chat("Data Structures important topics");

  assert.doesNotMatch(groqRequests[0].messages[0].content, /LANGUAGE:/);
  assert.equal(groqRequests[0].messages[1].content, "Data Structures important topics");
});

test("uncited passages are not listed as sources", async () => {
  groqReply = "Graph traversal is covered [2].";
  const { body } = await chat("Data Structures");

  assert.ok(body.reply.includes("- [2] DS U4\\.pdf, p. 8"));
  assert.ok(!body.reply.includes("p. 1"));
  assert.ok(!body.reply.includes("p. 11"));
});

test("general questions skip RAG and keep the normal Groq chat", async () => {
  for (const message of ["Hello, how are you?", "Tell me a joke"]) {
    groqReply = "Hi there!";
    const { status, body } = await chat(message);

    assert.equal(status, 200, message);
    assert.equal(body.reply, "Hi there!", message);
  }
  assert.equal(ragRequests.length, 0);
  assert.equal(groqRequests[0].temperature, 0.7);
  assert.equal(groqRequests[0].max_tokens, 800);
  assert.equal(groqRequests[1].messages[1].content, "Tell me a joke");
  assert.doesNotMatch(groqRequests[0].messages[0].content, /college-document passages/);
});

test("college query with zero RAG results is labelled as unverified", async () => {
  ragReply = () => ({
    status: 200,
    payload: { query: "q", rewritten_query: "q", count: 0, results: [] },
  });
  groqReply = "I could not find hostel fee details.";
  const { body } = await chat("What is the NIT Raipur hostel fee for 2027?");

  assert.equal(ragRequests.length, 1);
  assert.match(groqRequests[0].messages[0].content, /did not verify it/);
  assert.match(body.reply, /^_I could not find this in the approved Sahyog college documents/);
  assert.doesNotMatch(body.reply, /\*\*Sources\*\*/);
});

test("RAG failure still answers but says the knowledge base was unreachable", async () => {
  ragReply = () => ({ status: 503, payload: { detail: "down" } });
  groqReply = "General answer.";
  const { status, body } = await chat("Maths II ke first year PYQ batao");

  assert.equal(status, 200);
  assert.match(groqRequests[0].messages[0].content, /did not verify it/);
  assert.match(body.reply, /^_The Sahyog college knowledge base could not be reached/);
  assert.doesNotMatch(body.reply, /\*\*Sources\*\*/);
});

test("follow-up questions send college history to RAG", async () => {
  await chat("what about trees?", ["Data Structures ke important topics batao"]);

  assert.equal(ragRequests.length, 1);
  assert.deepEqual(ragRequests[0].body.history, ["Data Structures ke important topics batao"]);
});
