// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { HackerNewsTreeViewProvider } from "./HackerNewsTreeViewProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand("hackernews.itemClick", (url) => {
    vscode.env.openExternal(vscode.Uri.parse(url));
  });

  // context.subscriptions.push(disposable);
  const nodeDependenciesProvider = new HackerNewsTreeViewProvider();
  vscode.window.registerTreeDataProvider(
    "hackerNews",
    nodeDependenciesProvider
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
