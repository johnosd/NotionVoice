# 🎙 Voz → Notion

Transcrição de voz direto para um database do Notion, via servidor local em Node.js.

---

## Como funciona

1. Você fala no navegador
2. O texto é transcrito pela Web Speech API
3. O servidor local envia o item para o seu database no Notion

---

## Pré-requisitos

- [Node.js](https://nodejs.org) v18 ou superior
- Conta no Notion com uma integração criada
- Google Chrome (a Web Speech API não funciona em todos os navegadores)

---

## Configuração do Notion

### 1. Criar a integração

1. Acesse [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clique em **"New integration"**
3. Dê um nome (ex: `Voz para Notion`) e selecione seu workspace
4. Copie o **"Internal Integration Token"**

### 2. Conectar ao database

1. Abra o database no Notion
2. Clique em **"..."** no canto superior direito
3. Vá em **"Connect to"** e selecione sua integração
4. Copie o **ID do database** da URL:
   ```
   https://www.notion.so/SEU-WORKSPACE/[ESTE-É-O-ID]?v=...
   ```

---

## Instalação

Clone ou baixe os arquivos e coloque na mesma pasta:

```
server.js
index.html
package.json
```

---

## Variáveis de ambiente

O token e o database ID ficam apenas nas variáveis de ambiente, nunca no código.

### Temporário (válido enquanto o terminal estiver aberto)

```bash
export NOTION_TOKEN="seu_token_aqui"
export NOTION_DB_ID="seu_database_id_aqui"
```

### Permanente (Bash)

```bash
echo 'export NOTION_TOKEN="seu_token_aqui"' >> ~/.bashrc
echo 'export NOTION_DB_ID="seu_database_id_aqui"' >> ~/.bashrc
source ~/.bashrc
```

### Permanente (Zsh — padrão no macOS)

```bash
echo 'export NOTION_TOKEN="seu_token_aqui"' >> ~/.zshrc
echo 'export NOTION_DB_ID="seu_database_id_aqui"' >> ~/.zshrc
source ~/.zshrc
```

### Windows (PowerShell)

```powershell
$env:NOTION_TOKEN="seu_token_aqui"
$env:NOTION_DB_ID="seu_database_id_aqui"
```

---

## Rodando localmente

```bash
node server.js
```

Abra o navegador em [http://localhost:3456](http://localhost:3456).

---

## Deploy gratuito no Render

1. Suba os arquivos em um repositório no GitHub (pode ser privado)
2. Acesse [render.com](https://render.com) e crie uma conta gratuita
3. Clique em **"New +"** → **"Web Service"** e conecte o repositório
4. Configure:
   | Campo | Valor |
   |---|---|
   | Runtime | `Node` |
   | Branch | `main` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
5. Em **"Environment Variables"**, adicione:
   | Variável | Valor |
   |---|---|
   | `NOTION_TOKEN` | seu token |
   | `NOTION_DB_ID` | seu database ID |
6. Selecione o plano **Free** e clique em **"Create Web Service"**
7. Aguarde o build finalizar — o Render vai gerar uma URL pública no formato `https://seu-servico.onrender.com`

> ⚠️ No plano gratuito do Render, o serviço "dorme" após 15 minutos sem uso. A primeira requisição após esse período pode demorar cerca de 30 segundos para responder.

### Mantendo o serviço sempre ativo com UptimeRobot

Para evitar o "sono" do Render, configure um ping periódico gratuito:

1. Acesse [uptimerobot.com](https://uptimerobot.com) e crie uma conta gratuita
2. Clique em **"Add New Monitor"**
3. Configure:
   | Campo | Valor |
   |---|---|
   | Monitor Type | `HTTP(s)` |
   | Friendly Name | `voz-notion` |
   | URL | a URL gerada pelo Render |
   | Monitoring Interval | `5 minutes` |
4. Clique em **"Create Monitor"**

O UptimeRobot vai bater na URL a cada 5 minutos, impedindo que o Render coloque o serviço para dormir.

---

## Observações

- O servidor detecta automaticamente o nome da propriedade título do database, independente do idioma ou nome configurado no Notion
- Nenhuma credencial é exposta no frontend
- O microfone requer permissão do navegador para funcionar — libere o acesso quando solicitado

## Próximos passos
 
Ideias para evoluir o projeto:
 
- **Data e hora automáticas** — adicionar uma propriedade de data no database para registrar quando cada item foi criado
- **Múltiplos databases** — permitir escolher para qual database enviar direto pela interface, sem precisar alterar variáveis de ambiente
- **Atalho de teclado** — iniciar e parar a gravação com uma tecla de atalho, sem precisar clicar no botão
- **Editar antes de enviar** — permitir corrigir o texto transcrito antes de confirmar o envio ao Notion
- **Histórico persistente** — salvar os itens enviados em `localStorage` para manter o histórico entre sessões
- **Extensão do Chrome** — transformar o app em uma extensão para acessar de qualquer aba sem precisar do servidor local