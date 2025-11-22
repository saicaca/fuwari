FROM node:lts

WORKDIR /yaml-language-server

COPY . .

RUN yarn install && \
    yarn run build

ENTRYPOINT [ "node", "./out/server/src/server.js" ]
CMD [ "--stdio" ]
