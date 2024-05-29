module.exports = {
    apps: [
        {
            name: "server-app",
            script: "./app.js",
            watch: true,
            max_memory_restart: '1000M',
            instances: 1,
            cron_restart: "59 23 * * *",
            env: {
                NODE_ENV: "production",
            },
            env_production: {
                NODE_ENV: "production",
            }
        }
    ]
}