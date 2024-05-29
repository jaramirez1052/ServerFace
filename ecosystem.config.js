module.exports = {
    apps: [
        {
            name: "facial-system-app",
            script: "./app.js",
            watch: false,
            max_memory_restart: "1G",
            instances: "max",
            exec_mode: "cluster",
            kill_timeout: 3000,

            env: {
                NODE_ENV: "development"
            },
            env_production: {
                NODE_ENV: "production",
                PORT: process.env.PORT || 4010
            }
        }
    ]
};