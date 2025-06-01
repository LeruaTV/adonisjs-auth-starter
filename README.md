# AdonisJS Auth Starter

A modern, production-ready authentication template built with AdonisJS v6. This starter provides a complete user authentication system with API endpoints, email integration, and TypeScript support - perfect for building headless applications with separate frontend frameworks like Nuxt, React, or Vue.

## 🚀 Features

- **Complete Authentication System**

  - User registration and login
  - Password reset with email tokens
  - JWT token-based authentication
  - User profile management
  - Admin user auto-creation

- **Security First**

  - Password hashing with Scrypt
  - Token-based authentication
  - Input validation with VineJS
  - CORS support

- **Developer Experience**

  - TypeScript throughout
  - Hot Module Replacement (HMR)
  - Comprehensive test setup with Japa
  - ESLint and Prettier configured
  - Modular architecture

- **Email Integration**
  - Password reset emails
  - MJML templates for beautiful emails
  - Event-driven email notifications

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/czepter/adonisjs-auth-starter.git
   cd adonisjs-auth-starter
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=your_db_name

   # Application
   APP_KEY=your_app_key
   PORT=3333
   HOST=localhost
   LOG_LEVEL=info

   # Mail
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USERNAME=your_email
   SMTP_PASSWORD=your_password

   # Frontend
   FRONTEND_URL=
   FRONTEND_URL_VERIFY=
   FRONTEND_URL_RESET_PASSWORD=
   ```

4. **Generate application key**

   ```bash
   node ace generate:key
   ```

5. **Run database migrations**

   ```bash
   node ace migration:run
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Endpoints

### Authentication

| Method | Endpoint                       | Description               | Auth Required |
| ------ | ------------------------------ | ------------------------- | ------------- |
| POST   | `/api/v1/auth/register`        | Register new user         | No            |
| POST   | `/api/v1/auth/login`           | User login                | No            |
| POST   | `/api/v1/auth/logout`          | User logout               | Yes           |
| POST   | `/api/v1/auth/forgot-password` | Request password reset    | No            |
| POST   | `/api/v1/auth/reset-password`  | Reset password with token | No            |

### User Profile

| Method | Endpoint     | Description         | Auth Required |
| ------ | ------------ | ------------------- | ------------- |
| GET    | `/api/v1/me` | Get current user    | Yes           |
| PUT    | `/api/v1/me` | Update current user | Yes           |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project includes comprehensive tests for:

- Authentication endpoints
- User management
- Service layer functionality
- Input validation

## 🏗️ Project Structure

```
├── app/
│   ├── controllers/          # HTTP controllers
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── validators/          # Input validation
│   ├── dtos/               # Data transfer objects
│   ├── events/             # Application events
│   └── listeners/          # Event listeners
├── database/
│   └── migrations/         # Database migrations
├── tests/
│   ├── functional/         # API endpoint tests
│   └── unit/              # Unit tests
└── start/
    ├── routes.ts          # Route definitions
    ├── kernel.ts          # Middleware setup
    └── events.ts          # Event bindings
```

## 🔧 Configuration

### First Admin User

The first registered user automatically becomes an admin. Subsequent users are regular users by default.

### Email Templates

Email templates are located in `resources/views/emails/` and use MJML for responsive design.

### Custom Events

The application dispatches events for:

- User registration (`UserRegistered`)
- User login (`UserLoggedIn`)
- Password changes (`UserPasswordChanged`)
- Password reset requests (`UserPasswordResetRequested`)
- Password resets (`UserPasswordReset`)
- User verification (`UserVerified`)
- User updates (`UserUpdated`)

## 🚀 Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start in production**

   ```bash
   npm start
   ```

3. **Environment variables**
   Ensure all production environment variables are properly set, especially:
   - Database connection
   - SMTP configuration
   - APP_KEY for security

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [AdonisJS](https://adonisjs.com/) - The Node.js framework for building scalable applications
- Authentication powered by [@adonisjs/auth](https://docs.adonisjs.com/guides/auth/introduction)
- Database ORM by [@adonisjs/lucid](https://docs.adonisjs.com/guides/database/introduction)
- Email templates with [MJML](https://mjml.io/)

## 📞 Support

If you have any questions or need help getting started, please:

1. Check the [AdonisJS documentation](https://docs.adonisjs.com/)
2. Open an issue on GitHub
3. Join the [AdonisJS Discord](https://discord.gg/vDcEjq6)

---

**Happy coding! 🎉**
