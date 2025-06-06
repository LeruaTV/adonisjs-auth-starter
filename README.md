# AdonisJS Auth Starter 🔐

Welcome to the **AdonisJS Auth Starter** repository! This project serves as a modern authentication template built with AdonisJS v6. It integrates JWT for secure authentication, email capabilities, and TypeScript support. This template is ideal for developers looking to create headless applications efficiently.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Releases](#releases)

## Features

- **JWT Authentication**: Secure your application with JSON Web Tokens.
- **Email Integration**: Send emails for account verification and password resets.
- **TypeScript Support**: Leverage TypeScript for better development experience and type safety.
- **Password Reset**: Allow users to reset their passwords easily.
- **REST API**: Build a robust RESTful API for your application.
- **Starter Template**: Get started quickly with a ready-to-use template.

## Getting Started

To get started with the AdonisJS Auth Starter, follow these steps:

1. **Clone the repository**: Use the command below to clone the repository to your local machine.
   ```bash
   git clone https://github.com/LeruaTV/adonisjs-auth-starter.git
   ```

2. **Navigate to the project directory**:
   ```bash
   cd adonisjs-auth-starter
   ```

3. **Install dependencies**: Run the following command to install the necessary packages.
   ```bash
   npm install
   ```

## Installation

To install the AdonisJS Auth Starter, you need to have Node.js and npm installed on your machine. You can download them from [Node.js official website](https://nodejs.org/).

After setting up Node.js and npm, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/LeruaTV/adonisjs-auth-starter.git
   ```

2. Navigate into the cloned directory:
   ```bash
   cd adonisjs-auth-starter
   ```

3. Install the required dependencies:
   ```bash
   npm install
   ```

4. Set up your environment variables by copying the example file:
   ```bash
   cp .env.example .env
   ```

5. Configure your `.env` file with the necessary settings, such as database credentials and email service configurations.

## Configuration

### Environment Variables

Make sure to configure the following environment variables in your `.env` file:

- `APP_URL`: The URL of your application.
- `DB_CONNECTION`: The type of database you are using (e.g., sqlite, mysql, postgres).
- `DB_HOST`: The host of your database.
- `DB_PORT`: The port of your database.
- `DB_USER`: The username for your database.
- `DB_PASSWORD`: The password for your database.
- `DB_NAME`: The name of your database.
- `MAIL_DRIVER`: The email service you are using (e.g., smtp, mailgun).
- `MAIL_HOST`: The host of your email service.
- `MAIL_PORT`: The port of your email service.
- `MAIL_USERNAME`: Your email username.
- `MAIL_PASSWORD`: Your email password.
- `JWT_SECRET`: A secret key for JWT.

### Database Migration

After configuring your database settings, run the following command to create the necessary tables:

```bash
npm run migration
```

## Usage

To start the application, use the command below:

```bash
npm run dev
```

The application will run on `http://localhost:3333` by default. You can change the port in the `.env` file if needed.

## API Endpoints

### Authentication

- **Register User**
  - **Endpoint**: `POST /api/auth/register`
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```

- **Login User**
  - **Endpoint**: `POST /api/auth/login`
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```

- **Logout User**
  - **Endpoint**: `POST /api/auth/logout`
  - **Headers**: `Authorization: Bearer <token>`

### Password Reset

- **Request Password Reset**
  - **Endpoint**: `POST /api/auth/password/reset`
  - **Request Body**:
    ```json
    {
      "email": "user@example.com"
    }
    ```

- **Reset Password**
  - **Endpoint**: `POST /api/auth/password/reset/confirm`
  - **Request Body**:
    ```json
    {
      "token": "reset_token",
      "password": "newpassword"
    }
    ```

## Testing

To run the tests, use the command below:

```bash
npm test
```

Ensure that you have configured your testing environment variables before running the tests.

## Contributing

We welcome contributions to the AdonisJS Auth Starter! If you would like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Releases

You can find the latest releases [here](https://github.com/LeruaTV/adonisjs-auth-starter/releases). Download and execute the files as needed.

For more information about the latest updates and features, check the "Releases" section on GitHub.

---

Thank you for checking out the AdonisJS Auth Starter! We hope it helps you build secure and modern applications with ease. If you have any questions or need assistance, feel free to reach out.