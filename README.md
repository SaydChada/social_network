![screenshot](https://github.com/SaydChada/social_network/blob/master/LinkedCats.png)

Social network made during my training as JavaScript full stack dev at Ifocop

# Requirements

- NodeJS
- MongoDB

# Installation

- clone this repository with git or download it
- open a terminal and change directory to root of project
- then in terminal "npm install"
- again in terminal run this command "npm start"
- now you can access the project, enjoy.

# Technical stack

LinkedCats uses a number of open source projects to work properly:

* [Handlebars](http://handlebarsjs.com) - Templating for the winner!
* [Jquery](https://jquery.com) - well known javascript front library
* [socket.io](https://socket.io) - featuring the fastest and most reliable real-time engine
* [Twitter Bootstrap](http://getbootstrap.com) - great UI boilerplate for modern web apps
* [node.js](https://nodejs.org) - Javascript everywhere, based on v8 chrome
* [Express](http://expressjs.com) - mini framework for node servers
* [MomentJs](https://momentjs.com) - Manipulate Date and time like a wizard
* [Mongodb](https://www.mongodb.com) - Document oriented database
* [Mongoose](http://mongoosejs.com) - Abstract layer for node / mongodb 
* [multer](https://github.com/expressjs/multer) - Upload image and more
* [nodemailer](https://nodemailer.com) - Email sanding made easier
* [passport](http://passportjs.org/) - Authentication midleware

## Folder Structure

Project's folder structure:

```
rs/
  README.md
  node_modules/
  package.json      
  index.js          => app startup point
  routing.js        => load app routing
  app.js            => main app third part configuration 
  conf.js           => here all app config file are loaded
  conf/             => config loaded in config.js
  middlewares/      => custom middleware
  app/
    controller/     => custom controller 
    models/         => mongoose models
    public/         => public folder
    routes/         => app routing
    views/          => contain app views
```