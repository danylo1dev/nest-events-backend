#Event Manager
This project is an event manager built using `NestJs`. It was created with the aim of enhancing my understanding of `NestJs` while tackling a challenging and complex task. The backend for events in this application follows a simple yet effective concept.

##Motivation
My primary motivation for embarking on this project was to deepen my knowledge of `NestJs`. I believed that building an event manager would provide me with the opportunity to explore various aspects of `NestJs` in a practical and hands-on manner. Additionally, I was drawn to the challenge and complexity that such a project would entail.
##What I was learn
Throughout the development process, I have enhanced my knowledge of `NestJs` and gained valuable insights into `TypeORM`. Moreover, I have honed my testing skills through extensive work on `end-to-end` and `unit tests`.

---

#Instaling

## Prerequisites

Before you begin, ensure you have Node.js version 18.16.0 or later installed on your machine.

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository from GitHub:

   ```bash
   git clone <repository_url>
   ```

2. Install all dependencies:

   ```bash
   npm install
   ```

## Running with Docker (Optional)

If you prefer to use Docker, the repository contains a `docker-compose.yml` file. It includes configurations for the database and Adminer.

```bash
docker-compose up
```

If you choose to host the database locally, it's up to you. This app utilizes MySQL.

## Environment Configuration

The repository includes an `Example.env` file. You should create the following environment files:

- `.env`: Default environment for new scripts
- `dev.env`: Used during development (`npm run start:dev`)
- `prod.env`: Used during production (`npm run start:prod`)
- `e2e.env`: Used during end-to-end testing (`npm run test:e2e`)

You can use the `Example.env` file as a template.

## Running the Application

To run the application, use the following commands:

- **Development**:

  ```bash
  npm run start:dev
  ```

- **Production**:

  ```bash
  npm run build
  npm run start:prod
  ```

Once the application is running, you can access it via `http://localhost:3000/`.
