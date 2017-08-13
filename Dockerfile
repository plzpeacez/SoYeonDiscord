FROM node:latest

# WORKDIR /usr/src/
RUN git clone https://github.com/plzpeacez/SoYeonDiscord.git
RUN cd SoYeonDiscord

WORKDIR /SoYeonDiscord
ADD ./config.json /SoYeonDiscord/stable/
ADD ./appid.json /SoYeonDiscord/wg/
ADD ./apikey.json /SoYeonDiscord/osu/

RUN npm install

# Bundle app source
# COPY . /usr/src/app

# EXPOSE 3001
WORKDIR /SoYeonDiscord/stable
CMD [ "node", "launch.js" ]

#$ docker build --no-cache -t <your username>/node-web-app .
#$ docker build --no-cache -t plzpeacez/node-discord .

#$ docker run -p 49160:8080 -d <your username>/node-web-app
#$ docker run --name node --restart unless-stopped -dit plzpeacez/node-discord