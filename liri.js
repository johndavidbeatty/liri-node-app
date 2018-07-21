require("dotenv").config();
require("./keys.js");
var fs = require("fs");
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var name="";
var imdbRat = "not available"
var rtRat = "not available"


// Check that there is a target keyword and concatonate multiple words (though requiring quotes was cheezy) Also assign "no" to name for nonexistent words, this is primary done for the first log entry, otherwise no real reason to assign "no"

if (process.argv[3]) {
    for (i=3;i<process.argv.length; i++){
            name = name + " "+process.argv[i]
    } 
} else {
    name="no"
}
// Since we're writing to a log, let's make it easy to read later:

let output='\nRunning LIRI with action of "'+process.argv[2]+'" and "'+name.trim()+'" target.';
printOut(output);

chooser();
// Standard switch section with a helper output for typos etc:

function chooser() {

    switch (process.argv[2]){
        case "my-tweets":
            myTweets();
            break;
        case "spotify-this-song":
            spotifyThis();
            break;
        case "movie-this":
            movieThis();
            break;
        case "do-what-it-says":
            doWhat();
            break;
        default:
            console.log("\nPlease enter an action after above command like: \nmy-tweets \nspotify-this-song (and name of song) \nmovie-this (and name of movie) or \ndo-what-it-says\n")
        }
}

// Function to grab tweets, this one is pretty obvious, I thought it was valuable to include date posted as well.

function myTweets(){

    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
      });

      client.get('statuses/user_timeline', function(error, tweets, response) {
        if(error) console.log("error: ", error);

        for (i=0; i < tweets.length; i++) {
            output=(tweets[i].created_at).substring(0,10)+": "+tweets[i].text

        printOut(output)
        };
      });
}

// Function to write output to console and to log, this function is why I send the messages to the variable output.

function printOut(output){
    console.log(output)
    fs.appendFile("./log.txt","\n"+output, function(err) {
        if (err) console.log("error: ",err);
    });
}

// Function to pull spotify song, I did run into some preview URLs not being available so included logic to output "not available" instead of user-unfriendly "null".  Used earlier logic setting name to "no" as a quick way to set default song.

function spotifyThis(){

    if (name==="no")
        name="The Sign Ace of Base";

    var spotify = new Spotify({
        id: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
      });
       
      spotify.search({ type: 'track', query: name  }, function(err, data) {
        if (err) 
          return console.log('Error occurred: ' + err);
        
        for (i=0; i<data.tracks.items.length; i++) {
            if (!data.tracks.items[i].preview_url) {
                data.tracks.items[i].preview_url="Not Available" 
                };

            output= "\nArtist: "+data.tracks.items[i].artists["0"].name+
            "\nSong Name: "+data.tracks.items[i].name+
            "\nPreview Link: "+data.tracks.items[i].preview_url+
            "\nAlbum: "+data.tracks.items[i].album.name+
            "\n-----------------------------------------------------------------------\n"

            printOut(output)
        }
      });
}

// Function to pull IMDB info, I did run into some preview URLs not being available so included logic to output "not available" instead of user-unfriendly "null".  Used earlier logic setting name to "no" as a quick way to set default song.


function movieThis() {

    if (name==="no")
    name="Mr. Nobody";

    request("http://www.omdbapi.com/?t=" + name + "&y=&plot=short&apikey=trilogy", function(error, response, body) {
    
      // If the request is successful (i.e. if the response status code is 200)
      if (!error && response.statusCode === 200) {
        result=JSON.parse(body)

// Need to search for what kind of ratings are in ratings array, not positive they're always in the same position.

        for (j=0; j< result.Ratings.length; j++){
            switch (result.Ratings[j].Source){
                case "Internet Movie Database":
                imdbRat=result.Ratings[j].Value;
                break;
                case "Rotten Tomatoes":
                rtRat=result.Ratings[j].Value;
            }    
        }

        output= "\nTitle: "+result.Title+
        "\nYear: "+result.Released+
        "\nIMDB Rating: "+imdbRat+
        "\nRotten Tomatoes Rating: "+rtRat+
        "\nCountry: "+result.Country+
        "\nLanguage: "+result.Language+
        "\nPlot: "+result.Plot+
        "\nActors: "+result.Actors+  
        "\n-----------------------------------------------------------------------\n"

        printOut(output)

      } else {
          console.log("there was an error with accessing IMDB")
      }
    });
};

//  function for the do-what-it-says. grab the command and the target and then pass it to the switch/case to send it down the right path.

function doWhat() {

    fs.readFile("./random.txt", "utf8", function(error, data) {

        if (error) return console.log(error);
        
        var dataArr = data.split(",");

        process.argv[2]=dataArr[0];
        name=dataArr[1];

        chooser();

      
      });  
}



