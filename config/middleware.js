module.exports = (app) => {
    // Manejar rutas no encontradas
    app.use((req, res, next) => {
      const error = new Error("Ruta no encontrada");
      error.status = 404;
      next(error);
    });
  
    // Manejar errores generales
    app.use((err, req, res, next) => {
      const status = err.status || 500;
      const message = err.message || "Error interno del servidor";
      const isDevelopment = process.env.NODE_ENV === "development";
  
      // Registrar el error en la consola
      console.error(err); 
  
      res.status(status).json({
        error: {
          message,
          ...(isDevelopment ? { stack: err.stack } : {}),
        },
      });
    });

    // Manejar errores no controlados
    process.on('uncaughtException', (err) => {
      console.error('Excepción no controlada:', err);
      process.exit(1); // Salir del proceso con código de error
    });
  
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Rechazo no manejado:', reason);
      process.exit(1); // Salir del proceso con código de error
    });
};