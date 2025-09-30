FROM node:18
WORKDIR /app
COPY my-react-app/package*.json ./
RUN npm install
COPY my-react-app ./
EXPOSE 3000
CMD ["npm", "start"]
