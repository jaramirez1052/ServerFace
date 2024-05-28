module.exports = (app) => {
    // 404 (Not Found)
    app.use((req, res, next) => {
        const error = new Error("Ruta no encontrada");
        error.status = 404;
        next(error);
    });

    // Errores general
    app.use((err, req, res, next) => {
        const status = err.status || 500;
        const message = err.message || "Error interno del servidor";

        console.error(err);

        res.status(status).json({
            error: {
                message: message,
                ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
            },
        });
    });
};
