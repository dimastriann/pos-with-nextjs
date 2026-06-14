# Next.js POS System

This is a Point of Sale (POS) application built with [Next.js](https://nextjs.org), TypeScript, and TailwindCSS. It features a mocked backend using `localStorage` for demonstration purposes.

## Features

*   **Role-Based Access Control (RBAC)**: Distinct flows for Admins, Managers, and Cashiers.
*   **Admin Dashboard**: Manage Products and Users.
*   **Manager Dashboard**: Overview of shop configuration.
*   **POS Interface**: Dedicated cashier interface (restricted access).
*   **Mock Backend**: Data persistence via browser `localStorage`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Login Credentials

The application comes pre-loaded with the following users (Password is same as username):

| Role | Username | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin` | Full access to Backoffice (Products, Users) |
| **Manager** | `manager` | `manager` | Access to Shop Manager Dashboard |
| **Cashier** | `cashier` | `cashier` | Access to POS Frontend |

## Architecture

*   **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS 4.
*   **State/Storage**: Custom `StorageService` using `localStorage` to simulate a REST API.
*   **Authentication**: `AuthService` handles session management and redirection.

## Project Structure

*   `src/app/admin`: Backoffice pages for Admin.
*   `src/app/manager`: Backoffice pages for Shop Managers.
*   `src/app/pos`: Cashier POS interface.
*   `src/services`: Core services for Storage and Auth.
*   `src/models`: TypeScript interfaces for domain entities.

