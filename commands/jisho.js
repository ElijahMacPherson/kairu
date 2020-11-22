const JishoApi = require('unofficial-jisho-api');
const jisho = new JishoApi();

const hepburn = require("hepburn");

module.exports = {
    name: 'jisho',
    description: 'Jisho.org phrase search',
    execute(message, args) {
        if (args.length === 0) {
            message.channel.send('Please supply a word to look up!');
            return;
        }

        jisho.searchForPhrase(args.join(' ')).then(result => {
            const firstResult = result.data[0];
            const romanjiReading = hepburn.fromKana(firstResult.japanese[0].reading).toLowerCase();
            message.channel.send(`Kanji: ${firstResult.japanese[0].word}, Reading: ${firstResult.japanese[0].reading}, ${romanjiReading}
Meaning: ${firstResult.senses[0].english_definitions.join(', ')}`);
        });
    }
}