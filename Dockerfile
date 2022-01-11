FROM node:14

WORKDIR  /app

COPY package*.json ./

COPY tsconfig.json ./

RUN ls -a

ARG NODE_ENV

# RUN if [ "${NODE_ENV}" = "development" ]; \
#           then npm install; \
#           else npm install --only=production; \
#           fi
RUN npm install 

COPY . . 

RUN npm run build

EXPOSE  3000

CMD ["npm", "run" 'start']

