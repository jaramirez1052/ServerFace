<?php
// Ruta de Trabajo
$repo_dir = 'FacialSystem-alpha-server';

// Ejecutar los comandos de Git para actualizar
exec("cd $repo_dir && git pull");

// Instalar dependencias 
exec("cd $repo_dir && npm install"); 

// Reiniciar el servicio usando PM2
exec("cd $repo_dir && pm2 restart ecosystem.config.js");

echo 'Cambios Cargados Correctamente';

?>