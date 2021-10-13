# Reddit-Scraper
Scrapes the r/manga subreddit to pull recent manga updates and display in a searchable table.
Manga is essentially japanese comics that often require translations and are grouped into the subreddit as new chapters are released.

## How it works

* uses express as a backend and react for the frontend
* backend calls puppeteer to open the subreddit and scrape all the chapter updates that we want
* sends information to be displayed using react

## Setup

To run the express, first go into the express folder
`cd expressapp`

install it using npm
`npm install`

start the server 
`npm start`

In a new terminal, go into the react folder 
`cd ../reactapp`

install it using npm
`npm install`

start the server 
`npm start`

It will automatically start up a browser instance and navigate to `localhost:3000` where the frontend will be served.
