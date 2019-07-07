const Discord = require("discord.js")
const bot = new Discord.Client()
const firebase = require("firebase")
var date = require("date-and-time");
// const fs = require('fs');
// let rawWeaponData = fs.readFileSync('weapons.json');  
// let weapons = JSON.parse(rawWeaponData);
// let rawAttackData = fs.readFileSync('weapons.json');  
// let attacks = JSON.parse(rawAttackData);
const weapons = require('./weapons.json')
const attacks = require('./attacks.json')
const enemies = require("./enemies.json")
const quests = require("./quests.json")
const materials = require("./materials.json")
const floors = require("./floors.json")
var duelObjects = [

]
var questObjects = [

]

var botVersion = "0.2.2"

var playerTemplate = {
    Health: 100,
    Health_Cap: 100,
    EnergyCap: 3,
    Armor_Class: 5,
    Magic_Defense: 5,
    Physical_Amp: 0,
    Magic_Amp: 0,
    Class: 0,
    InDuel: false,
    Level: 1,
    Augments_Remaining: 1,
    Weapon: weapons[0],
    Armor: 0,
    Exp: 0,
    Lives: 1,
    Start_Time: Date(),
    Coins: 0,
    Class: "",
    Name: "",
    InQuest: false,
    Inventory: [

    ],
    Version: botVersion,
    Floor: 1
}

var config = {
    apiKey: "AIzaSyBIkqcsvFQJjvHVzwA-y9_WlImEgPw9ftE",
    authDomain: "spire-of-ascension.firebaseapp.com",
    databaseURL: "https://spire-of-ascension.firebaseio.com",
    projectId: "spire-of-ascension",
    storageBucket: "spire-of-ascension.appspot.com",
    messagingSenderId: "655797975154"
}
firebase.initializeApp(config)

bot.on("ready", async () => {
    bot.user.setActivity("Ascension v" + botVersion)
    console.log("Bot is ready")
})

