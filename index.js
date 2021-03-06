//dependencias
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mysql = require('mysql');
const SESSION_FILE_PATH = './session.json';
const { Client } = require('whatsapp-web.js');
const { connect } = require('http2');

//importa arquivo de configuração
const configs = require('./config.json');

//variavel que define sessão
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

//procura sessão existentes
const client = new Client({session: sessionData});

//salva sessão
client.on('authenticated', (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

//dados do mysql
var con = mysql.createConnection({
  host: configs.host,
  user: configs.user,
  password: configs.passwd,
  database: configs.database
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Banco de dados "+configs.database+" conectado com sucesso!");
});

//gera QR code para ler
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

//avisa no terminal quando tiver pronto para uso
client.on('ready', () => {
    console.log(configs.bot_name+" iniciado!");
});

//bloco de comandos
con.connect(function() {
  client.on('message', async msg => {

    //exibe os comandos do bot
    if (msg.body == '!ajuda') {
      msg.reply('⊱⋅ ───⊰• *Comandos* •⊱─── ⋅⊰\n\n× !ping × Só meme mesmo\n× !limparbanco × Limpa o Banco de Dados\n× !edit × Edita registro específico\n× !add × Adiciona registro\n× !del × Deleta registro\n× !listar × Lista todos os registros\n× !ver × Visualiza registro específico\n× !random × Visualiza registro aleatório')
    }

    //limpa banco de dados e reseta contagem de ID
    else if (msg.body.startsWith('!limparbanco')) {
      client.sendMessage(msg.from, "Banco de Dados limpo!");
      const sql = "TRUNCATE "+configs.table;
      return con.query(sql);
    }

    //meme apenas
    else if (msg.body == '!ping') {
      msg.reply('ta tirano mano, vou responder pong não velho :(');
    }

    //edita registros
    else if (msg.body.startsWith('!edit')) {
      const [ command, tableID ] = msg.body.split(' ');
      let comando = msg.body.replace("!edit ", "");
      let dados = comando.replace(tableID+" ", "");
      client.sendMessage(msg.from, "Registro editado!");
      const sql = "UPDATE "+configs.table+" SET frase = ('"+dados+"') WHERE id = ("+tableID+")";
      con.query(sql);
    }
    
    //deleta registros
    else if (msg.body.startsWith('!del')) {
      const sql = "DELETE FROM "+configs.table+" WHERE id = (?)";
      let getID = msg.body.replace("!del", "");
      const values = [getID];
      client.sendMessage(msg.from, "Registro removido!");
      con.query(sql, values);
    }
    
    //adiciona registros
    else if (msg.body.startsWith('!add')) {
      const sql = "INSERT INTO "+configs.table+" (frase) VALUES (?)";
      let dados = msg.body.replace("!add", "");
      const values = [dados];
      client.sendMessage(msg.from, "Registro inserido!");
      con.query(sql, values);
    }

    //exibe todas os resultados
    con.query("SELECT * FROM "+configs.table, function (err, result) {
      if (err) throw err;
      if (msg.body == '!listar') {
        for (let x in result){
          var fraseDB = JSON.stringify(result[x].frase);
          var idDB = JSON.stringify(result[x].id);
          client.sendMessage(msg.from, JSON.parse(idDB)+" - "+JSON.parse(fraseDB));
        }
      };
    });

    //exibe resultado por id
    if (msg.body.startsWith('!ver')) {
        const sql = "SELECT * FROM "+configs.table+" WHERE id = (?)";
        let dados = msg.body.replace("!ver ", "");
        const values = [dados];
      con.query(sql, values, function (err, result) {
        if (err) throw err;
        var fraseDB = JSON.stringify(result[0].frase);
        client.sendMessage(msg.from, JSON.parse(fraseDB));
      });
    };

    //frases aleatórias
    con.query("SELECT * FROM "+configs.table+" ORDER BY RAND() LIMIT 1", function (err, result) {
      if (err) throw err;
      if (msg.body == '!random') {
        for (let x in result) {
          var fraseDB = JSON.stringify(result[x].frase);
          client.sendMessage(msg.from, JSON.parse(fraseDB));
        }
      }
    });

  });
});

//inicializa o bot
client.initialize();