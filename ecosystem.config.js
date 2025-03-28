module.exports = {
  apps: [{
    name: "91club",
    script: "npx babel-node src/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};