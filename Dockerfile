FROM node:latest

# WORKDIR /usr/src/
RUN git clone https://github.com/plzpeacez/SoYeonDiscord.git
RUN cd SoYeonDiscord

WORKDIR /SoYeonDiscord
ADD ./SoYeon.json /SoYeonDiscord/soyeon/
ADD ./appid.json /SoYeonDiscord/wg/

RUN npm install

# Bundle app source
# COPY . /usr/src/app

# EXPOSE 3001
RUN cd soyeon
CMD [ "node", "soyeon.js" ]

#$ docker build --no-cache -t <your username>/node-web-app .
#$ docker build --no-cache -t plzpeacez/node-discord .

#$ docker run -p 49160:8080 -d <your username>/node-web-app
#$ docker run --name node --restart unless-stopped -dit plzpeacez/node-discord