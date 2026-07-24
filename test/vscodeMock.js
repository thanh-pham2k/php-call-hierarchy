const Module = require('module');

class TreeItem {
  constructor(label, collapsibleState) {
    this.label = label;
    this.collapsibleState = collapsibleState;
    this.description = '';
    this.tooltip = '';
    this.iconPath = null;
    this.command = null;
    this.contextValue = '';
  }
}

class ThemeIcon {
  constructor(id) {
    this.id = id;
  }
}

class Range {
  constructor(startLine, startCharacter, endLine, endCharacter) {
    this.startLine = startLine;
    this.startCharacter = startCharacter;
    this.endLine = endLine;
    this.endCharacter = endCharacter;
  }
}

class Uri {
  constructor(pathStr) {
    this.fsPath = pathStr;
  }
  static file(pathStr) {
    return new Uri(pathStr);
  }
}

class EventEmitter {
  constructor() {
    this.listeners = [];
    this.event = (listener) => {
      this.listeners.push(listener);
      return { dispose: () => {} };
    };
  }
  fire(data) {
    for (const listener of this.listeners) {
      listener(data);
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
      get: (key) => undefined
    })
  },
  window: {
    createOutputChannel: () => ({
      appendLine: () => {},
      show: () => {}
    })
  }
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
  if (request === 'vscode') {
    return mockVscode;
  }
  return originalRequire.apply(this, arguments);
};
