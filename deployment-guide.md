# Deployment Guide for 91club.local on Ubuntu Server with aaPanel

This guide will walk you through deploying the 91club application on an Ubuntu server using aaPanel GUI with the domain 91club.local.

## Prerequisites

- Ubuntu server (18.04 or higher recommended)
- Root access to the server
- Domain name configured to point to your server IP (91club.local)
- Basic knowledge of Linux commands

## Step 1: Install aaPanel

```bash
# Connect to your server via SSH
ssh root@your_server_ip

# Install aaPanel
wget -O install.sh http://www.aapanel.com/script/install_6.0_en.sh && bash install.sh
```

After installation, you'll receive the aaPanel login URL, username, and password. Access the panel through your browser.

## Step 2: Configure aaPanel

1. Log in to aaPanel using the provided credentials
2. Install required software:
   - Go to **App Store**
   - Install **Nginx** (recommended for Node.js applications)
   - Install **MySQL** (required for the application database)
   - Install **PM2 Manager** (for Node.js process management)
   - Install **Node.js** (version 14 or higher recommended)

## Step 3: Set Up MySQL Database

1. In aaPanel, go to **Database** > **MySQL**
2. Click **Add Database**
3. Create a database with these settings:
   - Database Name: `sql_91club_local`
   - Username: `sql_91club_local`
   - Password: `a03ed32a1e791` (or choose a more secure password)
   - Access permissions: select **All**
4. Click **Submit** to create the database

## Step 4: Configure Domain

1. In aaPanel, go to **Website**
2. Click **Add Site**
3. Enter the following information:
   - Domain: `91club.local`
   - Document Root: `/www/wwwroot/91club.local`
   - Database: Select the database you created earlier
   - PHP Version: No requirement (as we're using Node.js)
4. Click **Submit** to create the website

## Step 5: Upload Application Files

1. In aaPanel, go to **Files**
2. Navigate to `/www/wwwroot/91club.local`
3. Upload your application files using the **Upload** button
   - Alternatively, you can use Git to clone your repository:

```bash
cd /www/wwwroot/91club.local
git clone your_repository_url .
```

## Step 6: Install Node.js Dependencies

```bash
cd /www/wwwroot/91club.local
npm install
```

## Step 7: Configure Environment Variables

Create a `.env` file in the application root directory with the following content:

```
PORT=3000
accountBank=vp6262
secret_key=ap6v9njn
JWT_ACCESS_TOKEN=shas$isbwDBWDN2543#jcws

UPI_GATEWAY_PAYMENT_KEY=0c79da69-fdc1-4a07-a8b4-7135a0168385
WOWPAY_MERCHANT_ID=100789501
WOWPAY_MERCHANT_KEY=f5b22eabfd774a98befdb220fb7af60c
PAYMENT_INFO=WINGO PAYMENT
PAYMENT_EMAIL=www.sgswebbuilder@gnail.com

APP_BASE_URL=http://91club.local
APP_NAME=91club

DATABASE_HOST=localhost
DATABASE_USER=sql_91club_local
DATABASE_PASSWORD=a03ed32a1e791
DATABASE_NAME=sql_91club_local

MINIMUM_MONEY=100
```

Make sure to update any values as needed for your production environment.

## Step 8: Set Up PM2 for Process Management

1. Install PM2 globally if not already installed:

```bash
npm install -g pm2
```

2. Create a PM2 ecosystem file (`ecosystem.config.js`) in the application root:

```javascript
module.exports = {
  apps: [{
    name: "91club",
    script: "npx babel-node src/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};
```

3. Start the application with PM2:

```bash
pm2 start ecosystem.config.js
```

4. Set PM2 to start on system boot:

```bash
pm2 startup
# Run the command that PM2 outputs
pm2 save
```

## Step 9: Configure Nginx as a Reverse Proxy

1. In aaPanel, go to **Website** > **91club.local** > **Settings**
2. Click on **Proxy** tab
3. Click **Add Proxy**
4. Configure the proxy with these settings:
   - Proxy Name: `nodejs`
   - Target URL: `http://127.0.0.1:3000` (the port your Node.js app runs on)
   - Proxy Path: `/`
   - Enable WebSocket Support: **Yes** (important for Socket.IO)

5. Save the configuration

6. Alternatively, you can manually edit the Nginx configuration file:

```nginx
server {
    listen 80;
    server_name 91club.local;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 10: Set Up Local DNS (for local development)

If you're using 91club.local for local development, add an entry to your hosts file:

- On Ubuntu: Edit `/etc/hosts`
- On Windows: Edit `C:\Windows\System32\drivers\etc\hosts`

Add this line:
```
127.0.0.1 91club.local
```

## Step 11: Set Up SSL Certificate (Optional but Recommended)

1. In aaPanel, go to **Website** > **91club.local**
2. Click on **SSL**
3. You can either:
   - Use Let's Encrypt for a free certificate (requires a public domain)
   - Upload your own certificate
   - Use a self-signed certificate for testing

## Step 12: Database Initialization

If your application needs to initialize the database:

```bash
cd /www/wwwroot/91club.local
npm run database
```

## Step 13: Test the Deployment

1. Open a web browser and navigate to `http://91club.local`
2. Verify that the application is running correctly
3. Check the logs for any errors:

```bash
pm2 logs 91club
```

## Troubleshooting

### Socket.IO Connection Issues

If you experience Socket.IO connection problems, ensure:

1. WebSocket support is enabled in the Nginx proxy configuration
2. Firewall allows WebSocket connections
3. Check browser console for connection errors

### Database Connection Issues

1. Verify database credentials in the `.env` file
2. Ensure MySQL service is running
3. Check database connection logs

### Application Not Starting

1. Check PM2 logs: `pm2 logs 91club`
2. Verify all dependencies are installed: `npm install`
3. Check for syntax errors in your code

### Nginx Configuration Issues

1. Check Nginx error logs: `/www/wwwlogs/nginx_error.log`
2. Verify Nginx configuration: `nginx -t`
3. Restart Nginx after configuration changes

## Maintenance

### Updating the Application

```bash
cd /www/wwwroot/91club.local
git pull  # If using Git
npm install  # If dependencies changed
pm2 restart 91club
```

### Monitoring

Use PM2's monitoring features:

```bash
pm2 monit
pm2 status
```

### Backup

Regularly backup your database and application files using aaPanel's backup features.

## Security Considerations

1. Update the JWT secret key in the `.env` file
2. Use strong passwords for the database
3. Enable firewall and configure it to allow only necessary ports
4. Keep the server and all software up to date
5. Consider implementing rate limiting for API endpoints

---

This deployment guide covers the basic steps to get your 91club application running on an Ubuntu server with aaPanel. Adjust the configurations as needed for your specific requirements.