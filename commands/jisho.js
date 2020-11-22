const Discord = require('discord.js');
const fs = require('fs');
const renderFurigana = require('render-furigana');
const kanjiFont = '40px Yu Gothic UI';
const furiganaFont = '20px Yu Gothic UI';
const Kuroshiro = require('kuroshiro');
const JishoApi = require('unofficial-jisho-api');
const jisho = new JishoApi();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

module.exports = {
    name: 'jisho',
    description: 'Jisho.org phrase search',
    execute(message, args) {
        if (args.length === 0) {
            message.channel.send('Please supply a word to look up!');
            return;
        }

        jisho.searchForPhrase(args.join(' ')).then(result => {
            console.log(result);

            if (result.data.length === 0) {
                message.channel.send("No results found!");
                return;
            }

            const firstResult = result.data[0];
            const kanji = firstResult.japanese[0].word;
            const hiraganaReading = firstResult.japanese[0].reading;
            const romanjiReading = Kuroshiro.Util.kanaToRomaji(hiraganaReading);

            (async function () {
                const renderResult = await renderFurigana(kanji, kanjiFont, furiganaFont);
                fs.writeFileSync('./output.png', renderResult);
                await sleep(1000);
            })();

            const resultEmbed = new Discord.MessageEmbed()
                .setTitle(kanji)
                .attachFiles(['./output.png'])
                .setImage('attachment://output.png')
                .setColor('#56d926')
                .setDescription(romanjiReading);

            firstResult.senses.forEach((sense) => {
                if (sense.parts_of_speech[0] !== 'Wikipedia definition') {
                    resultEmbed.addField(sense.english_definitions.join(', '), sense.parts_of_speech.join(', '))
                }
            })

            message.channel.send(resultEmbed);
        });
    }
}