bot.on("message", async (message) => {
    if(message.author.id == 548716366237138944) return

    let prefix = "]"
    let messageArray = message.content.split(" ")
    let cmd = messageArray[0]
    let finalMessage = ""

    if (cmd.includes(prefix) && cmd != `${prefix}create` && cmd != `${prefix}remove` && cmd != `${prefix}y` && cmd != `${prefix}n` && cmd != `${prefix}yes` && cmd != `${prefix}no`) {
        checkAccount(message.author.id, function(param) {
            if (param) {
                checkVersion(message.author.id, message.author.username)
            }
        })
    }

    if(cmd == `${prefix}botinfo`) {
        let boticon = bot.user.displayAvatarURL
        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Info")
        .setColor("#c11b4a")
        .setThumbnail(boticon)
        .addField("Name:", bot.user.username)
        .addField("Created At: ",bot.user.createdAt)
        .addField("Created By: ", "˜”*°•.˜”*°•| ﾧﾷﾷӃΙﾼ |•°*”˜.•°*”˜#9963")
        .addField("Helpers: \n", "Darkspine77#1365")
        message.channel.send(botembed)
    }

    else if(cmd == `${prefix}create`) {
        let database = firebase.database().ref("Players/" + message.author.id)
        database.once("value").then(function(snapshot) {
            if (snapshot.val() == null) {
                helpCommand(message.author, message.channel)
                var value = playerTemplate
                value.Name = message.author.username
                var DATE = new Date();
                value.Start_Time = date.format(DATE, 'ddd MMM DD YYYY')
                database.update(value)
                finalMessage += "__**Account Created**__\n"
                finalMessage += "```\n"
                finalMessage += "You wake up and you feel the cold stone freezing on your back. You struggle to remember who you are. Where you are. What you are.\n"
                finalMessage += "Horrid thoughts flood your mind as you guage your surroundings.\n"
                finalMessage += "A waterfall looms in front of you, crashing waves onto a basin below. You are standing on what seems to be a trapdoor but it looks tightly sealed. A circular symbol is etched into the stonework below you and it is huge. All around you, you see darkness. There is nothing here except you. You try to recall your memories but you come up with nothing.\n"
                finalMessage += "-------------------\n"
                finalMessage += "After walking around for a while, torches suddenly light up in a spiral around you\n"
                finalMessage += "***RAORRRRRR***"
                finalMessage += "A beckoning sound rumbles from above and you feel a heavy atmosphere drop on top of you. It's hard to breathe."
                finalMessage += "```"
                message.channel.send(finalMessage)
                initQuest(0, message.author.id, message.channel, "Start")
            } 
            else {
                finalMessage = "```\n"
                finalMessage += "Your soul is already in this world\n"
                finalMessage += "```"
                message.channel.send(finalMessage)
            }
        })
        
    }

    else if (cmd == `${prefix}remove`) {
        let database = firebase.database().ref("Players/")
        database.once("value").then(function(snapshot) {
            if (snapshot.hasChild(message.author.id)) {
                finalMessage = "```css\n"
                finalMessage += "Are you sure you want to delete your account? This action cannot be undone\n"
                finalMessage += `You have 7 seconds to respond with ${prefix}yes or ${prefix}no\n`
                finalMessage += "```"
                message.reply(finalMessage)
                const filter = m => m.author.id === message.author.id
                message.channel.awaitMessages(filter, {max: 1, time: 7000}).then(collected => {
                    if(collected.first().content === `${prefix}yes` || collected.first().content === `${prefix}y`) {
                        removeAccount(message.author.id, function() {
                            for (let i = 0; i < duelObjects.length; i++) {
                                if (duelObjects[i].playerId == message.author.id) {
                                    duelObjects.splice(i)
                                }
                            }
                            for (let i = 0; i < questObjects.length; i++) {
                                if (questObjects[i].playerId == message.author.id) {
                                    questObjects.splice(i)
                                }
                            }
                            database.child(message.author.id).remove()
                            finalMessage = "```\n"
                            finalMessage += "You feel a tug in your soul. Has it finally been the end? Is this... what is left of you? A hollow shell... a faltered will. You close your eyes as you slump to the floor, your consciousness fading. You hear a crude laugh echo in the distance before you slip into darkness. The spire beckons you. The spire laughs at your weakness....\n"
                            finalMessage += "```"
                            finalMessage += "__**Termination Complete**__"
                            message.channel.send(finalMessage)
                        })
                    }
                    if(collected.first().content === `${prefix}no`|| collected.first().content === `${prefix}n`) {
                        finalMessage = "```\n"
                        finalMessage += "You have canceled your termination\n"
                        finalMessage += "```\n"
                        message.channel.send(finalMessage)
                    }
                })
            }
            else {
                finalMessage = "```\n"
                finalMessage += "You don't exist yet in this tower\n"
                finalMessage += "```"
                message.channel.send(finalMessage)
            }
        })
    }
    else if (cmd == `${prefix}weapon`) {
        if (messageArray[1]) {
            if (messageArray[1] == "equipped") {
                checkAccount(message.author.id, function(param) {
                    if (param) {
                        let database = firebase.database().ref("Players/" + message.author.id)
                        database.once("value").then(function(snapshot) {
                            let data = snapshot.val()
                            let finalMessage = ""
                            finalMessage = "__**" + data.Weapon.Name + "**__  " + Number(data.Weapon.Id + 1) + "/" + weapons.length + "\n"
                            finalMessage += "```css\n"
                            finalMessage += "Name: " + data.Weapon.Name + "\n"
                            finalMessage += "Description: " + data.Weapon.Description + "\n"
                            finalMessage += "ID: " + Number(data.Weapon.Id+1) + "\n"
                            finalMessage += "Node Slots: " + data.Weapon.Node_Slots + "\n"
                            finalMessage += "Floor Found: " + data.Weapon.Floor + "\n"
                            finalMessage += "[ Attacks: ]\n"
                            finalMessage += "----------------------------------------------\n"
                            let keys = Object.keys(data.Weapon.Attacks)
                            for(var i = 0; i < keys.length; i++) {
                                j = attacks[i]
                                finalMessage += "   Name: " + j.Name + "\n"
                                finalMessage += "   ID: " + Number(j.Id+1) + "\n"
                                finalMessage += "   Description: " + j.Description + "\n"
                                finalMessage += "[  Cost: " + j.Cost + " ]\n"
                                finalMessage += "[  Physical Ratio: " + j.Physical_Ratio * 100 + "% ]\n"
                                finalMessage += "[  Magical Ratio: " + j.Magical_Ratio * 100 + "% ]\n"
                                finalMessage += "----------------------------------------------\n"
                            }
                            finalMessage += "\n"
                            finalMessage += "Physical: " + data.Weapon.Physical + "\n"
                            finalMessage += "Magical: " + data.Weapon.Magical + "\n"
                            finalMessage += "Ethereal: " + data.Weapon.Ethereal + "\n"
                            finalMessage += "```"
                            message.channel.send(finalMessage)
                        })
                    }
                    else {
                        message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                    }
                })
            }
            else if (!isNaN(messageArray[1])) {
                if (messageArray[1] > weapons.length || messageArray[1] < 1) {
                    message.channel.send("`That Weapon Does Not Exist`")
                    return
                }
                message.channel.send(seeWeapon(messageArray[1]))   
            }
            else {
                message.channel.send("`That command does not exist`")
            }
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to view the stats of any weapon. Using weapon ID will not show any additional stats or modifiers that have been added\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}weapon: Shows this text\n`
            finalMessage += `   ${prefix}weapon <ID>: Shows the stats of the given weapon ID\n`
            finalMessage += `   ${prefix}weapon equipped: Shows the stats of your currently equipped weapon\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }
    else if (cmd == `${prefix}attack`) {
        if (messageArray[1]) {
            if (!isNaN(messageArray[1])) {
                if (messageArray[1] > attacks.length || messageArray[1] < 1) {
                    message.channel.send("`That Attack Does Not Exist`")
                    return
                }
                message.channel.send(seeAttack(messageArray[1]))   
            }
            else {
                message.channel.send("`That command does not exist`")
            }
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to view the stats of any attack\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}attack: Shows this text\n`
            finalMessage += `   ${prefix}attack <ID>: Shows the stats of the given attack ID\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }
    else if (cmd == `${prefix}enemy`) {
        if (messageArray[1]) {
            if (!isNaN(messageArray[1])) {
                if (messageArray[1] > enemies.length || messageArray[1] < 1) {
                    message.channel.send("`That Enemy Does Not Exist`")
                    return
                }
                message.channel.send(seeEnemy(messageArray[1]))   
            }
            else {
                message.channel.send("`That command does not exist`")
            }
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to view the stats of any enemy\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}enemy: Shows this text\n`
            finalMessage += `   ${prefix}enemy <ID>: Shows the stats of the given enemy ID\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }
    else if (cmd == `${prefix}material`) {
        if (messageArray[1]) {
            if (!isNaN(messageArray[1])) {
                if (messageArray[1] > materials.length || messageArray[1] < 1) {
                    message.channel.send("`That Material Does Not Exist`")
                    return
                }
                message.channel.send(seeMaterial(messageArray[1]))   
            }
            else {
                message.channel.send("`That command does not exist`")
            }
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to view the stats of any material\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}material: Shows this text\n`
            finalMessage += `   ${prefix}material <ID>: Shows the stats of the given material ID\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }
    else if (cmd == `${prefix}floor`) {
        if (messageArray[1]) {
            if (!isNaN(messageArray[1])) {
                if (messageArray[1] > floors.length || messageArray[1] < 1) {
                    message.channel.send("`That Floor Does Not Exist`")
                    return
                }
                message.channel.send(seeFloor(messageArray[1]))   
            }
            else {
                message.channel.send("`That command does not exist`")
            }
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to view the stats of any floor\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}floor: Shows this text\n`
            finalMessage += `   ${prefix}floor <Number>: Shows the stats of the given floor number\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }

    else if (cmd == `${prefix}profile`) {
        if (messageArray[1]) {
            if (message.mentions.users.first()) {
                finalMessage = ""
            let database = firebase.database().ref("Players/")
            database.once("value").then(function(snapshot) {
                if (snapshot.hasChild(message.mentions.users.first().id)) {
                    database = firebase.database().ref("Players/" + message.mentions.users.first().id)
        database.once('value').then(function(snapshot) {
            let tempMessage = snapshot.val()
            let temp = snapshot.val()
            finalMessage = "__**" + message.mentions.users.first().username + "**__\n"
            finalMessage += "```css\n"
            finalMessage += "Start Time: " + tempMessage.Start_Time + "\n"
            if (tempMessage.Class == "") {
                finalMessage += "Class: None\n"
            }
            else {
                finalMessage += "Class: " + tempMessage.Class + "\n"
            }
            finalMessage += "Level: " + tempMessage.Level + "\n"
            finalMessage += "Health: " + tempMessage.Health + "/" + tempMessage.Health_Cap + "\n"
            finalMessage += "Lives: " + tempMessage.Lives + "\n"
            finalMessage += "Exp: " + tempMessage.Exp + "\n"
            finalMessage += "Coins: " + tempMessage.Coins + "\n"
            finalMessage += "Floor: " + tempMessage.Floor + "\n"
            finalMessage += "Augments Remaining: " + tempMessage.Augments_Remaining + "\n"
            finalMessage += "Energy: " + tempMessage.EnergyCap + "\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Weapon ]\n"
            finalMessage += "   Name: " + temp.Weapon.Name + "\n"
            finalMessage += "   Description: " + temp.Weapon.Description + "\n"
            finalMessage += "   ID: " + Number(temp.Weapon.Id+1) + "\n"
            // finalMessage += "[   Attacks: ]\n"
            // finalMessage += "----------------------------------------------\n"
            // let keys = Object.keys(weapons[id-1].Attacks)
            // for(var i = 0; i < keys.length; i++) {
            //     j = attacks[i]
            //     finalMessage += "      Name: " + j.Name + "\n"
            //     finalMessage += "      ID: " + Number(j.Id+1) + "\n"
            //     finalMessage += "      Description: " + j.Description + "\n"
            //     finalMessage += "[    Cost: " + j.Cost + " ]\n"
            //     finalMessage += "[    Physical Ratio: " + j.Physical_Ratio + "% ]\n"
            //     finalMessage += "[    Magical Ratio: " + j.Magical_Ratio + "% ]\n"
            //     finalMessage += "----------------------------------------------\n"
            // }
            finalMessage += "\n"
            finalMessage += "   Physical: " + temp.Weapon.Physical + "\n"
            finalMessage += "   Magical: " + temp.Weapon.Magical + "\n"
            finalMessage += "   Ethereal: " + temp.Weapon.Ethereal + "\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "Armor: Will Add Later\n"
            finalMessage += "[ Armor Class: " + tempMessage.Armor_Class + "]\n"
            finalMessage += "[ Magic Defense: " + tempMessage.Magic_Defense + "]\n"
            finalMessage += "[ Physical Amp: " + tempMessage.Physical_Amp + "]\n"
            finalMessage += "[ Magic Amp: " + tempMessage.Magic_Amp + "]\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
    })
                }
                else {
                    message.channel.send("`That user does not have an account`")
                }
            })
            }
            else {
                message.channel.send("`You must mention a valid user`")
            }
        }
        else {
            checkAccount(message.author.id, function(param) {
                if (param == true) {
                // if (checkAccount(message.author.id) == false) return message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
            let database = firebase.database().ref("Players/")
            database.once("value").then(function(snapshot) {
                if (snapshot.hasChild(message.author.id)) {
                    finalMessage = ""
        let database = firebase.database().ref("Players/" + message.author.id)
        database.once('value').then(function(snapshot) {
            let tempMessage = snapshot.val()
            let temp = snapshot.val()
            finalMessage = "__**" + message.author.username + "**__\n"
            finalMessage += "```css\n"
            finalMessage += "Start Time: " + tempMessage.Start_Time + "\n"
            if (tempMessage.Class == "") {
                finalMessage += "Class: None\n"
            }
            else {
                finalMessage += "Class: " + tempMessage.Class + "\n"
            }
            finalMessage += "Level: " + tempMessage.Level + "\n"
            finalMessage += "Health: " + tempMessage.Health + "/" + tempMessage.Health_Cap + "\n"
            finalMessage += "Lives: " + tempMessage.Lives + "\n"
            finalMessage += "Exp: " + tempMessage.Exp + "\n"
            finalMessage += "Coins: " + tempMessage.Coins + "\n"
            finalMessage += "Floor: " + tempMessage.Floor + "\n"
            finalMessage += "Augments Remaining: " + tempMessage.Augments_Remaining + "\n"
            finalMessage += "Energy: " + tempMessage.EnergyCap + "/" + tempMessage.EnergyCap + "\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Weapon ]\n"
            finalMessage += "   Name: " + temp.Weapon.Name + "\n"
            finalMessage += "   Description: " + temp.Weapon.Description + "\n"
            finalMessage += "   ID: " + Number(temp.Weapon.Id+1) + "\n"
            // finalMessage += "[   Attacks: ]\n"
            // finalMessage += "----------------------------------------------\n"
            // let keys = Object.keys(weapons[id-1].Attacks)
            // for(var i = 0; i < keys.length; i++) {
            //     j = attacks[i]
            //     finalMessage += "      Name: " + j.Name + "\n"
            //     finalMessage += "      ID: " + Number(j.Id+1) + "\n"
            //     finalMessage += "      Description: " + j.Description + "\n"
            //     finalMessage += "[    Cost: " + j.Cost + " ]\n"
            //     finalMessage += "[    Physical Ratio: " + j.Physical_Ratio + "% ]\n"
            //     finalMessage += "[    Magical Ratio: " + j.Magical_Ratio + "% ]\n"
            //     finalMessage += "----------------------------------------------\n"
            // }
            finalMessage += "\n"
            finalMessage += "   Physical: " + temp.Weapon.Physical + "\n"
            finalMessage += "   Magical: " + temp.Weapon.Magical + "\n"
            finalMessage += "   Ethereal: " + temp.Weapon.Ethereal + "\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "Armor: Will Add Later\n"
            finalMessage += "[ Armor Class: " + tempMessage.Armor_Class + "]\n"
            finalMessage += "[ Magic Defense: " + tempMessage.Magic_Defense + "]\n"
            finalMessage += "[ Physical Amp: " + tempMessage.Physical_Amp + "]\n"
            finalMessage += "[ Magic Amp: " + tempMessage.Magic_Amp + "]\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
    })
                }
                else {
                    message.channel.send("`Your soul does not exist in the spire yet`")
                }
            })
                }
                else {
                    message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                    return
                }
            })
        }
    }
    else if (cmd == `${prefix}duel`) {
        checkAccount(message.author.id, function(param) {
            if (param == true) {
                if (messageArray[1] > enemies.length) {
                    message.channel.send("`That Enemy Does Not Exist`")
                    return
                }
                let database = firebase.database().ref("Players/" + message.author.id)
                database.once('value').then(function(snapshot) {
                        let value = snapshot.val()
                    if (value.InDuel == false) {
                        let finalMessage = ""
                        let enemy = enemies[messageArray[1]-1]
                        if (isNaN(messageArray[1])) {
                            finalMessage = "`An ERROR has occured. You must put the ID number in the parameter`"
                            message.channel.send(finalMessage)
                            return
                        }
                        else {
                            // let enemyLevel = Math.round(Math.random(value.Level - 2), value.Level + 2)
                            let enemyLevel = Math.round(Math.random() * ((value.Level + 1) - (value.Level - 2))) + (value.Level - 2)
                            if (enemyLevel < 1) {
                                enemyLevel = 1
                            }
                            initDuel(enemy, message.author.id, enemyLevel, function(finalMessage) {
                                message.channel.send(finalMessage)
                            })
                        }
                    }
                    else {
                        message.channel.send("`You are already in combat`")
                        return
                    }
                })
            }
            else {
                message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                return
            }
        })
        
    }
    else if (cmd == `${prefix}use`) {
        if (messageArray[1]) {
            checkAccount(message.author.id, function(param) {
                if (param) {
                    let finalMessage = ""
                    let canSend = true;
                    if (messageArray[1] == "attack") {
                        if (isNaN(messageArray[2])) {
                            message.channel.send("`Make Sure You Input An Attack Number`")
                        }
                        let database = firebase.database().ref("Players/" + message.author.id)
                        database.once('value').then(function(snapshot) {
                            let data = snapshot.val();
                            if (data.InDuel == false) {
                                message.channel.send("`You are not in combat`")
                                canSend = false;
                                return
                            }
                            else if (messageArray[2] > weapons[data.Weapon.Id].Attacks.length || messageArray[2] < 1) {
                                message.channel.send("`That Attack Does Not Exist`")
                                canSend = false;
                            }
                            else {
                                for (let i = 0; i < duelObjects.length; i++) {
                                    if (duelObjects[i].PlayerId == message.author.id) {
                                        if (duelObjects[i].Turn == "Enemy") {
                                            message.channel.send("`It is not your turn`")
                                            canSend = false;
                                        }
                                        else if (attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost > duelObjects[i].PlayerEnergy) {
                                            message.channel.send("`You Do Not Have Enough Energy To Use This Attack`")
                                            canSend = false;
                                        }
                                        
                                    }
                                }
                            }
                            if (canSend == true) {
                                if (messageArray[3]) {
                                    if (isNaN(messageArray[3])) {
                                        return message.channel.send("`That is not a valid quantity`")
                                    }
                                    else if (Math.sign(messageArray[3]) != 1) {
                                        return message.channel.send("`Please enter a valid number`")
                                    }
                                    else {
                                        for (let i = 0;  i < duelObjects.length; i++) {
                                            if (duelObjects[i].PlayerId == message.author.id) {
                                                if (attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost * messageArray[3] > duelObjects[i].PlayerEnergy) {
                                                    return message.channel.send("`You do not have the energy to use this many attacks`")
                                                }
                                            }
                                        }
                                        finalMessage = "```css\n"
                                        finalMessage += "Are you sure you want to use " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + " " + messageArray[3] + " times" + "\n"
                                        finalMessage += "```"
                                        message.channel.send(finalMessage)
                                        finalMessage = "```css\n"
                                        finalMessage += `[ You have 7 seconds to respond with ]\n    ${prefix}yes\nor\n    ${prefix}no\n`
                                        finalMessage += "```"
                                        message.channel.send(finalMessage)
                                        const filter = m => m.author.id === message.author.id
                                        message.channel.awaitMessages(filter, {max: 1, time: 7000}).then(collected => {
                                            if(collected.first().content === `${prefix}yes` || collected.first().content === `${prefix}y`) {
                                                for (let i = 0; i < duelObjects.length; i++) {
                                                    if (duelObjects[i].PlayerId == message.author.id) {
                                                        for (let g = 0; g < messageArray[3]; g++) {
                                                            duelObjects[i].PlayerAttackQueue.push(attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Id)
                                                            duelObjects[i].PlayerEnergy -= attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost
                                                        }
                                                        message.channel.send("```css\nYou used " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + " " + messageArray[3] + " times" + " for " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost * messageArray[3] + " amount of energy\nYou have " + duelObjects[i].PlayerEnergy + "/" + data.EnergyCap + " energy left```")
                                                    }
                                                }
                                                
                                            }
                                            if(collected.first().content === `${prefix}no`|| collected.first().content === `${prefix}n`) {
                                                return message.channel.send("```css\nYou have cancelled the attack " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + "```")
                                            }
                                        })
                                    }
                                }
                                else {
                                    finalMessage = "```css\n"
                                    finalMessage += "Are you sure you want to use " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + "\n"
                                    finalMessage += "```"
                                    message.channel.send(finalMessage)
                                    finalMessage = "```css\n"
                                    finalMessage += `[ You have 7 seconds to respond with ]\n    ${prefix}yes\nor\n    ${prefix}no\n`
                                    finalMessage += "```"
                                    message.channel.send(finalMessage)
                                    const filter = m => m.author.id === message.author.id
                                    message.channel.awaitMessages(filter, {max: 1, time: 7000}).then(collected => {
                                        if(collected.first().content === `${prefix}yes` || collected.first().content === `${prefix}y`) {
                                            for (let i = 0; i < duelObjects.length; i++) {
                                                if (duelObjects[i].PlayerId == message.author.id) {
                                                    duelObjects[i].PlayerAttackQueue.push(attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Id)
                                                    duelObjects[i].PlayerEnergy -= attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost
                                                    message.channel.send("```css\nYou used " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + " for " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Cost + " amount of energy\nYou have " + duelObjects[i].PlayerEnergy + "/" + data.EnergyCap + " energy left```")
                                                }
                                            }
                                            
                                        }
                                        if(collected.first().content === `${prefix}no`|| collected.first().content === `${prefix}n`) {
                                            return message.channel.send("```css\nYou have cancelled the attack " + attacks[weapons[data.Weapon.Id].Attacks[messageArray[2]-1]].Name + "```")
                                        }
                                    })
                                }    
                            }
                        })
                    }
                    else {
                        message.channel.send("`That is not a valid parameter`")
                    }
                }
                else {
                    message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                    return
                }
            }) 
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to use a certain action in combat\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}use: Shows this text\n`
            finalMessage += `   ${prefix}use attack <ID>: Queues the attack of the given ID\n`
            finalMessage += `   ${prefix}use attack <ID> <Quanity>: Queues the attack of the given ID, Quanity times\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }

    }
    else if (cmd == `${prefix}usedAttacks`) {
        checkAccount(message.author.id, function(param) {
            if (param) {
                let finalMessage = ""
                let database = firebase.database().ref("Players/" + message.author.id)
                database.once('value').then(function(snapshot) {
                    let value = snapshot.val()
                    if (value.InDuel == false) {
                        message.channel.send("`You are not in combat`")
                    } else {
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                if (duelObjects[i].Turn == "Player") {
                                    finalMessage = "```css\n"
                                    finalMessage += "[ Attacks Queued ]\n"
                                    finalMessage += "----------------------------------------------\n"
                                    for (let j = 0; j < duelObjects[i].PlayerAttackQueue.length; j++) {
                                        finalMessage += "   [ " + attacks[duelObjects[i].PlayerAttackQueue[j]].Name + " ]" + "  ID: " + attacks[duelObjects[i].PlayerAttackQueue[j]].Id + "\n"
                                        finalMessage += "----------------------------------------------\n"
                                    }
                                    finalMessage += "You have " + duelObjects[i].PlayerEnergy + "/" + duelObjects[i].PlayerMaxEnergy + " energy left\n"
                                    finalMessage += "```"
                                    message.channel.send(finalMessage)
                                } else {
                                    message.channel.send("`It is not your turn`")
                                }
                            }
                        }
                    }
                })
            }
            else {
                message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                return
            }
        }) 
    }
    else if (cmd == `${prefix}end` || cmd == `${prefix}endTurn`) {
        checkAccount(message.author.id, function(param) {
            if (param) {
                endPlayerTurn(messageArray, message.channel, message)
            }
            else {
                message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                return
            }
        })
    }
    else if (cmd == `${prefix}run`) {
        checkAccount(message.author.id, function(param) {
            if (param) {
                let database = firebase.database().ref("Players/" + message.author.id)
                database.once('value').then(function(snapshot) {
                    let val = snapshot.val() 
                    if (val.InDuel == false) {
                        message.channel.send("`You are not in a duel`")
                    }
                    else {
                        value = {
                            InDuel: false
                        }
                        database.update(value)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        message.channel.send("```css\nYou have fled from battle\n```")
                    }
                })
            }
            else {
                message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                return
            }
        })
    }
    else if (cmd == `${prefix}help`) {
        helpCommand(message.author, message.channel)
    }
    else if (cmd == `${prefix}choice` || cmd == `${prefix}Choice`) {
        if (messageArray[1]) {
            checkAccount(message.author.id, function(param) {
                if (param) {
                    if (isNaN(messageArray[1])) return message.channel.send("`That is not a valid parameter`")
                    else {
                        let database = firebase.database().ref("Players/" + message.author.id)
                        database.once('value').then(function(snapshot) {
                            let value = snapshot.val()
                            if (value.InQuest == false) {
                                message.channel.send("`You are not in a quest`")
                                return
                            }
                            else if (value.InQuest == true) {
                                for (let i = 0; i < questObjects.length; i++) {
                                    if (questObjects[i].PlayerId == message.author.id) {
                                        if (questObjects[i].Quest.Script[questObjects[i].QuestPosition][0] == "Text") {
                                            if (messageArray[1]-1 > questObjects[i].Quest.Script[questObjects[i].QuestPosition][2].length || messageArray[1]-1 < 0) {
                                                message.channel.send("`You must enter a valid choice number`")
                                            }
                                            for (let j = 0; j < questObjects[i].Quest.Script[questObjects[i].QuestPosition][2].length; j++) {
                                                if (messageArray[1]-1 == j) {
                                                    questObjects[i].QuestPosition = questObjects[i].Quest.Script[questObjects[i].QuestPosition][2][messageArray[1]-1][1]
                                                    initQuest(questObjects[i].Quest.Id, message.author.id, message.channel, "Continue Text")
                                                }
                                            }
                                        }
                                        else {
                                            message.channel.send("`You are not in a choice position`")
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
                else {
                    message.channel.send("```\nYou do not exist yet in this tower\nCreate an account using ]create```")
                    return
                }
            })
        }
        else {
            finalMessage = "```css\n"
            finalMessage += "[ Incorrect Command Usage: ]\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Description: ]\n"
            finalMessage += "   Used to choose a path in quests\n"
            finalMessage += "----------------------------------------------\n"
            finalMessage += "[ Usage: ]\n"
            finalMessage += `   ${prefix}choice: Shows this text\n`
            finalMessage += `   ${prefix}choice <Number>: Selects the choice of that given number\n`
            finalMessage += "----------------------------------------------\n"
            finalMessage += "```"
            message.channel.send(finalMessage)
        }
    }
    else if (cmd == `${prefix}inventory` || cmd == `${prefix}inv`) {
        let database = firebase.database().ref("Players/" + message.author.id + "/" + "Inventory")
        database.once('value').then(function(snapshot) {
            let value = snapshot.val()
            if (value != null) {
                if (value.length != 0) {
                    let invLength = value.length
                    let finalMessage = "__**Inventory** " + (invLength) + " items recorded__\n"
                    message.channel.send(finalMessage)
                    let invMessage = ""
                    let invMessages = [
        
                    ]
                    for (let i = 0; i < value.length; i++) {
                        if (invMessage.length >= 1900) {
                            invMessages.push(invMessage)
                            invMessage = ""
                        }
                        else {
                            if (value[i].Type == "Material") {
                                invMessage += "Slot " + (i+1) + ": " + value[i].Name + " -- " + value[i].Type + " -- Floor: " + value[i].Floor + " -- x" + value[i].Count + "\n"
                            }
                            else if (value[i].Type == "Weapon") {
                                invMessage += "Slot " + (i+1) + ": " + value[i].Name + " -- " + value[i].Type + " -- Floor: " + value[i].Floor + "\n"
                            }
                        }
                        if (i+1 == value.length) {
                            invMessages.push(invMessage)
                        }
                    }
                    for (let i = 0; i < invMessages.length; i++) {
                        finalMessage = "```css\n"
                        finalMessage += invMessages[i]
                        finalMessage += "```"
                        message.channel.send(finalMessage)
                    } 
                }
                else {
                    let finalMessage = "__**Inventory** " + 0 + " items recorded__\n"
                    finalMessage += "```\n"
                    finalMessage += "```"
                    message.channel.send(finalMessage)
                }
            }
            else {
                let finalMessage = "__**Inventory** " + 0 + " items recorded__\n"
                finalMessage += "```\n"
                finalMessage += "```"
                message.channel.send(finalMessage)
            }
        })
    }
    else if (cmd == `${prefix}give`) {
        drops(enemies[0].Drop_Table, message.author.id, message.channel)
    }
    else if (cmd == `${prefix}quest`) {
        initQuest(1, message.author.id, message.channel, "Start")
    }

})

//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

function checkVersion(playerId, messageUser) {
    let database = firebase.database().ref("Players/" + playerId)
    database.once('value').then(function(snapshot) {
        let value = snapshot.val()
        if (value.Version != botVersion) {
            profileFix(playerId, messageUser)
        }
    })
}

function profileFix(playerId, messageUser) {
    let database = firebase.database().ref("Players/" + playerId)
    database.once('value').then(function(snapshot) {
        let template = playerTemplate
        template.Name = messageUser
        let playerObject = snapshot.val()
        for (var key in template) {
            if (playerObject[key] == undefined) {
                playerObject[key] = template[key]
            }
        }
        playerObject.Version = botVersion
        database.update(playerObject)
    })
}

function drops(enemyDrop, playerId, messageChannel) {
        let dropArray = [

        ]
        let finalMessage = "```css\n"
        for (let i = 0; i < enemyDrop.length; i++) {
            let r = Math.random()
            if (r < enemyDrop[i].Chance) {
                dropArray.push(enemyDrop[i])
                finalMessage += "You have aqquired " + enemyDrop[i].Name + " -- ID: " + (enemyDrop[i].Id + 1) + " -- " + enemyDrop[i].Type + "\n"
            }
        }
        invPush(playerId, dropArray)
        finalMessage += "```"
        if (dropArray.length == 0) {
            finalMessage = "```\n"
            finalMessage += "You have no aqquired anything\n"
            finalMessage += "```"
            messageChannel.send(finalMessage)
        }
        else {
            messageChannel.send(finalMessage)
        }
}

function helpCommand(messageAuthor, messageChannel) {
    let finalMessage = "```css\n"
        finalMessage += "How to fight enemies: "
        finalMessage += "You have a set amount of resource. This resource is called [ ENERGY ]. Every attack you make uses up this [ ENERGY ]. Enemies have this mechanic as well\n"
        finalMessage += "To use an attack, you use the ]use command.\n"
        finalMessage += "This command has many uses, but the attack parameter is one of them. Upon adding the attack parameter, you need to enter an attack ID as another parameter.\n"
        finalMessage += "At default, you have 2 attacks, Simple Twack : 1, and Magical Twange : 2, with their attack numbers respectively.\n"
        finalMessage += "If you view your weapon using ]weapon equipped, you will see all your attacks that you can use. The attack ID number corrosponds to the order/what attacks you have unlocked.\n"
        finalMessage += "In addition, if you want to bulk use attacks, you can add an additional parameter indicating how much of that attack you want to use.\n"
        finalMessage += "----------------------------------------------\n"
        finalMessage += "   Final Command: \n"
        finalMessage += "   ]use attack 2 3\n"
        finalMessage += "----------------------------------------------\n"
        finalMessage += "Using the command ]usedAttacks will list all the attacks you have used this turn\n"
        finalMessage += "Using the command ]end will end your turn and have the enemy take their turn."
        finalMessage += "```"
        messageAuthor.send(finalMessage)

        finalMessage = "```css\n"
        finalMessage += "Available Commands:\n"
        finalMessage += "   botinfo\n"
        finalMessage += "   create\n"
        finalMessage += "   remove\n"
        finalMessage += "   enemy\n"
        finalMessage += "   attack\n"
        finalMessage += "   weapon\n"
        finalMessage += "   material\n"
        finalMessage += "   profile\n"
        finalMessage += "   duel\n"
        finalMessage += "   use (currently the only parameter is use attack)\n"
        finalMessage += "   usedAttacks\n"
        finalMessage += "   run\n"
        finalMessage += "   end\n" 
        finalMessage += "   choice\n"
        finalMessage += "```"
        messageAuthor.send(finalMessage)
        finalMessage = "```\n"
        finalMessage += "A help message has been sent to your DMs\n"
        finalMessage += "```"
        messageChannel.send(finalMessage)
}

function invPush(playerId, materialArray) {
    let database = firebase.database().ref("Players/" + playerId + "/Inventory/")
    database.once('value').then(function(snapshot) {
        let value = snapshot.val()
        let inv = [
            
        ]
        if (value != null) {
            for (let i = 0; i < value.length; i++) {
                inv.push(value[i])
            }
        }
        for (let i = 0; i < materialArray.length; i++) {
            if (materialArray[i].Type == "Material") {
                let canAdd = false
                if (inv.length != 0) {
                    for (let j = 0; j < inv.length; j++) {
                        if ((materialArray[i].Type && materialArray[i].Name) == (inv[j].Type && inv[j].Name)) {
                            inv[j].Count ++
                        }
                        else if (j == inv.length) {
                            canAdd = true
                        }
                    }
                    if (canAdd) {
                        inv.push(materialArray[i])
                    }
                }
                else {
                    inv.push(materialArray[i])
                }
            }
            else if (materialArray[i].Type == "Weapon") {
                inv.push(materialArray[i])
            }
        }
        database.update(inv)
    })
}

function checkAccount(PlayerId, callback) {
    let database = firebase.database().ref("Players/")
    database.once('value').then(function(snapshot) {
        if (snapshot.hasChild(PlayerId)) {
            callback(true)
        }
        else {
            callback(false)
        }
    })
}

function removeAccount(messageAuthor, callback) {
    let database = firebase.database().ref("Players/" + messageAuthor)
    database.once('value').then(function(snapshot) {
        let data = snapshot.val()
        if (data.InDuel == true && data.InQuest == true) {
            value = {
                InDuel: false
            }
            database.update(value)
            for (let i = 0; i < duelObjects.length; i++) {
                if (duelObjects[i].PlayerId == messageAuthor) {
                    duelObjects.splice(i)
                }
            }
            value2 = {
                InQuest: false
            }
            database.update(value2)
            for (let i = 0; i < questObjects.length; i++) {
                if (questObjects[i].PlayerId == messageAuthor) {
                    questObjects.splice(i)
                }
            }
            callback()
        }
        else if (data.InQuest == true) {
            value = {
                InQuest: false
            }
            database.update(value)
            for (let i = 0; i < questObjects.length; i++) {
                if (questObjects[i].PlayerId == messageAuthor) {
                    questObjects.splice(i)
                }
            }
        }
        else if (data.InDuel == true) {
            value = {
                InDuel: false
            }
            database.update(value)
            for (let i = 0; i < duelObjects.length; i++) {
                if (duelObjects[i].PlayerId == messageAuthor) {
                    duelObjects.splice(i)
                }
            }
            callback()
        }
        else {
            callback()
        }
    })
}

function endPlayerTurn(messageArray, messageChannel, message) {
    if (messageArray[1] == "full") {
        let finalMessage = ""
let database = firebase.database().ref("Players/" + message.author.id)
database.once('value').then(function (snapshot) {
    let value = snapshot.val()
    if (value.InDuel == false) {
        messageChannel.send("`You are not in combat`")
    }
    else {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == message.author.id) {
                if (duelObjects[i].Turn == "Player") {
                    let finalDamage = 0
                    let damage = 0
                    finalMessage = "```css\n"
                    finalMessage += "[ You have ended your turn ]\n"
                    for (let j = 0; j < duelObjects[i].PlayerAttackQueue.length; j++) {
                        damage = 0
                        let usedAttack = duelObjects[i].PlayerAttackQueue[j]
                        finalMessage += "You used [ " + attacks[usedAttack].Name + " ]\n"
                        finalMessage += "   You try to do [ " + Math.round(duelObjects[i].PlayerWeapon.Physical * attacks[usedAttack].Physical_Ratio) + " ] physical damage\n"
                        damage += calculateResistences(Math.round(duelObjects[i].PlayerWeapon.Physical * attacks[usedAttack].Physical_Ratio), duelObjects[i].EnemyArmorClass)
                        finalMessage += "   You try to do [ " + Math.round(duelObjects[i].PlayerWeapon.Magical * attacks[usedAttack].Magical_Ratio) + " ] magical damage\n"
                        damage += calculateResistences(Math.round(duelObjects[i].PlayerWeapon.Magical * attacks[usedAttack].Magical_Ratio), duelObjects[i].EnemyMagicDefense)
                        if (attacks[usedAttack].Ethereal == true) {
                            finalMessage += "   You did [ " + Math.round(duelObjects[i].PlayerWeapon.Ethereal) + " ] ethereal damage\n"
                            damage += duelObjects[i].PlayerWeapon.Ethereal
                        }
                        finalMessage += "The enemy took [ " + damage + " ] damage from " + attacks[usedAttack].Name + "\n"
                        duelObjects[i].EnemyHp -= damage
                        finalDamage += damage
                        finalMessage += "\n"
                    }
                    finalMessage += "The enemy has an armor class of " + duelObjects[i].EnemyArmorClass + "\n"
                    finalMessage += "The enemy has a magic defense of " + duelObjects[i].EnemyMagicDefense + "\n"
                    finalMessage += "\n"
                    finalMessage += enemies[duelObjects[i].Enemy].Name + " has taken " + finalDamage + " damage and now has " + duelObjects[i].EnemyHp + "/" + duelObjects[i].EnemyMaxHp + " health remaining"
                    finalMessage += "```"
                    messageChannel.send(finalMessage)
                    if (duelObjects[i].PlayerHp <= 0 && duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                    let update = {
                                        InDuel: false
                                    }
                                    database.update(update)
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].PlayerHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\n" + enemies[duelObjects[i].Enemy].Name + " has been killed```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Continue")
                                }
                            }
                        }
                        return
                    }
                    duelObjects[i].Turn = "Enemy"
                    var availableEnemyAttacks = enemies[duelObjects[i].Enemy].Attacks
                    var availableWeaponAttacks = weapons[enemies[duelObjects[i].Enemy].Weapon].Attacks
                    var availableAttacks = availableEnemyAttacks.concat(availableWeaponAttacks)
                    var availableEnergyAttacks = []
                    finalMessage = "```css\n"
                    finalMessage += "[ " + enemies[duelObjects[i].Enemy].Name + " has ended their turn ]\n"
                    for (let a = 0; a < availableAttacks.length; a++) {
                        availableEnergyAttacks.push(attacks[availableAttacks[a]].Cost)
                    }
                    while (duelObjects[i].EnemyEnergy >= Math.min.apply(null, availableEnergyAttacks)) {
                        let r = Math.random()
                        if (enemies[duelObjects[i].Enemy].Attacks.length == 0) {
                            r = 0
                        }
                        else if (r < 0.6) {
                            finalMessage += enemyWeaponAttack(message.author.id, "full")
                        }
                        else {
                            finalMessage += enemyEnemyAttack(message.author.id, "full")
                        }
                    }
                    let damageTaken = duelObjects[i].PlayerPreviousHp - duelObjects[i].PlayerHp
                    finalMessage += "You have taken " + damageTaken + " damage and now have " + duelObjects[i].PlayerHp + "/" + duelObjects[i].PlayerMaxHp + " health remaining"
                    finalMessage += "```"
                    messageChannel.send(finalMessage)
                    if (duelObjects[i].PlayerHp <= 0 && duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].PlayerHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\n" + enemies[duelObjects[i].Enemy].Name + " has been killed```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Continue")
                                }
                            }
                        }
                        return
                    }
                    duelObjects[i].Turn = "Player"
                    duelObjects[i].PlayerEnergy = duelObjects[i].PlayerMaxEnergy
                    duelObjects[i].PlayerAttackQueue = []
                    duelObjects[i].EnemyEnergy = duelObjects[i].EnemyMaxEnergy
                    duelObjects[i].PlayerPreviousHp = duelObjects[i].PlayerHp
                }
                else {
                    messageChannel.send("`It is not your turn`")
                }
            }
        }
    }
})
    }
else {
    let finalMessage = ""
let database = firebase.database().ref("Players/" + message.author.id)
database.once('value').then(function (snapshot) {
    let value = snapshot.val()
    if (value.InDuel == false) {
        messageChannel.send("`You are not in combat`")
    }
    else {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == message.author.id) {
                if (duelObjects[i].Turn == "Player") {
                    let finalDamage = 0
                    let damage = 0
                    finalMessage = "```css\n"
                    finalMessage += "[ You have ended your turn ]\n"
                    for (let j = 0; j < duelObjects[i].PlayerAttackQueue.length; j++) {
                        damage = 0
                        let usedAttack = duelObjects[i].PlayerAttackQueue[j]
                        finalMessage += "You used [ " + attacks[usedAttack].Name + " ]\n"
                        // finalMessage += "   You try to do [ " + Math.round(duelObjects[i].PlayerWeapon.Physical * attacks[usedAttack].Physical_Ratio) + " ] physical damage\n"
                        damage += calculateResistences(Math.round(duelObjects[i].PlayerWeapon.Physical * attacks[usedAttack].Physical_Ratio), duelObjects[i].EnemyArmorClass)
                        // finalMessage += "   You try to do [ " + Math.round(duelObjects[i].PlayerWeapon.Magical * attacks[usedAttack].Magical_Ratio) + " ] magical damage\n"
                        damage += calculateResistences(Math.round(duelObjects[i].PlayerWeapon.Magical * attacks[usedAttack].Magical_Ratio), duelObjects[i].EnemyMagicDefense)
                        if (attacks[usedAttack].Ethereal == true) {
                            // finalMessage += "   You did [ " + Math.round(duelObjects[i].PlayerWeapon.Ethereal) + " ] ethereal damage\n"
                            damage += duelObjects[i].PlayerWeapon.Ethereal
                        }
                        finalMessage += "   The enemy took [ " + damage + " ] damage from " + attacks[usedAttack].Name + "\n"
                        duelObjects[i].EnemyHp -= damage
                        finalDamage += damage
                        finalMessage += "\n"
                    }
                    finalMessage += "The enemy has an armor class of " + duelObjects[i].EnemyArmorClass + "\n"
                    finalMessage += "The enemy has a magic defense of " + duelObjects[i].EnemyMagicDefense + "\n"
                    finalMessage += "\n"
                    finalMessage += enemies[duelObjects[i].Enemy].Name + " has taken " + finalDamage + " damage and now has " + duelObjects[i].EnemyHp + "/" + duelObjects[i].EnemyMaxHp + " health remaining"
                    finalMessage += "```"
                    messageChannel.send(finalMessage)
                    if (duelObjects[i].PlayerHp <= 0 && duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].PlayerHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\n" + enemies[duelObjects[i].Enemy].Name + " has been killed```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Continue")
                                }
                            }
                        }
                        return
                    }
                    duelObjects[i].Turn = "Enemy"
                    var availableEnemyAttacks = enemies[duelObjects[i].Enemy].Attacks
                    var availableWeaponAttacks = weapons[enemies[duelObjects[i].Enemy].Weapon].Attacks
                    var availableAttacks = availableEnemyAttacks.concat(availableWeaponAttacks)
                    var availableEnergyAttacks = []
                    finalMessage = "```css\n"
                    finalMessage += "[ " + enemies[duelObjects[i].Enemy].Name + " has ended their turn ]\n"
                    for (let a = 0; a < availableAttacks.length; a++) {
                        availableEnergyAttacks.push(attacks[availableAttacks[a]].Cost)
                    }
                    while (duelObjects[i].EnemyEnergy >= Math.min.apply(null, availableEnergyAttacks)) {
                        let r = Math.random()
                        if (enemies[duelObjects[i].Enemy].Attacks.length == 0) {
                            r = 0
                        }
                        else if (r < 0.6) {
                            finalMessage += enemyWeaponAttack(message.author.id, "short")
                        }
                        else {
                            finalMessage += enemyEnemyAttack(message.author.id, "short")
                        }
                    }
                    let damageTaken = duelObjects[i].PlayerPreviousHp - duelObjects[i].PlayerHp
                    finalMessage += "You have taken " + damageTaken + " damage and now have " + duelObjects[i].PlayerHp + "/" + duelObjects[i].PlayerMaxHp + " health remaining"
                    finalMessage += "```"
                    messageChannel.send(finalMessage)
                    if (duelObjects[i].PlayerHp <= 0 && duelObjects[i].EnemyHp <= 0) {
                        message.channel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].PlayerHp <= 0) {
                        messageChannel.send("```css\nYou have been terminated\n```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Fail")
                                }
                            }
                        }
                        return
                    }
                    else if (duelObjects[i].EnemyHp <= 0) {
                        messageChannel.send("```css\n" + enemies[duelObjects[i].Enemy].Name + " has been killed```")
                        let update = {
                            InDuel: false
                        }
                        database.update(update)
                        for (let i = 0; i < duelObjects.length; i++) {
                            if (duelObjects[i].PlayerId == message.author.id) {
                                duelObjects.splice(i)
                            }
                        }
                        if (value.InQuest == true) {
                            for (let o = 0; o < questObjects.length; o++) {
                                if (questObjects[o].PlayerId == message.author.id) {
                                    initQuest(questObjects[o].QuestId, message.author.id, message.channel, "Continue")
                                }
                            }
                        }
                        return
                    }
                    duelObjects[i].Turn = "Player"
                    duelObjects[i].PlayerEnergy = duelObjects[i].PlayerMaxEnergy
                    duelObjects[i].PlayerAttackQueue = []
                    duelObjects[i].EnemyEnergy = duelObjects[i].EnemyMaxEnergy
                    duelObjects[i].PlayerPreviousHp = duelObjects[i].PlayerHp
                }
                else {
                    messageChannel.send("`It is not your turn`")
                }
            }
        }
    }
})
}
}

