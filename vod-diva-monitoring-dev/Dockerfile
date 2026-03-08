FROM harbor.rtbf.be/library/nginx:1.17.8-alpine
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]