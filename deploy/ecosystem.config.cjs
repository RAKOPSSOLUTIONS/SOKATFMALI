// PM2 process file for SOKATF MALI.
// Run from the repo root:  pm2 start deploy/ecosystem.config.cjs
//
// Only the Next.js backend needs a long-running process — the Astro front is a
// static build served directly by nginx (see deploy/nginx/sokatf.com.conf).
//
// Port 4100 must be free on the VPS. Verify with:  ss -ltnp | grep ':4100'

module.exports = {
  apps: [
    {
      name: "sokatf-api",
      cwd: "./apps/api",
      // Run Next's own binary so the port comes from PORT (below), not the
      // package.json dev script.
      script: "./node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
        PORT: 4100,
      },
    },

    // --- OPTIONAL: only if you run the front as a node process instead of
    // --- serving the static build from nginx (requires @astrojs/node adapter).
    // {
    //   name: "sokatf-web",
    //   cwd: "./apps/web",
    //   script: "./dist/server/entry.mjs",
    //   env: { NODE_ENV: "production", HOST: "127.0.0.1", PORT: 4200 },
    // },
  ],
};
