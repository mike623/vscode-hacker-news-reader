import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as vscodeHelpers from "vscode-helpers";

export class HackerNewsTreeViewProvider
  implements vscode.TreeDataProvider<Dependency>
{
  constructor() {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    Dependency | undefined | null | void
  > = new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    Dependency | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    console.log("getTreeItem");
    return element;
  }

  getChildren(element?: Dependency): Thenable<any[]> {
    console.log("getChildren");
    return this.getTopStories();
  }

  private async getTopStories() {
    const result = await vscodeHelpers.GET(
      "https://hacker-news.firebaseio.com/v0/topstories.json"
    );
    const ids: string[] = JSON.parse(
      (await result.readBody()).toString("utf8")
    );
    const posts = await Promise.all(
      ids.map(async (id) => {
        const result = await vscodeHelpers.GET(
          `https://hacker-news.firebaseio.com/v0/item/${id}.json`
        );
        return JSON.parse((await result.readBody()).toString("utf8"));
      })
    );
    console.log({ posts });
    return posts.map((post) => {
      const news = new News(
        post?.title,
        vscode.TreeItemCollapsibleState.None
      );
      return news;
    });
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

class News extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = this.label;
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }
}
