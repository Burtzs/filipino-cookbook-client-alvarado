# Filipino Cookbook Client Application

## 1. Application Title

**Filipino Cookbook Client** — A web-based client application for the Filipino Cookbook API.

## 2. Application Description

This client application consumes the **Filipino Cookbook API** created by classmate **John Vhinson Fontanos**. It provides a user-friendly interface for browsing, searching, and exploring traditional Filipino dishes. All data is retrieved exclusively through the classmate's REST API endpoints — no direct database access is performed.

**Major features:**

- Browse all Filipino food dishes with category and origin information
- Search for dishes by name using the API search endpoint
- Filter dishes by food category
- View complete food details including cooking instructions and ingredients
- Browse all food categories with dish counts
- Browse all ingredients used across Filipino cuisine
- Configurable API connection settings (base URL and Bearer token)
- Connection testing to verify API availability
- Responsive design for desktop and mobile devices

**Intended users:** Students and developers who want to explore Filipino food data through a graphical interface.

## 3. Technologies Used

- HTML5
- CSS3 (vanilla, no frameworks)
- JavaScript (vanilla ES6+, Fetch API)
- Google Fonts (Inter)

## 4. Installation Instructions

### Prerequisites

- XAMPP (or any local Apache + PHP + MySQL server)
- Composer installed globally
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

## 5. API Endpoints Used

This application consumes the following endpoints from the classmate's API:

| Endpoint | Method | Description |
|---|---|---|
| `/api/foods` | GET | Retrieve all Filipino foods with categories, origins, and ingredients |
| `/api/foods/{id}` | GET | Retrieve a specific food by its ID |
| `/api/foods/search/{name}` | GET | Search for foods by name (partial match) |
| `/api/categories` | GET | Retrieve all food categories |
| `/api/ingredients` | GET | Retrieve all ingredients |

All endpoints require a valid Bearer token sent via the `Authorization` header.

## 6. Screenshots

*Home Page — Stats and featured dishes:*
![Home](ui%20screenshots/Home.png)

*All Foods — Browsing dishes with search and category filter:*
![All Foods](ui%20screenshots/All%20%20Foods.png)

*Food Detail Modal — Viewing full recipe details:*
![Food detail modal](ui%20screenshots/Food%20detail%20modal.png)

*Categories — Browse dishes by category:*
![Categories](ui%20screenshots/Categories.png)

*Ingredients — All ingredients used across Filipino dishes:*
![Ingredients](ui%20screenshots/Ingredients.png)

*Settings — API connection configuration:*
![Settings](ui%20screenshots/Settings.png)

## 7. API Source and Acknowledgment

```
API Source

This client application uses the Filipino Cookbook API developed by:

Developer: John Vhinson Fontanos
GitHub Repository: https://github.com/vhinsonj/filipino-cookbook-api-fontanos

The API is used for educational purposes with the permission of the developer.
```

## Client Developer Information

- **Student name:** Alvarado
- **Course and section:** BSIT 4A
- **GitHub username:** Burtzs
- **Repository link:** https://github.com/Burtzs/filipino-cookbook-client-alvarado
- **Date completed:** August 13, 2026
