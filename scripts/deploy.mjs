#!/usr/bin/env node
/**
 * Deploy Călimara from any machine that has this repo + Node.
 *
 *   npm run deploy              # frontend (Cloudflare Pages) + Edge Functions
 *   npm run deploy -- --web     # Pages only
 *   npm run deploy -- --functions
 *
 * Reads .secrets/credentials.env (tracked). Needs network + the tokens in that file.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CREDS = path.join(ROOT, '.secrets', 'credentials.env');

function loadEnv(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
  const out = {};
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const i = t.indexOf('=');
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

function run(cmd, args, env) {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const args = process.argv.slice(2);
const webOnly = args.includes('--web');
const fnOnly = args.includes('--functions');
const doWeb = !fnOnly;
const doFn = !webOnly;

const creds = loadEnv(CREDS);
const need = (key) => {
  if (!creds[key]) throw new Error(`${key} missing in .secrets/credentials.env`);
  return creds[key];
};

const env = {
  CLOUDFLARE_API_TOKEN: need('CLOUDFLARE_API_TOKEN'),
  CLOUDFLARE_ACCOUNT_ID: need('R2_ACCOUNT_ID'),
  SUPABASE_ACCESS_TOKEN: creds.SUPABASE_ACCESS_TOKEN || '',
};

if (doWeb) {
  run('npm', ['run', 'build'], env);
  run('npx', [
    'wrangler', 'pages', 'deploy', 'dist',
    '--project-name=calimara',
    '--branch=main',
    '--commit-dirty=true',
  ], env);
  console.log('\nPages deploy done → https://calimara.online');
}

if (doFn) {
  if (!env.SUPABASE_ACCESS_TOKEN) {
    console.error(`
Edge Functions were skipped: SUPABASE_ACCESS_TOKEN is empty in .secrets/credentials.env

Create one at https://supabase.com/dashboard/account/tokens
Paste it as SUPABASE_ACCESS_TOKEN=sbp_... in that file, commit, then re-run:

  npm run deploy -- --functions
`);
    process.exit(doWeb ? 0 : 1);
  }
  const ref = need('SUPABASE_PROJECT_REF');
  for (const name of ['admin-create-user', 'transcribe-story-pages']) {
    const dir = path.join(ROOT, 'supabase', 'functions', name);
    if (!fs.existsSync(dir)) {
      console.log(`skip ${name} (folder missing)`);
      continue;
    }
    run('npx', ['supabase', 'functions', 'deploy', name, `--project-ref=${ref}`], env);
  }
  console.log('\nEdge Functions deploy done.');
}

console.log('\nAll requested deploy steps finished.');
