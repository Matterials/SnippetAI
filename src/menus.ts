import { window, ExtensionContext } from 'vscode';
import { mainMenu } from './extension';
import { gptQuery, GptParameters } from './gpt';

// Load models from globalState memory. Display them as a quick pick
export async function loadModelMenu(context: ExtensionContext) {
    const cachedModels = context.globalState.get('models') as Array<string>;
    const quickPick = createDropdown(context, cachedModels);

    quickPick.onDidChangeSelection(async ([{ label }]) => {
        if (label === "←") {
            mainMenu(context);
        }
        else {
            const prompt = await window.showInputBox() as string;
            gptQuery(context, prompt);
        }
        quickPick.hide();
    });
    quickPick.show();
}

// Creates a model
export async function createModelMenu(context: ExtensionContext) {
    const name = await window.showInputBox() as string;
    if (name !== null || name === "") {
        saveModel(context, name);
    }
    else {
        window.showErrorMessage("Message has to contain something!");
    }
    mainMenu(context);
}

// Delete models from globalState memory
export async function deleteModelMenu(context: ExtensionContext) {
    let cachedModels = context.globalState.get('models') as Array<string>;
    const quickPick = createDropdown(context, cachedModels);

    quickPick.onDidChangeSelection(([{ label }]) => {
        if (label === "←") {
            mainMenu(context);
        }
        else {
            cachedModels = cachedModels.filter(obj => obj !== label);
            context.globalState.update('models', cachedModels);
            quickPick.hide();
            mainMenu(context);
        }
    });
    quickPick.show();
}

// Exports models
export async function exportModelsMenu(context: ExtensionContext) {
    const directory = await window.showInputBox({ prompt: 'Enter directory to export to' }) as string;
    exportModelsToJson(directory);
}

// Export models to JSON
function exportModelsToJson(directory: string) { }

// Change GPT-3 settings
export async function gptSettings(context: ExtensionContext) {
    let settings = context.globalState.get('gpt-settings') as Partial<GptParameters>;
    let list = Array<string>();

    // Settings
    list.push(`Engine: ${settings.engine}`);
    list.push(`Temperature: ${settings.temperature}`);
    list.push(`Tokens: ${settings.tokens}`);
    list.push(`Add/edit API key`);
    list.push("←");

    const options = list.map(label => ({ label }));
    const quickPick = window.createQuickPick();
    quickPick.items = options;

    quickPick.onDidChangeSelection(async ([{ label }]) => {
        switch (label) {
            case list[0]:
                // Create dropdown menu for different UI settings
                const engineOptions = ['ada', 'babbage', 'curie', 'davinci', '←'].map(label => ({ label }));
                const engineQuickPick = window.createQuickPick();
                engineQuickPick.items = engineOptions;

                engineQuickPick.onDidChangeSelection(async ([{ label }]) => {
                    if (label === '←') {
                        engineQuickPick.hide();
                        mainMenu(context);
                    }
                    else {
                        settings.engine = label;
                        context.globalState.update('gpt-settings', settings);
                        engineQuickPick.hide();
                        gptSettings(context);
                    }
                });

                engineQuickPick.show();
                break;

            case list[1]:
                const temperature = await window.showInputBox({ prompt: 'Enter a new temperature' }) as string;
                const temp = Number(temperature);

                // Error handling
                if (isNaN(temp)) {
                    window.showErrorMessage(`${temperature} is not a number, nor is it between between 0 and 1.`);
                }
                else {
                    if (temp > 1 || temp < 0) {
                        window.showErrorMessage(`${temp} is not between between 0 and 1.`);
                        break;
                    }
                    else {
                        settings.temperature = temp;
                        context.globalState.update('gpt-settings', settings);
                    }
                }

                gptSettings(context);
                break;

            case list[2]:
                const tokens = await window.showInputBox({ prompt: 'Enter a new token limit' }) as string;
                const numTokens = Number(tokens);

                // Error handling
                if (isNaN(numTokens)) {
                    window.showErrorMessage(`${tokens} is not a number, nor is it between between 0 and 1.`);
                }
                else {
                    if (numTokens < 1 || numTokens > 2048) {
                        window.showErrorMessage(`${numTokens} must be between 1 and 2048.`);
                        break;
                    }
                    else {
                        settings.tokens = numTokens;
                        context.globalState.update('gpt-settings', settings);
                    }
                }

                gptSettings(context);
                break;

            case list[3]:
                const key = await window.showInputBox({ prompt: 'Enter your API key', placeHolder: settings.key }) as string;
                settings.key = key;
                context.globalState.update('gpt-settings', settings);
                mainMenu(context);
                break;

            case list[4]:
                quickPick.hide();
                mainMenu(context);
                break;
        }
    });

    quickPick.show();
}

// Creates dropdown with cached models and back option
function createDropdown(context: ExtensionContext, cachedModels: Array<string>) {
    const options = [...cachedModels.map(label => ({ label })), { label: '←' }];
    const quickPick = window.createQuickPick();
    quickPick.items = options;
    return quickPick;
}

// Cache models in globalState memory
function saveModel(context: ExtensionContext, name: string) {
    let cachedModels = context.globalState.get('models') as Array<string>;
    cachedModels.push(name);
    context.globalState.update('models', cachedModels);
}