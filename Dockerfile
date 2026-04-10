FROM mcr.microsoft.com/playwright:v1.59.1-jammy

WORKDIR /app

# Install Allure CLI
RUN apt-get update && apt-get install -y \
    openjdk-11-jdk \
    && rm -rf /var/lib/apt/lists/* && \
    npm install -g allure-commandline

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p allure-results

CMD ["npx", "playwright", "test", "--reporter=html,allure-playwright,line"]