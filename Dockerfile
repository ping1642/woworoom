FROM alpine:3.14
WORKDIR /var/www/localhost/htdocs
RUN apk --update add apache2
RUN rm -rf /var/cache/apk/*
COPY ./index.html ./
COPY ./admin.html ./
COPY ./css ./css
COPY ./js ./js
COPY ./images ./images
ENTRYPOINT ["httpd","-D","FOREGROUND"]
