# provide node version
FROM node:16.13
# set current location
WORKDIR /usr/src/app
# copy everything in this location to our workdir in docker
COPY . .
# install all dependencies
RUN npm install && npm install ts-node -g
# build the application
RUN --mount=type=secret,id=PG_URI \
    --mount=type=secret,id=TESTVAL \
    export PG_URI=$(cat /run/secrets/PG_URI) && \
    export TESTVAL=$(cat /run/secrets/TESTVAL) && \
    npm run build
# set container port?
EXPOSE 3003
# give it a file to start on
ENTRYPOINT ["ts-node", "./src/server/server.ts"]
#
# if the build hangs after npm run build completes, ensure that
# BundleAnalyzerPlugin is commented out in webpack