function initQuest(QuestId, playerId, messageChannel, status) {
    let database = firebase.database().ref("Players/" + playerId)
    database.once('value').then(function(snapshot) {
        value = snapshot.val()
        if (status == "Start") {
            let finalMessage = "```css\n"
            finalMessage += "[" + quests[QuestId].QuestName + "] Quest has been initialized\n"
            finalMessage += "```"
            let selectQuest = quests[QuestId]
            messageChannel.send(finalMessage)
            questObjects.push(
                {
                    PlayerId: playerId,
                    Quest: quests[QuestId],
                    QuestPosition: 0
                }
            )
            let update = {
                InQuest: true
            }
            database.update(update)
            for (let i = 0; i < questObjects.length; i++) {
                if (questObjects[i].PlayerId == playerId) {
                    if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Battle") {
                        initDuel(selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]], playerId, selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]].Level, function(finalMessage) {
                            messageChannel.send(finalMessage)
                        })
                    }
                }
            }
        }
        else {
            for (let i = 0; i < questObjects.length; i++) {
                if (questObjects[i].PlayerId == playerId) {
                    let selectQuest = questObjects[i].Quest
                    if (status == "Continue") {
                        for (let l = 0; l < duelObjects.length; l++) {
                            if (duelObjects[l].PlayerId == playerId) {
                                duelObjects.splice(l)
                            }
                        }
                        questObjects[i].QuestPosition = selectQuest.Script[questObjects[i].QuestPosition][2]
                        if (typeof selectQuest.Script[questObjects[i].QuestPosition][2] == "string") {
                            if (selectQuest.Script[questObjects[i].QuestPosition][2] == "End") {
                                finalMessage = "```css\n"
                                finalMessage += selectQuest.EndMessage + "\n"
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                                let update = {
                                    InQuest: false
                                }
                                questObjects.splice(i)
                                database.update(update)
                            }
                            else if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndFail") {
                                finalMessage = "```css\n"
                                finalMessage += "You have [failed] this quest" + "\n"
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                                let update = {
                                    InQuest: false
                                }
                                questObjects.splice(i)
                                database.update(update)
                            }
                            else if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndPass") {
                                finalMessage = "```css\n"
                                finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                                finalMessage = "```css\n"
                                finalMessage += selectQuest.EndMessage + "\n"
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                                let update = {
                                    InQuest: false
                                }
                                questObjects.splice(i)
                                database.update(update)
                            }
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Battle") {
                            initDuel(selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]], playerId, selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]].Level, function(finalMessage) {
                                messageChannel.send(finalMessage)
                            })
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Text") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            for (let j = 0; j < selectQuest.Script[questObjects[i].QuestPosition][2].length; j++) {
                                finalMessage = "```css\n"
                                finalMessage += "Choice " + (j + 1) + ": " + selectQuest.Script[questObjects[i].QuestPosition][2][j][0]
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                            }
                        }
                    }
                    else if (status == "Fail") {
                        for (let l = 0; l < duelObjects.length; l++) {
                            if (duelObjects[l].PlayerId == playerId) {
                                duelObjects.splice(l)
                            }
                        }
                        questObjects[i].QuestPosition = selectQuest.Script[questObjects[i].QuestPosition][3]
                        if (selectQuest.Script[questObjects[i].QuestPosition][2] === "End") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.EndMessage + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            let update = {
                                InQuest: false
                            }
                            questObjects.splice(i)
                            database.update(update)
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndFail") {
                            finalMessage = "```css\n"
                            finalMessage += "You have [failed] this quest" + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            let update = {
                                InQuest: false
                            }
                            questObjects.splice(i)
                            database.update(update)
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndPass") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.EndMessage + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            let update = {
                                InQuest: false
                            }
                            questObjects.splice(i)
                            database.update(update)
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Battle") {
                            initDuel(selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]], playerId, selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]].Level, function(finalMessage) {
                                messageChannel.send(finalMessage)
                            })
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Text") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            for (let j = 0; j < selectQuest.Script[questObjects[i].QuestPosition][2].length; j++) {
                                finalMessage = "```css\n"
                                finalMessage += "Choice " + (j + 1) + ": " + selectQuest.Script[questObjects[i].QuestPosition][2][j][0]
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                            }
                        }
                    }
                    else if (status == "Continue Text") {
                        if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndFail") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            finalMessage = "```css\n"
                            finalMessage += "You have [failed] this quest" + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            let update = {
                                InQuest: false
                            }
                            questObjects.splice(i)
                            database.update(update)
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][2] === "EndPass") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.EndMessage + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            let update = {
                                InQuest: false
                            }
                            questObjects.splice(i)
                            database.update(update)
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Battle") {
                            initDuel(selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]], playerId, selectQuest.EnemyList[selectQuest.Script[questObjects[i].QuestPosition][1]].Level, function(finalMessage) {
                                messageChannel.send(finalMessage)
                            })
                        }
                        else if (selectQuest.Script[questObjects[i].QuestPosition][0] == "Text") {
                            finalMessage = "```css\n"
                            finalMessage += selectQuest.Script[questObjects[i].QuestPosition][1] + "\n"
                            finalMessage += "```"
                            messageChannel.send(finalMessage)
                            for (let j = 0; j < selectQuest.Script[questObjects[i].QuestPosition][2].length; j++) {
                                finalMessage = "```css\n"
                                finalMessage += "Choice " + (j + 1) + ": " + selectQuest.Script[questObjects[i].QuestPosition][2][j][0]
                                finalMessage += "```"
                                messageChannel.send(finalMessage)
                            }
                        }
                    }
                }
            }
        }
    })
}

