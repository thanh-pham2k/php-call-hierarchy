# PHP Call Hierarchy (VS Code Extension)

**Extension Display Name**: PHP Call Hierarchy
**Extension ID**: `php-call-hierarchy`

A feature-rich VS Code extension built in TypeScript to analyze, construct, and present multi-level hierarchical call graphs (**Incoming Calls** and **Outgoing Calls**) for PHP projects in a native VS Code Tree View.

---

## Key Features

### 1. Hierarchical Call Graph

* **Incoming Calls**: Shows functions and methods that call the active symbol, up to a configurable depth.
* **Outgoing Calls**: Shows functions and methods called by the active symbol, up to a configurable depth.
* **Expand / Collapse**: Lazy-loads child hierarchy nodes on demand.
* **Navigation**: Select a node to navigate directly to its file and line number.

### 2. Full PHP Symbol and Call Support

Supports:

* Standard functions.
* Instance methods:

  * `$this->method()`
  * `$object->method()`
* Static methods:

  * `ClassName::method()`
* PHP keyword calls:

  * `self::method()`
  * `static::method()`
  * `parent::method()`
* Namespaces and import aliases:

  * `use Namespace\ClassName as Alias;`
* Class inheritance with `extends`.
* Interface contracts with `implements`.
* Traits with `use TraitName;`.

The extension also detects circular call relationships such as:

```text
A → B → A
```

Recursive nodes are marked accordingly, and infinite tree expansion is prevented.

### 3. High-Performance Architecture

* Pure AST parsing using `php-parser`.
* No PHP binary is required on the host machine.
* Parallel AST parsing using Node.js Worker Threads.
* Keeps the VS Code Extension Host responsive during indexing.
* Incremental re-indexing when PHP files are changed or saved.
* File change handling is debounced to reduce unnecessary indexing.
* File modification-time caching skips unchanged files.
* Indexed incoming-call lookups.
* Memoized descendant resolution for inheritance hierarchies.

Default excluded directories include:

* `vendor`
* `node_modules`
* `storage`
* `cache`
* `build`
* `dist`

---

## Commands and User Interface

### Commands

| Command                                 | Command ID                             |
| --------------------------------------- | -------------------------------------- |
| PHP Call Hierarchy: Show Incoming Calls | `php-call-hierarchy.showIncomingCalls` |
| PHP Call Hierarchy: Show Outgoing Calls | `php-call-hierarchy.showOutgoingCalls` |
| PHP Call Hierarchy: Refresh             | `php-call-hierarchy.refresh`           |
| PHP Call Hierarchy: Search Symbol       | `php-call-hierarchy.search`            |

### UI Integration

* **Editor Context Menu**: Right-click inside a PHP function or method to display its incoming or outgoing calls.
* **Activity Bar View Container**: Dedicated PHP Call Hierarchy view in the VS Code sidebar.
* **Explorer Container View**: Call hierarchy panel embedded in the Explorer sidebar.
* **View Action Toolbar**:

  * Refresh hierarchy.
  * Switch between incoming and outgoing calls.
  * Search for PHP symbols.

---

## Extension Settings

| Setting                             | Type      | Default                 | Description                                                             |
| ----------------------------------- | --------- | ----------------------- | ----------------------------------------------------------------------- |
| `phpCallHierarchy.maxDepth`         | `integer` | `5`                     | Maximum hierarchy expansion depth                                       |
| `phpCallHierarchy.maxResults`       | `integer` | `50`                    | Maximum number of child nodes displayed per level                       |
| `phpCallHierarchy.excludePatterns`  | `array`   | `["**/vendor/**", ...]` | Glob patterns excluded from workspace indexing                          |
| `phpCallHierarchy.autoIndexOnStart` | `boolean` | `true`                  | Automatically indexes the PHP workspace when the extension is activated |

---

## Installation and Build

### Prerequisites

* Node.js 18.0.0 or later.
* npm 9.0.0 or later.
* VS Code 1.75.0 or later.

### Install Dependencies

```bash
npm install
```

### Build Production Bundle

```bash
npm run build
```

### Development Watch Mode

```bash
npm run watch
```

---

## Packaging VSIX

To package the extension into a `.vsix` file:

```bash
npx vsce package
```

The generated `.vsix` file can be installed manually through VS Code.

---

## Debugging in VS Code

1. Open the repository folder in VS Code.
2. Press `F5` or select **Run Extension** from the Debug panel.
3. A new Extension Development Host window will open.
4. Open a PHP file.
5. Place the cursor inside a function or method.
6. Right-click and select:

   * **PHP Call Hierarchy: Show Incoming Calls**, or
   * **PHP Call Hierarchy: Show Outgoing Calls**.

---

## Limitations

### Dynamic Method Invocation

Runtime calls based on variable names cannot always be resolved through static AST analysis.

Examples:

```php
$functionName();
$controller->$methodName();
```

Type hints or PHPDoc annotations may improve symbol resolution in some cases.

### Magic Methods

Calls resolved through the following magic methods may not have a directly identifiable method definition:

```php
__call()
__callStatic()
```

The extension may record these calls as call sites without resolving a concrete target definition.

### Anonymous Classes and Closures

Calls inside closures are supported.

Anonymous classes do not always have a stable fully qualified class name, which may limit symbol resolution and hierarchy navigation.
