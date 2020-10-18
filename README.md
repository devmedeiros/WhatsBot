# Simple WhatsApp Bot

Manipula banco de dados do tipo mySQL (CRUD).

### Depêndencias

whatsapp-web.js</br>
qrcode-terminal</br>
mysql</br>

## Configurando

Antes de tudo certifiquei que tenha um servidor mySQL instalado, crie um banco de dados e uma tabela e modifique o código com as colunas desejadas!

#### Padrão

```json

{
    "host":"IP:PORT",
    "user":"MYSQL USER",
    "passwd": "MYSQL PASSWORD",
    "database":"DATABASE NAME",
    "table":"TABLE NAME",
    "bot_name":"BOT NAME"
}

```

#### Exemplo

```json

{
    "host":"50.51.52.53:3306",
    "user":"my_user",
    "passwd": "my_password",
    "database":"my_database",
    "table":"my_table",
    "bot_name":"Simple Whatsapp Bot"
}

```
	
Obs: Se a acontecer erro na conexão basta remover a porta.

## Instalando e Executando

```npm install``` para instalar as dependências.</br>
```node .``` para iniciar o arquivo index.js.

## Depois de iniciar

O terminal apresentará um QR Code para conectar a sua conta do WhatsApp. Assim que conectado com sucesso estará pronto para uso!

## Implementações Futuras

Irei adicionar um comando para criação de banco de dados e tabela de forma automática.

## Comandos

!ping - Só meme mesmo.</br>
!limparbanco - Reseta a tabela.</br>
!edit (id) (modificação) - Edita registro específico.</br>
!add (texto) - Adiciona registro.</br>
!del (id) - Deleta registro.</br>
!listar - Lista todos os registros.</br>
