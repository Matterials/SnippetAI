import { window, ViewColumn, WebviewPanel, ExtensionContext } from 'vscode';
import * as modeltools from './models';
import { GptExample } from './gpt';

export class SettingsView {
  exampleCount: number;
  examples: string[];
  name: string;

  constructor(name: string) {
    this.exampleCount = 0;
    this.examples = [];
    this.name = name;
  }

  public addExample() {
    this.exampleCount++;
    this.examples.push
      (`<div class="example">
        <div class="form-group">
            <label for="requestLabel">Example</label>
            <input type="text" class="form-control" id="request-${this.examples.length}" placeholder="Request...">
        </div>
        <div class="form-group">
            <label for="responseLabel">Response</label>
            <textarea class="form-control" id="response-${this.examples.length}" rows="3" placeholder="Response..."></textarea>
        </div>
      </div>`);
  }

  public writeExamplesFromList(list: []) {

  }

  writeHeader() {
    return `
    <!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    
        <title>Create Model - SnippetAI</title>
      </head>`;
  }

  writeStyle() {
    return `
    <style>
      body {
        background-color:var(--vscode-editor-background);
        width: 100%;
        height: 100%;
      }
      div { color: white; }
      h2 { color: white; }
    </style>`;
  }

  writeBootstrap() {
    return `
    <body>
    <h2>Global Settings - ${this.name}</h2>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <form>`;
  }

  // push all the values in addExample too
  writeScripts() {
    return `
      </form>
      <button type="button" class="btn btn-light" onclick="addExample()">Add Example</button>
      <button type="button" class="btn btn-light" onclick="save()">Save Settings</button>
      <script>
          const vscode = acquireVsCodeApi();
          function addExample() {
            vscode.postMessage({
              command: 'addExample'
            })
          }
          function save() {
              examples = []
              for (var i = 0; i < ${this.examples.length}; i++) {
                tuple = []
                const request = document.getElementById('request-' + i).value;
                const response = document.getElementById('response-' + i).value;
                tuple.push(request);
                tuple.push(response);
                examples.push(tuple);
              }
              vscode.postMessage({
                command: 'examples',
                items: examples              
              })
          }
      </script>
    </body>
    </html>`;
  }

  writeExamples() {
    let html = '';
    for (var i = 0; i < this.examples.length; i++) {
      html += this.examples[i];
    }
    return html;
  }

  writeGptSettings() {

  }

  // Compiles all examples into HTML code
  public toHTML() {
    // Add header
    return this.writeHeader() + this.writeStyle() + this.writeBootstrap() + this.writeExamples() + this.writeScripts();
  }
}

// Make it global so it can be referenced by the rest
let panel: WebviewPanel;
export async function createSettingsMenu(context: ExtensionContext, modelName: string) {
  // Create panel
  panel = window.createWebviewPanel(
    'editMenu',
    'Edit Menu - SnippetAI',
    ViewColumn.One, {
    enableScripts: true
  });

  let view = new SettingsView(modelName);
  panel.webview.html = view.toHTML();
  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        // Reload HTML
        case 'addExample':
          view.addExample();
          panel.webview.html = view.toHTML();
          return;
        case 'examples':
          let model = modeltools.getModelByName(context, modelName);
          const examples = message.items;

          // Go through every request & response submitted from the form
          let pulled: GptExample[] = [];
          for (var i = 0; i < examples.length; i++) {
            let example: GptExample = new GptExample();
            example.request = examples[i][0];
            example.response = examples[i][1];
            pulled.push(example);
          }

          model!.examples = pulled;
          modeltools.updateModelByName(context, modelName, model!);
          window.showInformationMessage('Settings saved');
          return;
      }
    },
    undefined,
    context.subscriptions);
}