function initDuel(enemy, playerId, enemyLevel, callback) {
    let database = firebase.database().ref("Players/" + playerId)
    database.once('value').then(function(snapshot) {
        let turn = 1
        let targetEnemy = enemy
        let finalMessage = "__**You have started a duel against " + targetEnemy.Name + "**__ Level: " + enemyLevel + "  Turn: " + turn
        value = true
        let value2 = snapshot.val()
        finalMessage += "\n```css\n"
        finalMessage += "You have " + value2.Health + "/" + value2.Health_Cap + " Health remaining\n"
        finalMessage += "You have " + value2.EnergyCap + "/" + value2.EnergyCap + " Energy remaining\n"
        value = {
            InDuel: true
        }
        database.update(value)
        let value3 = snapshot.val()
        duelObjects.push(
            {
            PlayerId: playerId,
            PlayerHp: value3.Health,
            PlayerMaxHp: value3.Health_Cap,
            PlayerEnergy: value3.EnergyCap,
            PlayerMaxEnergy: value3.EnergyCap,
            PlayerAttackQueue: [
                
            ],
            PlayerArmorClass: value3.Armor_Class,
            PlayerMagicDefense: value3.Magic_Defense,
            PlayerWeapon: value3.Weapon,
            PlayerPreviousHp: value3.Health,
            EnemyHp: targetEnemy.Health[1] * (targetEnemy.Level),
            EnemyMaxHp: targetEnemy.Health[1] * (targetEnemy.Level),
            EnemyEnergy: targetEnemy.Energy,
            EnemyMaxEnergy: targetEnemy.Energy,
            EnemyAttackQueue: [
    
            ],
            EnemyArmorClass: Math.round(Math.random() * (targetEnemy.Armor_Class[1] - targetEnemy.Armor_Class[0]) + targetEnemy.Armor_Class[0]) * targetEnemy.Level,
            EnemyMagicDefense: Math.round(Math.random() * (targetEnemy.Magic_Defense[1] - targetEnemy.Magic_Defense[0]) + targetEnemy.Magic_Defense[0]) * targetEnemy.Level,
            EnemyWeapon: weapons[targetEnemy.Weapon],
            Turn: "Player",
            Enemy: targetEnemy.Id,
            EnemyLevel: enemyLevel
            }
        )
        finalMessage += "\n"
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == playerId) {
                finalMessage += "The enemy has an armor class of " + duelObjects[i].EnemyArmorClass + "\n"
                finalMessage += "The enemy has a magic defense of " + duelObjects[i].EnemyMagicDefense + "\n"
            }
        }
        finalMessage += "```"
        callback(finalMessage)
    })
}

