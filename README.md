# Breeze API Wrapper

**Breeze API Wrapper** is a Django‑based boilerplate that sits on top of the free **ICICI Breeze API**. Plug in your Breeze credentials to get secure session generation, instrument master downloads, OHLC visualisations and real‑time tick streaming—all wrapped in a Docker‑first developer experience.

Use it as a starting point for **back‑testing engines, live‑trading bots, research notebooks or data pipelines**.

---

## Table of Contents

- [Breeze API Wrapper](#breeze-api-wrapper)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#techstack)
  - [Architecture](#architecture)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Development Workflow](#developmentworkflow)
  - [Testing \& Monitoring](#testingmonitoring)
    - [Follow Celery logs](#follow-celery-logs)
    - [Multitail (optional)](#multitail-optional)
    - [Flower dashboard](#flower-dashboard)
  - [Contributing](#contributing)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)
  - [Contact](#contact)

---

## Features

| Category               | What you get                                                 |
| ---------------------- | ------------------------------------------------------------ |
| **Session management** | Create / refresh sessions with your API key & secret         |
| **Instrument master**  | Download & cache symbol metadata                             |
| **Charts**             | Interactive OHLC candles with TA overlays                    |
| **Live ticks**         | Subscribe to any instrument and stream ticks over WebSockets |
| **Task orchestration** | Celery + Redis for async jobs & scheduling                   |
| **Dockerised stack**   | `docker-compose up --build` and you’re done                  |

---

## Tech Stack

| Layer                 | Tech                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| **Backend**           | Django · Django REST Framework                                                          |
| **Async / broker**    | Celery · Redis                                                                          |
| **Realtime**          | Django Channels (WebSockets)                                                            |
| **Frontend**          | React  ·  Vite                                                                          |
| **Database**          | PostgreSQL                                                                              |
| **Container / infra** | Docker · Docker Compose · Nginx (reverse proxy)                                         |
| **Dev tooling**       | `uv` (deps) · `black` (format) · `ruff` (lint) · `pytest` (tests) · `vitest` (FE tests) |

---

## Architecture

```
                   ┌──────────┐
                   │  React   │
                   │  Vite    │
                   └────┬─────┘
                        │  HTTP / WS
┌────────────┐   ┌──────▼───────┐    ┌──────────┐
│  Nginx     │──▶│  Django API  │───▶│ PostgreSQL│
│ reverse‑px │   │  (ASGI)      │    └──────────┘
└────────────┘   │  Channels    │
                 │  Celery      │───▶ Redis
                 └──────────────┘
```

> All services (backend, frontend, db, cache, broker, workers, beat, Flower & Nginx) are defined in **`docker-compose.yml`**.

---

## Prerequisites

- **Docker** & **Docker Compose** installed
- An **ICICI Breeze API** key & secret

---

## Installation

```bash
git clone https://github.com/your-username/breeze-api-wrapper.git
cd breeze-api-wrapper

# first‑time build & launch
docker-compose up --build
```

Compose will:

1. Build the backend, frontend and Nginx images
2. Pull official images for Postgres & Redis
3. Spin up Celery workers, beat scheduler and Flower dashboard

---

## Running the Application

Once the stack is up Nginx exposes everything on **[http://localhost:8000](http://localhost:8000)**:

- `/` — React SPA
- `/api/…` — Django REST endpoints
- `/ws/…` — WebSocket stream
- `/flower` — Celery dashboard

---

## Development Workflow

Both backend and frontend code are mounted as volumes, so changes hot‑reload instantly.

```bash
# backend tests
docker-compose exec backend pytest

# FE dev server (if you prefer Vite's dev mode)
docker-compose exec frontend pnpm dev
```

---

## Testing & Monitoring

### Follow Celery logs

```bash
# all workers
docker-compose exec backend tail -f /var/log/celery/w*.log
```

### Multitail (optional)

```bash
# install once on the host
sudo apt-get install multitail  # or yum install multitail

# split‑screen log view
docker-compose exec backend multitail /var/log/celery/w1.log /var/log/celery/w2.log
```

### Flower dashboard

Open **[http://localhost:8000/flower](http://localhost:8000/flower)** in your browser for task‑level visibility.

> **Tip:** Configure log‑rotation (`logrotate`) inside the container—or mount `/var/log/celery` to your host—to keep log sizes under control.

---

## Contributing

1. Fork the repo
2. `git checkout -b feature/<slug>`
3. Commit & push
4. Open a pull request—PR template included :)

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full text.

---

## Acknowledgements

- [ICICI Direct – Breeze API](https://www.icicidirect.com/)
- [Django](https://www.djangoproject.com/) · [DRF](https://www.django-rest-framework.org/)
- [Celery](https://docs.celeryproject.org/) · [Redis](https://redis.io/)
- [Docker](https://www.docker.com/) · [Nginx](https://www.nginx.com/)

> **Disclaimer:** This project is unaffiliated with ICICI Direct. Use at your own risk and ensure compliance with ICICI’s terms of service.

---

## Contact

Questions? Bugs? Reach out at **[nkhan364@uwo.ca](mailto:nkhan364@uwo.ca)**.

---

_Happy hacking & good trades! 🚀_
