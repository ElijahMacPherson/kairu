const Discord = require('discord.js');

const renderFurigana = require('render-furigana');
const kanjiFont = '40px Yu Gothic UI';
const furiganaFont = '20px Yu Gothic UI';

const Kuroshiro = require('kuroshiro');

const JishoApi = require('unofficial-jisho-api');
const jisho = new JishoApi();

const log4js = require("log4js");
log4js.configure({
    appenders: { jisho: { type: "file", filename: "kairu.log" } },
    categories: { default: { appenders: ["jisho"], level: "info" } }
});
const logger = log4js.getLogger("jisho");

module.exports = {
    name: 'jisho',
    description: 'Jisho.org phrase search',
    execute(message, args) {
        if (args.length === 0) {
            message.channel.send('Please supply a word to look up!');
            logger.warn('No arguments supplied.');
            return;
        }

        const phrase = args.join(' ');
        console.log(`Search phrase: ${phrase}`);
        logger.info(`Search phrase: ${phrase}`);

        jisho.searchForPhrase(phrase).then(result => {
            if (result.data.length === 0) {
                message.channel.send("No results found!");
                logger.warn('No results found.');
                return;
            }

            const firstResult = result.data[0];
            const kanji = firstResult.japanese[0].word;
            const hiraganaReading = firstResult.japanese[0].reading;
            const romanjiReading = Kuroshiro.Util.kanaToRomaji(hiraganaReading);

            (async function () {
                const renderResult = await renderFurigana(kanji, kanjiFont, furiganaFont);

                const resultEmbed = new Discord.MessageEmbed()
                    .attachFiles([new Discord.MessageAttachment(renderResult, 'kanji.png')])
                    .setColor('#56d926')
                    .setDescription(romanjiReading);

                firstResult.senses.forEach((sense) => {
                    if (sense.parts_of_speech[0] !== 'Wikipedia definition') {
                        resultEmbed.addField(sense.english_definitions.join(', '), sense.parts_of_speech.join(', '))
                    }
                })

                message.channel.send(resultEmbed);
            })();
        });
    }
}