const baseUrl = process.env.LOAD_TEST_BASE_URL || 'http://localhost:3000';
const path = process.env.LOAD_TEST_PATH || '/api/v1/health';
const iterations = Number(process.env.LOAD_TEST_ITERATIONS || 100);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY || 10);

async function hit(url) {
  const started = Date.now();
  const res = await fetch(url);
  return { ok: res.ok, status: res.status, ms: Date.now() - started };
}

async function run() {
  const url = `${baseUrl}${path}`;
  let total = 0;
  let failed = 0;
  let slow = 0;
  const thresholdMs = 1000;
  const workers = [];
  let cursor = 0;

  for (let i = 0; i < concurrency; i += 1) {
    workers.push(
      (async () => {
        while (cursor < iterations) {
          const current = cursor;
          cursor += 1;
          if (current >= iterations) break;
          const result = await hit(url);
          total += 1;
          if (!result.ok) failed += 1;
          if (result.ms > thresholdMs) slow += 1;
        }
      })()
    );
  }

  await Promise.all(workers);
  console.log(`Requests: ${total}`);
  console.log(`Failed: ${failed}`);
  console.log(`Slow(>${thresholdMs}ms): ${slow}`);
  console.log(`FailureRate: ${((failed / Math.max(total, 1)) * 100).toFixed(2)}%`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
