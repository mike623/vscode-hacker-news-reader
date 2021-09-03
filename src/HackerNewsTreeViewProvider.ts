import * as vscode from "vscode";
import * as vscodeHelpers from "vscode-helpers";

export class HackerNewsTreeViewProvider
  implements vscode.TreeDataProvider<News>
{
  constructor() {}

  private _onDidChangeTreeData: vscode.EventEmitter<
    News | undefined | null | void
  > = new vscode.EventEmitter<News | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<News | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: News): vscode.TreeItem {
    console.log("getTreeItem");
    return element;
  }

  getChildren(element?: News): Thenable<any[]> {
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
    return posts.map((post) => {
      const news = new News(
        post?.title,
        post?.url,
        vscode.TreeItemCollapsibleState.None
      );
      return news;
    });
  }
}

class News extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly url: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label;
    this.description = this.label;
    this.command = {
      command: "hackernews.itemClick",
      title: "Open Url",
      arguments: [url],
    };
  }
}
