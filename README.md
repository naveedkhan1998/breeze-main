# Breeze API Wrapper

**Breeze API Wrapper** is a comprehensive Django-based application that serves as a wrapper around the ICICI Breeze API. It allows users to seamlessly integrate their Breeze API credentials to perform various financial data operations, including session generation, instrument data loading, OHLC (Open, High, Low, Close) graph visualization with analysis, and real-time data subscription with tick updates.

## Live Demo

Experience the Breeze API Wrapper in action! Visit our live demo at: [https://breeze.mnaveedk.com/](https://breeze.mnaveedk.com/)

## Table of Contents

- [Breeze API Wrapper](#breeze-api-wrapper)
  - [Live Demo](#live-demo)
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
    - [Monitoring and Accessing Celery Logs](#monitoring-and-accessing-celery-logs)
      - [Using `tail` to Follow Logs](#using-tail-to-follow-logs)
      - [Using `multitail` for Split-Screen Log Monitoring](#using-multitail-for-split-screen-log-monitoring)
      - [Combining Logs into a Single File (Optional)](#combining-logs-into-a-single-file-optional)
      - [Tips](#tips)
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
- **Frontend:** React.js
- **Database:** PostgreSQL
- **Task Queue:** Celery with Redis
- **Real-Time Communication:** WebSockets via Django Channels
- **Containerization:** Docker, Docker Compose
- **Others:** Nginx for reverse proxy, ASGI server for asynchronous capabilities

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

### Monitoring and Accessing Celery Logs

To monitor the Celery worker logs in real-time, you can use the following methods:

#### Using `tail` to Follow Logs

If you have multiple Celery workers (e.g., `w1`, `w2`, `w3`) and want to monitor their logs in real-time, use the `tail` command:

```bash
docker-compose exec -it breeze-backend sh tail -f /var/log/celery/w1.log /var/log/celery/w2.log /var/log/celery/w3.log
```

Or use a wildcard to follow all worker logs:

```bash
docker-compose exec backend tail -f /var/log/celery/w*.log
```

**Explanation:**

- **`tail -f`**: Follows the content of files in real-time.
- **Multiple Files**: By specifying multiple files, `tail` will interleave the output, prefixing each line with the file name.

#### Using `multitail` for Split-Screen Log Monitoring

For a more organized view, you can use `multitail` to monitor multiple log files in a split-screen terminal window.

**Install `multitail` (if not already installed):**

- **Ubuntu/Debian:**

  ```bash
  sudo apt-get install multitail
  ```

- **CentOS/RHEL:**

  ```bash
  sudo yum install multitail
  ```

**Usage:**

```bash
docker-compose exec backend multitail /var/log/celery/w1.log /var/log/celery/w2.log /var/log/celery/w3.log
```

**Features:**

- Displays each log file in its own window within the terminal.
- Provides color highlighting and filtering options.

#### Combining Logs into a Single File (Optional)

If you prefer to have all worker logs in one file, you can modify your Celery command:

```bash
celery multi restart w1 w2 w3 -A main \
--pidfile=/var/run/celery/%n.pid \
--logfile=/var/log/celery/all_workers.log \
--loglevel=INFO --time-limit=300
```

**Monitoring the Combined Log:**

```bash
docker-compose exec backend tail -f /var/log/celery/all_workers.log
```

**Considerations:**

- **Interleaved Logs**: Logs from all workers will be mixed together, which might make it harder to distinguish between them.
- **Log Rotation**: Ensure proper log rotation to prevent the log file from growing indefinitely.

#### Tips

- **Permissions**: Ensure you have the necessary permissions to read the log files.
- **Log Rotation**: Implement log rotation mechanisms to prevent log files from consuming excessive disk space.
- **Inside Docker Containers**: The `docker-compose exec` command runs the `tail` command inside the running container.

---

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

For any inquiries or support, please contact [nkhan364@uwo.ca](mailto:nkhan364@uwo.ca).

---

_Happy Coding! 🚀_

---
