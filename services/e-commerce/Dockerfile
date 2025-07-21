# Use a specific Node.js version suitable for Medusa
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and the package-lock.json (if available)
COPY package*.json ./

# Install dependencies using npm
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the default Medusa port
EXPOSE 9000

# Run the development server using npm
CMD ["npm", "run", "develop"]
