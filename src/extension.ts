import { window, commands, ExtensionContext, StatusBarItem, StatusBarAlignment } from 'vscode';
import { loadModelMenu, createModelMenu, deleteModelMenu, exportModelsMenu } from './menus';
import { settingsMenu } from './webviews';
import { GptObject } from './gpt';

let tokenStatusBarItem: StatusBarItem;

// Entry point
export function activate(context: ExtensionContext) {
	const tokenID = 'snippetai.token';
	context.globalState.update('models', new Map<string, GptObject>());

	// Register main command and token status command
	let main = commands.registerCommand('snippetai.snippetAi', async () => { mainMenu(context); });
	let token = commands.registerCommand(tokenID, async() => { tokenMenu(context); });

	tokenStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
	tokenStatusBarItem.command = tokenID;
	context.subscriptions.push(tokenStatusBarItem);

	// TODO: Add on startup
	
	const currentlyUsed = context.globalState.get('tokens-used');
	const limit = context.globalState.get('token-limit');
	tokenStatusBarItem.text = `$(output) ${currentlyUsed}/${limit} tokens used.`;
	tokenStatusBarItem.show();
}

// Main menu that contains the primary options of the extension
export function mainMenu(context: ExtensionContext) {
	const options = ['Load Model', 'Create Model', 'Edit Model', 'Delete Model', 'Export Models', 'Add/edit API key'].map(label => ({ label }));
	const quickPick = window.createQuickPick();
	quickPick.items = options;
	quickPick.onDidChangeSelection(async ([{ label }]) => {
		switch (label) {
			case options[0].label:
				loadModelMenu(context);
				break;
			case options[1].label:
				createModelMenu(context);
				break;
			// TODO: Implement editing GUI & creating GUI
			case options[2].label:
				settingsMenu(context);
				break;
			case options[3].label:
				deleteModelMenu(context);
				break;
			case options[4].label:
				exportModelsMenu(context);
				break;
			case options[5].label:
				const currentKey = context.globalState.get('gpt3-key') as string;
				const key = await window.showInputBox({ prompt: 'Enter your API key', placeHolder: currentKey }) as string;
                context.globalState.update('gpt3-key', key);
                mainMenu(context);
                break;
		}
		quickPick.hide();
	});
	quickPick.show();
}

// Don't want to limit the developer to a timeframe
// If they want to reset or change they can do that
// This is moreso a mental reminder for them
export function tokenMenu(context: ExtensionContext) {
	// Using create quickpick over show quickpick because it's less of a pain and generally the same speed
	const options = ['Set Max Tokens', 'Reset Token Use'].map(label => ({ label }));
	const quickPick = window.createQuickPick();
	quickPick.items = options;
	quickPick.onDidChangeSelection(async ([{ label }]) => {
		switch (label) {
			case options[0].label:
				let amount: number = Number(await window.showInputBox() as string);
				const currentlyUsed: number = context.globalState.get('tokens-used') as number;

				context.globalState.update('token-limit', amount);
				tokenStatusBarItem.text = `$(output) ${currentlyUsed}/${amount} tokens used.`;
				break;
			case options[1].label:
				const limit = context.globalState.get('token-limit');
				context.globalState.update('tokens-used', 0);
				tokenStatusBarItem.text = `$(output) 0/${limit} tokens used.`;
				break;
		}
		quickPick.hide();
	});
	quickPick.show();
}

// Extension deactivated entry point
export function deactivate() { }