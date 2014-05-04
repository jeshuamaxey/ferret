# Low Pass

**Low Pass** is a powerful tool for finding first-person, eye-witness accounts of major events through Twitter.</p>

It allows journalists to go back in time and find tweets immediately before the flood of noise and activity that accompanies heavily-reported news.

After entering your search term, **Low Pass** returns a graphical representation of the density of tweets over time. The interactive interface lets you pull tweets from the beginnings of an event, before the noise of opinion and outrage takes over.

**Low Pass** was created by [Giovanni Charles](http://twitter.com/gdcharles), [Jeshua Maxey](http://twitter.com/jeshuamaxey), [Philip Nye](http://twitter.com/philipnye), [Ashley Pace](http://twitter.com/ashmpace) and [Kadhim Shubber](http://twitter.com/kadhimshubber) at [The Times The Sunday Times Build The News hack weekend](http://buildthenews.wordpress.com/).

All the code for **Low Pass** is open source, released under the MIT license. You may view it [here](http://github.com/jeshuamaxey/low-pass" target="_blank).

## Run Locally (Python)

Once you have the repo cloned run:

`pip install -r requirements.txt`

Then to spin up the server type:

`python twitter.py`

The app is now accessible at `http://localhost:5000/public/index.html`

## Run Locally (Node)

Once you have the repo cloned run:

`npm install`

Then to spin up the server type:

`npm start`

The app is now accessible at `http://localhost:3000`