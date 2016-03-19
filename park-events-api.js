/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event: " + JSON.stringify(event) + ".\ncontext: " + JSON.stringify(context));
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("WhatsHappeningInParkIntent" === intentName) {
        getWhatsHappeningInPark(intent, session, callback);
    } else if ("ParkwaysBlogPostsIntent" === intentName) {
        getParkwaysBlogPosts(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        readMore(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        nextBlogPost(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        getStopResponse(callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        getStopResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the Seattle Parks And Recreation. " +
        "What would you like to do? You can say hwat is happening in Magnuson Park or read the latest Parkways blog post.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me your favorite color by saying, " +
        "my favorite color is red";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
 
function getWhatsHappeningInPark(intent, session, callback) {
    var cardTitle = intent.name;
    var parkSlot = intent.slots.Park;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "I was not able to catch that. What park did you want to go to?";

    var park = parkSlot.value;
    
    if (!park) {
        callback(sessionAttributes,
                     buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)); 
    }

    var https = require('https');
    
    var options = {
        host: 'www.trumba.com',
        path: '/calendars/volunteer-1.rss?startdate=20160319&search=' + park.replace(/\s?park/i,"")
    }

    var request = https.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            
            try {
                var titleRegex = /<title>(.*)<\/title>/ig;
                var titles = data.match(titleRegex);
                
                var eventTitle = titles[2].replace(/<\/?title>/g,"");
                
                var descriptionRegex = /<description>(.*)<\/description>/ig;
                var descriptions = data.match(descriptionRegex);
                
                // &lt;br/&gt;Saturday, October 8, 2016, 10am&amp;nbsp;&amp;ndash;&amp;nbsp;2pm &lt;br/&gt;&lt;br/&gt;
                
                var eventAddress = descriptions[0].match(/<description>(.*?)&lt;br\/&gt;/ig)[0].replace(/<description>/,"").replace(/&lt;br\/&gt;/g,"");
                
                var eventDate = descriptions[0].match(/&lt;br\/&gt;(.*?)&lt;br\/&gt;&lt;br\/&gt;/ig)[0].replace(/\s?&lt;br\/&gt;/g,"").replace(/&amp;nbsp;&amp;ndash;&amp;nbsp;/," to ");
                
                speechOutput = "The next event at " + park + " is " + eventTitle + " on " + eventDate + ". The address is " + eventAddress + ".";
            }
            catch(err) {
                speechOutput = "There are no volunteering opportunities planned for " + park + ".";
            }

            // Setting repromptText to null signifies that we do not want to reprompt the user.
            // If the user does not respond or says something that is not understood, the session
            // will end.
            callback(sessionAttributes,
                     buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)); 

        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
    
}

function getParkwaysBlogPosts(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "There was no recent blog post.";

    var https = require('https');
    
    var options = {
        host: 'ajax.googleapis.com',
        path: '/ajax/services/feed/load?v=2.0&q=http://parkways.seattle.gov/feed/&num=3'
    }

    var request = https.request(options, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            
            blogPosts = JSON.parse(data);

            speechOutput = blogPosts.responseData.feed.entries[0].title + " by " + blogPosts.responseData.feed.entries[0].author + ". Would you like me to read more?";
            
            sessionAttributes.blogPosts = blogPosts;
            sessionAttributes.cursor = 0;

            // Setting repromptText to null signifies that we do not want to reprompt the user.
            // If the user does not respond or says something that is not understood, the session
            // will end.
            callback(sessionAttributes,
                     buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)); 

        });
    });
    request.on('error', function (e) {
        console.log(e.message);
    });
    request.end();
}


function readMore(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "I did not get that. What did you want to do?";
    
    if (session.hasOwnProperty("attributes") && session.attributes.hasOwnProperty("blogPosts")) {
        speechOutput = session.attributes.blogPosts.responseData.feed.entries[session.attributes.cursor].content.replace(/(<([^>]+)>)/ig,"");
        
        speechOutput += "The next blog post is " + session.attributes.blogPosts.responseData.feed.entries[session.attributes.cursor+1].title + " by " + blogPosts.responseData.feed.entries[session.attributes.cursor+1].author + ". Would you like me to read more?";
    
        sessionAttributes.blogPosts = session.attributes.blogPosts;
        sessionAttributes.cursor = session.attributes.cursor+1;
    }
    
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
             buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)); 

}

function nextBlogPost(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "I did not get that. What did you want to do?";
    
    if (session.hasOwnProperty("attributes") && session.attributes.hasOwnProperty("blogPosts")) {
        if (session.attributes.cursor > session.attributes.blogPosts.responseData.feed.entries.length-2) {
            speechOutput = "This was the last blog post. What would you like to do next?";
        } else {
            speechOutput = "The next blog post is " + session.attributes.blogPosts.responseData.feed.entries[session.attributes.cursor+1].title + " by " + blogPosts.responseData.feed.entries[session.attributes.cursor+1].author + ". Would you like me to read more?";
        
            sessionAttributes.blogPosts = session.attributes.blogPosts;
            sessionAttributes.cursor = session.attributes.cursor+1;
        }
    }
    
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
             buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession)); 

}


function getStopResponse(callback) {
    var repromptText = null;
    var cardTitle = "Goodbye";
    var shouldEndSession = true;
    var speechOutput = "Thanks for checking in with Seattle Parks. Enjoy your next park visit!";
    var sessionAttributes = {};

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
