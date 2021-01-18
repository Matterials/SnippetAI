import { window, workspace, ExtensionContext, WorkspaceEdit, Position, Uri } from 'vscode';
import { createPrinter, getJSDocTypeParameterTags } from 'typescript';
import { loadResponseFromString } from './responseHandler';
import * as modeltools from './models';
import axios from 'axios';

// Stored params to query with
export class GptParameters {
    public engine: string;
    public temperature: number;
    public tokens: number;
    public topP: number;
    public n: number;
    public stream: boolean;
    public stop: string;

    constructor(engine='davinci', temperature=0.8,
                tokens=60, topP = 1, n = 1, stream=false,
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
    public request: string;
    public response: string;

    constructor(request='', response='') {
        this.request = request;
        this.response = response;
    }
}

// Object for global state storage
export class GptObject {
    public options: GptParameters;
    public examples: GptExample[];
    public script: string;

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

    const options = model!.options;
    const examples = model!.examples;

    let modifiedPrompt = '';
    for (var i = 0; i < examples.length; i++) {
        modifiedPrompt += 'Q: ' + examples[i].request + '\n';
        modifiedPrompt += '\/\/Gen: \n' + examples[i].response + '\n';
    }
    modifiedPrompt += 'Q: ' + prompt + '\n';
    
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

    // Add to history
    let history = context.globalState.get('history') as Map<string, string>;
    history.set(prompt, result.choices[0].text);
    context.globalState.update('history', history);

    // Handler stuff here
    /*
        const parsed = loadResponseFromString(stored.script(), result.choices[0].text);
        edit.insert(window.activeTextEditor?.document.uri as Uri,
            window.activeTextEditor?.selection.active as Position, parsed);
    */

    edit.insert(window.activeTextEditor?.document.uri as Uri,
        window.activeTextEditor?.selection.active as Position, result.choices[0].text);

    workspace.applyEdit(edit);
}