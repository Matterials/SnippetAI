import { window, commands, ExtensionContext } from 'vscode';
import { loadModelMenu, createModelMenu, deleteModelMenu, exportModelsMenu, gptSettings } from './menus';
import { GptParameters } from './gpt';

// Entry point
export function activate(context: ExtensionContext) {
	let settings = context.globalState.get('gpt-settings') as Partial<GptParameters>;

	// Default davinci settings
	if (settings === undefined) {
		context.globalState.update('gpt-settings', {
			engine: "davinci",
			temperature: 1,
			tokens: 128,
			stop: '\n'
		});
	}

	// Register command
	let disposable = commands.registerCommand('snippetai.snippetAi', async () => {
		mainMenu(context);
	});
}

// Main menu
export function mainMenu(context: ExtensionContext) {
	const options = ['Load Model', 'Create Model', 'Edit Model', 'Delete Model', 'Export Models', 'Edit GPT-3 Settings'].map(label => ({ label }));
	const quickPick = window.createQuickPick();
	quickPick.items = options;
	quickPick.onDidChangeSelection(([{ label }]) => {
		switch (label) {
			case options[0].label:
				loadModelMenu(context);
				break;
			case options[1].label:
				createModelMenu(context);
				break;
			// TODO: Implement editing GUI & creating GUI
			case options[2].label:
				break;
			case options[3].label:
				deleteModelMenu(context);
				break;
			case options[4].label:
				exportModelsMenu(context);
				break;
			case options[5].label:
				gptSettings(context);
				break;
		}
		quickPick.hide();
	});
	quickPick.show();
}

// Extension deactivated entry point
export function deactivate() { }