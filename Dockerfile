# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages and sharp's dependencies
RUN apt-get update && apt-get install -y \
    libvips-dev \
 && rm -rf /var/lib/apt/lists/*

RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the app
RUN npm run build

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Define the command to run the app
CMD npm run start:docker