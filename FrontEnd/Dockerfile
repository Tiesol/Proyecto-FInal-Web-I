FROM nginx:alpine

# Eliminar el index.html por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar archivos del frontend
COPY . /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
