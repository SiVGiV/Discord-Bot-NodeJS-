var _8ball = require('./JSONs/8ball.json');
var jimmy = require('./JSONs/jimmy.json');
var cardsAgainst = require('./JSONs/cardsagainst.json');
var r6operators = require('./JSONs/r6operators.json');
var r6strats = require('./JSONs/strats.json');
var request = require('request');
var Scraper = require('google-search-scraper');
var imdb = require('imdb-api');
var MathSolver = require('./MathSolver.js');
var clipboard = [];
var allCmds = {
	"embed": {
		help: "Sends an embed [TEST COMMAND]",
		syntax: "!embed",
		exec: (input) => {
			if(input.message.author.id == '{{{{REMOVED}}}}')
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: "This is a title",
						description: "This is the description. It can be 2048 characters long",
						url: "http://www.google.com/",
						timestamp: new Date(),
						color: 0xFF0000,
						footer: {
							text: "THIS IS A FOOTER"
						},
						fields: [
							{
								name: "Test1",
								value: "123",
								inline: true
							},
							{
								name: "Test2",
								value: "456",
								inline: true
							},
							{
								name: "Test3",
								value: "789",
								inline: true
							},
							{
								name: "Test4",
								value: "741",
								inline: true
							}
						]
					}
				}, (err)=>{ if(err) console.log(err) });
		}
	},
	"quote": {
		help: "Uses an embed to quote the message that correlates to the id.",
		syntax: "!quote [MSGID]",
		exec: (input) => {
			if(input.message.content.split(" ").length > 1)
				var msgID = input.message.content.split(" ")[1];
			input.bot.getMessage({
				channelID: input.message.channel_id,
				messageID: msgID
			},(err, msg) => {
				if(err)
					console.log(err);
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: msg.author.username + "#" + msg.author.discriminator,
						description: msg.content,
						timestamp: new Date(msg.timestamp),
						color: input.bot.servers[input.bot.channels[input.message.channel_id].guild_id].members[msg.author.id].color,
						thumbnail: {
							url: "https://cdn.discordapp.com/avatars/" + msg.author.id + "/" + msg.author.avatar + ".jpg",
							height: 50,
							width: 50
						}
					}
				}, (err)=>{ if(err) console.log(err); });
			});
		}
	},
	"poll": {
		help: "Sends a poll to #poll_channel",
		syntax: "!poll {\"QUESTION\"} [{REACTION1},{REACTION2}...{REACTION-N}]",
		exec: (input) => {
			var q = input.parameters.match(/".*"/g)[0];
			q = q.substring(1,q.length - 1);
			var msg = (/{(.*)}/g).exec(input.parameters)[1];
			var reactions = msg.split(",");
			LatestPoll = {
				question: q,
				answers: reactions
			};
			Object.keys(input.bot.channels).forEach(function(key){
				if((input.bot.channels[key].guild_id == input.bot.channels[input.message.channel_id].guild_id)&&(input.bot.channels[key].name == "poll_channel"))
					input.bot.sendMessage({
						to: key,
						message: q
					}, (err) => {if(err) console.log(err);});
			});
			input.bot.deleteMessage({
				channelID: input.message.channel_id,
				messageID: input.message.id
			}, (err) => { if(err) console.log(err); });
			return {
				type: 'poll',
				value: {
					question: q,
					answers: reactions
				},
				sender: input.message.author.id
			};
		}
	},
	"convert": {
		help: "Converts between currencies.",
		syntax: "!convert [AMNT] [FROM] [TO]",
		exec: (input) =>{
				var convrtValue = parseFloat(input.parameters.match(/[0-9.]+/));
				var currencies = input.parameters.match(/([A-z]{3}).+?([A-z]{3})/i);
				if((convrtValue != NaN)&&(currencies)){
					currencies = (currencies[1] + currencies[2]).toUpperCase();
					var website = "http://query.yahooapis.com/v1/public/yql?q=select Rate from yahoo.finance.xchange where pair in (\"" + currencies + "\")&env=store://datatables.org/alltableswithkeys&format=json";
					request(website, function (err, response, body) {
						if (err) 
							console.log(err);
						input.bot.sendMessage({
							to: input.message.channel_id,
							message: convrtValue + " " + currencies.substring(0,3) +  " = " +
										(JSON.parse(body).query.results.rate.Rate * convrtValue).toFixed(2) + " " + currencies.substring(3)
						}, (err) => {if(err) console.log(err);});
						
					});
				}
				input.bot.deleteMessage({
					channelID: input.message.channel_id,
					messageID: input.message.id
				}, (err) => {if(err) console.log(err);});
			}
	},
	"summon": {
		help: "Sends private messages to all users mentioned.",
		syntax: "!summon @USER1 @USER2 ... @USER-N \"[MESSAGE-optional]\"",
		exec: (input) => {
			var ids = input.parameters.match(/\d{18}/g) || [];
			var msg = input.parameters.match(/"(.*)"/g) || "";
			if(msg.length > 0){
				msg = msg[0]
				msg = " with the message:\r\n`" + msg.substring(1,msg.length-1) + "`";
			}
			for (var i = 0; i < ids.length; i++)
				sendMessages(input.bot, ids[i], ["You've been summoned by <@" + input.message.author.id + ">" + msg]);
			input.bot.deleteMessage({
				channelID: input.message.channel_id,
				messageID: input.message.id
			}, (err) => { if(err) console.log(err); });
		}
	},
	"cardsagainst": {
		help: "Changes the channel's topic to a Cards Against Humanity style sentence.",
		syntax: "!cardsagainst [ChannelID]",
		exec: (input) => {
			var blackCard = pick(cardsAgainst.black);
			var cardCombo;
			var channel = (/(\d+)/g).exec(input.parameters);
			if(blackCard.indexOf('_') == -1)
				cardCombo = blackCard + " " + pick(cardsAgainst.white) + ".";
			else{
				while(blackCard.indexOf('_') != -1)
					blackCard = blackCard.substring(0,blackCard.indexOf('_')) + pick(cardsAgainst.white) + blackCard.substring(blackCard.indexOf('_') + 1);
				cardCombo = blackCard;
			}
			console.log(channel);
			if(channel)
			{
				input.bot.editChannelInfo({
					channelID: channel[1],
					topic: cardCombo
				},  (err) => {if(err) console.log(err);});
			}
			else
			{
				input.bot.editChannelInfo({
					channelID: input.message.channel_id,
					topic: cardCombo
				},  (err) => {if(err) console.log(err);});
			}
			input.bot.sendMessage({
				to: '272321874631852032',
				embed: {
					title: (channel ? channel[1] : input.message.channel_id),
					description: cardCombo,
					timestamp: new Date()
				}
			},  (err) => {if(err) console.log(err);});
			input.bot.deleteMessage({
				channelID: input.message.channel_id,
				messageID: input.message.id
			}, (err) => {if(err) console.log(err);});
		}
	},
	"autocardsagainst": {
		help: "Changes the channel's topic to a Cards Against Humanity style sentence.",
		syntax: "!autocardsagainst [ChannelID]",
		omit: true,
		exec: (input) => {
			var blackCard = pick(cardsAgainst.black);
			var cardCombo;
			var channel = (/(\d+)/g).exec(input.parameters);
			if(blackCard.indexOf('_') == -1)
				cardCombo = blackCard + " " + pick(cardsAgainst.white) + ".";
			else{
				while(blackCard.indexOf('_') != -1)
					blackCard = blackCard.substring(0,blackCard.indexOf('_')) + pick(cardsAgainst.white) + blackCard.substring(blackCard.indexOf('_') + 1);
				cardCombo = blackCard;
			}
			if(channel)
			{
				input.bot.editChannelInfo({
					channelID: channel[1],
					topic: cardCombo
				},  (err) => {if(err) console.log(err);});
			}
			input.bot.sendMessage({
				to: '272321874631852032',
				embed: {
					title: (channel ? channel[1] : ""),
					description: cardCombo,
					timestamp: new Date()
				}
			},  (err) => {if(err) console.log(err);});
		}
	},
	"togethertube": {
		help: "Sends the link to togethertube.",
		syntax: "!togethertube || !tt || !together || !tube",
		abbrev: ["tt","together","tube"],
		exec: (input) => {
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: "https://togethertube.com/rooms/alot"
			}, (err) => {if(err) console.log(err);});
		}
	},
	"syncvideo": {
		help: "Sends the link to syncvideo.",
		syntax: "!syncvideo || !sv",
		abbrev: ["sv"],
		exec: (input)=>{
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: "https://sync-video.com/r/r4yuMiHV"
			}, (err) => {if(err) console.log(err);})
		}
	},
	"senpai": {
		help: "Sends a message tailored for the user who sent the command.",
		syntax: "!senpai",
		exec: (input)=>{
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: ("<@" + input.message.author.id + ">" + "'s my senpai ₍₍ (ง Ŏ౪Ŏ)ว ⁾⁾")
			}, (err) => { if(err) console.log(err); });
		}
	},
	"8ball": {
		help: "Sends an 8ball reply.",
		syntax: "!8ball",
		exec: (input)=>{
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: pick(_8ball)
			},(err) => {if(err) console.log(err);})
		}
	},
	"jimmy": {
		help: "Sends a random picture of Jimmy Savile",
		syntax: "!jimmy",
		exec: (input) => {
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: pick(jimmy)
			}, (err) => {if(err) console.log(err);});
		}
	},
	"google": {
		help: "Sends a link to the first result corresponding with the specified query.",
		syntax: "!google [SEARCH_QUERY]",
		exec: (input) => {
			var options = {
				host: 'www.google.com',
				query: input.parameters,
				limit: 1
			};
			var searchDone = false;
			if(options.query)
				Scraper.search(options, function (err, url) {
					if(!err && !searchDone){
						input.bot.sendMessage({
							to: input.message.channel_id,
							message: url
						},(err) => {if(err) console.log(err);});
						searchDone = true;
					}
				});
		}
	},
	"lmgtfy": {
		help: "Sends a link to a lmgtfy.com search with the specified query.",
		syntax: "!lmgtfy [SEARCH_QUERY]",
		exec: (input) => {
			var query = input.parameters;
			while (query.indexOf(" ")!=-1)
				query = query.replace(" ","+");
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: "https://www.lmgtfy.com/?q=" + query
			},(err) => {if(err) console.log(err);})
		}
	},
	"pick": {
		help: "Sends a random choice of the specified options.",
		syntax: "!pick \"[OPTION1]\" \"[OPTION2]\" ... \"[OPTION-N]\"",
		exec: (input) => {
			if (input.parameters.match(/"([^"]*)"/))
				input.bot.sendMessage({
					to: input.message.channel_id,
					message: pick(input.parameters.match(/"([^"]*)"/))
				}, (err) => {if(err) console.log(err);});
		}
	},
	"help": {
		help: "Sends a list of all commands and how to use them.",
		syntax: "!help",
		abbrev: ["halep"],
		exec: (input) => {
			var cmdFields = [];
			for(var cmd in allCmds){
				if(!allCmds[cmd].omit)
					cmdFields.push({
						name: allCmds[cmd].syntax,
						value: allCmds[cmd].help
					});
			}
			input.bot.sendMessage({
				to: input.message.author.id,
				embed: {
					title: "Command List",
					color: Math.random() * 0xFFFFFF,
					fields: cmdFields
				}
			}, (err) => {if(err) console.log(err);});
			input.bot.deleteMessage({
				channelID: input.message.channel_id,
				messageID: input.message.id
			}, (err) => {if(err) console.log(err);})
		}
	},
	"debug": {
		help: "Executes code.",
		syntax: "!debug \r\n```{CODE}```",
		omit: true,
		exec: (input) => {
			var tempCode = (/`((.*\n*)+)`/).exec(input.parameters);
			var code = "";
			if(tempCode)
				code = tempCode[1];
			if(input.message.author.id === '{{{{REMOVED}}}}')
			{
				try{
					input.bot.sendMessage({
						to: input.message.channel_id,
						message: eval(code)
					}, (err) => { if(err) console.log(err); });
				}
				catch(e)
				{
					input.bot.sendMessage({
						to: input.message.channel_id,
						message: e
					}, (err) => { if(err) console.log(err); });
				}
			}
			else{
				input.bot.sendMessage({
					to: input.message.channel_id,
					message: "Sorry, but you will need the dev's permission to do that."
				}, (err)=> {if(err) console.log(err);});
				return {
					type: 'debug',
					code: code,
					sender: input.message.author.id
				};
			}
		}
	},
	"grant": {
		help: "Grants permission to run code. (DEV ONLY)",
		syntax: "!grant",
		omit: true,
		exec: (input) => {
			if(input.message.author.id === '{{{{REMOVED}}}}')
			{
				if(input.prev.type === 'debug')
				{
					try{
						input.bot.sendMessage({
							to: input.message.channel_id,
							message: eval(input.prev.code)
						}, (err) => { if(err) console.log(err); });
					}
					catch(e)
					{
						input.bot.sendMessage({
							to: input.message.channel_id,
							message: e
						}, (err) => { if(err) console.log(err); });
					}
				}
				else
					input.bot.sendMessage({
							to: input.message.channel_id,
							message: "Sorry, but the last command wasn't debug."
						}, (err) => { if(err) console.log(err); });
			}
			else{
				input.bot.sendMessage({
					to: input.message.channel_id,
					message: "Only the developer can grant permission to execute code."
				}, (err)=> {if(err) console.log(err);});
			}
		}
	},
	"imdb": {
		help: "Sends an embed with details about the movie/series",
		syntax: "!imdb {QUERY}",
		exec: (input) => {
			var options = {
				query: input.parameters + " site:imdb.com",
				limit: 1
			};
			var searchDone = false;
			if(options.query)
				Scraper.search(options, function (err, url) {
					if(err)
						console.log(err);
					if(!err && !searchDone){
						var idObj = (/(tt\d{7})/).exec(url);
						if(idObj){
							var id = idObj[1];
							imdb.getById(id, (err, res) => {
							    if(!err)
							    {
							    	var embed;
							    	console.log(res);
							    	if(res.type === 'movie'){
							    		embed = {
							    			title: res.title + " (" + res.year + ")",
							    			url: res.imdburl,
							    			color: Math.random() * 0x999999 + 0x666666,
							    			description: "`"+ ((res.genres != "N/A" ? res.genres + ((res.languages != "N/A")||(res.runtime != "N/A") ? " | " : "") : "") +
							    						(res.languages != "N/A" ? res.languages + (res.runtime != "N/A" ? " | " : "") : "") +
							    						(res.runtime != "N/A" ? res.runtime : "")) + "`\n" + truncate(res.plot, 200, 10),
							    			thumbnail: {
							    				url: (res.poster != "N/A" ?  res.poster : "https://az853139.vo.msecnd.net/static/images/not-found.png")
							    			},
							    			fields: [{
							    				name: ((/\,/).test(res.director) ? "Directors" : "Director"),
							    				value: res.director
							    			}],
							    			footer: {
							    				text: 	((res.rated != "N/A" ? "Rated " + res.rated + ((res.metascore != "N/A")||(res.rating != "N/A") ? " | " : "") : "") +
							    						(res.rating != "N/A" ? "User Rating: " +  res.rating + (res.metascore != "N/A" ? " | " : "") : "") +
							    						(res.metascore != "N/A" ? "Metascore: " + res.metascore : ""))
							    			}
							    		};
							    	}
							    	else if(res.type === 'series'){
							    		embed = {
							    			title: res.title + " (" + res._year_data + ")",
							    			url: res.imdburl,
							    			color: Math.random() * 0x999999 + 0x666666,
							    			description: "`"+ res.genres + " | " + res.languages + "`\n" + truncate(res.plot, 200, 10),
							    			thumbnail: {
							    				url: (res.poster != "N/A" ?  res.poster : "https://az853139.vo.msecnd.net/static/images/not-found.png")
							    			},
							    			footer: {
							    				text: 	((res.rated != "N/A" ? "Rated " + res.rated + ((res.metascore != "N/A")||(res.rating != "N/A") ? " | " : "") : "") +
														(res.rating != "N/A" ? "User Rating: " +  res.rating + (res.metascore != "N/A" ? " | " : "") : "") +
														(res.metascore != "N/A" ? "Metascore: " + res.metascore : ""))
							    			}
							    		};
							    	}
							    	if(embed)
								    	input.bot.sendMessage({
								    		to: input.message.channel_id,
								    		embed: embed
								    	}, (err) => {if(err) console.log(err);});
							    }
							});
						}
						searchDone = true;
					}
				});
		}
	},
	"r6": {
		help: "Sends random operators.",
		syntax: "!r6 {-a||-d} [opNum(1-5)]",
		exec: (input) => {
			var type = (/\-([ad])/gi).exec(input.parameters);
			var num = (/(\d+)/g).exec(input.parameters);
			var numFin;
			var operators = [];
			if(num)
				numFin = Number(num[1]);
			else numFin = 5;
			if(type){
				var finType = type[1];
				if(finType.toUpperCase() == 'A')
					finType = 'Attack';
				else
					finType = 'Defend';
				if(numFin > r6operators[finType].length)
					numFin = r6operators[finType].length;
				operators[0] = pick(r6operators[finType]);
				for(var i = 1; i< numFin; i++)
				{
					var tempOp = pick(r6operators[finType]);
					var exists = false;
					for(var j = 0; (j<operators.length) && !exists;j++){
						if(operators[j].name == tempOp.name)
							exists = true;
					}
					if(exists)
						i--;
					else operators.push(tempOp);
				}
				var fields = [];
				operators.forEach((op)=>{
					fields.push({
						name: op.name,
						value: op.unit
					});
				});
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: numFin + " Random " + finType + " Operator" + (numFin>1?"s":""),
						fields: fields,
						color: 0x666666 + (0x999999 * Math.random())
					}
				}, (err) => {if(err) console.log(err);});
			}
			else {
				input.bot.sendMessage({
					to: input.message.channel_id,
					message: "The syntax of the mesage you sent does not fit the correct syntax, use !help for help."
				}, (err) => {if(err) console.log(err);});
			}
		}
	},
	"r6strats": {
		help: "Sends random strats.",
		syntax: "!r6strats [-a||-d]",
		exec: (input) => {
			var type = (/\-([ad])/gi).exec(input.parameters);
			if(type){
				var strat = pick(r6strats[type[1]].concat(r6strats['any']));
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: strat.title,
						description: strat.description,
						color: (type[1] === 'a' ? 0xFF0000 : 0xFF)
					}
				}, (err) => {if(err) console.log(err);});
			}
			else {
				var strat = pick(r6strats['any']);
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: strat.title,
						description: strat.description,
						color: 0xFFFFFF
					}
				}, (err) => {if(err) console.log(err);});
			}
		}
	},
	"calc": {
		help: "Calculates a mathematical expression. Use underscore for a minus (that isn't a subtraction).",
		syntax: "!calc {expression}",
		exec: (input) => {
			input.bot.sendMessage({
				to: input.message.channel_id,
				message: MathSolver(input.parameters)
			}, (err) => {if(err) console.log(err);});
		}
	},
	"enlarge": {
		help: "Enlarges server emotes.",
		syntax: "!enlarge {emote}",
		exec: (input) => {
			if((/<\:\w+\:\d+>/).test(input.parameters)){
				input.bot.sendMessage({
					to: input.message.channel_id,
					embed: {
						title: (/<(\:\w+\:)\d+>/).exec(input.parameters)[1],
						image: {
							url: "https://cdn.discordapp.com/emojis/"+(/<\:\w+\:(\d+)>/).exec(input.parameters)[1] + ".png"
						},
						color: 0xFFFFFF * Math.random()
					}
				}, (err) => {if(err) console.log(err);});
			}
		}
	},
	"kessify": {
		help: "Kessifies the attached message (add a message in quotes or a message ID).",
		syntax: "!kessify {\"MSG\" || messageID}",
		exec: (input) => {
			var msg = (/"(.*)"/g).exec(input.parameters);
			var msgID = (msg ? null : (/\d+/g).exec(input.parameters));
			if(msgID){
				input.bot.getMessage({
					channelID: input.message.channel_id,
					messageID: msgID[0]
				}, (err, res) => {
					if(err)
						console.log(err);
					else
						input.bot.sendMessage({
							to: input.message.channel_id,
							message: kessify(res.content)
						},(err)=>{if(err) console.log(err);});
				});
			}
			else if(msg){
				input.bot.sendMessage({
					to: input.message.channel_id,
					message: kessify(msg[1])
				}, (err)=>{if(err) console.log(err);});
			}
			input.bot.deleteMessage({
				channelID: input.message.channel_id,
				messageID: input.message.id
			}, (err)=>{if(err) console.log(err);});
		}
	}
};
module.exports = allCmds;
/* FUNCTIONS */
function sendMessages(bot, ID, messageArr, interval) {
	var callback, resArr = [], len = messageArr.length;
	typeof(arguments[3]) === 'function' ? callback = arguments[3] : callback = arguments[4];
	if (typeof(interval) !== 'number') interval = 1000;
	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				bot.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(res){
					resArr.push(res);
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendMessages();
			}
		}, interval);
	}
	_sendMessages();
}

