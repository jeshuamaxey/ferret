var analyser = {

  getDatapoint: function(tweets){

                if (tweets.length < 2){
                  console.log('small sample');
                  return 0;
                  //TODO:make this a datapoint
                }

                var times = [];
                var max = 0;
                var min = Number.MAX_VALUE;
                var time = 0;
                var sum = 0;

                for(var i in tweets){ //in gives an index back
                  time = Date.parse(tweets[i].created_at);
                  times.push(time);
                  max = Math.max(max, time);
                  min = Math.min(min, time);
                  sum = sum + time;
                }

                if (max == min){
                  console.log('bucket too small, no variation');
                }

                return {density: tweets.length/(max - min), 
                  time: sum/tweets.length}
              }
}
exports.analyser = analyser;
