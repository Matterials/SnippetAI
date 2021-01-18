import { window, ViewColumn, ExtensionContext, WebviewView, WebviewPanel } from 'vscode';

let panel: WebviewPanel;
export async function settingsMenu(context: ExtensionContext) {
    panel = window.createWebviewPanel(
        'editMenu',
        'Edit Menu - SnippetAI',
        ViewColumn.One,
        {
          enableScripts: true
        }
    );
    panel.webview.html = createSettingsWebview('heck yeah', '');
}

export function addExample() {
    const newForm = `
    <div class="example" id="1">
      <div class="form-group">
          <label for="name">Example one</label>
          <input type="text" class="form-control" id="request" placeholder="Request...">
      </div>
      <div class="form-group">
          <label for="exampleFormControlTextarea1">Response one</label>
          <textarea class="form-control" id="response" rows="3" placeholder="Response..."></textarea>
      </div>
  </div>`;
  const newHTML = createSettingsWebview('heck yeah', newForm);
  panel.webview.html = newHTML;
}

// add a button, post the message, increase,
export function createSettingsWebview(modelName: string, additionalForm: string) {
    return `<!doctype html>
    <html lang="en">
      <head>
        <!-- Required meta tags -->
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    
        <title>Create Model - SnippetAI</title>
      </head>
      <style>
        body {
          background-color:var(--vscode-editor-background);
          width: 100%;
          height: 100%;
        }
        div { color: white; }
        h2 { color: white; }
      </style>
      <body>
        <h2>Global Settings - ${modelName}</h2>
        <!-- Load Bootstrap -->
    
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>

        <form>
          <div class="example" id="1">
            <div class="form-group">
                <label for="name">Example one</label>
                <input type="text" class="form-control" id="request" placeholder="Request...">
            </div>
            <div class="form-group">
                <label for="exampleFormControlTextarea1">Response one</label>
                <textarea class="form-control" id="response" rows="3" placeholder="Response..."></textarea>
            </div>
          </div>
          ${additionalForm}
        </form>
      <script>
      
      </script>
      </body>
    </html>`;
}