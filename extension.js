const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');
const which = require('which');

function activate(context) {
    // Crear una terminal para el compilador e intérprete
    const terminal = vscode.window.createTerminal('BennuGD2 Terminal');

    let compileCommand = vscode.commands.registerCommand('bennugd2.compile', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.fileName;
            const compilerPath = getExecutablePath('bgdc');
            if (!compilerPath) {
                vscode.window.showErrorMessage('Compilador (bgdc) no encontrado en el PATH.');
                return;
            }
            terminal.sendText(`${compilerPath} "${filePath}"`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage('No hay un archivo abierto para compilar.');
        }
    });

    let runCommand = vscode.commands.registerCommand('bennugd2.run', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.fileName.replace('.prg', '.exe'); // Cambia esto según tu lógica
            const interpreterPath = getExecutablePath('bgdi');
            if (!interpreterPath) {
                vscode.window.showErrorMessage('Intérprete (bgdi) no encontrado en el PATH.');
                return;
            }
            terminal.sendText(`${interpreterPath} "${filePath}"`);
            terminal.show();
        } else {
            vscode.window.showErrorMessage('No hay un archivo abierto para ejecutar.');
        }
    });

    context.subscriptions.push(compileCommand);
    context.subscriptions.push(runCommand);

    // Configuración para el autocompletado
    const provider = vscode.languages.registerCompletionItemProvider('bennugd2', {
        provideCompletionItems(document, position) {
            const completionItems = [];
            const functions = [
                { label: 'sound_load', parameters: ['STRING Song'] },
                { label: 'music_load', parameters: ['STRING Music'] },
                { label: 'music_unload', parameters: ['INT Music'] },
                { label: 'sound_unload', parameters: ['INT Song'] },
                { label: 'fpg_load', parameters: ['STRING FPG'] },
                { label: 'fpg_unload', parameters: ['INT FPG'] },
                { label: 'set_mode', parameters: ['INT WIDTH, INT HEIGHT'] },
                { label: 'fopen', parameters: ['STRING File,INT Mode'] },
                { label: 'fread', parameters: ['STRING File, INT Variable'] },
                { label: 'fwrite', parameters: ['STRING File, INT Variable'] },
                { label: 'fclose', parameters: ['INT IDFile'] },
                { label: 'fseek', parameters: ['INT IDFile, INT Position, INT From '] },
                { label: 'ftell', parameters: ['INT IDFile'] },
                { label: 'flength', parameters: ['INT IDFile'] },
                { label: 'feof', parameters: ['INT IDFile'] },
                { label: 'map_load', parameters: ['STRING Map'] },
                { label: 'map_upload', parameters: ['INT Map'] },
                { label: 'wrap', parameters: ['INT Value, INT Min, INT Max'] },
                { label: 'clamp', parameters: ['INT Value, INT Min, INT Max'] },
                { label: 'music_play', parameters: ['INT IDMusic, INT Loops'] },
                { label: 'music_stop', parameters: [] },
                { label: 'sound_play', parameters: ['INT IDSound, INT Loops'] },
                { label: 'sound_stop', parameters: ['INT IDSound'] },
                { label: 'set_fps', parameters: ['INT FPS, INT JUMP'] },
                { label: 'map_get_pixel', parameters: ['INT File, INT Graph, INT X, INT Y'] },
                { label: 'write_in_map', parameters: ['INT Font, INT Variable, INT Alignment'] },
                { label: 'map_info', parameters: ['INT File, INT Graph, INT Type'] },
                { label: 'map_new', parameters: ['INT WIDTH, INT HEIGHT'] },
                { label: 'write', parameters: ['INT Font, INT X, INT Y, INT Alignment, STRING Text'] },
                { label: 'write_var', parameters: ['INT Font, INT X, INT Y, INT Alignment, VARIABLE'] },
                { label: 'fade_on', parameters: ['INT IN, INT OUT'] },
            ];

            functions.forEach(func => {
                const item = new vscode.CompletionItem(func.label, vscode.CompletionItemKind.Function);
                item.detail = `Función: ${func.label}(${func.parameters.join(', ')})`;
                item.insertText = new vscode.SnippetString(`${func.label}($0)`);
                completionItems.push(item);
            });

            return completionItems;
        }
    });

    context.subscriptions.push(provider);
}

function deactivate() {}

function getExecutablePath(executable) {
    try {
        return which.sync(executable);
    } catch (err) {
        return null;
    }
}

module.exports = {
    activate,
    deactivate
};
