# provide node version
FROM node:16.13
# set current location
WORKDIR /usr/src/app
# copy everything in this location to our workdir in docker
COPY . .
# install all dependencies
RUN npm install && npm install ts-node -g
# build the application
RUN npm run build
# set container port?
EXPOSE 3003
# give it a file to start on
ENTRYPOINT ["ts-node", "./src/server/server.ts"]
#
# docker build -t [org]/prod .
# docker run -d --name CNC-PGH-PROD -p 3002:3003 [org]/prod
#
# if the build hangs after npm run build completes, ensure that
# BundleAnalyzerPlugin is commented out in webpack