function calculateResistences(damage, resistenceScore) {
    if (damage < resistenceScore) {
        return 0
    }
    else {
        return damage - resistenceScore
    }
}

function enemyWeaponAttack(playerId, param) {
    if (param == "full") {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == playerId) {
                var enemy = enemies[duelObjects[i].Enemy]
                let enemyLevel = duelObjects[i].EnemyLevel
                let finalMessage = ""
                var availableWeaponAttacks = weapons[enemies[duelObjects[i].Enemy].Weapon].Attacks
                let chosenAttack = attacks[availableWeaponAttacks[Math.floor(Math.random() * availableWeaponAttacks.length)]]
                let damage = 0
                finalMessage += enemy.Name + " used [ " + chosenAttack.Name + " ]\n"
                finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)) + " ] physical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerArmorClass)
                finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7))+ " ] magical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerMagicDefense)
                if (chosenAttack.Ethereal == true) {
                    finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(duelObjects[i].EnemyWeapon.Ethereal) + " ] ethereal damage\n"
                    damage += duelObjects[i].EnemyWeapon.Ethereal
                }
                finalMessage += "You took [ " + damage + " ] damage from " + chosenAttack.Name + "\n"
                finalMessage += "\n"
                duelObjects[i].EnemyEnergy -= chosenAttack.Cost
                duelObjects[i].PlayerHp -= damage
                return finalMessage
            }
        }
    }
    else if (param == "short") {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == playerId) {
                var enemy = enemies[duelObjects[i].Enemy]
                let enemyLevel = duelObjects[i].EnemyLevel
                let finalMessage = ""
                var availableWeaponAttacks = weapons[enemies[duelObjects[i].Enemy].Weapon].Attacks
                let chosenAttack = attacks[availableWeaponAttacks[Math.floor(Math.random() * availableWeaponAttacks.length)]]
                let damage = 0
                finalMessage += enemy.Name + " used [ " + chosenAttack.Name + " ]\n"
                // finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio) + " ] physical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerArmorClass)
                // finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio)+ " ] magical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerMagicDefense)
                if (chosenAttack.Ethereal == true) {
                    damage += duelObjects[i].EnemyWeapon.Ethereal
                }
                finalMessage += "   You took [ " + damage + " ] damage from " + chosenAttack.Name + "\n"
                finalMessage += "\n"
                duelObjects[i].EnemyEnergy -= chosenAttack.Cost
                duelObjects[i].PlayerHp -= damage
                return finalMessage
            }
        }
    }
}

