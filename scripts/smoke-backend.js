const baseUrl = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

const checks = [
  { name: 'health', path: '/api/v1/health' },
  { name: 'root', path: '/' },
];

async function run() {
  let failed = 0;

  for (const check of checks) {
    const url = `${baseUrl}${check.path}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        failed += 1;
        console.error(`[FAIL] ${check.name} -> ${res.status}`);
        continue;
      }
      console.log(`[PASS] ${check.name} -> ${res.status}`);
    } catch (error) {
      failed += 1;
      console.error(`[FAIL] ${check.name} -> ${error.message}`);
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();
