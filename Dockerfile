FROM node:lts-slim AS runtime
WORKDIR /app

# Copy the files needed to install packages.
COPY package.json .
COPY package-lock.json .

# Perform a fresh installation of npm dependencies.
RUN npm ci

# Copy the rest of your application files.
COPY . .
# Build your application.
RUN npm run build

# Set environment variables and expose the appropriate port.
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Define the command to run your application.
CMD ["/bin/sh", "-c", "ls -a && node ./dist/server/entry.mjs"]
# CMD ls && node ./dist/server/entry.mjs