function enemyEnemyAttack(playerId, param) {
    if (param == "full") {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == playerId) {
                var enemy = enemies[duelObjects[i].Enemy]
                let enemyLevel = duelObjects[i].EnemyLevel
                let finalMessage = ""
                var availableEnemyAttacks = enemies[duelObjects[i].Enemy].Attacks
                let chosenAttack = attacks[availableEnemyAttacks[Math.floor(Math.random() * availableEnemyAttacks.length)]]
                let damage = 0;
                finalMessage += enemy.Name + " used [ " + chosenAttack.Name + " ]\n"
                finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)) + " ] physical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerArmorClass)
                finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7))+ " ] magical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerMagicDefense)
                if (chosenAttack.Ethereal == true) {
                    finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(duelObjects[i].EnemyWeapon.Ethereal) + " ] ethereal damage\n"
                    damage += duelObjects[i].EnemyWeapon.Ethereal
                }
                finalMessage += "You took [ " + damage + " ] damage from " + chosenAttack.Name + "\n"
                finalMessage += "\n"
                duelObjects[i].EnemyEnergy -= chosenAttack.Cost
                duelObjects[i].PlayerHp -= damage
                return finalMessage
            }
        }
    }
    else if (param == "short") {
        for (let i = 0; i < duelObjects.length; i++) {
            if (duelObjects[i].PlayerId == playerId) {
                var enemy = enemies[duelObjects[i].Enemy]
                let enemyLevel = duelObjects[i].EnemyLevel
                let finalMessage = ""
                var availableEnemyAttacks = enemies[duelObjects[i].Enemy].Attacks
                let chosenAttack = attacks[availableEnemyAttacks[Math.floor(Math.random() * availableEnemyAttacks.length)]]
                let damage = 0
                finalMessage += enemy.Name + " used [ " + chosenAttack.Name + " ]\n"
                // finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio) + " ] physical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Physical * chosenAttack.Physical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerArmorClass)
                // finalMessage += "   " + enemy.Name + " tried to do [ " + Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio)+ " ] magical damage\n"
                damage += calculateResistences(Math.round(weapons[enemy.Weapon].Magical * chosenAttack.Magical_Ratio * (enemyLevel * 0.7)), duelObjects[i].PlayerMagicDefense)
                if (chosenAttack.Ethereal == true) {
                    damage += duelObjects[i].EnemyWeapon.Ethereal
                }
                finalMessage += "   You took [ " + damage + " ] damage from " + chosenAttack.Name + "\n"
                finalMessage += "\n"
                duelObjects[i].EnemyEnergy -= chosenAttack.Cost
                duelObjects[i].PlayerHp -= damage
                return finalMessage
            }
        }
    }
}

