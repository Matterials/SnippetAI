import { window, workspace, ExtensionContext, WorkspaceEdit, Position, Uri } from 'vscode';
import { createPrinter, getJSDocTypeParameterTags } from 'typescript';
import { loadResponseFromString } from './responseHandler';
import { tokenStatusBarItem } from './extension';
import * as modeltools from './models';
import axios from 'axios';

// Stored params to query with
export class GptParameters {
    engine: string;
    temperature: number;
    tokens: number;
    topP: number;
    n: number;
    stream: boolean;
    stop: string;

    constructor(engine='davinci', temperature=0.8,
                tokens=128, topP = 1, n = 1, stream=false,
                stop = 'Q: ') {
        this.engine = engine;
        this.temperature = temperature;
        this.tokens = tokens;
        this.topP = topP;
        this.n = n;
        this.stream = stream;
        this.stop = stop;
    }
}

// To feed into davinci
export class GptExample {
    request: string;
    response: string;

    constructor(request='', response='') {
        this.request = request;
        this.response = response;
    }
}

// Object for global state storage
export class GptObject {
    options: GptParameters;
    examples: GptExample[];
    script: string;

    constructor(options = new GptParameters(), script = 'None') {
        this.options = options;
        this.script = script;
        this.examples = [];
    }
}

// Query GPT-3 with text that we grabbed from load model
export async function gptQuery(context: ExtensionContext, prompt: string, modelName: string) {
    const edit = new WorkspaceEdit();

    const model = modeltools.getModelByName(context, modelName);

    // GPT Object
    const options = model!.options;
    const examples = model!.examples;

    // Token status bar item
    const limit = Number(context.globalState.get('token-limit'));
    let currentlyUsed = Number(context.globalState.get('tokens-used'));

    // Prompt
    let modifiedPrompt = '';
    
    // Check to see if in bounds of the token limit
    currentlyUsed += Math.round(modifiedPrompt.length / 4);
    if (currentlyUsed > limit) {
        window.showErrorMessage('Over the token limit');
        return;
    }
    
    const result = (await axios.post(`https://api.openai.com/v1/engines/${options.engine}/completions`, {
        prompt: modifiedPrompt,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        max_tokens: options.tokens,
        temperature: options.temperature,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        top_p: options.topP,
        n: options.n,
        stream: options.stream,
        logprobs: null,
        stop: options.stop,
    }, {
        headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "Content-Type": "application/json",
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${context.globalState.get('gpt3-key')}`
        },
    })).data as any;

    // Handler stuff here
    /*
        const parsed = loadResponseFromString(stored.script(), result.choices[0].text);
        edit.insert(window.activeTextEditor?.document.uri as Uri,
            window.activeTextEditor?.selection.active as Position, parsed);
    */

    edit.insert(window.activeTextEditor?.document.uri as Uri,
        window.activeTextEditor?.selection.active as Position, result.choices[0].text);

    workspace.applyEdit(edit);

    
	tokenStatusBarItem.text = `$(output) ${currentlyUsed}/${limit} tokens used.`;
}