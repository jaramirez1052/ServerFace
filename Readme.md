# FacialSystem | Server App

[![Licencia GPL v3](https://img.shields.io/badge/Licencia-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Este sistema permite registrar usuarios con sus datos personales y una imagen de referencia. Posteriormente, permite validar la identidad de un usuario a través de su rostro, utilizando reconocimiento facial.

## Requisitos

* ***Node.js*** y npm (o yarn)
* ***MongoDB*** (con una base de datos creada)
* ***face-api.js*** (y sus modelos)

## Instalación

1. Clonar este repositorio:

   ```bash
   git clone https://github.com/JohanRengifo/FacialSystem-alpha-server.git
   ```

2. Instalar Dependencias:

  ```bash
  npm install
  ```

3. Configurar variables de entorno:

* Crear un archivo .env en la raíz del proyecto.
* Agregar las siguientes variables:

  ```bash
  MONGODB_URI=mongodb+srv...
  PORT=4010
  NODE_ENV=development 
  CORS_ORIGIN=http://IP:PORT  
  UPLOAD_DIR=uploads
  ```

4. Iniciar el servidor

  ```bash
  npm run dev o npm start
  ```

# Endpoints de la API

## Usuarios

* *GET* /usuarios: Obtiene una lista de todos los usuarios (sin los descriptores faciales).
* *GET* /usuario/:cc: Obtiene los datos de un usuario específico por su número de cédula.
* *POST* /usuario: Crea un nuevo usuario. Requiere los siguientes datos en el cuerpo de la petición (formato JSON) y una imagen en formato multipart/form-data:
  * **nombreCompleto** (string)
  * **correoInstitucional** (string)
  * **telefono** (string)
  * **cc** (string)
  * **imagen** (archivo)
* *DELETE* ***/usuario/:cc***: Elimina un usuario por su número de cédula.

## Validación Facial

* *POST* ***/validar***: Valida si un rostro coincide con alguno de los usuarios registrados. Requiere un array de descriptores faciales en el cuerpo de la petición (formato JSON):
  * **descriptors** (array de números)

## Funcionamiento

### Registro

* El cliente envía una imagen del rostro del usuario junto con sus datos personales.
* El servidor extrae los descriptores faciales de la imagen utilizando face-api.js.
* Los datos del usuario y sus descriptores se almacenan en la base de datos MongoDB.

### Validación

* El cliente envía un array de descriptores faciales obtenidos de una nueva imagen.
* El servidor compara estos descriptores con los almacenados en la base de datos.
* Si la distancia entre los descriptores es menor a un umbral (0.6 en este caso), se considera una coincidencia y se devuelve la información del usuario.

## Protocolos y Tecnologías

* **Backend**: Node.js, Express.js
* **Base de Datos**: MongoDB
* **Reconocimiento Facial**: face-api.js
* **Almacenamiento de Imágenes**: Sistema de archivos local (directorio uploads)
* **Comunicación**: HTTP (JSON)
