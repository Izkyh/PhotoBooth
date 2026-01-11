# How to run the application

## Prerequisites

*   [Docker](https://www.docker.com/get-started)
*   [Node.js](https://nodejs.org/en/)

## Running with Docker

This is the recommended way to run the application.

1.  Open a terminal and navigate to the project's root directory.
2.  Run the following command to build and start the containers:

    ```bash
    docker-compose up -d
    ```

3.  The application will be available at [http://localhost:5173](http://localhost:5173).
4.  The backend server will be available at [http://localhost:3001](http://localhost:3001).

The `docker-compose` command will start two services:
*   `app`: The Node.js application.
*   `db`: The PostgreSQL database.

## Running locally without Docker

### Prerequisites
* You must have a running PostgreSQL instance.

### Instructions
1.  Open a terminal and navigate to the project's root directory.
2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Start the backend server:

    ```bash
    npm run server
    ```

4.  In a separate terminal, start the frontend development server:

    ```bash
    npm run dev
    ```

5.  The application will be available at [http://localhost:5173](http://localhost:5173).

## Database Credentials

*   **Username:** `user`
*   **Password:** `password`
*   **Database:** `photobooth`
*   **Host:** `db` (when running with Docker) or `localhost` (when running locally)
*   **Port:** `5432`

## Superadmin Credentials

*   **Username:** `superadmin`
*   **Password:** `superadmin`