function seeFloor(id) {
    let finalMessage = ""
    if (isNaN(id)) return "`An ERROR has occured. You must put the floor number in the parameter`"
    finalMessage = "__**" + floors[id-1].Name + "**__  " + Number(floors[id-1].Number) + "/" + floors.length + "\n"
    finalMessage += "```css\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "   Name: " + floors[id-1].Name + "\n"
    finalMessage += "   Floor Number: " + Number(floors[id-1].Number) + "\n"
    finalMessage += "   Description: " + floors[id-1].Description + "\n"
    finalMessage += "   [ Enemy List: ] \n"
    for (let i = 0; i < floors[id-1].EnemyArray.length; i++) {
        finalMessage += "       [" + enemies[floors[id-1].EnemyArray[i]].Name + "] ID: " + (enemies[floors[id-1].EnemyArray[i]].Id + 1) + "\n"
    }
    finalMessage += "----------------------------------------------\n"
    finalMessage += "```"
    return finalMessage
}

function seeMaterial(id) {
    let finalMessage = ""
    if (isNaN(id)) return "`An ERROR has occured. You must put the ID number in the parameter`"
    finalMessage = "__**" + materials[id-1].Name + "**__  " + Number(materials[id-1].Id+1) + "/" + materials.length + "\n"
    finalMessage += "```css\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "   Name: " + materials[id-1].Name + "\n"
    finalMessage += "   ID: " + Number(materials[id-1].Id+1) + "\n"
    finalMessage += "   Description: " + materials[id-1].Description + "\n"
    finalMessage += "   Floor Found: " + materials[id-1].Floor + "\n"
    finalMessage += "   Drop Chance: " + (materials[id-1].Chance * 100) + "%\n"
    finalMessage += "[  Physical Amp: " + materials[id-1].Physical_Amp + " ]\n"
    finalMessage += "[  Magical Amp: " + materials[id-1].Magical_Amp + " ]\n"
    finalMessage += "[  Ethereal Amp: " + materials[id-1].Ethereal_Amp + " ]\n"
    finalMessage += "   Nodes: " + materials[id-1].Nodes + "\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "```"
    return finalMessage
}

function seeWeapon(id) {
    let finalMessage = ""
    if (isNaN(id)) return "`An ERROR has occured. You must put the ID number in the parameter`"
    finalMessage = "__**" + weapons[id-1].Name + "**__  " + Number(weapons[id-1].Id + 1) + "/" + weapons.length + "\n"
    finalMessage += "```css\n"
    finalMessage += "Name: " + weapons[id-1].Name + "\n"
    finalMessage += "Description: " + weapons[id-1].Description + "\n"
    finalMessage += "ID: " + Number(weapons[id-1].Id+1) + "\n"
    finalMessage += "Node Slots: " + weapons[id-1].Node_Slots + "\n"
    finalMessage += "Floor Found: " + weapons[id-1].Floor + "\n"
    finalMessage += "[ Attacks: ]\n"
    finalMessage += "----------------------------------------------\n"
    for(var i = 0; i < weapons[id-1].Attacks.length; i++) {
        j = attacks[weapons[id-1].Attacks[i]]
        finalMessage += "   Name: " + j.Name + "\n"
        finalMessage += "   ID: " + Number(j.Id+1) + "\n"
        finalMessage += "   Description: " + j.Description + "\n"
        finalMessage += "[  Cost: " + j.Cost + " ]\n"
        finalMessage += "[  Physical Ratio: " + j.Physical_Ratio * 100 + "% ]\n"
        finalMessage += "[  Magical Ratio: " + j.Magical_Ratio * 100 + "% ]\n"
        finalMessage += "[  Ethereal Application: " + j.Ethereal + " ]\n"
        finalMessage += "----------------------------------------------\n"
    }
    finalMessage += "\n"
    finalMessage += "Physical: " + weapons[id-1].Physical + "\n"
    finalMessage += "Magical: " + weapons[id-1].Magical + "\n"
    finalMessage += "Ethereal: " + weapons[id-1].Ethereal + "\n"
    finalMessage += "```"
    return finalMessage
}

