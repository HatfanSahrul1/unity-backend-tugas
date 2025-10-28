FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json (and package-lock.json if it exists)
COPY package.json ./
COPY package-lock.json* ./

# Install dependencies including dev dependencies
RUN npm install --include=dev

# Copy the rest of the application
COPY . .

EXPOSE 5000
CMD ["npm", "run", "dev"]
