const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const commands = new Map();

const loadCommands = () => {
    commands.clear();
    const commandsDir = path.join(__dirname, '..', 'commands');
    
    let commandCount = 0;

    const readDir = (dir) => {
        if (!fs.existsSync(dir)) return;

        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isDirectory()) {
                readDir(filePath);
            } else if (file.endsWith('.js') && file !== 'index.js') {
                try {
                    // Limpiar caché (útil si quisiéramos recargar comandos en caliente)
                    delete require.cache[require.resolve(filePath)];
                    const command = require(filePath);

                    if (command.name && command.execute) {
                        commands.set(command.name.toLowerCase(), command);
                        commandCount++;

                        if (command.aliases && Array.isArray(command.aliases)) {
                            command.aliases.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                            });
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`[Error al cargar comando] ${file}:`), error);
                }
            }
        }
    }
    
    readDir(commandsDir);
    console.log(chalk.hex("#FFB7C5")(`🌸 Comandos cargados en memoria: ${commandCount}`));
    return commands;
};

module.exports = {
    commands,
    loadCommands
};
