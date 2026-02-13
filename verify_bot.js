try {
    console.log("Cargando comandos...");
    const commands = require('./src/commands/index');
    console.log("Comandos cargados:", Object.keys(commands));
    
    console.log("Probando Sharp...");
    const sharp = require('sharp');
    console.log("Sharp cargado correctamente.");

    process.exit(0);
} catch (err) {
    console.error("Error detectado:");
    console.error(err);
    process.exit(1);
}
