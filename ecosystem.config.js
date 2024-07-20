module.exports = {
  apps: [
    {
      name: "WEB_AUTHN",
      script: "node dist/index.js",
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      env_testing: {
        NODE_ENV: "testing",
      },
    },
  ],
};
