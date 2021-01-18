import { ExtensionContext } from 'vscode';
import * as modeltools from './models';

export function createHistoryDropdown(context: ExtensionContext) {
    // Create map of command-model name
    const recent = context.globalState.get('history') as Map<string, string>;
}