# Ferret

**Ferret** is a powerful tool for finding first-person, eye-witness accounts of major events through Twitter.</p>

It allows journalists to go back in time and find tweets immediately before the flood of noise and activity that accompanies heavily-reported news.

After entering your search term, **Ferret** returns a graphical representation of the density of tweets over time. The interactive interface lets you pull tweets from the beginnings of an event, before the noise of opinion and outrage takes over.

**Ferret** was created by [http://twitter.com/gdcharles](Giovanni Charles), [http://twitter.com/jeshuamaxey](Jeshua Maxey), [http://twitter.com/philipnye](Philip Nye), [http://twitter.com/ashmpace](Ashley Pace) and [http://twitter.com/kadhimshubber](Kadhim Shubber) at [http://buildthenews.wordpress.com/](The Times The Sunday Times Build The News hack weekend).

All the code for **Ferret** is open source, released under the MIT license.

## Run Locally

Once you have the repo cloned run:

`pip install -r requirements.txt`

Then to spin up the server type:

`python twitter.py`

The app is now accessible at `http://localhost:5000/public/index.html`

## Node branch (more beta)

You must have a mongod instance running on your machine.
Information can be found here: http://docs.mongodb.org/manual/installation/

Clone low-pass and navigate to low-pass/low-pass.

Create a file in the `data` folder called `twitterapi.json` 

Write your app information in the following format:
```
{
  "key": "APP KEY",
  "keySecret": "APP KEY SECRET",
  "token": "APP TOKEN",
  "tokenSecret": "APP TOKEN SECRET"
}
```

You can then install the application by running:
`npm install`

Then run the application with:
`npm start`

The app is now accessible at `http://localhost:3000`

