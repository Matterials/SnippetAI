import * as ts from 'typescript';
import * as fs from 'fs';
import { window } from 'vscode';

// I decided to go with this approach for rapid implementation.
// I have added guards to prevent using libraries and I/O functionality.
// May be changed. Reason I am not passing in an interface is because one can still have imports
export function loadResponseFromPath(path: string, response: string) {
    // Disable storing data & importing other libraries
    // Run code & return result as a string
    // Sample code

    let re = /import/gi;
    const script = fs.readFileSync(path, 'utf-8');

    if (script.search(re) !== -1) {
        window.showErrorMessage('There are no imports allowed.');
        return;
    }

    let result = ts.transpile(script);
    let runnable :any = eval(result);

    return runnable.parse(response);
}

// The same thing as the above function, just without reading from a file
export function loadResponseFromString(script: string, response: string) 
{
    var re = /import/gi;
    if (script.search(re) !== -1) {
        window.showErrorMessage('There are no imports allowed.');
        return;
    }

    let result = ts.transpile(script);
    let runnable :any = eval(result);

    return runnable.parse(response);
}