# Live Reload Information

This document provides details about the live reload functionality configured for the PhotoBooth project, running within a Docker environment.

## Current Status: Live Reload is Active!

Based on the `docker-compose.yml` configuration and the project's use of Vite, **live reloading is fully enabled and operational**. You do not need to perform any additional setup for this feature to work.

## How it Works

The live reload functionality is achieved through a combination of Docker's volume mounting and Vite's Hot Module Replacement (HMR) capabilities:

1.  **Docker Volume Mounting**:
    Your project's source code directories (`src`, `public`) and the main `index.html` file are mounted as volumes into the Docker container where the application runs. This means any changes you save on your local machine are instantly reflected inside the running Docker container.

    Relevant snippet from `docker-compose.yml`:
    ```yaml
    volumes:
      - ./src:/usr/src/app/src
      - ./public:/usr/src/app/public
      - ./index.html:/usr/src/app/index.html
      # node_modules is also mounted to avoid reinstalling on every build
      - /usr/src/app/node_modules 
    ```

2.  **Vite Development Server with HMR**:
    The application runs a Vite development server inside the Docker container. Vite has built-in Hot Module Replacement (HMR), which efficiently updates your application in the browser without a full page reload when changes are made.

    The `app` service in `docker-compose.yml` also exposes the default Vite port `5173`:
    ```yaml
    ports:
      - '3001:3001'
      - '5173:5173' # Vite development server port
    ```
    And the `start:docker` script initiated by `CMD npm run start:docker` (which is `vite --host & vite-node src/server.ts`) ensures the Vite development server is running.

## What to Expect

When you make and save changes to files within your local:
*   `src/` directory (e.g., `.tsx`, `.ts`, `.css` files)
*   `public/` directory (e.g., static assets)
*   `index.html`

The Vite development server will detect these changes, and your browser tab running the application (typically at `http://localhost:5173/`) will update automatically, either by replacing the changed modules or performing a quick page refresh.

## Troubleshooting

If you are not seeing your changes reflected instantly:
*   **Browser Cache**: Try a hard refresh in your browser (usually `Ctrl + F5` or `Cmd + Shift + R`).
*   **Docker Container Status**: Ensure your Docker containers are running correctly. You can check their status with `docker-compose ps`.
*   **Vite Errors**: Check the console output of your Docker container (`docker-compose logs app`) for any errors from the Vite server that might be preventing HMR.
*   **File Watching Issues**: In some environments, file system event watching over Docker volumes can be unreliable. If persistent, a full `docker-compose down` followed by `docker-compose up` might resolve it.