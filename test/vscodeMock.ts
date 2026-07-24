import Module from 'module';

class TreeItem {
  public label: string;
  public collapsibleState: any;
  public description?: string;
  public tooltip?: string;
  public iconPath?: any;
  public command?: any;
  public contextValue?: string;

  constructor(label: string, collapsibleState?: any) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

class ThemeIcon {
  constructor(public id: string) {}
}

class Range {
  constructor(
    public startLine: number,
    public startCharacter: number,
    public endLine: number,
    public endCharacter: number
  ) {}
}

class Uri {
  public fsPath: string;
  constructor(pathStr: string) {
    this.fsPath = pathStr;
  }
  static file(pathStr: string) {
    return new Uri(pathStr);
  }
}

class EventEmitter<T> {
  private listeners: Array<(e: T) => void> = [];
  public event = (listener: (e: T) => void) => {
    this.listeners.push(listener);
    return { dispose: () => {} };
  };
  public fire(data?: T) {
    for (const listener of this.listeners) {
      listener(data as any);
    }
  }
}

const mockVscode = {
  TreeItem,
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  },
  ThemeIcon,
  Range,
  Uri,
  EventEmitter,
  workspace: {
    workspaceFolders: [
      {
        uri: Uri.file('/test-workspace')
      }
    ],
    getConfiguration: () => ({
      get: (key: string) => undefined
    })
  },
  window: {
    createOutputChannel: () => ({
      appendLine: () => {},
      show: () => {}
    })
  }
};

// Register mock module in Node's require system
const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function (this: any, request: string) {
  if (request === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, arguments as any);
};
