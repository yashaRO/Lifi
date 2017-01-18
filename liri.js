var keys = require('./keys');
var request = require('request');
var spotify = require('spotify');
var Twitter = require('twitter');
//var omdb = require('omdb')
var inquirer = require('inquirer');
var fs = require('fs');

//Shall detect method first, anything following is a single argument applied to the method. Args instead of argument to prevent confusion in functions.

(function whichOperation(operation) {
    
    var args = arguments[1] || process.argv.splice(3).join('+').replace(/"/g, '')
    
    function doThis() {
    fs.readFile('random.txt', 'utf8', (err, data) => {
        if (err) {throw err};
        var operate = data.slice(0, data.indexOf(','));
        var args = data.slice(data.indexOf('"') + 1, data.lastIndexOf('"')).replace(/\s/g,'+');
        fs.appendFile('Lirilog.txt','[Results of do-what-it-says]\r\n' , (err) => {
            if (err) {throw err};
        });
        whichOperation(operate, args)
    });
}
    
    switch(operation) {
        case 'my-tweets':
            twitterFeed()
            return;
        case 'spotify-this-song':
            spotifySong(args)
            return;
        case 'movie-this':
            movieSearch(args)
            return;
        case 'do-what-it-says':
            doThis()
            return;
        default:
            console.log('Check command syntax again please!')
            return;
    }
})(process.argv[2].toLowerCase())

function twitterFeed() {
    var client = new Twitter(keys.twitterKeys)
    var count = {
        type: 'input',
        name: 'count',
        message: 'How many do you want to return?',
        default: 20,
    }
    inquirer.prompt([count]).then(function(answers) {
        client.get('statuses/user_timeline',{count: answers.count, screen_name:'BillyJJ'}, function(error, tweets, response) {
            if (error) {throw error;}
            
            var writeTweets = fs.createWriteStream('Lirilog.txt',{flags:'a'});
            writeTweets.write(`${new Date().toLocaleString()} || Results of 'my-tweets, ${answers.count} most recent'\r\n`)
            
            console.log(`Your last ${answers.count} message(s):`)
            writeTweets.write(`Your last ${answers.count} message(s):\r\n`)
            
            for (let i = 0; i < tweets.length; i++) {
                console.log(`${i + 1}. ${tweets[i].text}`)
                writeTweets.write(`${i + 1}. ${tweets[i].text}\r\n`)
            }
            writeTweets.write('\r\n')
            writeTweets.end()
            console.log('New data was added to LiriLog');
        })
    })
}

function spotifySong(song) {
    
    //Might be a chance that in your spotify package, the js not updated to allow limiting. Can simply add yourself or copy from the github page. 
    searchObject = {
        type: 'track',
        query: song || 'The Sign Ace of Base',
        limit: '1'
    }
	spotify.search(searchObject, function(err, data) {
        let trackData = data.tracks.items[0]
        if ( err ) {
            console.log('Error occurred: ' + err);
            return;
        }
        toAppend = `${trackData.name} is a song on the album ${trackData.album.name} by ${trackData.artists[0].name}. \r\nPreview here: ${trackData.preview_url}`
        console.log(toAppend) 
        appendThis = `${new Date().toLocaleString()} || Results of 'spotify-this-song ${song = song || 'The Sign'}'\r\n${toAppend}\r\n\r\n`
        fs.appendFile('LiriLog.txt', appendThis, (err) => {
            if (err) {throw err};
            console.log('New data was added to LiriLog');
        });
    })
}  

function movieSearch(movie) {
    movie = movie || "Mr.+Nobody"
    request("http://www.omdbapi.com/?t=" + movie + "&plot=short&r=json&tomatoes=true", function(error, response, body) {
        if (!error && response.statusCode == 200) {
            body = JSON.parse(body)
            toAppend = `Title: ${body.Title}, Year: ${body.Year}\r\nIMDB Rating: ${body.imdbRating}, Rotten Tomatoes: ${body.tomatoRating} (${body.tomatoURL})\r\nCountries: ${body.Country}, Language: ${body.Language}\r\nActors: ${body.Actors}\r\nPlot: ${body.Plot}`
            console.log(toAppend)
            
            appendThis = `${new Date().toLocaleString()} || Results of 'movie-this ${movie}'\r\n${toAppend}\r\n\r\n`
            fs.appendFile('LiriLog.txt', appendThis, (err) => {
                if (err) {throw err;}
                console.log('New data was added to LiriLog');
            })
        }
    })
    
    //OMDB PKG NOT COMPLETED. CAN'T USE WITHOUT MODIFYING ITS CODE AND AINT NOBODY GOT TIME FOR THAT. Right now at least.
    
    /*if (!arguments[0]) {
        omdb.get({title: 'Mr. Nobody',year: 2009, tomatoes: true}, function(err, Movie) {
            if(err) {
                return console.log(err)
            }
            if(!Movie) {
                return console.log('Our placeholder movie has either been deleted, or altered!')
            }
            /*return console.log(
                `Title: ${Movie.title}, Year: ${Movie.year}\nIMDB Rating: ${Movie.imdb.rating}, Rotten Tomatoes: ${Movie.tomato ? Movie.tomato : 'N/A' }\nCountries: ${Movie.countries.join(', ')},\nActors: ${Movie.actors.join(', ')}\nPlot: ${Movie.plot}`
            )
            return console.log(Movie)
        })
            
    } else {
        omdb.search(movie, function(err, movies) {
        if(err) {return console.log(err)}
        if (movies.length < 1) {return console.log('No movies were found!')}
        if (movies.length == 1) {return console.log(movies[0].title)}
        if (movies.length > 1) {
            var movieList = []
            for(let i = 0; i < movies.length; i++) {
                movieList.push({name: `${movies[i].title}, ${movies[i].year}`, value: movies[i].year})
            }
            selectMovie = {
                type: 'list',
                name: 'selectedMovie',
                message: 'There were multiple hits. Which one did you want?',
                default:movieList[0],
                choices: movieList,
            }
            inquirer.prompt([selectMovie]).then(function(answers) {
                omdb.get({title:movie, year:answers.selectedMovie.value, tomatoes:true}, true, function(err, data) {
                    //TODO: .title,year,imdb.rating,countries[0],check for language key,plot,actors(cycle through), check for rotten tomato value/url.
                    console.log(data)
                })
            })
        }
    })
    }*/
}