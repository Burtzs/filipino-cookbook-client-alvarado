# Filipino Cookbook Client Application

A web-based client application that consumes the **Filipino Cookbook API** created by **John Vhinson Fontanos**. Built with HTML, CSS, and JavaScript as part of the Collaborative API Development and Integration Activity.

## Application Description

This client application provides a user-friendly interface for browsing, searching, and exploring traditional Filipino dishes. It retrieves all data exclusively through the classmate's REST API endpoints — no direct database access is performed.

### Features

- Browse all Filipino food dishes with category and origin information
- Search for dishes by name using the API search endpoint
- Filter dishes by food category
- View complete food details including cooking instructions and ingredients
- Browse all food categories with dish counts
- Browse all ingredients used across Filipino cuisine
- Configurable API connection settings (base URL and Bearer token)
- Connection testing to verify API availability
- Responsive design for desktop and mobile devices

## Technologies Used

- HTML5
- CSS3 (vanilla, no frameworks)
- JavaScript (vanilla ES6+, Fetch API)
- Google Fonts (Inter)

## Classmate's API Information

| Property | Details |
|---|---|
| **API Developer** | John Vhinson Fontanos |
| **GitHub Username** | vhinsonj |
| **Repository Name** | filipino-cookbook-api-fontanos |
| **Repository Link** | https://github.com/vhinsonj/filipino-cookbook-api-fontanos |
| **Base URL** | `http://localhost/filipino-cookbook-api/public/api` |
| **Authentication** | Bearer Token (role-based: Admin read/write, User read-only) |

### API Endpoints Used

| Endpoint | Method | Description |
|---|---|---|
| `/api/foods` | GET | Retrieve all Filipino foods with categories, origins, and ingredients |
| `/api/foods/{id}` | GET | Retrieve a specific food by its ID |
| `/api/foods/search/{name}` | GET | Search for foods by name (partial match) |
| `/api/categories` | GET | Retrieve all food categories |
| `/api/ingredients` | GET | Retrieve all ingredients |

## Installation Instructions

### Prerequisites

- XAMPP (or any local Apache + PHP + MySQL server)
- The classmate's API must be installed and running locally

### Setup Steps

1. **Clone this repository** into your XAMPP `htdocs` folder:
   ```
   git clone https://github.com/Burtzs/filipino-cookbook-client-alvarado.git
   cd filipino-cookbook-client-alvarado
   ```

2. **Install and configure the classmate's API:**
   - Clone `https://github.com/vhinsonj/filipino-cookbook-api-fontanos.git` into `htdocs`
   - **Important:** Rename the folder to `filipino-cookbook-api` (to match the API's base path), or update the base path in the API's `public/index.php`
   - Run `composer install` in the API project folder
   - Import `database/filipino_cookbook_api.sql` into phpMyAdmin
   - Configure database credentials and tokens in the API's `public/index.php`
   - Start Apache and MySQL in XAMPP

3. **Open the client application** in your browser:
   ```
   http://localhost/filipino-cookbook-client-alvarado/
   ```

4. **Configure the API connection:**
   - Click **Settings** in the sidebar (or click the setup prompt)
   - Enter the API Base URL: `http://localhost/filipino-cookbook-api/public/api`
   - Enter the Bearer Token (the token you set in the API's `index.php`)
   - Click **Test Connection** to verify
   - Click **Save Settings**

5. **Browse and explore** Filipino dishes!

## API Developer Acknowledgment

```
API developed by: John Vhinson Fontanos
```

This client application consumes the Filipino Cookbook API developed by **John Vhinson Fontanos** as part of the Collaborative API Development and Integration Activity.

- **GitHub:** [vhinsonj](https://github.com/vhinsonj)
- **Repository:** [filipino-cookbook-api-fontanos](https://github.com/vhinsonj/filipino-cookbook-api-fontanos)

## Client Developer Information

- **Student name:** Alvarado
- **Course and section:** BSIT 4A
- **GitHub username:** Burtzs
- **Repository link:** https://github.com/Burtzs/filipino-cookbook-client-alvarado
- **Date completed:** August 13, 2026
