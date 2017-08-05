FROM node:latest

# WORKDIR /usr/src/
RUN git clone https://github.com/plzpeacez/SoYeonDiscord.git
RUN cd SoYeonDiscord

WORKDIR /SoYeonDiscord
ADD ./config.json /SoYeonDiscord/

RUN npm install

# Bundle app source
# COPY . /usr/src/app

# EXPOSE 3001
CMD [ "node", "app.js" ]

#$ docker build -t <your username>/node-web-app .
#$ docker build -t plzpeacez/node-discord .

#$ docker run -p 49160:8080 -d <your username>/node-web-app
#$ docker run --name node --restart unless-stopped -dit plzpeacez/node-discord