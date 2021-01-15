import { window, workspace, ExtensionContext, WorkspaceEdit, Position, Uri } from 'vscode';
import axios from 'axios';
import { createPrinter } from 'typescript';

// Stored params to query with
export interface GptParameters {
    engine: string;
    temperature: number;
    tokens: number;
    topP: number;
    n: number;
    stream: boolean;
    logprobs: number;
    stop: string;
    key: string;
}

export interface GptObject {
    options: Partial<GptParameters>;
    models: string[];
    script: string;
}

// Query GPT-3 with text that we grabbed from load model
export async function gptQuery(context: ExtensionContext, prompt: string) {
    const stored = context.globalState.get('gpt-settings') as Partial<GptParameters>;
    const edit = new WorkspaceEdit();
    
    const result = (await axios.post(`https://api.openai.com/v1/engines/${stored.engine}/completions`, {
        prompt: prompt,
        max_tokens: stored.tokens,
        temperature: stored.temperature,
        top_p: stored.topP,
        n: stored.n,
        stream: stored.stream,
        logprobs: stored.logprobs,
        stop: stored.stop,
    }, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${stored.key}`
        },
    })).data as any;

    // Handler stuff here

    edit.insert(window.activeTextEditor?.document.uri as Uri,
        window.activeTextEditor?.selection.active as Position, result.choices[0].text);

    workspace.applyEdit(edit);
}