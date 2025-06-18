FROM node:18-alpine

# Argumenty przekazane z docker-compose
ARG REACT_APP_USER_SERVICE_URL
ARG REACT_APP_COURSE_SERVICE_URL
ARG REACT_APP_PROGRESS_SERVICE_URL

# Ustawienie zmiennych środowiskowych dla procesu budowania
ENV REACT_APP_USER_SERVICE_URL=$REACT_APP_USER_SERVICE_URL
ENV REACT_APP_COURSE_SERVICE_URL=$REACT_APP_COURSE_SERVICE_URL
ENV REACT_APP_PROGRESS_SERVICE_URL=$REACT_APP_PROGRESS_SERVICE_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies using npm ci for deterministic builds
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["serve", "-s", "build", "-l", "3000"]