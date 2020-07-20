/**
 * @author zongquan.hzq
 * @description lark editor
 */
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

const scriptPath = path.join(__dirname, "../client/build", "app.js");
const stylePath = path.join(__dirname, "../client/build", "app.css");
const vendorPath = path.join(__dirname, "../client/build", "vendor.js");
const scriptCode = fs.readFileSync(scriptPath, "utf8");
const styleCode = fs.readFileSync(stylePath, "utf8");
const vendorCode = fs.readFileSync(vendorPath, "utf8");

export class LarkEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new LarkEditorProvider(context);

    const providerRegistration = vscode.window.registerCustomEditorProvider(
      LarkEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  private static readonly viewType = "larkEditor.lark";

  resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): void | Thenable<void> {
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    if (!webviewPanel.webview.html) {
      webviewPanel.webview.html = LarkEditorProvider.getWebviewContent(
        document.getText()
      );
    }

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    // const changeDocumentSubscription = vscode.workspace.on(
    //   (e) => {
    //     if (e.document.uri.toString() === document.uri.toString()) {
    //       updateWebview();
    //     }
    //   }
    // );

    webviewPanel.onDidDispose(() => {
      // changeDocumentSubscription.dispose();
    });

    webviewPanel.webview.onDidReceiveMessage((e) => {
      switch (e.type) {
        case "save": {
          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            e.text
          );
          vscode.workspace.applyEdit(edit).then((edit) => {
            document.save();
            webviewPanel.webview.html = LarkEditorProvider.getWebviewContent(
              e.text
            );
          });
          return;
        }
        case "delete": {
          // this.deleteScratch(document, e.id);
          return;
        }
      }
    });
  }

  static getWebviewContent(initValue = "") {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Lark</title>
      <style>${styleCode}</style>
    </head>
    <body>
      <div id="app"></div>
      <script>
      const initInputValue = \`${initValue}\`;

      ${vendorCode}
      ${scriptCode}
      </script>
    </body>
    </html>
    `;
  }
}
