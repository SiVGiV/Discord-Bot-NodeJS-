//Variable Area
	var Discordbot = require('discord.io');
	var alot = require('./JSONs/alot.json');
	var nato = require('./JSONs/nato.json');
	var fs = require('fs');
	var endOfLine = require('os').EOL;
	var allCmds = require('./commands.js');
	var bot = new Discordbot.Client({
		token: "REWOVED",
		autorun: true
	});
	var lastResult = {
		type: 'empty',
		sender: ''
	};
	var intervalID;
//Event area
bot.on("err", function(error) {
	console.log(error);
	bot.disconnect();
});

bot.on("ready", function(rawEvent) {
	console.log("Connected!" + endOfLine + 
		"Logged in as: " + endOfLine +
		 bot.username + " - (" + bot.id + ")" + endOfLine +
		  "----------" + endOfLine);
	allCmds['autocardsagainst'].exec({
		parameters: 'REMOVED',
		bot: bot
	});
	intervalID = setInterval(()=>{
		allCmds['autocardsagainst'].exec({
			parameters: 'REMOVED',
			bot: bot
		});
	},1800000);
});

bot.on("message", function(user, userID, channelID, message, rawEvent) {
	lastLine = message;
	console.log(user + " - " + userID + endOfLine + "in " + channelID + endOfLine + message + endOfLine + "----------" + endOfLine); //Logs message
	if(message[0] === '!')
		if((message.match(/\!\w+.*/g)) && (userID != bot.id))
		{
			var botCmd = ((/\!(\d*\w+).*/g).exec(message)[1]).toLowerCase();
			var params = message.substring(botCmd.length + 2);
			if(botCmd in allCmds)
				lastResult = allCmds[botCmd].exec({
					parameters: params,
					message: rawEvent.d,
					bot: bot,
					prev: lastResult
				}) || {type: 'empty', sender: userID};
			else {
				Object.keys(allCmds).forEach((cmdKey)=>{
					if(allCmds[cmdKey].abbrev)
						if(allCmds[cmdKey].abbrev.indexOf(botCmd) != -1)
							lastResult = allCmds[cmdKey].exec({
								parameters: params,
								message: rawEvent.d,
								bot: bot
							}) || {type: 'empty', sender: userID};
				});
			}
		}

	if((message.toLowerCase().match(/\W\/[ru]\//))&&(userID != bot.id))
		sendMessages(channelID, ["https://www.reddit.com" + message.toLowerCase().match(/\/[ru]\/[a-z0-9]+/)]);
	// Sends a corresponding reddit link to every /r/SUBREDDITNAME or /u/USERNAME
	
	if(message.toLowerCase().indexOf("gay")!= -1)
			sendMessages(channelID,["http://goo.gl/r356Sf"]);
		
	if(message.toLowerCase().indexOf("creepy")!= -1)
			sendMessages(channelID,["http://goo.gl/u2aJPV"]);
		
	if((message.toLowerCase().indexOf("alot")!= -1)&&(userID != bot.id))
			sendMessages(channelID,[pick(alot)]);
		
	if(message.toLowerCase().indexOf("sad")!= -1)
			if(message.toLowerCase().indexOf("sadcena")== -1)
				sendMessages(channelID,["http://66.media.tumblr.com/tumblr_m8x1lkS3wk1qa6z3eo1_500.jpg"]);

	if((lastResult.type === 'poll') && (message == lastResult.value.question)&&(bot.channels[channelID].name == "poll_channel"))
	{
		//Adds possible responses to poll sent in the function above
		for(var i = 0; i < lastResult.value.answers.length;i++)
		{
			(function(){
				console.log(lastResult.value.answers);
				if(lastResult.value.answers[i].match(/<:\w+:\d+>/g) != undefined)
					lastResult.value.answers[i] = lastResult.value.answers[i].slice(2,lastResult.value.answers[i].length-1);
				var answer = lastResult.value.answers[i];
				setTimeout(function(){
					bot.addReaction({
						channelID: channelID,
						messageID: rawEvent.d.id,
						reaction: answer
					},function(err,res){
						if(err)
							console.log(err);
					});
				},i*600);
			})();
		}
	}
});

bot.on("voiceStateUpdate", function(rawEvent) {
	Object.keys(bot.servers).forEach(function(curServer){
		var emptyChannels = []; //list of all empty channels except afk in curServer
		Object.keys(bot.servers[curServer].channels).forEach(function(curChannel){	//fill emptyChannels
			if((bot.channels[curChannel].id != bot.servers[curServer].afk_channel_id)&&
				(bot.channels[curChannel].type == 'voice')&&
				(Object.keys(bot.channels[curChannel].members).length == 0))
			{
					emptyChannels.push(bot.channels[curChannel].id);
			}
		});
		if(emptyChannels.length == 0)	//add a channel if one is missing
		{
			var channelKeys = Object.keys(bot.servers[curServer].channels);
			var name = pick(nato);
			for(var i = 0; i < channelKeys.length; i++)
				if(bot.channels[channelKeys[i]].name == "Voice " + name)
				{
					name = pick(nato);
					i = 0;
				}
			bot.createChannel({
				serverID: bot.servers[curServer].id,
				name: toTitleCase("Voice " + name),
				type: 'voice'
			});
		}
		else
		{
			while(emptyChannels.length > 1)	//remove all empty channels but one
				bot.deleteChannel(emptyChannels.pop());
		}
	});
});


var lastLine;
bot.on("disconnect", function() {
	if(lastLine != "Bot disconnected")
		console.log("Bot disconnected");
	clearInterval(intervalID);
	bot.connect();
});



/*Function declaration area*/
function sendMessages(ID, messageArr, interval) {
	var callback, resArr = [], len = messageArr.length;
	typeof(arguments[2]) === 'function' ? callback = arguments[2] : callback = arguments[3];
	if (typeof(interval) !== 'number') interval = 1000;
	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				bot.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(res) {
					resArr.push(res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendMessages();
			}
		}, interval);
	}
	_sendMessages();
}

function sendFiles(channelID, fileArr, interval) {
	var callback, resArr = [], len = fileArr.length;
	typeof(arguments[2]) === 'function' ? callback = arguments[2] : callback = arguments[3];
	if (typeof(interval) !== 'number') interval = 1000;
	
	function _sendFiles() {
		setTimeout(function() {
			if (fileArr[0]) {
				bot.uploadFile({
					to: channelID,
					file: require('fs').createReadStream(fileArr.shift())
				}, function(res) {
					resArr.push(res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendFiles();
			}
		}, interval);
	}
	_sendFiles();
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function pick(arr){
	if(Array.isArray(arr))
		return arr[Math.round(Math.random() * (arr.length-1))];
	else console.error("Value passed is not an array.");
}