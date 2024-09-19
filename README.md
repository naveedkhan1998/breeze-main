# Breeze API Wrapper

![Breeze API Wrapper](https://your-repo-link.com/banner.png)

**Breeze API Wrapper** is a comprehensive Django-based application that serves as a wrapper around the ICICI Breeze API. It allows users to seamlessly integrate their Breeze API credentials to perform various financial data operations, including session generation, instrument data loading, OHLC (Open, High, Low, Close) graph visualization with analysis, and real-time data subscription with tick updates.

## Table of Contents

- [Breeze API Wrapper](#breeze-api-wrapper)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technology Stack](#technology-stack)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Set Up Environment Variables](#2-set-up-environment-variables)
      - [`.envs/env.dev`](#envsenvdev)
    - [3. Build and Run Docker Containers](#3-build-and-run-docker-containers)
  - [Running the Application](#running-the-application)
  - [Development](#development)
    - [Setting Up a Development Environment](#setting-up-a-development-environment)
    - [Making Changes](#making-changes)
    - [Running Tests](#running-tests)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)
  - [Contact](#contact)

## Features

- **Session Management:** Generate and manage sessions using your Breeze API key and secret.
- **Instrument Data Loading:** Fetch and display detailed information about various financial instruments.
- **OHLC Graphs with Analysis:** Visualize Open, High, Low, Close data through interactive graphs, complete with analytical tools.
- **Real-Time Data Subscription:** Subscribe to instruments to receive live tick data updates.
- **User-Friendly Frontend:** Intuitive interface for seamless interaction with Breeze API functionalities.
- **Robust Backend:** Powered by Django, Django REST Framework, Celery, and Redis for efficient task management and data handling.
- **Secure Data Storage:** PostgreSQL database ensures secure and reliable storage of your session and instrument data.

## Technology Stack

- **Backend:** Django, Django REST Framework
- **Frontend:** React.js *(Assuming React; adjust if different)*
- **Database:** PostgreSQL
- **Task Queue:** Celery with Redis
- **Real-Time Communication:** WebSockets via Django Channels
- **Containerization:** Docker, Docker Compose
- **Others:** Nginx for reverse proxy, Gunicorn as WSGI server

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Docker:** [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/)
- **Breeze API Credentials:** Obtain your Breeze API Key and Secret from [ICICI Direct](https://www.icicidirect.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/breeze-api-wrapper.git
cd breeze-api-wrapper
```

### 2. Set Up Environment Variables

Create a `.envs` directory in the root of the project and add an `env.dev` file with the necessary environment variables for development.

```bash
mkdir .envs
```

#### `.envs/env.dev`

Create a file named `env.dev` inside the `.envs` directory and add the following content:

```dotenv
# PostgreSQL Configuration
POSTGRES_DB=breeze
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis Configuration
REDIS_CACHE_URL=redis://redis:6379/0
REDIS_URL=redis://redis:6379/0

# Celery Configuration
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Breeze API Credentials
BREEZE_API_KEY=your_breeze_api_key
BREEZE_API_SECRET=your_breeze_api_secret

# Django Configuration
DJANGO_SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=*
```

**Note:**
- Replace `your_breeze_api_key` and `your_breeze_api_secret` with your actual Breeze API credentials.
- Replace `your_django_secret_key` with a securely generated Django secret key. You can generate one using Django's `get_random_secret_key` utility:

  ```python
  from django.core.management.utils import get_random_secret_key
  print(get_random_secret_key())
  ```

### 3. Build and Run Docker Containers

Ensure Docker is running on your machine. Then, execute the following command to build and start the containers:

```bash
docker-compose up --build
```

This command will:

- Build Docker images for the backend, frontend, and Nginx services.
- Start PostgreSQL and Redis containers.
- Set up the entire application stack.

## Running the Application

Once all containers are up and running, you can access the entire application by visiting:

- **Application:** [http://localhost:8000](http://localhost:8000)

**Note:** Nginx handles the routing for both the frontend and backend, so there's no need to access them separately. Nginx will serve the frontend and proxy API requests to the backend.

## Development

### Setting Up a Development Environment

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/breeze-api-wrapper.git
   cd breeze-api-wrapper
   ```

2. **Set Up Environment Variables:**

   Follow the [Installation](#installation) section to set up your `.envs/env.dev` file.

3. **Run Docker Containers:**

   ```bash
   docker-compose up --build
   ```

4. **Access the Application:**

   Navigate to [http://localhost:8000](http://localhost:8000) to start interacting with the application.

### Making Changes

- **Backend:**

  The backend code is mounted as a volume (`./backend/:/app/`), allowing you to make changes locally and see them reflected in real-time without rebuilding the Docker container.

- **Frontend:**

  Similarly, the frontend code is mounted as a volume, enabling live updates during development.

### Running Tests

Implement and run your test suites to ensure the application's integrity.

```bash
docker-compose exec backend python manage.py test
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository**
2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add some feature"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

## License

This project is licensed under the [MIT License](LICENSE).

---

**Disclaimer:** This project is a wrapper around the ICICI Breeze API and is intended for educational and personal use. Ensure compliance with ICICI's terms of service when using their API.

## Acknowledgments

- [ICICI Direct](https://www.icicidirect.com/) for the Breeze API.
- [Django](https://www.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery](https://docs.celeryproject.org/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [Nginx](https://www.nginx.com/)

## Contact

For any inquiries or support, please contact [your-email@example.com](mailto:your-email@example.com).

---

*Happy Coding! 🚀*