FROM nginx:1.27-alpine

COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY apps/ui/ /usr/share/nginx/html/

EXPOSE 80
