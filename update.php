<?php
// Ruta de Trabajo
$repo_dir = 'FacialSystem-alpha-server';

// Leer los datos del cuerpo de la solicitud POST
$data = json_decode(file_get_contents('php://input'), true);

// Verificar si se trata de un evento "push"
if ($data['ref'] === 'refs/heads/main') { 
    // Ejecutar los comandos de Git para actualizar
    exec("cd $repo_dir && git pull");

    // Instalar dependencias
    exec("cd $repo_dir && npm install");

    // Reiniciar el servicio usando PM2
    exec("cd $repo_dir && pm2 restart ecosystem.config.js");

    // Enviar una respuesta al webhook
    http_response_code(200); // Código de éxito
    echo json_encode(array('message' => 'Actualización exitosa'));
} else {
    // Enviar una respuesta si no es un evento "push" a main
    http_response_code(202); // Código de aceptación
    echo json_encode(array('message' => 'No se requiere actualización'));
}
?>