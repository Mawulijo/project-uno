FROM node:lts-slim AS runtime
WORKDIR /app

# Ensure that both node_modules and package-lock.json are removed.
COPY package.json .
RUN rm -rf node_modules package-lock.json

# Perform a fresh installation of npm dependencies.
RUN npm install

# Copy the rest of your application files.
COPY . .
# pocketbase.railway.internal
# pojectuno-pb.up.railway.app

# Build your application.
RUN npm run build || true

# Set environment variables and expose the appropriate port.
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Define the command to run your application.
CMD ls && node ./dist/server/entry.mjs
# CMD ["node", "./dist/server/entry.mjs"]