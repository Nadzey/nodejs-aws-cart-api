# Use official Node.js 20 Alpine base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the project (for TypeScript projects)
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["node", "dist/src/lambda.js"]