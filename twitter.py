import re
from twython import Twython
from dateutil import parser
from datetime import datetime, date, time, timedelta
from flask import Flask, send_from_directory
import calendar

app = Flask(__name__, static_url_path='')
counter = 0

def startTwitter():
  global APP_KEY
  APP_KEY='CcdZ3PrZxZb7m7uQhfCAxg'
  APP_SECRET='W4T7dykukM5eYqRRtLFZvqw1WztApI2hpPJNj0ZGQ'
  twitter = Twython(APP_KEY, APP_SECRET, oauth_version=2)
  global ACCESS_TOKEN 
  ACCESS_TOKEN = twitter.obtain_access_token()

def getTwitter():
  return Twython(APP_KEY, access_token=ACCESS_TOKEN)

def getGoodTweets(hashtag, keywords, tweets):
  return filter(lambda t: matches(hashtag, keywords, t), allTweets)

def matches(hashtag, keywords, tweet):
  if hashtag in map(hstrip, tweet.entities.hashtags):
    return True
  words = re.sub("[^\w]", " ",  tweet.text).split()
  return any(map(lambda k: k in words, keywords)) 

def hstrip(hashtag):
  return hashtag.text

def getFollowerCount(tweet):
  return getTwitter().show_user(user_id=tweet.get('user').get('id')).get('followers_count')

def getDensity(ts):
  times = map(lambda x: parser.parse(x.get('created_at')), ts)
  mintime = min(times)
  maxtime = max(times)

  range = maxtime - mintime
  return (len(ts)/range.total_seconds(), avg_time(times))

def avg_time(datetimes):
  total = sum(dt.hour * 3600 + dt.minute * 60 + dt.second for dt in datetimes)
  avg = total / len(datetimes)
  minutes, seconds = divmod(int(avg), 60)
  hours, minutes = divmod(minutes, 60)
  #hack: no avg date, may fail
  dt = datetime.combine(datetimes[0].date(), time(hours, minutes, seconds))
  return dt

def getTweets(date, term, pages):
  datestring = str(date.year) + '-' + str(date.month) + '-' + str(date.day)
  tweets = getTwitter().search(q=term, until=datestring).get('statuses')
  newtweets = tweets
  for p in range(1, pages):
    if not newtweets:
      break
    minid = min(map(lambda t: t.get('id'), newtweets))
    newtweets = getTwitter().search(q=term, max_id=minid,
        until=datestring).get('statuses')
    tweets = tweets + newtweets

  return tweets

def getTimeSeries(startDate, term):
  series = list()
  d = startDate
  iter = 5
  delta = timedelta(days=-1)

  for i in range(0, iter):
    dateTweets = getTweets(d, term, 3)
    if not dateTweets:
      break
    dateDensity = getDensity(dateTweets)
    if dateDensity < 0.01:
      break
    series.append(dateDensity)

    oldDate = d
    d = d + delta
    delta = delta + delta
    oldDensity = dateDensity

  return expandOn(oldDate, d, term)

def expandOn(start, end, term):
  while(end - start >= timedelta(days=7)):
    middle = start + (end - start)/2 
    dateTweets = getTweets(d, term, 3)
    if not dateTweets:
      end = middle
    dateDensity = getDensity(dateTweets)
    if dateDensity < 0.1:
      end = middle
    else:
      if dateTweets:
        start = middle

  fullTweets = getTweets(start, term, 5)
  b = 5
  chunks=[fullTweets[x:x+b] for x in xrange(0, len(fullTweets), b)]
  global results
  results = fullTweets
  return map(getDensity, chunks)

@app.route("/api/generate_time_series/<q>/<d>")
def gentime(q,d):
  global counter
  ts = getTimeSeries(parser.parse(d), q)
  toreturn = 'data/data' + str(counter)
  fname = 'public/data/data' + str(counter)
  counter = counter + 1
  f = open(fname, 'w')
  f.write('date\ttps\n')
  for t in ts:
    tstamp = str(calendar.timegm(t[1].utctimetuple()))
    print tstamp, ' ', t[1]
    f.write('%s\t%f\n' % (tstamp, t[0]))
  f.close()

  return toreturn

def between(s,e,tweet):
  d = parser.parse(tweet.get('created_at')).replace(tzinfo=None)
  return s - timedelta(1) <= d and e + timedelta(1) >= d

@app.route("/api/get_tweets/<s>/<e>")
def tweets(s, e):
  start = parser.parse(s)
  end = parser.parse(e)
  global results
  return str(filter(lambda t: between(start, end, t), results))

@app.route('/')
def index():
  return app.send_static_file('public/index.html')

@app.route('/public/<path:filename>')
def send_foo(filename):
  print filename
  return send_from_directory('public', filename)

if __name__ == "__main__":
  startTwitter()
  app.run(debug=True)
