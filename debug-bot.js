const { handleMessages } = require('./src/handlers/messageHandler');
const chalk = require('chalk');

// Mock Socket
const mockSock = {
    sendMessage: async (jid, content) => {
        console.log(chalk.blue(`[MOCK] Enviando a ${jid}:`), JSON.stringify(content, null, 2));
        return { key: { id: 'mock-id' } };
    }
};

// Mock Message Upsert
const mockUpsert = {
    messages: [
        {
            key: {
                remoteJid: '521234567890@s.whatsapp.net',
                fromMe: false,
                id: 'ABC12345'
            },
            message: {
                conversation: '!ping'
            },
            messageTimestamp: Date.now()
        }
    ],
    type: 'notify'
};

async function testCommand() {
    console.log(chalk.bold.green('--- INICIANDO TEST DE COMANDOS ---'));
    
    console.log(chalk.yellow('\n1. Probando comando !ping...'));
    await handleMessages(mockUpsert, mockSock);
    
    console.log(chalk.yellow('\n2. Probando comando !menu...'));
    mockUpsert.messages[0].message.conversation = '!menu';
    await handleMessages(mockUpsert, mockSock);

    console.log(chalk.yellow('\n3. Probando comando inexistente...'));
    mockUpsert.messages[0].message.conversation = '!test';
    await handleMessages(mockUpsert, mockSock);

    console.log(chalk.bold.green('\n--- TEST FINALIZADO CON ÉXITO ---'));
    console.log(chalk.cyan('Si ves los mensajes de [MOCK] arriba, la lógica interna está bien.'));
    console.log(chalk.cyan('El problema de cierre debe ser de conexión real con WhatsApp.'));
}

testCommand().catch(err => {
    console.error(chalk.red('\n[!] Error durante el test:'), err);
});
