FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma client
RUN npm ci --only=production
RUN npx prisma generate

# Copy source code
COPY src/ ./src/

EXPOSE 3001

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"] 