function randInt(min, max){
//	Returns a number between min and max (both inclusive)
	return (Math.floor(Math.random() * (max - min + 1)) + min);
}

function truncate(str, length, maxForward, elipsis){
	var newStr = str;
	var _elipsis, _maxForward;
	_elipsis = elipsis;
	_maxForward = maxForward;
	if(!_elipsis)
		_elipsis = '...';
	if(!_maxForward)
		_maxForward = 20;
	if(length<str.length)
	{
		var done = false;
		for(var i = length; (i<length + maxForward) && !done; i++)
		{
			if([' ','	', '\n', '\r\n', '.', ','].indexOf(str[i]) != -1)
			{
				newStr = str.substring(0,i) + _elipsis;
				done = true;
			}
		}
		for(var i = length; (i>=0) && !done; i--)
		{
			if([' ','	', '\n', '\r\n', '.', ','].indexOf(str[i]) != -1)
			{
				newStr = str.substring(0,i) + _elipsis;
				done = true;
			}
		}
		if(!done)
			newStr = str.substring(0,length) + _elipsis;
	}
	return newStr;
}

function pick(arr){
	if(Array.isArray(arr))
		return arr[Math.round(Math.random() * (arr.length-1))];
	else console.error("Value passed is not an array.");
}

function kessify(string){
	var methods = [
		(str)=>(str.toUpperCase()),
		(str)=>{	//First part lower, rest upper (upper will start before half)
			var start = Math.round(Math.random() * (Math.round(str.length/2)-1));
			return str.substring(0,start).toLowerCase() + str.substr(start).toUpperCase();
		},
		(str)=>{
			var start = Math.round(Math.random() * (Math.round(str.length/2)-1));
			return str.substring(0,start).toUpperCase() + str.substr(start).toLowerCase();
		},
		(str)=>{
			var res = "";
			for(var i = 0; i<str.length; i++){
				if(pick([true, false]))
					res += str[i].toUpperCase();
				else 
					res += str[i].toLowerCase();
			}
			return res;
		},
		(str)=>(str)
	]
	return methods[Math.round(Math.random() * (methods.length-1))](string);
}