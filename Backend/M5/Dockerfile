# Use the official Node.js image as a base image
FROM node:16

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose the port that your application will run on
EXPOSE 3000

# Command to run your Node.js script
CMD ["node", "MON-1.js"]
