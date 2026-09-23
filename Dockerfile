FROM nginx:alpine

COPY certs/weathr.crt /etc/nginx/certs/weathr.crt
COPY certs/weathr.key /etc/nginx/certs/weathr.key
COPY weather-app.html /usr/share/nginx/html/index.html
COPY sw.js /usr/share/nginx/html/sw.js
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443 80
