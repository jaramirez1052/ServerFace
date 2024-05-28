# FacialSystem-JavaScript

[![Licencia GPL v3](https://img.shields.io/badge/Licencia-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Sistema de reconocimiento facial desarrollado en Node-Js, autenticación de usuarios y alertas de autenticación utilizando la librería 'Face-api.js' y 'TensorFlow.js'. Este proyecto permite registrar usuarios, capturar sus datos faciales y autenticarlos comparando sus rostros en tiempo real con los datos almacenados en una base de datos MongoDB.

## Características principales

* **Registro de usuarios:** Captura imágenes faciales y almacena descriptores faciales únicos en MongoDB.
* **Autenticación en tiempo real:** Compara rostros capturados por la cámara con los datos almacenados para autenticar usuarios.
* **Alertas de autenticación:** Proporciona feedback visual al usuario sobre el éxito o fracaso de la autenticación.
* **Interfaz de usuario intuitiva:** Facilita el registro y la autenticación a través de una interfaz web amigable.
* **Basado en tecnologías modernas:** Utiliza Node.js, Express, MongoDB, TensorFlow.js y Face-api.js para un desarrollo eficiente y escalable.

## Tecnologías utilizadas

* **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
* **TensorFlow.js:** Biblioteca de aprendizaje automático para JavaScript que permite ejecutar modelos de reconocimiento facial en el navegador.
* **Express:** Framework web minimalista para Node.js que facilita la creación de servidores y APIs.
* **MongoDB:** Base de datos NoSQL flexible y escalable para almacenar datos faciales y de usuarios.
* **Face-api.js:** Implementación de JavaScript de modelos de reconocimiento facial de última generación basados en TensorFlow.js.

## Cómo empezar

### Prerrequisitos

* **Node.js y npm (o yarn):** Asegúrate de tener Node.js (versión 12 o superior recomendada) y npm (o yarn) instalados en tu sistema. Puedes descargarlos desde [https://nodejs.org/](https://nodejs.org/).
* **Git:** Necesario para clonar el repositorio. Puedes descargarlo desde [https://git-scm.com/](https://git-scm.com/).
* **MongoDB (Local):** Debes tener MongoDB instalado y en ejecución en tu sistema. Si no lo tienes, puedes descargarlo e instalarlo desde [https://www.mongodb.com/](https://www.mongodb.com/).

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/JohanRengifo/FacialSystem-Js.git
    ```
2. **Instala las Dependencias:**
    ```bash
    npm install
    ```
3. **Configurar la Base de Datos (MongoDB):**
    - Crea una base de datos llamada 'facial_auth'
    - Crea una colección llamada 'users' para almacenar los datos de los usuarios (incluyendo sus descriptores faciales).

4. **Configura las variables de entorno:**
    - Crea un archivo .env en la raíz del proyecto.
    - Agrega las siguientes variables:
    ```bash
    MONGODB_URI= mongodb://localhost:27017/facial_auth   #Base de datos Local
    MONGODB_URI= mongodb+srv://@Cluster #Base de datos Online
    PORT=3000  # O el puerto que desees usar (Local)
    ```

> [!WARNING]
> Recuerda que si Ejecutas en Producción y haces uso de un Servidor, Habilita Un puerto publico, para que el Front-end Pueda Ejecutarse, y configura ese puerto en el '.env'.

5. **Ejecuta**
    ```bash
    pm2 start server.js #Ejecucion en Producción
    npm run dev # Ejecucion de Desarollo
    ```
    

> [!IMPORTANT]
> Ten en cuenta que si Ejecutas la App en un servidor, Te recomiendo Hacerlo con 'PM2' para que se ejcute incluso si la Conexión con el servidor se cierra.

De forma Local iniciará un servidor Express. Para ingresar a este abre tu navegador y visita http://localhost:3000 (o el puerto que hayas configurado) para acceder a la interfaz de usuario del sistema, en caso que sea un desarollo Local. De lo contrario la dirección IP y el Puerto que especificaste en tu Servidor.

# ¿Como usar?
En los siguientes Items Se explicara como funciona cada proceso de la App. de forma Sencilla e intuitiva.

### Registro de usuarios:

* Se Accede a la sección de registro en la interfaz de usuario.
* Se tiene que permitir el acceso a la cámara para la deteccion del rostro.
* Proporciona tus datos personales (Nombre, Correo electrónico, Telefoto.).
* Haz clic en "Registrar" para almacenar tus datos y descriptor facial en la base de datos.

### Autenticación:

* El sistema comparará tu rostro con los almacenados en la base de datos de Forma Automatica.
* Si hay una coincidencia, se te autenticará y se te mostrará una alerta de éxito.
* Si no hay coincidencia, se te mostrará una alerta de error.

### Eliminación de Usuarios (Beta Versión)

* El Usuario a ser eliminado tendra que autenticarse, y en el mismo proceso de Autenticación Seleccionar el Boton de Eliminar Usuario.
* El sistema Enviara la Petición Al Backend y este tardara en Procesar de 5 a 15 Minutos dicha Petición.
* Una vez Pasado este tiempo, El usuario eliminado ya no se encontrara en Ningun Registro de Acceso.


## Estructura de Carpetas

- 📁 frontend
    - 📁 Public
      - 📁 auth
        - 📄 authController.js
        - 📄 authRoutes.js
        - 📄 authMiddleware.js
        - 📄 userModel.js        
        - 📁 db
          - 📄 conn.js
      - 📁 js
        - 📄 main.js
        - 📄 face-detection.js
        - 📄 face-api.min.js
      - 📁 style
        - 📄 style.css
      - 📁 models
      - 📁 images
        - 📄 camara_slip.png
    - 📄 index.html
- 📁 Backend
  - 📄 Server.js
  - 📁 Uploads

# API Endpoints 

Manejo de las Rutas en la App

### Crea un nuevo usuario.

```http
  POST /api/users
```

* URL: /api/users
* Método: POST
- Headers: Content-Type: multipart/form-data
* Body:
  ```json
  { 
    "name": "FullName",
    "email": "name@University.edu.co",
    "phone": "+57310123123",
    "image": "BlobImage",
   }
  ```
* Respuesta Exitosa
  * Código: 201 Created
   ```js
  { "message": "Usuario creado exitosamente" }
  ```
* Respuesta Fallida:
  * Código: 400 Bad Request
  ```js
  { "error": "Todos los campos son obligatorios" }
  ```
* Código: 500 Internal Server Error
  ```js
  { "error": "Error al crear el usuario" }
  ```

## Reconocimiento Facial

Reconoce a un usuario basado en la imagen proporcionada.

```http
  POST /api/recognize
```

* URL: /api/recognize
* Método: POST
* Headers: Content-Type: application/json
Body:
 ```json
  { 
    "descriptor": "FacialPoints"
  }
  ```
* Respuesta Exitosa:
  * Código: 200 OK
  ```json
    {
      "recognized": true,
      "user": {
          "name": "FullName",
          "email": "name@University.edu.co",
          "phone": "+57310123123"
      }
    }
  ```
* Respuesta Fallida:
  * Código: 200 OK
  ```js
  { "recognized": false }
  ```
* Código: 500 Internal Server Error
  ```js
   { "error": "Error en la solicitud de reconocimiento facial" }
  ```

## Eliminación de Usuarios

Elimina un usuario basado en su nombre.

  ```http
  DELETE /api/users/:name
  ```

* URL: /api/users/:name

* Método: DELETE

* Parámetros de URL:

  ```json
   { "name": "FullName" }
  ```

* Respuesta Exitosa:

  * Código: 200 OK

  ```js
   { "message": "Usuario eliminado exitosamente" }
  ```

* Respuesta Fallida:

  * Código: 404 Not Found

  ```js
    { "error": "Usuario no encontrado" }
  ```

  * Código: 500 Internal Server Error

  ```js
    { "error": "Error al eliminar el usuario" }
  ```

  ## Configuración del Servidor

  ### Dependencias

  ```json
    {
      "dependencies": {
        "express": "^4.17.1",
        "cors": "^2.8.5",
        "dotenv": "^10.0.0",
        "path": "^0.12.7",
        "mongoose": "^5.13.8",
        "morgan": "^1.10.0",
        "multer": "^1.4.3"
      }
    }
  ```

  ### Configuración de CORS

```js
  const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
```

  ### Conexión a la Base de Datos

  ```js
  const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error.message);
        process.exit(1);
      } 
  };
  ```

  ### Middleware para Manejo de Errores

  ```js
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({ error: err.message || 'Internal Server Error' });
  });
  ```

  ### Inicio del Servidor

  ```js
    const startServer = async () => {
      try {
          await connectDB(process.env.MONGODB_URI);
          console.log('Conectado a MongoDB');
          app.listen(PORT, () => {
              console.log(`Servidor corriendo en http://localhost:${PORT}`);
          });
        } catch (err) {
            console.error('Error al iniciar el servidor o conectar a MongoDB:', err.message);
            process.exit(1);
        }
      };

startServer();
  ```

## Contribuciones
¡Las contribuciones son bienvenidas! Por favor, abre un issue o envía un pull request si encuentras algún error o quieres mejorar el proyecto.

## Licencia
Este proyecto está bajo la Licencia GNU General Public License v3.0. Consulta el archivo LICENSE para más detalles.