import { window, commands, ExtensionContext } from 'vscode';
import { GptObject, GptParameters } from './gpt';

// Grab model GptObject by name
export function getModelByName(context: ExtensionContext, name: string) {
    const models = context.globalState.get('models') as Map<string, GptObject>;
    if (models.has(name)) {
        return models.get(name) as GptObject;
    }
    else {
        return null;
    }
}

// Returns an array of model names
export function getModelNames(context: ExtensionContext) {
    const models = context.globalState.get('models') as Map<string, GptObject>;
    return Array.from(models.keys());
}

// Updates value in models
export function updateModelByName(context: ExtensionContext, name: string, data: GptObject) {
    let models = context.globalState.get('models') as Map<string, GptObject>;
    if (models.has(name)) {
        models.set(name, data);
    }
    else {
        window.showErrorMessage(`Could not find model ${name}`);
    }
}