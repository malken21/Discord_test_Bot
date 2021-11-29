
const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const https = require('https');
const fs = require('fs');
const cron = require('node-cron');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const Config = require('./Config.json');
client.login(Config.TOKEN);

client.on('ready', () => {
  const data = [{
		name: "satofull",
		description: "さとふる のテータスを表示"
	}];
	client.application.commands.set(data, Config.serverID);
	console.log(`login (${client.user.tag})`);
});

cron.schedule('30 0 * * * *', () => {
  const text = fs.readFileSync("text.txt");
  let datas = '';
  https.get(Config.URL, (res) => {
    res.on('data', (d) => {
      datas = datas+d.toString();
    });
    res.on('end', () => {
      const ninzuu = datas.split(/支援者合計|受付終了日/g)[1].split('<dd>')[1].split('</dd>')[0];
      fs.writeFile("text.txt", ninzuu, (err) => {if (err) throw err;console.log('バックアップ完了');});
      if(ninzuu != text){
        const title = datas.split('<title>')[1].split(' | ふるさと納税サイト「さとふる」\n</title>')[0];
        const goukei = datas.split(/現在の寄付合計|目標金額/g)[1].split('<dd>')[1].split('</dd>')[0];
        const mokuhyou = datas.split(/目標金額|支援者合計/g)[1].split('<dd>')[1].split('</dd>')[0];
        const syuuryoubi = datas.split(/受付終了日|この事業を支援する/g)[1].split('<dd>')[1].split('</dd>')[0];
        const ato = Number(mokuhyou.replace(/,|円/g,""))-Number(goukei.replace(/,|円/g,""));
        const tasseiritu = Number(goukei.replace(/,|円/g,""))*100/Number(mokuhyou.replace(/,|円/g,""));
        const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('支援者が増えた!!')
        .setDescription(title)
        .addFields(
          { name: '現在の寄付金合計', value: goukei, inline: true },
          { name: '目標金額', value: mokuhyou, inline: true },
          { name: '支援者合計', value: ninzuu, inline: true },
          { name: '受付終了日', value: syuuryoubi, inline: true },
          { name: '目標金額まで', value:  `あと${ato.toLocaleString()}円` , inline: true },
          { name: '達成率', value: `${tasseiritu.toLocaleString()}%`, inline: true }
        )
        client.guilds.cache.get(Config.serverID).channels.cache.get(Config.channelID).send({ embeds: [embed] , components: [new MessageActionRow().addComponents(new MessageButton().setURL(Config.URL).setLabel(`寄付はこちらから`).setStyle(`LINK`))]});
      }
    });
  });
});

client.on("interactionCreate", interaction => {
	if (!interaction.isCommand()) {
    return;
  }
  if (interaction.commandName === `satofull`) {
    let datas = '';
    https.get(Config.URL, (res) => {
      res.on('data', (d) => {
        datas = datas+d.toString();
      });
      res.on('end', () => {
        const ninzuu = datas.split(/支援者合計|受付終了日/g)[1].split('<dd>')[1].split('</dd>')[0];
        const title = datas.split('<title>')[1].split(' | ふるさと納税サイト「さとふる」\n</title>')[0];
        const goukei = datas.split(/現在の寄付合計|目標金額/g)[1].split('<dd>')[1].split('</dd>')[0];
        const mokuhyou = datas.split(/目標金額|支援者合計/g)[1].split('<dd>')[1].split('</dd>')[0];
        const syuuryoubi = datas.split(/受付終了日|この事業を支援する/g)[1].split('<dd>')[1].split('</dd>')[0];
        const description = datas.split(/<a href="#cfReward" class="cf-Button2">この事業を支援する|この事業で選択可能なお礼品/g)[1].split(/<div class="cf-Article__body">/)[1].split('</div><!-- /.cf-Article__body -->')[0].replace(/<br .>/g,'');

        const ato = Number(mokuhyou.replace(/,|円/g,""))-Number(goukei.replace(/,|円/g,""));
        const tasseiritu = Number(goukei.replace(/,|円/g,""))*100/Number(mokuhyou.replace(/,|円/g,""));
        const embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(title)
        .setDescription(description)
        .addFields(
          { name: '現在の寄付金合計', value: goukei, inline: true },
          { name: '目標金額', value: mokuhyou, inline: true },
          { name: '支援者合計', value: ninzuu, inline: true },
          { name: '受付終了日', value: syuuryoubi, inline: true },
          { name: '目標金額まで', value:  `あと${ato.toLocaleString()}円` , inline: true },
          { name: '達成率', value: `${tasseiritu.toLocaleString()}%`, inline: true }
        )
        interaction.reply({ embeds: [embed] , components: [new MessageActionRow().addComponents(new MessageButton().setURL(Config.URL).setLabel(`寄付はこちらから`).setStyle(`LINK`))]});
      });

    });
	}
});