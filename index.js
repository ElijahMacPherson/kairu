require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();
const botCommands = require('./commands');
bot.commands = new Discord.Collection();

Object.keys(botCommands).map(key => {
    bot.commands.set(botCommands[key].name, botCommands[key]);
});

const TOKEN = process.env.DISCORD_TOKEN;

bot.login(TOKEN);

bot.on('ready', () => {
    console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', message => {
    const prefix = '$';
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    console.log(`Called command: ${command}`);

    if (!bot.commands.has(command)) return;

    try {
        bot.commands.get(command).execute(message, args);
    }
    catch (error) {
        console.error(error);
        message.reply("There was an error trying to execute that command!");
    }
});