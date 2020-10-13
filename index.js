//dependencias
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const mysql = require('mysql');
const SESSION_FILE_PATH = './session.json';
const { Client } = require('whatsapp-web.js');
const { connect } = require('http2');

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
  host: "localhost",
  user: "root",
  password: null,
  database: "gman_bot"
});

//gera QR code para ler
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

//avisa no terminal quando tiver pronto para uso
client.on('ready', () => {
    console.log('Bot conectado com sucesso!');
});

//bloco de comandos
con.connect(function() {
  client.on('message', async msg => {

    //exibe os comandos do bot
    if (msg.body == '!ajuda') {
      msg.reply('⊱⋅ ───⊰• *Comandos* •⊱─── ⋅⊰\n\n× !ping × Só meme mesmo\n× !limparbanco × Limpa o Banco de Dados\n× !edit × Edita registro específico\n× !add × Adiciona registro\n× !del × Deleta registro\n× !listar × Lista todos os registros')
    }

    //limpa banco de dados e reseta contagem de ID
    else if (msg.body.startsWith('!limparbanco')) {
      client.sendMessage(msg.from, "Banco de Dados limpo!");
      const sql = "TRUNCATE frases";
      return con.query(sql);
    }

    //meme apenas
    else if (msg.body == '!ping') {
      msg.reply('ta tirano mano, vou responder pong não velho :(');
    }

    //edita registros
    else if (msg.body.startsWith('!edit')) {
      const [ command, tableID ] = msg.body.split(' ');
      let comando = msg.body.replace("!edit", "");
      let dados = comando.replace(tableID, "");
      client.sendMessage(msg.from, "Registro editado!");
      const sql = "UPDATE frases SET frase = ('"+dados+"') WHERE id = ("+tableID+")";
      con.query(sql);
    }
    
    //deleta registros
    else if (msg.body.startsWith('!del')) {
      const sql = "DELETE FROM frases WHERE id = (?)";
      let corno = msg.body.replace("!del", "");
      const values = [corno];
      client.sendMessage(msg.from, "Registro removido!");
      con.query(sql, values);
    }
    
    //adiciona registros
    else if (msg.body.startsWith('!add')) {
      const sql = "INSERT INTO frases (frase) VALUES (?)";
      let dados = msg.body.replace("!add", "");
      const values = [dados];
      client.sendMessage(msg.from, "Registro inserido!");
      con.query(sql, values);
    }

    //exibe todas as frases
    con.query("SELECT * FROM frases", function (err, result) {
      if (err) throw err;
      if (msg.body == '!listar') {
        for (let x in result){
          var fraseDB = JSON.stringify(result[x].frase);
          var idDB = JSON.stringify(result[x].id);
          client.sendMessage(msg.from, JSON.parse(idDB)+" - "+JSON.parse(fraseDB));
        }
      };
    });

    //frases aleatórias
    con.query("SELECT * FROM frases ORDER BY RAND() LIMIT 1", function (err, result) {
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