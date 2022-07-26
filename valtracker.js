const Valorant = require('@liamcottle/valorant.js');
const valorantApi = new Valorant.API('NA');
const moment = require('moment')
const Discord = require("discord.js");

const bot = new Discord.Client();

const user = ''
const password = ''
const token = ''
const botCommandsChannel = ''

bot.on('message', (msg) => {

    if (msg.content.startsWith("!getmatch")) {
        valorantApi.authorize(user, password).then(() => {
            valorantApi.getMatch(msg.content.split(" ")[1]).then((response) => {
                console.log(response.data)
            })
        })
    }

    if (msg.channel.id === botCommandsChannel && msg.content === "!history") {
        valorantApi.authorize(user, password).then(() => {
            console.log(valorantApi.user_id)
            valorantApi.getPlayerMatchHistory('6cf9d8d8-47e3-5be7-8748-61e8f5657660', 0, 10).then((response) => {
                let s = "```"
                for (let m of response.data.History) {
                    var date = new Date(m.GameStartTime);
                    s += date.toString() + '\n'
                    s += m.QueueID + '\n'
                }

                s += "```"
                msg.channel.send(s)
            });
        })

    }

    if (msg.channel.id === botCommandsChannel && msg.content === "!lastmatch") {
        valorantApi.authorize(user, password).then(() => {
            console.log(valorantApi.user_id)
            valorantApi.getPlayerMatchHistory('6cf9d8d8-47e3-5be7-8748-61e8f5657660', 0, 10).then((response) => {
                let m = response.data.History[0]
                var date = new Date(m.GameStartTime);
                msg.channel.send("```" + date.toString() + "\n" + m.QueueID + "```")
                //console.log(response.data.History)
            });
        })
    }
    if (msg.channel.id === botCommandsChannel && msg.content === "!lastcomp") {
        valorantApi.authorize(user, password).then(() => {

            // 3697c6b0-715d-570a-836d-e31fb0ae2f5b
            // 6cf9d8d8-47e3-5be7-8748-61e8f5657660
            // b81ba271-b879-5a7a-88c3-bc36840d2113
            valorantApi.getPlayerCompetitiveHistory('6cf9d8d8-47e3-5be7-8748-61e8f5657660', 0, 10).then((response) => {
                for (let m of response.data.Matches) {
                    if (m.TierAfterUpdate !== 0) {
                        console.log(m)
                        getMatchInfo(m)
                        break;
                    }
                }
            });

            function getMatchInfo(m) {
                let s = "```"
                let e = new Discord.RichEmbed()
                e.setTitle("BIG T LAST COMP MATCH INFO")
                e.setFooter(moment.utc(m.MatchStartTime).local().toString())
                for (var key in m) {
                    if (m.hasOwnProperty(key)) {
                        if (key == "MatchStartTime") {
                            var date = new Date(m[key.toString()]);
                            s += key + " : " + date.toString() + "\n"
                            e.addField(key, date.toString());
                        }

                        else {
                            s += key + " : " + m[key.toString()] + "\n"
                            e.addField(key, m[key.toString()]);
                        }

                    }
                }
                s += "```"
                valorantApi.getMatch(m.MatchID).then((response) => {
                    let winningTeam = response.data.roundResults.slice(-1)[0].winningTeam
                    console.log(winningTeam)
                    for (let p of response.data.players) {
                        if (p.gameName === "BIG T") {
                            let team = p.teamId
                            console.log(p.teamId)
                            console.log(p.teamId == winningTeam)
                            e.addField("Win?", p.teamId == winningTeam)
                            s += "Win? : " + (p.teamId == winningTeam) + "\n"
                            break;
                        }
                    }
                    bot.channels.get(botCommandsChannel).send("<@367128870656147459>").then(msg => {
                        msg.edit(s);
                    })
                });
            }

        }).catch((error) => {
            console.log(error);
        });
    }
});

bot.login(token);