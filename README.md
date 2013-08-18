# Jotta

Jotta is a barebones Node.js server which uses the Express framework. It exists to get a simple express implementation up and running super duper quick. It can be quickly deployed to Heroku following the instructions below (adapted from the [Heroku documentation for implementing Node.js](https://devcenter.heroku.com/articles/nodejs)).

Jotta works very well with [Squared Paper](http://github.com/jeshuamaxey/squared-paper), a front end amalgam of boilerplate code.

## Running Jotta Locally

### Prerequisites

I am assuming you have Node.js and NPM installed locally on your machine. If you do not, you can download it [here](http://nodejs.org/download).

### Running the server

Navigate to the Jotta directory in a terminal window and run the following command:
```
node index.js
```
If

By default, the server runs at [http://localhost:5000](http://localhost:5000).

## Deploying to Heroku

### Prerequisites

As well as all the prerequisites of the previous section, I am assuming you have the Heroku toolbelt installed on your machine and have signed up for a free Heroku account. Details of this can be found on the [heroku website](http://heroku.com).

### Deploying the server

From a terminal window, navigate to the newly cloned Jotta directory and login with your Heroku account details using the `heroku login` command.

You can run the server locally using `foreman start` to make sure things are in order before you deploy the app.

When you are ready to deploy, make a git commit before running the following two commands:
```
heroku create
git push heroku master
```

Your app is now live and can be visited with the command:
```
heroku open
```

By default, you will be running one dyno. This can be changed with the following command:
```
heroku ps:scale web=2 #for running 2 dynos
```
To learn more about dynos and scaling, visit the [Heroku documentation](https://devcenter.heroku.com/articles/dynos). Info about dynos and billing can be found [here](https://devcenter.heroku.com/articles/usage-and-billing).

To dive deeper into deploying a Node.js backend with Heroku, see [this article](https://devcenter.heroku.com/articles/nodejs).