function seeAttack(id) {
    let finalMessage = ""
    if (isNaN(id)) return "`An ERROR has occured. You must put the ID number in the parameter`"
    finalMessage = "__**" + attacks[id-1].Name + "**__  " + Number(attacks[id-1].Id+1) + "/" + attacks.length + "\n"
    finalMessage += "```css\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "   Name: " + attacks[id-1].Name + "\n"
    finalMessage += "   ID: " + Number(attacks[id-1].Id+1) + "\n"
    finalMessage += "   Type: " + attacks[id-1].Type + "\n"
    finalMessage += "   Description: " + attacks[id-1].Description + "\n"
    finalMessage += "[  Cost: " + attacks[id-1].Cost + " ]\n"
    finalMessage += "[  Physical Ratio: " + attacks[id-1].Physical_Ratio * 100 + "% ]\n"
    finalMessage += "[  Magical Ratio: " + attacks[id-1].Magical_Ratio * 100 + "% ]\n"
    finalMessage += "[  Ethereal Application: " + attacks[id-1].Ethereal + " ]\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "```"
    return finalMessage
}

function seeEnemy(id) {
    let finalMessage = ""
    if (isNaN(id)) return "`An ERROR has occured. You must put the ID number in the parameter`"
    let weaponUsed = enemies[id-1].Weapon+1
    finalMessage = "__**" + enemies[id-1].Name + "**__  " + Number(enemies[id-1].Id + 1) + "/" + enemies.length + "\n"
    finalMessage += "```css\n"
    finalMessage += "Name: " + enemies[id-1].Name + "\n"
    finalMessage += "Description: " + enemies[id-1].Description + "\n"
    finalMessage += "ID: " + Number(enemies[id-1].Id + 1) + "\n"
    finalMessage += "Health: " + enemies[id-1].Health[1] + "/" + enemies[id-1].Health[1] + "\n"
    finalMessage += "Energy: " + enemies[id-1].Energy + "/" + enemies[id-1].Energy + "\n"
    finalMessage += "Floors Available: " + enemies[id-1].Floor[0] + " - " + enemies[id-1].Floor[1] + "\n"
    finalMessage += "Armor Class: " + enemies[id-1].Armor_Class[0] + " - " + enemies[id-1].Armor_Class[1] + "\n"
    finalMessage += "Magic Defense: " + enemies[id-1].Magic_Defense[0] + " - " + enemies[id-1].Magic_Defense[1] + "\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "   Name: " + weapons[weaponUsed-1].Name + "\n"
    finalMessage += "   Description: " + weapons[weaponUsed-1].Description + "\n"
    finalMessage += "   ID: " + Number(weapons[weaponUsed-1].Id+1) + "\n"
    // finalMessage += "[  Attacks: ]\n"
    // finalMessage += "----------------------------------------------\n"
    // let keys = Object.keys(weapons[weaponUsed-1].Attacks)
    // for(var i = 0; i < keys.length; i++) {
    //     j = attacks[i]
    //     finalMessage += "   Name: " + j.Name + "\n"
    //     finalMessage += "   ID: " + Number(j.Id+1) + "\n"
    //     finalMessage += "   Description: " + j.Description + "\n"
    //     finalMessage += "[  Cost: " + j.Cost + " ]\n"
    //     finalMessage += "[  Physical Ratio: " + j.Physical_Ratio * 100 + "% ]\n"
    //     finalMessage += "[  Magical Ratio: " + j.Magical_Ratio * 100 + "% ]\n"
    //     finalMessage += "----------------------------------------------\n"
    // }
    finalMessage += "\n"
    finalMessage += "   Physical: " + weapons[weaponUsed-1].Physical + "\n"
    finalMessage += "   Magical: " + weapons[weaponUsed-1].Magical + "\n"
    finalMessage += "   Ethereal: " + weapons[weaponUsed-1].Ethereal + "\n"
    finalMessage += "----------------------------------------------\n"
    finalMessage += "Enemy Attacks:\n"
    let keys2 = Object.values(enemies[id-1].Attacks)
    
    for(var i = 0; i < keys2.length; i++) {
        j = attacks[keys2]
        finalMessage += "   Name: " + j.Name + "\n"
        finalMessage += "   ID: " + Number(j.Id+1) + "\n"
        finalMessage += "   Description: " + j.Description + "\n"
        finalMessage += "[  Cost: " + j.Cost + " ]\n"
        finalMessage += "[  Physical Ratio: " + j.Physical_Ratio * 100 + "% ]\n"
        finalMessage += "[  Magical Ratio: " + j.Magical_Ratio * 100 + "% ]\n"
        finalMessage += "[  Ethereal Application: " + j.Ethereal + " ]\n"
        finalMessage += "----------------------------------------------\n"
    }
    finalMessage += "```"
    return finalMessage
}

bot.login("NTQ4NzE2MzY2MjM3MTM4OTQ0.D1JXnQ.uEJmwRTSF_kjxzvl65PDeZrciOk")