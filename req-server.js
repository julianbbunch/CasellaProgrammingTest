"use strict";
const express = require("express");
const app = express();

const parseRawBody = (req, res, next) => {
    req.setEncoding('utf8');
    req.rawBody = '';
    req.on('data', (chunk) => {
      req.rawBody += chunk;
    });
    req.on('end', () => {
      next();
    });
}

app.use(parseRawBody);

app.post("/", (req, res) => {
    console.log(req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.send(toJSON(req.rawBody));
});

app.listen(3000, (err) => {
    if (err){
        console.log("there was a problem", err);
        return;
    }
    console.log("listening on port 3000");
});



function toJSON (string) {
    var totalChars = string.length;
    var totalPunctuation = 0;
    var totalWhitespace = 0;

    var result = {
        Frequency: [],
        WordCount: 0,
        WhitespacePercentage: 0,
        PunctuationPercentage: 0
    };

    // Step 1) Find all the words and their frequency and place them in the array
    string = string.toLowerCase();

    var currentWord = {
        Word: "",
        Frequency: 1        
    }

    for (var i = 0; i < string.length; i++) {
        var char = string.charAt(i);

        if (isAlphnumeric(char)) {
            currentWord.Word += char;
        }
        // Add to the list of words when a non-letter is encountered
        if ((!isAlphnumeric(char) || i + 1 === string.length) && currentWord.Word.length != 0) {
            result.Frequency = insert(result.Frequency, currentWord);
            result.WordCount++;
            currentWord = {
                Word: "",
                Frequency: 1
            }
        }
    }

    // Step 2) Calculate whitespace
    totalWhitespace += (string.match(/[ \t\n]/g) || []).length;
    result.WhitespacePercentage = totalWhitespace / totalChars;

    // Step 3) Calculate punctuation
    totalPunctuation += (string.match(/[\.\!?\,]/g) || []).length;
    result.PunctuationPercentage = totalPunctuation / totalChars;

    // Step 4) Sort the array
    result.Frequency.sort(function(a, b) {
        if (0 > b.Frequency - a.Frequency) {
            return b.Frequency - a.Frequency;
        }
        if (0 === b.Frequency - a.Frequency) {
            if (b.Word < a.Word) {
                return 1;
            }
            else {
                return -1;
            }
        }
    });

    console.log(result);

    return result;
}

// Checks if input character is a letter
function isAlphnumeric(char) {
    var cc = char.charCodeAt(0);
    return (96 < cc && 123 > cc);
}

// Inserts a word into the array
function insert(array, word) {
    var contains = false;

    array.forEach(function (item, index) {
        if (word.Word === item.Word) {
            item.Frequency++;
            contains = true;
        }
    });

    if (!contains && array.length < 50) {
        array.push(word);
    }

    return array;
}