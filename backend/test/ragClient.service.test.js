const test = require("node:test");
const assert = require("node:assert/strict");

const rag = require("../services/ragClient.service");

test("grounded prompts and browser citations use the same bounded sources", () => {
  const results = Array.from({ length: 5 }, (_, index) => ({
    document_name: `Long source name ${index} ${"x".repeat(160)}`,
    page_number: index + 1,
    source_url: null,
    score: 0.1,
    text: String(index).repeat(1800),
    metadata: {},
  }));
  const selected = rag.selectContextResults(results);
  const messages = rag.buildGroundedMessages({
    question: "What does the document say?",
    results: selected,
  });
  const sources = rag.toClientSources(selected);
  const context = messages[0].content;

  assert.ok(selected.length > 0);
  assert.ok(selected.length < results.length);
  assert.equal(sources.length, selected.length);
  assert.deepEqual(
    sources.map((source) => source.id),
    selected.map((_, index) => index + 1)
  );
  assert.ok(context.includes(`[${sources.length}] Source:`));
  assert.ok(!context.includes(`[${sources.length + 1}] Source:`));
});
