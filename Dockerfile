FROM harbor.rtbf.be/library/nginx:1.17.8-alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY ./nginx.proxy_params /etc/nginx/proxy_params
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]