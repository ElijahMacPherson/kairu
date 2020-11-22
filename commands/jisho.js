const Discord = require('discord.js');
const Hepburn = require('hepburn');
const renderFurigana = require('render-furigana');
const fs = require('fs');
const kanjiFont = '40px IPAMincho';
const furiganaFont = '20px IPAMincho';
//const Kuroshiro = require('kuroshiro');
//const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const JishoApi = require('unofficial-jisho-api');
const jisho = new JishoApi();

module.exports = {
    name: 'jisho',
    description: 'Jisho.org phrase search',
    execute(message, args) {
        if (args.length === 0) {
            message.channel.send('Please supply a word to look up!');
            return;
        }

        jisho.searchForPhrase(args.join(' ')).then(result => {
            (async function () {
                var furigana;
                const firstResult = result.data[0];

                try {
                    const kuroshiro = new Kuroshiro();
                    await kuroshiro.init(new KuromojiAnalyzer());
                    furigana = await kuroshiro.convert(firstResult.japanese[0].word, { mode: 'furigana', to: 'hiragana' });
                }
                catch (e) {
                    console.error(e);
                }

                //const furigana = getFurigana(firstResult.japanese[0].word);
                const romanjiReading = Kuroshiro.Util.kanaToRomaji(firstResult.japanese[0].reading);
                const resultEmbed = new Discord.MessageEmbed()
                    .setColor('#56d926')
                    //.setTitle(firstResult.japanese[0].word)
                    .setTitle(furigana)
                    .setDescription(`${romanjiReading}`)

                firstResult.senses.forEach((sense) => {
                    if (sense.parts_of_speech[0] !== 'Wikipedia definition')
                        resultEmbed.addField(sense.english_definitions.join(', '), sense.parts_of_speech.join(', '))
                })

                message.channel.send(resultEmbed);
            })();
            //const romanjiReading = Hepburn.fromKana(firstResult.japanese[0].reading).toLowerCase();
        });
    }
}