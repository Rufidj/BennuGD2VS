const vscode = require('vscode');
const { execSync } = require('child_process');
const fs = require('fs');

// Cargar funciones y parámetros desde el archivo JSON
const functions = JSON.parse(fs.readFileSync('./functions.json', 'utf8'));

function getBennuExecutables() {
    // Obtener el PATH del sistema
    const pathEnv = process.env.PATH.split(';'); // Para Windows, usa ';' como separador
    const executables = {
        compiler: null,
        interpreter: null
    };

    // Buscar en cada ruta si existe el compilador y el intérprete
    for (const path of pathEnv) {
        const compilerPath = `${path}/bgdc`; // Cambia a bgdc.exe en Windows
        const interpreterPath = `${path}/bgdi`; // Cambia a bgdi.exe en Windows

        // Comprobar si el compilador existe
        if (!executables.compiler) {
            try {
                execSync(`command -v bgdc`, { stdio: 'ignore' });
                executables.compiler = compilerPath;
            } catch (e) {
                // Ignorar error si no se encuentra
            }
        }

        // Comprobar si el intérprete existe
        if (!executables.interpreter) {
            try {
                execSync(`command -v bgdi`, { stdio: 'ignore' });
                executables.interpreter = interpreterPath;
            } catch (e) {
                // Ignorar error si no se encuentra
            }
        }

        // Salir si ambos se encontraron
        if (executables.compiler && executables.interpreter) {
            break;
        }
    }

    return executables;
}

function provideFunctionParameters(document, position) {
    const lineText = document.lineAt(position).text;
    const wordRange = document.getWordRangeAtPosition(position);
    const functionName = document.getText(wordRange).trim();

    const completionItems = [];

    // Comprobar si la función está definida en functions.json
    if (functions[functionName]) {
        functions[functionName].parameters.forEach(param => {
            const item = new vscode.CompletionItem(param, vscode.CompletionItemKind.Parameter);
            item.documentation = `Parámetro: ${param}`; // Agregar documentación opcional
            completionItems.push(item);
        });
    }

    return completionItems;
}

function compile() {
    const { compiler } = getBennuExecutables();

    if (!compiler) {
        vscode.window.showErrorMessage("No se encontró el compilador (bgdc) en el PATH.");
        return;
    }

    // Aquí puedes implementar la lógica para compilar
    vscode.window.showInformationMessage(`Compilando con ${compiler}...`);
}

function run() {
    const { interpreter } = getBennuExecutables();

    if (!interpreter) {
        vscode.window.showErrorMessage("No se encontró el intérprete (bgdi) en el PATH.");
        return;
    }

    // Aquí puedes implementar la lógica para ejecutar
    vscode.window.showInformationMessage(`Ejecutando con ${interpreter}...`);
}

function activate(context) {
    const { compiler, interpreter } = getBennuExecutables();
    if (!compiler || !interpreter) {
        vscode.window.showErrorMessage("No se encontraron bgdc o bgdi en el PATH.");
        return;
    }

    console.log(`Compilador encontrado en: ${compiler}`);
    console.log(`Intérprete encontrado en: ${interpreter}`);

    context.subscriptions.push(vscode.languages.registerCompletionItemProvider('bennugd2', {
        provideCompletionItems
    }));

    context.subscriptions.push(vscode.commands.registerCommand('bennugd2.compile', compile));
    context.subscriptions.push(vscode.commands.registerCommand('bennugd2.run', run));
}

module.exports = {
    activate
};
