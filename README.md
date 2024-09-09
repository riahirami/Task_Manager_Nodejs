# Server start

- npm install
- node server.js

# API Documentation

## **Authentication**

### **Register a New User**

- **Method:** `POST`
- **URL:** `/register`
- **Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

### **Login**

- **Method:** `POST`
- **URL:** `/login`
- **Body:**
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```
- **Response:**
  ```json
  {
    "token": "your_jwt_token"
  }
  ```

## **Protected Endpoints**

### **Authorization Header**

- `Bearer <your_jwt_token>`

### **Project Endpoints**

- **Create a Project with Description:**

  - **Method:** `POST`
  - **URL:** `/projects`
  - **Body:**
    ```json
    {
      "name": "Project Name",
      "description": "Project Description"
    }
    ```

- **Update Project Title and Description:**
  - **Method:** `PUT`
  - **URL:** `/projects/:id`
  - **Body:**
    ```json
    {
      "name": "New Project Name",
      "description": "Updated Description"
    }
    ```

### **Task Endpoints**

- **Update Task Title and Description:**

  - **Method:** `PUT`
  - **URL:** `/tasks/:id`
  - **Body:**
    ```json
    {
      "title": "New Task Title",
      "description": "Updated Task Description"
    }
    ```

- Endpoint added to can mark tasks as complete/incomplete

- **Update Task status:**
  - **Method:** `PUT`
  - **URL:** `'/tasks/:id/status'`
  - **Body:**
    ```json
    {
      "status": "complete | incomplete"
    }
    ```
