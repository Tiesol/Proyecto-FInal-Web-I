# Payment Gateway Project

Este proyecto implementa un gateway de pagos simulado utilizando Node.js y Express. Permite procesar pagos, consultar su estado y recibir confirmaciones de pago a través de webhooks.

## Instrucciones de uso

### 1. Configurar un Dev Tunnel 

Para exponer localmente el servicio del Gateway se puede ser el Port Forwarding de Visual Studio Code o utilizar una herramienta como [ngrok](https://ngrok.com/).

En este caso, se necesita exponer el puerto `3000` para que el servicio sea accesible externamente.

Luego de iniciar el túnel, este debe configurarse como público y se debe actualizar la variable de entorno `PUBLIC_URL` en el archivo `.env` del proyecto Gateway con la URL pública generada por ngrok o el túnel.

### 2. Iniciar la aplicacion con Docker Compose

Desde la raíz del proyecto, ejecutar:

```bash
docker-compose up --build
``` 

Esto iniciará los contenedores para la base de datos MySQL, el Gateway API y la Example Client App.

En caso de que el Gateway no inicie trate de inidicarlo manualmente o revise los logs para más detalles.

### 3. Acceder a la Example Client App

Abrir un navegador y navegar a `http://localhost:3001` para acceder a la aplicación cliente de ejemplo. Desde allí se pueden crear pagos y consultar su estado.

### 4. Acceder a la Billetera Digital implementada dentro del Gateway

Abrir desde un dispositivo movil la URL generada por el Dev Tunnel (ngrok u otro) para acceder a la interfaz de pago y simular la confirmación del pago.