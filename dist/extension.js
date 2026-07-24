"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/php-parser/src/lexer/attribute.js
var require_attribute = __commonJS({
  "node_modules/php-parser/src/lexer/attribute.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      attributeIndex: 0,
      attributeListDepth: {},
      matchST_ATTRIBUTE() {
        const ch = this.input();
        if (this.is_WHITESPACE()) {
          do {
            this.input();
          } while (this.is_WHITESPACE());
          this.unput(1);
          return null;
        }
        switch (ch) {
          case "]":
            if (this.attributeListDepth[this.attributeIndex] === 0) {
              delete this.attributeListDepth[this.attributeIndex];
              this.attributeIndex--;
              this.popState();
            } else {
              this.attributeListDepth[this.attributeIndex]--;
            }
            return "]";
          case "(":
          case ")":
          case ":":
          case "=":
          case ";":
          case "|":
          case "&":
          case "^":
          case "-":
          case "+":
          case "*":
          case "%":
          case "~":
          case "<":
          case ">":
          case "!":
          case ".":
          case "{":
          case "}":
          case "$":
            return this.consume_TOKEN();
          case "[":
            this.attributeListDepth[this.attributeIndex]++;
            return "[";
          case ",":
            return ",";
          case '"':
            return this.ST_DOUBLE_QUOTES();
          case "'":
            return this.T_CONSTANT_ENCAPSED_STRING();
          case "/":
            if (this._input[this.offset] === "/") {
              return this.T_COMMENT();
            } else if (this._input[this.offset] === "*") {
              this.input();
              return this.T_DOC_COMMENT();
            } else {
              return this.consume_TOKEN();
            }
        }
        if (this.is_LABEL_START() || ch === "\\") {
          while (this.offset < this.size) {
            const ch2 = this.input();
            if (!(this.is_LABEL() || ch2 === "\\")) {
              if (ch2)
                this.unput(1);
              break;
            }
          }
          return this.T_STRING();
        } else if (this.is_NUM()) {
          return this.consume_NUM();
        }
        throw new Error(
          `Bad terminal sequence "${ch}" at line ${this.yylineno} (offset ${this.offset})`
        );
      }
    };
  }
});

// node_modules/php-parser/src/lexer/comments.js
var require_comments = __commonJS({
  "node_modules/php-parser/src/lexer/comments.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a single line comment
       */
      T_COMMENT() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (ch === "\n" || ch === "\r") {
            return this.tok.T_COMMENT;
          } else if (ch === "?" && !this.aspTagMode && this._input[this.offset] === ">") {
            this.unput(1);
            return this.tok.T_COMMENT;
          } else if (ch === "%" && this.aspTagMode && this._input[this.offset] === ">") {
            this.unput(1);
            return this.tok.T_COMMENT;
          }
        }
        return this.tok.T_COMMENT;
      },
      /*
       * Behaviour : https://github.com/php/php-src/blob/master/Zend/zend_language_scanner.l#L1927
       */
      T_DOC_COMMENT() {
        let ch = this.input();
        let token = this.tok.T_COMMENT;
        if (ch === "*") {
          ch = this.input();
          if (this.is_WHITESPACE()) {
            token = this.tok.T_DOC_COMMENT;
          }
          if (ch === "/") {
            return token;
          } else {
            this.unput(1);
          }
        }
        while (this.offset < this.size) {
          ch = this.input();
          if (ch === "*" && this._input[this.offset] === "/") {
            this.input();
            break;
          }
        }
        return token;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/initial.js
var require_initial = __commonJS({
  "node_modules/php-parser/src/lexer/initial.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      nextINITIAL() {
        if (this.conditionStack.length > 1 && this.conditionStack[this.conditionStack.length - 1] === "INITIAL") {
          this.popState();
        } else {
          this.begin("ST_IN_SCRIPTING");
        }
        return this;
      },
      matchINITIAL() {
        while (this.offset < this.size) {
          let ch = this.input();
          if (ch == "<") {
            ch = this.ahead(1);
            if (ch == "?") {
              if (this.tryMatch("?=")) {
                this.unput(1).appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3).nextINITIAL();
                break;
              } else if (this.tryMatchCaseless("?php")) {
                ch = this._input[this.offset + 4];
                if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
                  this.unput(1).appendToken(this.tok.T_OPEN_TAG, 6).nextINITIAL();
                  break;
                }
              }
              if (this.short_tags) {
                this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
                break;
              }
            } else if (this.asp_tags && ch == "%") {
              if (this.tryMatch("%=")) {
                this.aspTagMode = true;
                this.unput(1).appendToken(this.tok.T_OPEN_TAG_WITH_ECHO, 3).nextINITIAL();
                break;
              } else {
                this.aspTagMode = true;
                this.unput(1).appendToken(this.tok.T_OPEN_TAG, 2).nextINITIAL();
                break;
              }
            }
          }
        }
        if (this.yytext.length > 0) {
          return this.tok.T_INLINE_HTML;
        } else {
          return false;
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/numbers.js
var require_numbers = __commonJS({
  "node_modules/php-parser/src/lexer/numbers.js"(exports2, module2) {
    "use strict";
    var MAX_LENGTH_OF_LONG = 10;
    var long_min_digits = "2147483648";
    if (process.arch == "x64") {
      MAX_LENGTH_OF_LONG = 19;
      long_min_digits = "9223372036854775808";
    }
    module2.exports = {
      consume_NUM() {
        let ch = this.yytext[0];
        let hasPoint = ch === ".";
        if (ch === "0") {
          ch = this.input();
          if (ch === "x" || ch === "X") {
            ch = this.input();
            if (ch !== "_" && this.is_HEX()) {
              return this.consume_HNUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (ch === "b" || ch === "B") {
            ch = this.input();
            if (ch !== "_" && ch === "0" || ch === "1") {
              return this.consume_BNUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (ch === "o" || ch === "O") {
            ch = this.input();
            if (ch !== "_" && this.is_OCTAL()) {
              return this.consume_ONUM();
            } else {
              this.unput(ch ? 2 : 1);
            }
          } else if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
          }
        }
        while (this.offset < this.size) {
          const prev = ch;
          ch = this.input();
          if (ch === "_") {
            if (prev === "_") {
              this.unput(2);
              break;
            }
            if (prev === ".") {
              this.unput(1);
              break;
            }
            if (prev === "e" || prev === "E") {
              this.unput(2);
              break;
            }
          } else if (ch === ".") {
            if (hasPoint) {
              this.unput(1);
              break;
            }
            if (prev === "_") {
              this.unput(2);
              break;
            }
            hasPoint = true;
            continue;
          } else if (ch === "e" || ch === "E") {
            if (prev === "_") {
              this.unput(1);
              break;
            }
            let undo = 2;
            ch = this.input();
            if (ch === "+" || ch === "-") {
              undo = 3;
              ch = this.input();
            }
            if (this.is_NUM_START()) {
              this.consume_LNUM();
              return this.tok.T_DNUMBER;
            }
            this.unput(ch ? undo : undo - 1);
            break;
          }
          if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        if (hasPoint) {
          return this.tok.T_DNUMBER;
        } else if (this.yytext.length < MAX_LENGTH_OF_LONG - 1) {
          return this.tok.T_LNUMBER;
        } else {
          if (this.yytext.length < MAX_LENGTH_OF_LONG || this.yytext.length == MAX_LENGTH_OF_LONG && this.yytext < long_min_digits) {
            return this.tok.T_LNUMBER;
          }
          return this.tok.T_DNUMBER;
        }
      },
      // read hexa
      consume_HNUM() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_HEX()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      // read a generic number
      consume_LNUM() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_NUM()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      // read binary
      consume_BNUM() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch !== "0" && ch !== "1" && ch !== "_") {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      },
      // read an octal number
      consume_ONUM() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_OCTAL()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this.tok.T_LNUMBER;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/property.js
var require_property = __commonJS({
  "node_modules/php-parser/src/lexer/property.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      matchST_LOOKING_FOR_PROPERTY() {
        let ch = this.input();
        if (ch === "-") {
          ch = this.input();
          if (ch === ">") {
            return this.tok.T_OBJECT_OPERATOR;
          }
          if (ch)
            this.unput(1);
        } else if (this.is_WHITESPACE()) {
          return this.tok.T_WHITESPACE;
        } else if (this.is_LABEL_START()) {
          this.consume_LABEL();
          this.popState();
          return this.tok.T_STRING;
        }
        this.popState();
        if (ch)
          this.unput(1);
        return false;
      },
      matchST_LOOKING_FOR_VARNAME() {
        let ch = this.input();
        this.popState();
        this.begin("ST_IN_SCRIPTING");
        if (this.is_LABEL_START()) {
          this.consume_LABEL();
          ch = this.input();
          if (ch === "[" || ch === "}") {
            this.unput(1);
            return this.tok.T_STRING_VARNAME;
          } else {
            this.unput(this.yytext.length);
          }
        } else {
          if (ch)
            this.unput(1);
        }
        return false;
      },
      matchST_VAR_OFFSET() {
        const ch = this.input();
        if (this.is_NUM_START()) {
          this.consume_NUM();
          return this.tok.T_NUM_STRING;
        } else if (ch === "]") {
          this.popState();
          return "]";
        } else if (ch === "$") {
          this.input();
          if (this.is_LABEL_START()) {
            this.consume_LABEL();
            return this.tok.T_VARIABLE;
          } else {
            throw new Error("Unexpected terminal");
          }
        } else if (this.is_LABEL_START()) {
          this.consume_LABEL();
          return this.tok.T_STRING;
        } else if (this.is_WHITESPACE() || ch === "\\" || ch === "'" || ch === "#") {
          return this.tok.T_ENCAPSED_AND_WHITESPACE;
        } else if (ch === "[" || ch === "{" || ch === "}" || ch === '"' || ch === "`" || this.is_TOKEN()) {
          return ch;
        } else {
          throw new Error("Unexpected terminal");
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/scripting.js
var require_scripting = __commonJS({
  "node_modules/php-parser/src/lexer/scripting.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      matchST_IN_SCRIPTING() {
        let ch = this.input();
        switch (ch) {
          case " ":
          case "	":
          case "\n":
          case "\r":
          case "\r\n":
            return this.T_WHITESPACE();
          case "#":
            if (this.version >= 800 && this._input[this.offset] === "[") {
              this.input();
              this.attributeListDepth[++this.attributeIndex] = 0;
              this.begin("ST_ATTRIBUTE");
              return this.tok.T_ATTRIBUTE;
            }
            return this.T_COMMENT();
          case "/":
            if (this._input[this.offset] === "/") {
              return this.T_COMMENT();
            } else if (this._input[this.offset] === "*") {
              this.input();
              return this.T_DOC_COMMENT();
            }
            return this.consume_TOKEN();
          case "'":
            return this.T_CONSTANT_ENCAPSED_STRING();
          case '"':
            return this.ST_DOUBLE_QUOTES();
          case "`":
            this.begin("ST_BACKQUOTE");
            return "`";
          case "?":
            if (!this.aspTagMode && this.tryMatch(">")) {
              this.input();
              const nextCH = this._input[this.offset];
              if (nextCH === "\n" || nextCH === "\r")
                this.input();
              if (this.conditionStack.length > 1) {
                this.begin("INITIAL");
              }
              return this.tok.T_CLOSE_TAG;
            }
            return this.consume_TOKEN();
          case "%":
            if (this.aspTagMode && this._input[this.offset] === ">") {
              this.input();
              ch = this._input[this.offset];
              if (ch === "\n" || ch === "\r") {
                this.input();
              }
              this.aspTagMode = false;
              if (this.conditionStack.length > 1) {
                this.begin("INITIAL");
              }
              return this.tok.T_CLOSE_TAG;
            }
            return this.consume_TOKEN();
          case "{":
            this.begin("ST_IN_SCRIPTING");
            return "{";
          case "}":
            if (this.conditionStack.length > 2) {
              this.popState();
            }
            return "}";
          default:
            if (ch === ".") {
              ch = this.input();
              if (this.is_NUM_START()) {
                return this.consume_NUM();
              } else {
                if (ch)
                  this.unput(1);
              }
            }
            if (this.is_NUM_START()) {
              return this.consume_NUM();
            } else if (this.is_LABEL_START()) {
              return this.consume_LABEL().T_STRING();
            } else if (this.is_TOKEN()) {
              return this.consume_TOKEN();
            }
        }
        throw new Error(
          'Bad terminal sequence "' + ch + '" at line ' + this.yylineno + " (offset " + this.offset + ")"
        );
      },
      T_WHITESPACE() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
            continue;
          }
          if (ch)
            this.unput(1);
          break;
        }
        return this.tok.T_WHITESPACE;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/strings.js
var require_strings = __commonJS({
  "node_modules/php-parser/src/lexer/strings.js"(exports2, module2) {
    "use strict";
    var newline = ["\n", "\r"];
    var valid_after_heredoc = ["\n", "\r", ";"];
    var valid_after_heredoc_73 = valid_after_heredoc.concat([
      "	",
      " ",
      ",",
      "]",
      ")",
      "/",
      "=",
      "!",
      "."
    ]);
    module2.exports = {
      T_CONSTANT_ENCAPSED_STRING() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch == "\\") {
            this.input();
          } else if (ch == "'") {
            break;
          }
        }
        return this.tok.T_CONSTANT_ENCAPSED_STRING;
      },
      // check if matching a HEREDOC state
      is_HEREDOC() {
        const revert = this.offset;
        if (this._input[this.offset - 1] === "<" && this._input[this.offset] === "<" && this._input[this.offset + 1] === "<") {
          this.offset += 3;
          if (this.is_TABSPACE()) {
            while (this.offset < this.size) {
              this.offset++;
              if (!this.is_TABSPACE()) {
                break;
              }
            }
          }
          let tChar = this._input[this.offset - 1];
          if (tChar === "'" || tChar === '"') {
            this.offset++;
          } else {
            tChar = null;
          }
          if (this.is_LABEL_START()) {
            let yyoffset = this.offset - 1;
            while (this.offset < this.size) {
              this.offset++;
              if (!this.is_LABEL()) {
                break;
              }
            }
            const yylabel = this._input.substring(yyoffset, this.offset - 1);
            if (!tChar || tChar === this._input[this.offset - 1]) {
              if (tChar)
                this.offset++;
              if (newline.includes(this._input[this.offset - 1])) {
                this.heredoc_label.label = yylabel;
                this.heredoc_label.length = yylabel.length;
                this.heredoc_label.finished = false;
                yyoffset = this.offset - revert;
                this.offset = revert;
                this.consume(yyoffset);
                if (tChar === "'") {
                  this.begin("ST_NOWDOC");
                } else {
                  this.begin("ST_HEREDOC");
                }
                this.prematch_ENDOFDOC();
                return this.tok.T_START_HEREDOC;
              }
            }
          }
        }
        this.offset = revert;
        return false;
      },
      ST_DOUBLE_QUOTES() {
        let ch;
        while (this.offset < this.size) {
          ch = this.input();
          if (ch == "\\") {
            this.input();
          } else if (ch == '"') {
            break;
          } else if (ch == "$") {
            ch = this.input();
            if (ch == "{" || this.is_LABEL_START()) {
              this.unput(2);
              break;
            }
            if (ch)
              this.unput(1);
          } else if (ch == "{") {
            ch = this.input();
            if (ch == "$") {
              this.unput(2);
              break;
            }
            if (ch)
              this.unput(1);
          }
        }
        if (ch == '"') {
          return this.tok.T_CONSTANT_ENCAPSED_STRING;
        } else {
          let prefix = 1;
          if (this.yytext[0] === "b" || this.yytext[0] === "B") {
            prefix = 2;
          }
          if (this.yytext.length > 2) {
            this.appendToken(
              this.tok.T_ENCAPSED_AND_WHITESPACE,
              this.yytext.length - prefix
            );
          }
          this.unput(this.yytext.length - prefix);
          this.begin("ST_DOUBLE_QUOTES");
          return this.yytext;
        }
      },
      // check if its a DOC end sequence
      isDOC_MATCH(offset, consumeLeadingSpaces) {
        const prev_ch = this._input[offset - 2];
        if (!newline.includes(prev_ch)) {
          return false;
        }
        let indentation_uses_spaces = false;
        let indentation_uses_tabs = false;
        let indentation = 0;
        let leading_ch = this._input[offset - 1];
        if (this.version >= 703) {
          while (leading_ch === "	" || leading_ch === " ") {
            if (leading_ch === " ") {
              indentation_uses_spaces = true;
            } else if (leading_ch === "	") {
              indentation_uses_tabs = true;
            }
            leading_ch = this._input[offset + indentation];
            indentation++;
          }
          offset = offset + indentation;
          if (newline.includes(this._input[offset - 1])) {
            return false;
          }
        }
        if (this._input.substring(
          offset - 1,
          offset - 1 + this.heredoc_label.length
        ) === this.heredoc_label.label) {
          const ch = this._input[offset - 1 + this.heredoc_label.length];
          if ((this.version >= 703 ? valid_after_heredoc_73 : valid_after_heredoc).includes(ch)) {
            if (consumeLeadingSpaces) {
              this.consume(indentation);
              if (indentation_uses_spaces && indentation_uses_tabs) {
                throw new Error(
                  "Parse error:  mixing spaces and tabs in ending marker at line " + this.yylineno + " (offset " + this.offset + ")"
                );
              }
            } else {
              this.heredoc_label.indentation = indentation;
              this.heredoc_label.indentation_uses_spaces = indentation_uses_spaces;
              this.heredoc_label.first_encaps_node = true;
            }
            return true;
          }
        }
        return false;
      },
      /*
       * Prematch the end of HEREDOC/NOWDOC end tag to preset the
       * context of this.heredoc_label
       */
      prematch_ENDOFDOC() {
        this.heredoc_label.indentation_uses_spaces = false;
        this.heredoc_label.indentation = 0;
        this.heredoc_label.first_encaps_node = true;
        let offset = this.offset + 1;
        while (offset < this._input.length) {
          if (this.isDOC_MATCH(offset, false)) {
            return;
          }
          if (!newline.includes(this._input[offset - 1])) {
            while (!newline.includes(this._input[offset++]) && offset < this._input.length) {
            }
          }
          offset++;
        }
      },
      matchST_NOWDOC() {
        if (this.isDOC_MATCH(this.offset, true)) {
          this.consume(this.heredoc_label.length);
          this.popState();
          return this.tok.T_END_HEREDOC;
        }
        let ch = this._input[this.offset - 1];
        while (this.offset < this.size) {
          if (newline.includes(ch)) {
            ch = this.input();
            if (this.isDOC_MATCH(this.offset, true)) {
              this.unput(1).popState();
              this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
              return this.tok.T_ENCAPSED_AND_WHITESPACE;
            }
          } else {
            ch = this.input();
          }
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      matchST_HEREDOC() {
        let ch = this.input();
        if (this.isDOC_MATCH(this.offset, true)) {
          this.consume(this.heredoc_label.length - 1);
          this.popState();
          return this.tok.T_END_HEREDOC;
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            ch = this.input();
            if (!newline.includes(ch)) {
              ch = this.input();
            }
          }
          if (newline.includes(ch)) {
            ch = this.input();
            if (this.isDOC_MATCH(this.offset, true)) {
              this.unput(1).popState();
              this.appendToken(this.tok.T_END_HEREDOC, this.heredoc_label.length);
              return this.tok.T_ENCAPSED_AND_WHITESPACE;
            }
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
          } else {
            ch = this.input();
          }
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      consume_VARIABLE() {
        this.consume_LABEL();
        const ch = this.input();
        if (ch == "[") {
          this.unput(1);
          this.begin("ST_VAR_OFFSET");
          return this.tok.T_VARIABLE;
        } else if (ch === "-") {
          if (this.input() === ">") {
            this.input();
            if (this.is_LABEL_START()) {
              this.begin("ST_LOOKING_FOR_PROPERTY");
            }
            this.unput(3);
            return this.tok.T_VARIABLE;
          } else {
            this.unput(2);
          }
        } else {
          if (ch)
            this.unput(1);
        }
        return this.tok.T_VARIABLE;
      },
      // HANDLES BACKQUOTES
      matchST_BACKQUOTE() {
        let ch = this.input();
        if (ch === "$") {
          ch = this.input();
          if (ch === "{") {
            this.begin("ST_LOOKING_FOR_VARNAME");
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          } else if (this.is_LABEL_START()) {
            const tok = this.consume_VARIABLE();
            return tok;
          }
        } else if (ch === "{") {
          if (this._input[this.offset] === "$") {
            this.begin("ST_IN_SCRIPTING");
            return this.tok.T_CURLY_OPEN;
          }
        } else if (ch === "`") {
          this.popState();
          return "`";
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            this.input();
          } else if (ch === "`") {
            this.unput(1);
            this.popState();
            this.appendToken("`", 1);
            break;
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
            continue;
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
            continue;
          }
          ch = this.input();
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      },
      matchST_DOUBLE_QUOTES() {
        let ch = this.input();
        if (ch === "$") {
          ch = this.input();
          if (ch === "{") {
            this.begin("ST_LOOKING_FOR_VARNAME");
            return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
          } else if (this.is_LABEL_START()) {
            const tok = this.consume_VARIABLE();
            return tok;
          }
        } else if (ch === "{") {
          if (this._input[this.offset] === "$") {
            this.begin("ST_IN_SCRIPTING");
            return this.tok.T_CURLY_OPEN;
          }
        } else if (ch === '"') {
          this.popState();
          return '"';
        }
        while (this.offset < this.size) {
          if (ch === "\\") {
            this.input();
          } else if (ch === '"') {
            this.unput(1);
            this.popState();
            this.appendToken('"', 1);
            break;
          } else if (ch === "$") {
            ch = this.input();
            if (ch === "{") {
              this.begin("ST_LOOKING_FOR_VARNAME");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_DOLLAR_OPEN_CURLY_BRACES, 2);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return this.tok.T_DOLLAR_OPEN_CURLY_BRACES;
              }
            } else if (this.is_LABEL_START()) {
              const yyoffset = this.offset;
              const next = this.consume_VARIABLE();
              if (this.yytext.length > this.offset - yyoffset + 2) {
                this.appendToken(next, this.offset - yyoffset + 2);
                this.unput(this.offset - yyoffset + 2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                return next;
              }
            }
            if (ch)
              this.unput(1);
          } else if (ch === "{") {
            ch = this.input();
            if (ch === "$") {
              this.begin("ST_IN_SCRIPTING");
              if (this.yytext.length > 2) {
                this.appendToken(this.tok.T_CURLY_OPEN, 1);
                this.unput(2);
                return this.tok.T_ENCAPSED_AND_WHITESPACE;
              } else {
                this.unput(1);
                return this.tok.T_CURLY_OPEN;
              }
            }
            if (ch)
              this.unput(1);
          }
          ch = this.input();
        }
        return this.tok.T_ENCAPSED_AND_WHITESPACE;
      }
    };
  }
});

// node_modules/php-parser/src/lexer/tokens.js
var require_tokens = __commonJS({
  "node_modules/php-parser/src/lexer/tokens.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      T_STRING() {
        const token = this.yytext.toLowerCase();
        let id = this.keywords[token];
        if (typeof id !== "number") {
          if (token === "yield") {
            if (this.version >= 700 && this.tryMatch(" from")) {
              this.consume(5);
              id = this.tok.T_YIELD_FROM;
            } else {
              id = this.tok.T_YIELD;
            }
          } else {
            id = this.tok.T_STRING;
            if (token === "b" || token === "B") {
              const ch = this.input();
              if (ch === '"') {
                return this.ST_DOUBLE_QUOTES();
              } else if (ch === "'") {
                return this.T_CONSTANT_ENCAPSED_STRING();
              } else if (ch) {
                this.unput(1);
              }
            }
          }
        }
        if (id === this.tok.T_ENUM) {
          if (this.version < 801) {
            return this.tok.T_STRING;
          }
          const initial = this.offset;
          let ch = this.input();
          while (ch == " ") {
            ch = this.input();
          }
          let isEnum = false;
          if (this.is_LABEL_START()) {
            while (this.is_LABEL()) {
              ch += this.input();
            }
            const label = ch.slice(0, -1).toLowerCase();
            isEnum = label !== "extends" && label !== "implements";
          }
          this.unput(this.offset - initial);
          return isEnum ? this.tok.T_ENUM : this.tok.T_STRING;
        }
        if (this.offset < this.size && id !== this.tok.T_YIELD_FROM) {
          let ch = this.input();
          if (ch === "\\") {
            id = token === "namespace" ? this.tok.T_NAME_RELATIVE : this.tok.T_NAME_QUALIFIED;
            do {
              if (this._input[this.offset] === "{") {
                this.input();
                break;
              }
              this.consume_LABEL();
              ch = this.input();
            } while (ch === "\\");
          }
          if (ch) {
            this.unput(1);
          }
        }
        return id;
      },
      // reads a custom token
      consume_TOKEN() {
        const ch = this._input[this.offset - 1];
        const fn = this.tokenTerminals[ch];
        if (fn) {
          return fn.apply(this, []);
        } else {
          return this.yytext;
        }
      },
      // list of special char tokens
      tokenTerminals: {
        $() {
          this.offset++;
          if (this.is_LABEL_START()) {
            this.offset--;
            this.consume_LABEL();
            return this.tok.T_VARIABLE;
          } else {
            this.offset--;
            return "$";
          }
        },
        "-"() {
          const nchar = this._input[this.offset];
          if (nchar === ">") {
            this.begin("ST_LOOKING_FOR_PROPERTY").input();
            return this.tok.T_OBJECT_OPERATOR;
          } else if (nchar === "-") {
            this.input();
            return this.tok.T_DEC;
          } else if (nchar === "=") {
            this.input();
            return this.tok.T_MINUS_EQUAL;
          }
          return "-";
        },
        "\\"() {
          if (this.offset < this.size) {
            this.input();
            if (this.is_LABEL_START()) {
              let ch;
              do {
                if (this._input[this.offset] === "{") {
                  this.input();
                  break;
                }
                this.consume_LABEL();
                ch = this.input();
              } while (ch === "\\");
              this.unput(1);
              return this.tok.T_NAME_FULLY_QUALIFIED;
            } else {
              this.unput(1);
            }
          }
          return this.tok.T_NS_SEPARATOR;
        },
        "/"() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_DIV_EQUAL;
          }
          return "/";
        },
        ":"() {
          if (this._input[this.offset] === ":") {
            this.input();
            return this.tok.T_DOUBLE_COLON;
          } else {
            return ":";
          }
        },
        "("() {
          const initial = this.offset;
          this.input();
          if (this.is_TABSPACE()) {
            this.consume_TABSPACE().input();
          }
          if (this.is_LABEL_START()) {
            const yylen = this.yytext.length;
            this.consume_LABEL();
            const castToken = this.yytext.substring(yylen - 1).toLowerCase();
            const castId = this.castKeywords[castToken];
            if (typeof castId === "number") {
              this.input();
              if (this.is_TABSPACE()) {
                this.consume_TABSPACE().input();
              }
              if (this._input[this.offset - 1] === ")") {
                return castId;
              }
            }
          }
          this.unput(this.offset - initial);
          return "(";
        },
        "="() {
          const nchar = this._input[this.offset];
          if (nchar === ">") {
            this.input();
            return this.tok.T_DOUBLE_ARROW;
          } else if (nchar === "=") {
            if (this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_IS_IDENTICAL;
            } else {
              this.input();
              return this.tok.T_IS_EQUAL;
            }
          }
          return "=";
        },
        "+"() {
          const nchar = this._input[this.offset];
          if (nchar === "+") {
            this.input();
            return this.tok.T_INC;
          } else if (nchar === "=") {
            this.input();
            return this.tok.T_PLUS_EQUAL;
          }
          return "+";
        },
        "!"() {
          if (this._input[this.offset] === "=") {
            if (this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_IS_NOT_IDENTICAL;
            } else {
              this.input();
              return this.tok.T_IS_NOT_EQUAL;
            }
          }
          return "!";
        },
        "?"() {
          if (this.version >= 700 && this._input[this.offset] === "?") {
            if (this.version >= 704 && this._input[this.offset + 1] === "=") {
              this.consume(2);
              return this.tok.T_COALESCE_EQUAL;
            } else {
              this.input();
              return this.tok.T_COALESCE;
            }
          }
          if (this.version >= 800 && this._input[this.offset] === "-" && this._input[this.offset + 1] === ">") {
            this.consume(1);
            this.begin("ST_LOOKING_FOR_PROPERTY").input();
            return this.tok.T_NULLSAFE_OBJECT_OPERATOR;
          }
          return "?";
        },
        "<"() {
          let nchar = this._input[this.offset];
          if (nchar === "<") {
            nchar = this._input[this.offset + 1];
            if (nchar === "=") {
              this.consume(2);
              return this.tok.T_SL_EQUAL;
            } else if (nchar === "<") {
              if (this.is_HEREDOC()) {
                return this.tok.T_START_HEREDOC;
              }
            }
            this.input();
            return this.tok.T_SL;
          } else if (nchar === "=") {
            this.input();
            if (this.version >= 700 && this._input[this.offset] === ">") {
              this.input();
              return this.tok.T_SPACESHIP;
            } else {
              return this.tok.T_IS_SMALLER_OR_EQUAL;
            }
          } else if (nchar === ">") {
            this.input();
            return this.tok.T_IS_NOT_EQUAL;
          }
          return "<";
        },
        ">"() {
          let nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_IS_GREATER_OR_EQUAL;
          } else if (nchar === ">") {
            nchar = this._input[this.offset + 1];
            if (nchar === "=") {
              this.consume(2);
              return this.tok.T_SR_EQUAL;
            } else {
              this.input();
              return this.tok.T_SR;
            }
          }
          return ">";
        },
        "*"() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_MUL_EQUAL;
          } else if (nchar === "*") {
            this.input();
            if (this._input[this.offset] === "=") {
              this.input();
              return this.tok.T_POW_EQUAL;
            } else {
              return this.tok.T_POW;
            }
          }
          return "*";
        },
        "."() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_CONCAT_EQUAL;
          } else if (nchar === "." && this._input[this.offset + 1] === ".") {
            this.consume(2);
            return this.tok.T_ELLIPSIS;
          }
          return ".";
        },
        "%"() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_MOD_EQUAL;
          }
          return "%";
        },
        "&"() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_AND_EQUAL;
          } else if (nchar === "&") {
            this.input();
            return this.tok.T_BOOLEAN_AND;
          }
          return "&";
        },
        "|"() {
          const nchar = this._input[this.offset];
          if (nchar === "=") {
            this.input();
            return this.tok.T_OR_EQUAL;
          } else if (nchar === "|") {
            this.input();
            return this.tok.T_BOOLEAN_OR;
          } else if (nchar === ">") {
            this.input();
            return this.tok.T_PIPE;
          }
          return "|";
        },
        "^"() {
          if (this._input[this.offset] === "=") {
            this.input();
            return this.tok.T_XOR_EQUAL;
          }
          return "^";
        }
      }
    };
  }
});

// node_modules/php-parser/src/lexer/utils.js
var require_utils = __commonJS({
  "node_modules/php-parser/src/lexer/utils.js"(exports2, module2) {
    "use strict";
    var tokens = ";:,.\\[]()|^&+-/*=%!~$<>?@";
    module2.exports = {
      // check if the char can be a numeric
      is_NUM() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 47 && ch < 58 || ch === 95;
      },
      // check if the char can be a numeric
      is_NUM_START() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 47 && ch < 58;
      },
      // check if current char can be a label
      is_LABEL() {
        const ch = this._input.charCodeAt(this.offset - 1);
        return ch > 96 && ch < 123 || ch > 64 && ch < 91 || ch === 95 || ch > 47 && ch < 58 || ch > 126;
      },
      // check if current char can be a label
      is_LABEL_START() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 64 && ch < 91)
          return true;
        if (ch > 96 && ch < 123)
          return true;
        if (ch === 95)
          return true;
        if (ch > 126)
          return true;
        return false;
      },
      // reads each char of the label
      consume_LABEL() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_LABEL()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this;
      },
      // check if current char is a token char
      is_TOKEN() {
        const ch = this._input[this.offset - 1];
        return tokens.indexOf(ch) !== -1;
      },
      // check if current char is a whitespace
      is_WHITESPACE() {
        const ch = this._input[this.offset - 1];
        return ch === " " || ch === "	" || ch === "\n" || ch === "\r";
      },
      // check if current char is a whitespace (without newlines)
      is_TABSPACE() {
        const ch = this._input[this.offset - 1];
        return ch === " " || ch === "	";
      },
      // consume all whitespaces (excluding newlines)
      consume_TABSPACE() {
        while (this.offset < this.size) {
          const ch = this.input();
          if (!this.is_TABSPACE()) {
            if (ch)
              this.unput(1);
            break;
          }
        }
        return this;
      },
      // check if current char can be a hexadecimal number
      is_HEX() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 47 && ch < 58)
          return true;
        if (ch > 64 && ch < 71)
          return true;
        if (ch > 96 && ch < 103)
          return true;
        if (ch === 95)
          return true;
        return false;
      },
      // check if current char can be an octal number
      is_OCTAL() {
        const ch = this._input.charCodeAt(this.offset - 1);
        if (ch > 47 && ch < 56)
          return true;
        if (ch === 95)
          return true;
        return false;
      }
    };
  }
});

// node_modules/php-parser/src/lexer.js
var require_lexer = __commonJS({
  "node_modules/php-parser/src/lexer.js"(exports2, module2) {
    "use strict";
    var Lexer = function(engine) {
      this.engine = engine;
      this.tok = this.engine.tokens.names;
      this.EOF = 1;
      this.debug = false;
      this.all_tokens = true;
      this.comment_tokens = false;
      this.mode_eval = false;
      this.asp_tags = false;
      this.short_tags = false;
      this.version = 803;
      this.yyprevcol = 0;
      this.keywords = {
        __class__: this.tok.T_CLASS_C,
        __trait__: this.tok.T_TRAIT_C,
        __function__: this.tok.T_FUNC_C,
        __method__: this.tok.T_METHOD_C,
        __line__: this.tok.T_LINE,
        __file__: this.tok.T_FILE,
        __dir__: this.tok.T_DIR,
        __namespace__: this.tok.T_NS_C,
        exit: this.tok.T_EXIT,
        die: this.tok.T_EXIT,
        function: this.tok.T_FUNCTION,
        const: this.tok.T_CONST,
        return: this.tok.T_RETURN,
        try: this.tok.T_TRY,
        catch: this.tok.T_CATCH,
        finally: this.tok.T_FINALLY,
        throw: this.tok.T_THROW,
        if: this.tok.T_IF,
        elseif: this.tok.T_ELSEIF,
        endif: this.tok.T_ENDIF,
        else: this.tok.T_ELSE,
        while: this.tok.T_WHILE,
        endwhile: this.tok.T_ENDWHILE,
        do: this.tok.T_DO,
        for: this.tok.T_FOR,
        endfor: this.tok.T_ENDFOR,
        foreach: this.tok.T_FOREACH,
        endforeach: this.tok.T_ENDFOREACH,
        declare: this.tok.T_DECLARE,
        enddeclare: this.tok.T_ENDDECLARE,
        instanceof: this.tok.T_INSTANCEOF,
        as: this.tok.T_AS,
        switch: this.tok.T_SWITCH,
        endswitch: this.tok.T_ENDSWITCH,
        case: this.tok.T_CASE,
        default: this.tok.T_DEFAULT,
        break: this.tok.T_BREAK,
        continue: this.tok.T_CONTINUE,
        goto: this.tok.T_GOTO,
        echo: this.tok.T_ECHO,
        print: this.tok.T_PRINT,
        class: this.tok.T_CLASS,
        interface: this.tok.T_INTERFACE,
        trait: this.tok.T_TRAIT,
        enum: this.tok.T_ENUM,
        extends: this.tok.T_EXTENDS,
        implements: this.tok.T_IMPLEMENTS,
        new: this.tok.T_NEW,
        clone: this.tok.T_CLONE,
        var: this.tok.T_VAR,
        eval: this.tok.T_EVAL,
        include: this.tok.T_INCLUDE,
        include_once: this.tok.T_INCLUDE_ONCE,
        require: this.tok.T_REQUIRE,
        require_once: this.tok.T_REQUIRE_ONCE,
        namespace: this.tok.T_NAMESPACE,
        use: this.tok.T_USE,
        insteadof: this.tok.T_INSTEADOF,
        global: this.tok.T_GLOBAL,
        isset: this.tok.T_ISSET,
        empty: this.tok.T_EMPTY,
        __halt_compiler: this.tok.T_HALT_COMPILER,
        static: this.tok.T_STATIC,
        abstract: this.tok.T_ABSTRACT,
        final: this.tok.T_FINAL,
        private: this.tok.T_PRIVATE,
        protected: this.tok.T_PROTECTED,
        public: this.tok.T_PUBLIC,
        unset: this.tok.T_UNSET,
        list: this.tok.T_LIST,
        array: this.tok.T_ARRAY,
        callable: this.tok.T_CALLABLE,
        or: this.tok.T_LOGICAL_OR,
        and: this.tok.T_LOGICAL_AND,
        xor: this.tok.T_LOGICAL_XOR,
        match: this.tok.T_MATCH,
        readonly: this.tok.T_READ_ONLY
      };
      this.castKeywords = {
        int: this.tok.T_INT_CAST,
        integer: this.tok.T_INT_CAST,
        real: this.tok.T_DOUBLE_CAST,
        double: this.tok.T_DOUBLE_CAST,
        float: this.tok.T_DOUBLE_CAST,
        string: this.tok.T_STRING_CAST,
        binary: this.tok.T_STRING_CAST,
        array: this.tok.T_ARRAY_CAST,
        object: this.tok.T_OBJECT_CAST,
        bool: this.tok.T_BOOL_CAST,
        boolean: this.tok.T_BOOL_CAST,
        unset: this.tok.T_UNSET_CAST
      };
    };
    Lexer.prototype.setInput = function(input) {
      this._input = input;
      this.size = input.length;
      this.yylineno = 1;
      this.offset = 0;
      this.yyprevcol = 0;
      this.yytext = "";
      this.yylloc = {
        first_offset: 0,
        first_line: 1,
        first_column: 0,
        prev_offset: 0,
        prev_line: 1,
        prev_column: 0,
        last_line: 1,
        last_column: 0
      };
      this.tokens = [];
      if (this.version > 703) {
        this.keywords.fn = this.tok.T_FN;
      } else {
        delete this.keywords.fn;
      }
      this.done = this.offset >= this.size;
      if (!this.all_tokens && this.mode_eval) {
        this.conditionStack = ["INITIAL"];
        this.begin("ST_IN_SCRIPTING");
      } else {
        this.conditionStack = [];
        this.begin("INITIAL");
      }
      this.heredoc_label = {
        label: "",
        length: 0,
        indentation: 0,
        indentation_uses_spaces: false,
        finished: false,
        /*
         * this used for parser to detemine the if current node segment is first encaps node.
         * if ture, the indentation will remove from the begining. and if false, the prev node
         * might be a variable '}' ,and the leading spaces should not be removed util meet the
         * first \n
         */
        first_encaps_node: false,
        // for backward compatible
        /* istanbul ignore next */
        toString() {
          this.label;
        }
      };
      return this;
    };
    Lexer.prototype.input = function() {
      const ch = this._input[this.offset];
      if (!ch)
        return "";
      this.yytext += ch;
      this.offset++;
      if (ch === "\r" && this._input[this.offset] === "\n") {
        this.yytext += "\n";
        this.offset++;
      }
      if (ch === "\n" || ch === "\r") {
        this.yylloc.last_line = ++this.yylineno;
        this.yyprevcol = this.yylloc.last_column;
        this.yylloc.last_column = 0;
      } else {
        this.yylloc.last_column++;
      }
      return ch;
    };
    Lexer.prototype.unput = function(size) {
      if (size === 1) {
        this.offset--;
        if (this._input[this.offset] === "\n" && this._input[this.offset - 1] === "\r") {
          this.offset--;
          size++;
        }
        if (this._input[this.offset] === "\r" || this._input[this.offset] === "\n") {
          this.yylloc.last_line--;
          this.yylineno--;
          this.yylloc.last_column = this.yyprevcol;
        } else {
          this.yylloc.last_column--;
        }
        this.yytext = this.yytext.substring(0, this.yytext.length - size);
      } else if (size > 0) {
        this.offset -= size;
        if (size < this.yytext.length) {
          this.yytext = this.yytext.substring(0, this.yytext.length - size);
          this.yylloc.last_line = this.yylloc.first_line;
          this.yylloc.last_column = this.yyprevcol = this.yylloc.first_column;
          for (let i = 0; i < this.yytext.length; i++) {
            let c = this.yytext[i];
            if (c === "\r") {
              c = this.yytext[++i];
              this.yyprevcol = this.yylloc.last_column;
              this.yylloc.last_line++;
              this.yylloc.last_column = 0;
              if (c !== "\n") {
                if (c === "\r") {
                  this.yylloc.last_line++;
                } else {
                  this.yylloc.last_column++;
                }
              }
            } else if (c === "\n") {
              this.yyprevcol = this.yylloc.last_column;
              this.yylloc.last_line++;
              this.yylloc.last_column = 0;
            } else {
              this.yylloc.last_column++;
            }
          }
          this.yylineno = this.yylloc.last_line;
        } else {
          this.yytext = "";
          this.yylloc.last_line = this.yylineno = this.yylloc.first_line;
          this.yylloc.last_column = this.yylloc.first_column;
        }
      }
      return this;
    };
    Lexer.prototype.tryMatch = function(text) {
      return text === this.ahead(text.length);
    };
    Lexer.prototype.tryMatchCaseless = function(text) {
      return text === this.ahead(text.length).toLowerCase();
    };
    Lexer.prototype.ahead = function(size) {
      let text = this._input.substring(this.offset, this.offset + size);
      if (text[text.length - 1] === "\r" && this._input[this.offset + size + 1] === "\n") {
        text += "\n";
      }
      return text;
    };
    Lexer.prototype.consume = function(size) {
      for (let i = 0; i < size; i++) {
        const ch = this._input[this.offset];
        if (!ch)
          break;
        this.yytext += ch;
        this.offset++;
        if (ch === "\r" && this._input[this.offset] === "\n") {
          this.yytext += "\n";
          this.offset++;
          i++;
        }
        if (ch === "\n" || ch === "\r") {
          this.yylloc.last_line = ++this.yylineno;
          this.yyprevcol = this.yylloc.last_column;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }
      }
      return this;
    };
    Lexer.prototype.getState = function() {
      return {
        yytext: this.yytext,
        offset: this.offset,
        yylineno: this.yylineno,
        yyprevcol: this.yyprevcol,
        yylloc: {
          first_offset: this.yylloc.first_offset,
          first_line: this.yylloc.first_line,
          first_column: this.yylloc.first_column,
          last_line: this.yylloc.last_line,
          last_column: this.yylloc.last_column
        },
        heredoc_label: this.heredoc_label
      };
    };
    Lexer.prototype.setState = function(state) {
      this.yytext = state.yytext;
      this.offset = state.offset;
      this.yylineno = state.yylineno;
      this.yyprevcol = state.yyprevcol;
      this.yylloc = state.yylloc;
      if (state.heredoc_label) {
        this.heredoc_label = state.heredoc_label;
      }
      return this;
    };
    Lexer.prototype.appendToken = function(value, ahead) {
      this.tokens.push([value, ahead]);
      return this;
    };
    Lexer.prototype.lex = function() {
      this.yylloc.prev_offset = this.offset;
      this.yylloc.prev_line = this.yylloc.last_line;
      this.yylloc.prev_column = this.yylloc.last_column;
      let token = this.next() || this.lex();
      if (!this.all_tokens) {
        while (token === this.tok.T_WHITESPACE || // ignore white space
        !this.comment_tokens && (token === this.tok.T_COMMENT || // ignore single lines comments
        token === this.tok.T_DOC_COMMENT) || // ignore doc comments
        // ignore open tags
        token === this.tok.T_OPEN_TAG) {
          token = this.next() || this.lex();
        }
        if (token == this.tok.T_OPEN_TAG_WITH_ECHO) {
          return this.tok.T_ECHO;
        } else if (token === this.tok.T_CLOSE_TAG) {
          return ";";
        }
      }
      if (!this.yylloc.prev_offset) {
        this.yylloc.prev_offset = this.yylloc.first_offset;
        this.yylloc.prev_line = this.yylloc.first_line;
        this.yylloc.prev_column = this.yylloc.first_column;
      }
      return token;
    };
    Lexer.prototype.begin = function(condition) {
      this.conditionStack.push(condition);
      this.curCondition = condition;
      this.stateCb = this["match" + condition];
      if (typeof this.stateCb !== "function") {
        throw new Error('Undefined condition state "' + condition + '"');
      }
      return this;
    };
    Lexer.prototype.popState = function() {
      const n = this.conditionStack.length - 1;
      const condition = n > 0 ? this.conditionStack.pop() : this.conditionStack[0];
      this.curCondition = this.conditionStack[this.conditionStack.length - 1];
      this.stateCb = this["match" + this.curCondition];
      if (typeof this.stateCb !== "function") {
        throw new Error('Undefined condition state "' + this.curCondition + '"');
      }
      return condition;
    };
    Lexer.prototype.next = function() {
      let token;
      if (!this._input) {
        this.done = true;
      }
      this.yylloc.first_offset = this.offset;
      this.yylloc.first_line = this.yylloc.last_line;
      this.yylloc.first_column = this.yylloc.last_column;
      this.yytext = "";
      if (this.done) {
        this.yylloc.prev_offset = this.yylloc.first_offset;
        this.yylloc.prev_line = this.yylloc.first_line;
        this.yylloc.prev_column = this.yylloc.first_column;
        return this.EOF;
      }
      if (this.tokens.length > 0) {
        token = this.tokens.shift();
        if (typeof token[1] === "object") {
          this.setState(token[1]);
        } else {
          this.consume(token[1]);
        }
        token = token[0];
      } else {
        token = this.stateCb.apply(this, []);
      }
      if (this.offset >= this.size && this.tokens.length === 0) {
        this.done = true;
      }
      if (this.debug) {
        let tName = token;
        if (typeof tName === "number") {
          tName = this.engine.tokens.values[tName];
        } else {
          tName = '"' + tName + '"';
        }
        const e = new Error(
          tName + "	from " + this.yylloc.first_line + "," + this.yylloc.first_column + "	 - to " + this.yylloc.last_line + "," + this.yylloc.last_column + '	"' + this.yytext + '"'
        );
        console.error(e.stack);
      }
      return token;
    };
    [
      require_attribute(),
      require_comments(),
      require_initial(),
      require_numbers(),
      require_property(),
      require_scripting(),
      require_strings(),
      require_tokens(),
      require_utils()
    ].forEach(function(ext) {
      for (const k in ext) {
        Lexer.prototype[k] = ext[k];
      }
    });
    module2.exports = Lexer;
  }
});

// node_modules/php-parser/src/ast/position.js
var require_position = __commonJS({
  "node_modules/php-parser/src/ast/position.js"(exports2, module2) {
    "use strict";
    var Position = function(line, column, offset) {
      this.line = line;
      this.column = column;
      this.offset = offset;
    };
    module2.exports = Position;
  }
});

// node_modules/php-parser/src/parser/array.js
var require_array = __commonJS({
  "node_modules/php-parser/src/parser/array.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Parse an array
       * ```ebnf
       * array ::= T_ARRAY '(' array_pair_list ')' |
       *   '[' array_pair_list ']'
       * ```
       */
      read_array() {
        let expect;
        let shortForm = false;
        const result = this.node("array");
        if (this.token === this.tok.T_ARRAY) {
          this.next().expect("(");
          expect = ")";
        } else {
          shortForm = true;
          expect = "]";
        }
        let items = [];
        if (this.next().token !== expect) {
          items = this.read_array_pair_list(shortForm);
        }
        this.expect(expect);
        this.next();
        return result(shortForm, items);
      },
      /*
       * Reads an array of items
       * ```ebnf
       * array_pair_list ::= array_pair (',' array_pair?)*
       * ```
       */
      read_array_pair_list(shortForm) {
        const self = this;
        return this.read_list(
          function() {
            return self.read_array_pair(shortForm);
          },
          ",",
          true
        );
      },
      /*
       * Reads an entry
       * array_pair:
       *  expr T_DOUBLE_ARROW expr
       *  | expr
       *  | expr T_DOUBLE_ARROW '&' variable
       *  | '&' variable
       *  | expr T_DOUBLE_ARROW T_LIST '(' array_pair_list ')'
       *  | T_LIST '(' array_pair_list ')'
       */
      read_array_pair(shortForm) {
        if (!shortForm && this.token === ")" || shortForm && this.token === "]") {
          return;
        }
        if (this.token === ",") {
          return this.node("noop")();
        }
        const entry = this.node("entry");
        let key = null;
        let value;
        let byRef = false;
        let unpack = false;
        if (this.token === "&") {
          this.next();
          byRef = true;
          value = this.read_variable(true, false);
        } else if (this.token === this.tok.T_ELLIPSIS && this.version >= 704) {
          this.next();
          if (this.token === "&") {
            this.error();
          }
          unpack = true;
          value = this.read_expr();
        } else {
          const expr = this.read_expr();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            this.next();
            key = expr;
            if (this.token === "&") {
              this.next();
              byRef = true;
              value = this.read_variable(true, false);
            } else {
              value = this.read_expr();
            }
          } else {
            value = expr;
          }
        }
        return entry(key, value, byRef, unpack);
      }
    };
  }
});

// node_modules/php-parser/src/parser/class.js
var require_class = __commonJS({
  "node_modules/php-parser/src/parser/class.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * reading a class
       * ```ebnf
       * class ::= class_scope? T_CLASS T_STRING (T_EXTENDS NAMESPACE_NAME)? (T_IMPLEMENTS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' CLASS_BODY '}'
       * ```
       */
      read_class_declaration_statement(attrs) {
        const result = this.node("class");
        const flag = this.read_class_modifiers();
        if (this.token !== this.tok.T_CLASS) {
          this.error(this.tok.T_CLASS);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const propExtends = this.read_extends_from();
        const propImplements = this.read_implements_list();
        this.expect("{");
        const body = this.next().read_class_body(true, false);
        const node = result(propName, propExtends, propImplements, body, flag);
        if (attrs)
          node.attrGroups = attrs;
        return node;
      },
      read_class_modifiers() {
        const modifier = this.read_class_modifier({
          readonly: 0,
          final_or_abstract: 0
        });
        return [0, 0, modifier.final_or_abstract, modifier.readonly];
      },
      read_class_modifier(memo) {
        if (this.token === this.tok.T_READ_ONLY) {
          this.next();
          memo.readonly = 1;
          memo = this.read_class_modifier(memo);
        } else if (memo.final_or_abstract === 0 && this.token === this.tok.T_ABSTRACT) {
          this.next();
          memo.final_or_abstract = 1;
          memo = this.read_class_modifier(memo);
        } else if (memo.final_or_abstract === 0 && this.token === this.tok.T_FINAL) {
          this.next();
          memo.final_or_abstract = 2;
          memo = this.read_class_modifier(memo);
        }
        return memo;
      },
      /*
       * Reads a class body
       * ```ebnf
       *   class_body ::= (member_flags? (T_VAR | T_STRING | T_FUNCTION))*
       * ```
       */
      read_class_body(allow_variables, allow_enum_cases) {
        let result = [];
        let attrs = [];
        while (this.token !== this.EOF && this.token !== "}") {
          if (this.token === this.tok.T_COMMENT) {
            result.push(this.read_comment());
            continue;
          }
          if (this.token === this.tok.T_DOC_COMMENT) {
            result.push(this.read_doc_comment());
            continue;
          }
          if (this.token === this.tok.T_USE) {
            result = result.concat(this.read_trait_use_statement());
            continue;
          }
          const locStart = this.position();
          if (this.token === this.tok.T_ATTRIBUTE) {
            attrs = this.read_attr_list();
          }
          if (allow_enum_cases && this.token === this.tok.T_CASE) {
            const enumcase = this.read_enum_case(attrs);
            attrs = [];
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(enumcase);
            continue;
          }
          const flags = this.read_member_flags(false);
          if (this.token === this.tok.T_CONST) {
            if (flags[0][1] !== -1) {
              this.raiseError("Cannot use asymmetric visibility on constants");
            }
            const constants = this.read_constant_list(flags, attrs, locStart);
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(constants);
            continue;
          }
          if (allow_variables && this.token === this.tok.T_VAR) {
            this.next().expect(this.tok.T_VARIABLE);
            flags[0][0] = null;
            flags[1] = 0;
          }
          if (this.token === this.tok.T_FUNCTION) {
            result.push(this.read_function(false, flags, attrs, locStart));
            attrs = [];
          } else if (allow_variables && (this.token === this.tok.T_VARIABLE || this.version >= 801 && this.token === this.tok.T_READ_ONLY || // support https://wiki.php.net/rfc/typed_properties_v2
          this.version >= 704 && (this.token === "?" || this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE || this.token === this.tok.T_NAMESPACE || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NS_SEPARATOR || this.token === this.tok.T_STRING))) {
            const variables = this.read_variable_list(flags, attrs, locStart);
            attrs = [];
            result = result.concat(variables);
          } else {
            this.error([
              this.tok.T_CONST,
              ...allow_variables ? [this.tok.T_VARIABLE] : [],
              ...allow_enum_cases ? [this.tok.T_CASE] : [],
              this.tok.T_FUNCTION
            ]);
            this.next();
          }
        }
        this.expect("}");
        this.next();
        return result;
      },
      /*
       * Reads variable list
       * ```ebnf
       *  variable_list ::= (variable_declaration ',')* variable_declaration
       * ```
       */
      read_variable_list(flags, attrs, locStart) {
        let property_statement = this.node("propertystatement");
        const properties = this.read_list(
          /*
           * Reads a variable declaration
           *
           * ```ebnf
           *  variable_declaration ::= T_VARIABLE '=' scalar
           * ```
           */
          function read_variable_declaration() {
            const result = this.node("property");
            let readonly = flags[3] === 1;
            if (!readonly && this.token === this.tok.T_READ_ONLY) {
              readonly = true;
              this.next();
            }
            const [nullable, type] = this.read_optional_type();
            this.expect(this.tok.T_VARIABLE);
            let propName = this.node("identifier");
            const name = this.text().substring(1);
            this.next();
            propName = propName(name);
            let value = null;
            let property_hooks = [];
            this.expect([",", ";", "=", "{"]);
            if (this.token === "=") {
              value = this.next().read_expr();
            }
            if (this.token === "{") {
              property_hooks = this.read_property_hooks();
            } else {
              this.expect([";", ","]);
            }
            return result(
              propName,
              value,
              readonly,
              nullable,
              type,
              attrs || [],
              property_hooks
            );
          },
          ","
        );
        property_statement = property_statement(null, properties, flags);
        if (locStart && property_statement.loc) {
          property_statement.loc.start = locStart;
          if (property_statement.loc.source) {
            property_statement.loc.source = this.lexer._input.substr(
              property_statement.loc.start.offset,
              property_statement.loc.end.offset - property_statement.loc.start.offset
            );
          }
        }
        if (this.token === ";") {
          this.next();
        }
        return property_statement;
      },
      /*
       * Reads property hooks
       */
      read_property_hooks() {
        if (this.version < 804) {
          this.raiseError("Parse Error: Property hooks require PHP 8.4+");
        }
        this.expect("{");
        this.next();
        const hooks = [];
        while (this.token !== this.EOF && this.token !== "}") {
          hooks.push(this.read_property_hook());
        }
        this.expect("}");
        this.next();
        return hooks;
      },
      read_property_hook() {
        const property_hooks = this.node("propertyhook");
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        const is_final = this.token === this.tok.T_FINAL;
        if (is_final)
          this.next();
        const is_reference = this.token === "&";
        if (is_reference)
          this.next();
        const method_name = this.text();
        if (method_name !== "get" && method_name !== "set") {
          this.raiseError(
            "Parse Error: Property hooks must be either 'get' or 'set'"
          );
        }
        this.next();
        let parameter = null;
        let body = null;
        this.expect([this.tok.T_DOUBLE_ARROW, "{", "(", ";"]);
        if (this.token === ";") {
          this.next();
          return property_hooks(
            method_name,
            is_final,
            is_reference,
            parameter,
            body,
            attrs
          );
        }
        if (this.token === "(") {
          this.next();
          parameter = this.read_parameter(false);
          this.expect(")");
          this.next();
        }
        if (this.token === this.tok.T_DOUBLE_ARROW) {
          this.next();
          body = this.read_expr();
          this.next();
        } else if (this.token === "{") {
          body = this.read_code_block();
        }
        return property_hooks(
          method_name,
          is_final,
          is_reference,
          parameter,
          body,
          attrs
        );
      },
      /*
       * Reads constant list
       * ```ebnf
       *  constant_list ::= T_CONST [type] (constant_declaration ',')* constant_declaration
       * ```
       */
      read_constant_list(flags, attrs, locStart) {
        const result = this.node("classconstant");
        if (this.expect(this.tok.T_CONST)) {
          this.next();
        }
        if (flags[1] === 1 || flags[2] === 1 || flags[3] === 1) {
          this.error();
        }
        if (flags[2] === 2 && this.version < 801) {
          this.raiseError("Final class constants are not allowed before PHP 8.1");
        }
        const [nullable, type] = this.version >= 803 ? this.read_optional_type() : [false, null];
        const items = this.read_list(
          /*
           * Reads a constant declaration
           *
           * ```ebnf
           *  constant_declaration ::= (T_STRING | IDENTIFIER) '=' expr
           * ```
           * @return {Constant} [:link:](AST.md#constant)
           */
          function read_constant_declaration() {
            const result2 = this.node("constant");
            let constName = null;
            let value = null;
            if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
              constName = this.node("identifier");
              const name = this.text();
              this.next();
              constName = constName(name);
            } else {
              this.expect("IDENTIFIER");
            }
            if (this.expect("=")) {
              value = this.next().read_expr();
            }
            return result2(constName, value);
          },
          ","
        );
        const node = result(null, items, flags, nullable, type, attrs || []);
        if (locStart && node.loc) {
          node.loc.start = locStart;
          if (node.loc.source) {
            node.loc.source = this.lexer._input.substr(
              node.loc.start.offset,
              node.loc.end.offset - node.loc.start.offset
            );
          }
        }
        return node;
      },
      /*
       * Read member flags
       * @return array
       *  1st index : [get, set] visibility tuple
       *    get/set: -1 => no visibility, 0 => public, 1 => protected, 2 => private
       *  2nd index : 0 => instance member, 1 => static member
       *  3rd index : 0 => normal, 1 => abstract member, 2 => final member
       *  4th index : 0 => no readonly, 1 => readonly
       */
      read_member_flags(asInterface) {
        const result = [[-1, -1], 0, 0, 0];
        const seen = /* @__PURE__ */ new Set();
        while (this.is("T_MEMBER_FLAGS")) {
          let idx = -1, val = -1;
          switch (this.token) {
            case this.tok.T_PUBLIC:
            case this.tok.T_PROTECTED:
            case this.tok.T_PRIVATE: {
              idx = 0;
              val = this.token === this.tok.T_PUBLIC ? 0 : this.token === this.tok.T_PROTECTED ? 1 : 2;
              if (asInterface && val === 2) {
                this.expect([this.tok.T_PUBLIC, this.tok.T_PROTECTED]);
                val = -1;
              }
              this.next();
              if (this.version >= 804 && this.token === "(") {
                if (result[0][0] === -1) {
                  result[0][0] = 0;
                }
                this.next();
                if (this.token !== this.tok.T_STRING || this.text() !== "set") {
                  this.error("set");
                } else {
                  this.next();
                }
                if (this.expect(")")) {
                  this.next();
                }
                if (seen.has("set")) {
                  this.error();
                } else if (val !== -1) {
                  seen.add("set");
                  result[0][1] = val;
                }
                continue;
              }
              if (seen.has(idx)) {
                this.error();
              } else if (val !== -1) {
                seen.add(idx);
                result[0][0] = val;
              }
              continue;
            }
            case this.tok.T_STATIC:
              idx = 1;
              val = 1;
              break;
            case this.tok.T_ABSTRACT:
              idx = 2;
              val = 1;
              break;
            case this.tok.T_FINAL:
              idx = 2;
              val = 2;
              break;
            case this.tok.T_READ_ONLY:
              idx = 3;
              val = 1;
              break;
          }
          if (asInterface && idx === 2 && val === 1) {
            this.error();
            val = -1;
          }
          if (seen.has(idx)) {
            this.error();
          } else if (val !== -1) {
            seen.add(idx);
            result[idx] = val;
          }
          this.next();
        }
        return result;
      },
      /*
       * optional_type:
       *	  /- empty -/	{ $$ = NULL; }
       *   |	type_expr	{ $$ = $1; }
       * ;
       *
       * type_expr:
       *		type		{ $$ = $1; }
       *	|	'?' type	{ $$ = $2; $$->attr |= ZEND_TYPE_NULLABLE; }
       *	|	union_type	{ $$ = $1; }
       * ;
       *
       * type:
       * 		T_ARRAY		{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_ARRAY); }
       * 	|	T_CALLABLE	{ $$ = zend_ast_create_ex(ZEND_AST_TYPE, IS_CALLABLE); }
       * 	|	name		{ $$ = $1; }
       * ;
       *
       * union_type:
       * 		type '|' type       { $$ = zend_ast_create_list(2, ZEND_AST_TYPE_UNION, $1, $3); }
       * 	|	union_type '|' type { $$ = zend_ast_list_add($1, $3); }
       * ;
       */
      read_optional_type() {
        const nullable = this.token === "?";
        if (nullable) {
          this.next();
        }
        if (this.peekSkipComments() === "=") {
          return [false, null];
        }
        let type = this.read_types();
        if (nullable && !type) {
          this.raiseError(
            "Expecting a type definition combined with nullable operator"
          );
        }
        if (!nullable && !type) {
          return [false, null];
        }
        if (this.token === "|") {
          type = [type];
          do {
            this.next();
            const variant = this.read_type();
            if (!variant) {
              this.raiseError("Expecting a type definition");
              break;
            }
            type.push(variant);
          } while (this.token === "|");
        }
        return [nullable, type];
      },
      peekSkipComments() {
        const lexerState = this.lexer.getState();
        let nextToken;
        do {
          nextToken = this.lexer.lex();
        } while (nextToken === this.tok.T_COMMENT || nextToken === this.tok.T_WHITESPACE);
        this.lexer.setState(lexerState);
        return nextToken;
      },
      /*
       * reading an interface
       * ```ebnf
       * interface ::= T_INTERFACE T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' INTERFACE_BODY '}'
       * ```
       */
      read_interface_declaration_statement(attrs) {
        const result = this.node("interface");
        if (this.token !== this.tok.T_INTERFACE) {
          this.error(this.tok.T_INTERFACE);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const propExtends = this.read_interface_extends_list();
        this.expect("{");
        const body = this.next().read_interface_body();
        return result(propName, propExtends, body, attrs || []);
      },
      /*
       * Reads an interface body
       * ```ebnf
       *   interface_body ::= (member_flags? (T_CONST | T_FUNCTION))*
       * ```
       */
      read_interface_body() {
        let result = [];
        let attrs;
        while (this.token !== this.EOF && this.token !== "}") {
          if (this.token === this.tok.T_COMMENT) {
            result.push(this.read_comment());
            continue;
          }
          if (this.token === this.tok.T_DOC_COMMENT) {
            result.push(this.read_doc_comment());
            continue;
          }
          const locStart = this.position();
          attrs = [];
          if (this.token === this.tok.T_ATTRIBUTE) {
            attrs = this.read_attr_list();
          }
          const flags = this.read_member_flags(true);
          if (this.token === this.tok.T_CONST) {
            if (flags[0][1] !== -1) {
              this.raiseError("Cannot use asymmetric visibility on constants");
            }
            const constants = this.read_constant_list(flags, attrs, locStart);
            if (this.expect(";")) {
              this.next();
            }
            result = result.concat(constants);
          } else if (this.token === this.tok.T_FUNCTION) {
            const method = this.read_function_declaration(
              2,
              flags,
              attrs,
              locStart
            );
            method.parseFlags(flags);
            result.push(method);
            if (this.expect(";")) {
              this.next();
            }
          } else if (this.token === this.tok.T_STRING) {
            result.push(this.read_variable_list(flags, attrs, locStart));
          } else {
            this.error([this.tok.T_CONST, this.tok.T_FUNCTION, this.tok.T_STRING]);
            this.next();
          }
        }
        if (this.expect("}")) {
          this.next();
        }
        return result;
      },
      /*
       * reading a trait
       * ```ebnf
       * trait ::= T_TRAIT T_STRING (T_EXTENDS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' FUNCTION* '}'
       * ```
       */
      read_trait_declaration_statement(attrs) {
        const result = this.node("trait");
        if (this.token !== this.tok.T_TRAIT) {
          this.error(this.tok.T_TRAIT);
          this.next();
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        this.expect("{");
        const body = this.next().read_class_body(true, false);
        const node = result(propName, body);
        if (attrs)
          node.attrGroups = attrs;
        return node;
      },
      /*
       * reading a use statement
       * ```ebnf
       * trait_use_statement ::= namespace_name (',' namespace_name)* ('{' trait_use_alias '}')?
       * ```
       */
      read_trait_use_statement() {
        const node = this.node("traituse");
        this.expect(this.tok.T_USE) && this.next();
        const traits = [this.read_namespace_name()];
        let adaptations = null;
        while (this.token === ",") {
          traits.push(this.next().read_namespace_name());
        }
        if (this.token === "{") {
          adaptations = [];
          while (this.next().token !== this.EOF) {
            if (this.token === "}")
              break;
            adaptations.push(this.read_trait_use_alias());
            this.expect(";");
          }
          if (this.expect("}")) {
            this.next();
          }
        } else {
          if (this.expect(";")) {
            this.next();
          }
        }
        return node(traits, adaptations);
      },
      /*
       * Reading trait alias
       * ```ebnf
       * trait_use_alias ::= namespace_name ( T_DOUBLE_COLON T_STRING )? (T_INSTEADOF namespace_name) | (T_AS member_flags? T_STRING)
       * ```
       * name list : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L303
       * trait adaptation : https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L742
       */
      read_trait_use_alias() {
        const node = this.node();
        let trait = null;
        let method;
        if (this.is("IDENTIFIER")) {
          method = this.node("identifier");
          const methodName = this.text();
          this.next();
          method = method(methodName);
        } else {
          method = this.read_namespace_name();
          if (this.token === this.tok.T_DOUBLE_COLON) {
            this.next();
            if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
              trait = method;
              method = this.node("identifier");
              const methodName = this.text();
              this.next();
              method = method(methodName);
            } else {
              this.expect(this.tok.T_STRING);
            }
          } else {
            method = method.name;
          }
        }
        if (this.token === this.tok.T_INSTEADOF) {
          return node(
            "traitprecedence",
            trait,
            method,
            this.next().read_name_list()
          );
        } else if (this.token === this.tok.T_AS) {
          let flags = null;
          let alias = null;
          if (this.next().is("T_MEMBER_FLAGS")) {
            flags = this.read_member_flags();
          }
          if (this.token === this.tok.T_STRING || this.version >= 700 && this.is("IDENTIFIER")) {
            alias = this.node("identifier");
            const name = this.text();
            this.next();
            alias = alias(name);
          } else if (flags === null) {
            this.expect(this.tok.T_STRING);
          }
          return node("traitalias", trait, method, alias, flags);
        }
        this.expect([this.tok.T_AS, this.tok.T_INSTEADOF]);
        return node("traitalias", trait, method, null, null);
      }
    };
  }
});

// node_modules/php-parser/src/parser/comment.js
var require_comment = __commonJS({
  "node_modules/php-parser/src/parser/comment.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       *  Comments with // or # or / * ... * /
       */
      read_comment() {
        const text = this.text();
        let result = this.ast.prepare(
          text.substring(0, 2) === "/*" ? "commentblock" : "commentline",
          null,
          this
        );
        const offset = this.lexer.yylloc.first_offset;
        const prev = this.prev;
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
        this.lex();
        result = result(text);
        result.offset = offset;
        this.prev = prev;
        return result;
      },
      /*
       * Comments with / ** ... * /
       */
      read_doc_comment() {
        let result = this.ast.prepare("commentblock", null, this);
        const offset = this.lexer.yylloc.first_offset;
        const text = this.text();
        const prev = this.prev;
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
        this.lex();
        result = result(text);
        result.offset = offset;
        this.prev = prev;
        return result;
      }
    };
  }
});

// node_modules/php-parser/src/parser/expr.js
var require_expr = __commonJS({
  "node_modules/php-parser/src/parser/expr.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      read_expr(expr) {
        const result = this.node();
        if (this.token === "@") {
          if (!expr) {
            expr = this.next().read_expr();
          }
          return result("silent", expr);
        }
        if (!expr) {
          expr = this.read_expr_item();
        }
        if (this.token === "|") {
          return result("bin", "|", expr, this.next().read_expr());
        }
        if (this.token === "&") {
          return result("bin", "&", expr, this.next().read_expr());
        }
        if (this.token === "^") {
          return result("bin", "^", expr, this.next().read_expr());
        }
        if (this.token === ".") {
          return result("bin", ".", expr, this.next().read_expr());
        }
        if (this.token === "+") {
          return result("bin", "+", expr, this.next().read_expr());
        }
        if (this.token === "-") {
          return result("bin", "-", expr, this.next().read_expr());
        }
        if (this.token === "*") {
          return result("bin", "*", expr, this.next().read_expr());
        }
        if (this.token === "/") {
          return result("bin", "/", expr, this.next().read_expr());
        }
        if (this.token === "%") {
          return result("bin", "%", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_POW) {
          return result("bin", "**", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SL) {
          return result("bin", "<<", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SR) {
          return result("bin", ">>", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_BOOLEAN_OR) {
          return result("bin", "||", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_OR) {
          return result("bin", "or", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_BOOLEAN_AND) {
          return result("bin", "&&", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_AND) {
          return result("bin", "and", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_LOGICAL_XOR) {
          return result("bin", "xor", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_IDENTICAL) {
          return result("bin", "===", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_NOT_IDENTICAL) {
          return result("bin", "!==", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_EQUAL) {
          return result("bin", "==", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_NOT_EQUAL) {
          return result("bin", "!=", expr, this.next().read_expr());
        }
        if (this.token === "<") {
          return result("bin", "<", expr, this.next().read_expr());
        }
        if (this.token === ">") {
          return result("bin", ">", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_SMALLER_OR_EQUAL) {
          return result("bin", "<=", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_IS_GREATER_OR_EQUAL) {
          return result("bin", ">=", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_SPACESHIP) {
          return result("bin", "<=>", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_INSTANCEOF) {
          expr = result(
            "bin",
            "instanceof",
            expr,
            this.next().read_class_name_reference()
          );
          if (this.token !== ";" && this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
            expr = this.read_expr(expr);
          }
        }
        if (this.token === this.tok.T_NULLSAFE_OBJECT_OPERATOR) {
          expr = result("nullsafepropertylookup", expr, this.read_what());
          expr = this.recursive_variable_chain_scan(expr, false, true);
        }
        if (this.token === this.tok.T_COALESCE) {
          return result("bin", "??", expr, this.next().read_expr());
        }
        if (this.token === this.tok.T_PIPE) {
          if (this.version < 805) {
            this.raiseError("PHP 8.5+ is required to use pipe operator");
          }
          const right = this.next().read_expr();
          if (right.kind === "arrowfunc" && !right.parenthesizedExpression) {
            this.raiseError(
              "Arrow functions in a pipe chain must be wrapped in parentheses"
            );
          }
          return result("bin", "|>", expr, right);
        }
        if (this.token === "?") {
          let trueArg = null;
          if (this.next().token !== ":") {
            trueArg = this.read_expr();
          }
          this.expect(":") && this.next();
          return result("retif", expr, trueArg, this.read_expr());
        } else {
          result.destroy(expr);
        }
        return expr;
      },
      /*
       * Reads a cast expression
       */
      read_expr_cast(type) {
        return this.node("cast")(type, this.text(), this.next().read_expr());
      },
      /*
       * Read a isset variable
       */
      read_isset_variable() {
        return this.read_expr();
      },
      /*
       * Reads isset variables
       */
      read_isset_variables() {
        return this.read_function_list(this.read_isset_variable, ",");
      },
      /*
       * Reads internal PHP functions
       */
      read_internal_functions_in_yacc() {
        let result = null;
        switch (this.token) {
          case this.tok.T_ISSET:
            {
              result = this.node("isset");
              if (this.next().expect("(")) {
                this.next();
              }
              const variables = this.read_isset_variables();
              if (this.expect(")")) {
                this.next();
              }
              result = result(variables);
            }
            break;
          case this.tok.T_EMPTY:
            {
              result = this.node("empty");
              if (this.next().expect("(")) {
                this.next();
              }
              const expression = this.read_expr();
              if (this.expect(")")) {
                this.next();
              }
              result = result(expression);
            }
            break;
          case this.tok.T_INCLUDE:
            result = this.node("include")(false, false, this.next().read_expr());
            break;
          case this.tok.T_INCLUDE_ONCE:
            result = this.node("include")(true, false, this.next().read_expr());
            break;
          case this.tok.T_EVAL:
            {
              result = this.node("eval");
              if (this.next().expect("(")) {
                this.next();
              }
              const expr = this.read_expr();
              if (this.expect(")")) {
                this.next();
              }
              result = result(expr);
            }
            break;
          case this.tok.T_REQUIRE:
            result = this.node("include")(false, true, this.next().read_expr());
            break;
          case this.tok.T_REQUIRE_ONCE:
            result = this.node("include")(true, true, this.next().read_expr());
            break;
        }
        return result;
      },
      /*
       * Reads optional expression
       */
      read_optional_expr(stopToken) {
        if (this.token !== stopToken) {
          return this.read_expr();
        }
        return null;
      },
      /*
       * Reads exit expression
       */
      read_exit_expr() {
        let expression = null;
        if (this.token === "(") {
          this.next();
          expression = this.read_optional_expr(")");
          this.expect(")") && this.next();
        }
        return expression;
      },
      /*
       * ```ebnf
       * Reads an expression
       *  expr ::= @todo
       * ```
       */
      read_expr_item() {
        let result, expr, attrs = [];
        if (this.token === "+") {
          return this.node("unary")("+", this.next().read_expr());
        }
        if (this.token === "-") {
          return this.node("unary")("-", this.next().read_expr());
        }
        if (this.token === "!") {
          return this.node("unary")("!", this.next().read_expr());
        }
        if (this.token === "~") {
          return this.node("unary")("~", this.next().read_expr());
        }
        if (this.token === "(") {
          expr = this.next().read_expr();
          expr.parenthesizedExpression = true;
          this.expect(")") && this.next();
          return this.handleDereferencable(expr);
        }
        if (this.token === "`") {
          return this.read_encapsed_string("`");
        }
        if (this.token === this.tok.T_LIST) {
          let assign = null;
          const isInner = this.innerList;
          result = this.node("list");
          if (!isInner) {
            assign = this.node("assign");
          }
          if (this.next().expect("(")) {
            this.next();
          }
          if (!this.innerList)
            this.innerList = true;
          const assignList = this.read_array_pair_list(false);
          if (this.expect(")")) {
            this.next();
          }
          let hasItem = false;
          for (let i = 0; i < assignList.length; i++) {
            if (assignList[i] !== null && assignList[i].kind !== "noop") {
              hasItem = true;
              break;
            }
          }
          if (!hasItem) {
            this.raiseError(
              "Fatal Error :  Cannot use empty list on line " + this.lexer.yylloc.first_line
            );
          }
          if (!isInner) {
            this.innerList = false;
            if (this.expect("=")) {
              return assign(
                result(assignList, false),
                this.next().read_expr(),
                "="
              );
            } else {
              return result(assignList, false);
            }
          } else {
            return result(assignList, false);
          }
        }
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        if (this.token === this.tok.T_CLONE) {
          const node = this.node("clone");
          this.next();
          if (this.version >= 805 && this.token === "(") {
            this.next();
            let what2 = this.read_variable(false, false);
            what2 = this.handleDereferencable(what2);
            let properties = null;
            if (this.token === ",") {
              properties = this.next().read_expr();
            }
            this.expect(")") && this.next();
            return node(what2, properties);
          }
          let what = this.read_variable(false, false);
          what = this.handleDereferencable(what);
          return node(what, null);
        }
        switch (this.token) {
          case this.tok.T_INC:
            return this.node("pre")("+", this.next().read_variable(false, false));
          case this.tok.T_DEC:
            return this.node("pre")("-", this.next().read_variable(false, false));
          case this.tok.T_NEW:
            expr = this.read_new_expr();
            if (this.token === this.tok.T_OBJECT_OPERATOR && this.version < 804) {
              this.raiseError(
                "New without parenthesis is not allowed before PHP 8.4"
              );
            }
            return this.handleDereferencable(expr);
          case this.tok.T_ISSET:
          case this.tok.T_EMPTY:
          case this.tok.T_INCLUDE:
          case this.tok.T_INCLUDE_ONCE:
          case this.tok.T_EVAL:
          case this.tok.T_REQUIRE:
          case this.tok.T_REQUIRE_ONCE:
            return this.read_internal_functions_in_yacc();
          case this.tok.T_MATCH:
            return this.read_match_expression();
          case this.tok.T_INT_CAST:
            return this.read_expr_cast("int");
          case this.tok.T_DOUBLE_CAST:
            return this.read_expr_cast("float");
          case this.tok.T_STRING_CAST:
            return this.read_expr_cast(
              this.text().indexOf("binary") !== -1 ? "binary" : "string"
            );
          case this.tok.T_ARRAY_CAST:
            return this.read_expr_cast("array");
          case this.tok.T_OBJECT_CAST:
            return this.read_expr_cast("object");
          case this.tok.T_BOOL_CAST:
            return this.read_expr_cast("bool");
          case this.tok.T_UNSET_CAST:
            return this.read_expr_cast("unset");
          case this.tok.T_THROW: {
            if (this.version < 800) {
              this.raiseError("PHP 8+ is required to use throw as an expression");
            }
            const result2 = this.node("throw");
            const expr2 = this.next().read_expr();
            return result2(expr2);
          }
          case this.tok.T_EXIT: {
            const useDie = this.lexer.yytext.toLowerCase() === "die";
            result = this.node("exit");
            this.next();
            const expression = this.read_exit_expr();
            return result(expression, useDie);
          }
          case this.tok.T_PRINT:
            return this.node("print")(this.next().read_expr());
          case this.tok.T_YIELD: {
            let value = null;
            let key = null;
            result = this.node("yield");
            if (this.next().is("EXPR")) {
              value = this.read_expr();
              if (this.token === this.tok.T_DOUBLE_ARROW) {
                key = value;
                value = this.next().read_expr();
              }
            }
            return result(value, key);
          }
          case this.tok.T_YIELD_FROM:
            result = this.node("yieldfrom");
            expr = this.next().read_expr();
            return result(expr);
          case this.tok.T_FN:
          case this.tok.T_FUNCTION:
            return this.read_inline_function(void 0, attrs);
          case this.tok.T_STATIC: {
            const backup = [this.token, this.lexer.getState()];
            this.next();
            if (this.token === this.tok.T_FUNCTION || this.version >= 704 && this.token === this.tok.T_FN) {
              return this.read_inline_function([0, 1, 0], attrs);
            } else {
              this.lexer.tokens.push(backup);
              this.next();
            }
          }
        }
        if (this.is("VARIABLE")) {
          result = this.node();
          expr = this.read_variable(false, false);
          const isConst = expr.kind === "identifier" || expr.kind === "staticlookup" && expr.offset.kind === "identifier";
          switch (this.token) {
            case "=": {
              if (isConst)
                this.error("VARIABLE");
              if (this.next().token == "&") {
                return this.read_assignref(result, expr);
              }
              return result("assign", expr, this.read_expr(), "=");
            }
            case this.tok.T_PLUS_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "+=");
            case this.tok.T_MINUS_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "-=");
            case this.tok.T_MUL_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "*=");
            case this.tok.T_POW_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "**=");
            case this.tok.T_DIV_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "/=");
            case this.tok.T_CONCAT_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), ".=");
            case this.tok.T_MOD_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "%=");
            case this.tok.T_AND_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "&=");
            case this.tok.T_OR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "|=");
            case this.tok.T_XOR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "^=");
            case this.tok.T_SL_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "<<=");
            case this.tok.T_SR_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), ">>=");
            case this.tok.T_COALESCE_EQUAL:
              if (isConst)
                this.error("VARIABLE");
              return result("assign", expr, this.next().read_expr(), "??=");
            case this.tok.T_INC:
              if (isConst)
                this.error("VARIABLE");
              this.next();
              return result("post", "+", expr);
            case this.tok.T_DEC:
              if (isConst)
                this.error("VARIABLE");
              this.next();
              return result("post", "-", expr);
            default:
              result.destroy(expr);
          }
        } else if (this.is("SCALAR")) {
          result = this.node();
          expr = this.read_scalar();
          if (expr.kind === "array" && expr.shortForm && this.token === "=") {
            const list = this.convertToList(expr);
            if (expr.loc)
              list.loc = expr.loc;
            const right = this.next().read_expr();
            return result("assign", list, right, "=");
          } else {
            result.destroy(expr);
          }
          return this.handleDereferencable(expr);
        } else {
          this.error("EXPR");
          this.next();
        }
        return expr;
      },
      /*
       * Recursively convert nested array to nested list.
       */
      convertToList(array) {
        const convertedItems = array.items.map((entry) => {
          if (entry.value && entry.value.kind === "array" && entry.value.shortForm) {
            entry.value = this.convertToList(entry.value);
          }
          return entry;
        });
        const node = this.node("list")(convertedItems, true);
        if (array.loc)
          node.loc = array.loc;
        if (array.leadingComments)
          node.leadingComments = array.leadingComments;
        if (array.trailingComments)
          node.trailingComments = array.trailingComments;
        return node;
      },
      /*
       * Reads assignment
       * @param {*} left
       */
      read_assignref(result, left) {
        this.next();
        let right;
        if (this.token === this.tok.T_NEW) {
          if (this.version >= 700) {
            this.error();
          }
          right = this.read_new_expr();
        } else if (this.token === "(") {
          right = this.next().read_expr();
          this.expect(")") && this.next();
          right = this.recursive_variable_chain_scan(right, false, false);
        } else {
          right = this.read_variable(false, false);
        }
        return result("assignref", left, right);
      },
      /*
       *
       * inline_function:
       * 		function returns_ref backup_doc_comment '(' parameter_list ')' lexical_vars return_type
       * 		backup_fn_flags '{' inner_statement_list '}' backup_fn_flags
       * 			{ $$ = zend_ast_create_decl(ZEND_AST_CLOSURE, $2 | $13, $1, $3,
       * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0),
       * 				  $5, $7, $11, $8); CG(extra_fn_flags) = $9; }
       * 	|	fn returns_ref '(' parameter_list ')' return_type backup_doc_comment T_DOUBLE_ARROW backup_fn_flags backup_lex_pos expr backup_fn_flags
       * 			{ $$ = zend_ast_create_decl(ZEND_AST_ARROW_FUNC, $2 | $12, $1, $7,
       * 				  zend_string_init("{closure}", sizeof("{closure}") - 1, 0), $4, NULL,
       * 				  zend_ast_create(ZEND_AST_RETURN, $11), $6);
       * 				  ((zend_ast_decl *) $$)->lex_pos = $10;
       * 				  CG(extra_fn_flags) = $9; }   *
       */
      read_inline_function(flags, attrs) {
        if (this.token === this.tok.T_FUNCTION) {
          const result2 = this.read_function(true, flags, attrs);
          result2.attrGroups = attrs;
          return result2;
        }
        if (this.version < 704) {
          this.raiseError("Arrow Functions are not allowed");
        }
        const node = this.node("arrowfunc");
        if (this.expect(this.tok.T_FN))
          this.next();
        const isRef = this.is_reference();
        if (this.expect("("))
          this.next();
        const params = this.read_parameter_list();
        if (this.expect(")"))
          this.next();
        let nullable = false;
        let returnType = null;
        if (this.token === ":") {
          if (this.next().token === "?") {
            nullable = true;
            this.next();
          }
          returnType = this.read_types();
        }
        if (this.expect(this.tok.T_DOUBLE_ARROW))
          this.next();
        const body = this.read_expr();
        const result = node(
          params,
          isRef,
          body,
          returnType,
          nullable,
          flags ? true : false
        );
        result.attrGroups = attrs;
        return result;
      },
      read_match_expression() {
        const node = this.node("match");
        this.expect(this.tok.T_MATCH) && this.next();
        if (this.version < 800) {
          this.raiseError("Match statements are not allowed before PHP 8");
        }
        if (this.expect("("))
          this.next();
        const cond = this.read_expr();
        if (this.expect(")"))
          this.next();
        if (this.expect("{"))
          this.next();
        const arms = this.read_match_arms();
        if (this.expect("}"))
          this.next();
        return node(cond, arms);
      },
      read_match_arms() {
        return this.read_list(() => this.read_match_arm(), ",", true);
      },
      read_match_arm() {
        if (this.token === "}") {
          return;
        }
        return this.node("matcharm")(this.read_match_arm_conds(), this.read_expr());
      },
      read_match_arm_conds() {
        let conds = [];
        if (this.token === this.tok.T_DEFAULT) {
          conds = null;
          this.next();
        } else {
          conds.push(this.read_expr());
          while (this.token === ",") {
            this.next();
            if (this.token === this.tok.T_DOUBLE_ARROW) {
              this.next();
              return conds;
            }
            conds.push(this.read_expr());
          }
        }
        if (this.expect(this.tok.T_DOUBLE_ARROW)) {
          this.next();
        }
        return conds;
      },
      read_attribute() {
        const node = this.node("attribute");
        const name = this.text();
        let args = [];
        this.next();
        if (this.token === "(") {
          args = this.read_argument_list();
        }
        return node(name, args);
      },
      read_attr_list() {
        const list = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          do {
            const node = this.node("attrgroup");
            this.next();
            const attrs = [this.read_attribute()];
            while (this.token === ",") {
              this.next();
              if (this.token !== "]")
                attrs.push(this.read_attribute());
            }
            this.expect("]");
            this.next();
            list.push(node(attrs));
          } while (this.token === this.tok.T_ATTRIBUTE);
        }
        return list;
      },
      /*
       * ```ebnf
       *    new_expr ::= T_NEW (namespace_name function_argument_list) | (T_CLASS ... class declaration)
       * ```
       * https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L850
       */
      read_new_expr() {
        const result = this.node("new");
        this.expect(this.tok.T_NEW) && this.next();
        let args = [];
        if (this.token === "(") {
          this.next();
          const newExp = this.read_expr();
          this.expect(")");
          this.next();
          if (this.token === "(") {
            args = this.read_argument_list();
          }
          return result(newExp, args);
        }
        const attrs = this.read_attr_list();
        const isReadonly = this.token === this.tok.T_READ_ONLY;
        if (isReadonly) {
          if (this.version < 803) {
            this.raiseError(
              "Anonymous readonly classes are not allowed before PHP 8.3"
            );
          }
          this.next();
        }
        if (this.token === this.tok.T_CLASS) {
          const what = this.node("class");
          if (this.next().token === "(") {
            args = this.read_argument_list();
          }
          const propExtends = this.read_extends_from();
          const propImplements = this.read_implements_list();
          let body = null;
          if (this.expect("{")) {
            body = this.next().read_class_body(true, false);
          }
          const whatNode = what(null, propExtends, propImplements, body, [
            0,
            0,
            0,
            isReadonly ? 1 : 0
          ]);
          whatNode.attrGroups = attrs;
          return result(whatNode, args);
        }
        let name = this.read_new_class_name();
        while (this.token === "[") {
          const offsetNode = this.node("offsetlookup");
          const offset = this.next().read_encaps_var_offset();
          this.expect("]") && this.next();
          name = offsetNode(name, offset);
        }
        if (this.token === "(") {
          args = this.read_argument_list();
        }
        return result(name, args);
      },
      /*
       * Reads a class name
       * ```ebnf
       * read_new_class_name ::= namespace_name | variable
       * ```
       */
      read_new_class_name() {
        if (this.token === this.tok.T_NS_SEPARATOR || this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_STRING || this.token === this.tok.T_NAMESPACE) {
          let result = this.read_namespace_name(true);
          if (this.token === this.tok.T_DOUBLE_COLON) {
            result = this.read_static_getter(result);
            return this.recursive_variable_chain_scan(result, true, false);
          }
          return result;
        } else if (this.is("VARIABLE")) {
          return this.read_variable(true, false);
        } else {
          this.expect([this.tok.T_STRING, "VARIABLE"]);
        }
      },
      handleDereferencable(expr) {
        while (this.token !== this.EOF) {
          if (this.token === this.tok.T_OBJECT_OPERATOR || this.token === this.tok.T_DOUBLE_COLON || this.token === this.tok.T_NULLSAFE_OBJECT_OPERATOR) {
            expr = this.recursive_variable_chain_scan(expr, false, false, true);
          } else if (this.token === this.tok.T_CURLY_OPEN || this.token === "[") {
            expr = this.read_dereferencable(expr);
          } else if (this.token === "(") {
            expr = this.node("call")(expr, this.read_argument_list());
          } else {
            return expr;
          }
        }
        return expr;
      }
    };
  }
});

// node_modules/php-parser/src/parser/enum.js
var require_enum = __commonJS({
  "node_modules/php-parser/src/parser/enum.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * reading an enum
       * ```ebnf
       * enum ::= enum_scope? T_ENUM T_STRING (':' NAMESPACE_NAME)? (T_IMPLEMENTS (NAMESPACE_NAME ',')* NAMESPACE_NAME)? '{' ENUM_BODY '}'
       * ```
       */
      read_enum_declaration_statement(attrs) {
        const result = this.node("enum");
        if (!this.expect(this.tok.T_ENUM)) {
          return null;
        }
        this.next().expect(this.tok.T_STRING);
        let propName = this.node("identifier");
        const name = this.text();
        this.next();
        propName = propName(name);
        const valueType = this.read_enum_value_type();
        const propImplements = this.read_implements_list();
        this.expect("{");
        const body = this.next().read_class_body(false, true);
        const node = result(propName, valueType, propImplements, body);
        if (attrs)
          node.attrGroups = attrs;
        return node;
      },
      read_enum_value_type() {
        if (this.token === ":") {
          return this.next().read_namespace_name();
        }
        return null;
      },
      read_enum_case(attrs) {
        this.expect(this.tok.T_CASE);
        const result = this.node("enumcase");
        let caseName = this.node("identifier");
        const name = this.next().text();
        this.next();
        caseName = caseName(name);
        const value = this.token === "=" ? this.next().read_expr() : null;
        this.expect(";");
        const node = result(caseName, value);
        if (attrs && attrs.length > 0)
          node.attrGroups = attrs;
        return node;
      }
    };
  }
});

// node_modules/php-parser/src/parser/function.js
var require_function = __commonJS({
  "node_modules/php-parser/src/parser/function.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * checks if current token is a reference keyword
       */
      is_reference() {
        if (this.token === "&") {
          this.next();
          return true;
        }
        return false;
      },
      /*
       * checks if current token is a variadic keyword
       */
      is_variadic() {
        if (this.token === this.tok.T_ELLIPSIS) {
          this.next();
          return true;
        }
        return false;
      },
      /*
       * reading a function
       * ```ebnf
       * function ::= function_declaration code_block
       * ```
       */
      read_function(closure, flag, attrs, locStart) {
        const result = this.read_function_declaration(
          closure ? 1 : flag ? 2 : 0,
          flag && flag[1] === 1,
          attrs || [],
          locStart
        );
        if (flag && flag[2] == 1) {
          result.parseFlags(flag);
          if (this.expect(";")) {
            this.next();
          }
        } else {
          if (this.expect("{")) {
            result.body = this.read_code_block(false);
            if (result.loc && result.body.loc) {
              result.loc.end = result.body.loc.end;
            }
          }
          if (!closure && flag) {
            result.parseFlags(flag);
          }
        }
        return result;
      },
      /*
       * reads a function declaration (without his body)
       * ```ebnf
       * function_declaration ::= T_FUNCTION '&'?  T_STRING '(' parameter_list ')'
       * ```
       */
      read_function_declaration(type, isStatic, attrs, locStart) {
        let nodeName = "function";
        if (type === 1) {
          nodeName = "closure";
        } else if (type === 2) {
          nodeName = "method";
        }
        const result = this.node(nodeName);
        if (this.expect(this.tok.T_FUNCTION)) {
          this.next();
        }
        const isRef = this.is_reference();
        let name = false, use = [], returnType = null, nullable = false;
        if (type !== 1) {
          const nameNode = this.node("identifier");
          if (type === 2) {
            if (this.version >= 700) {
              if (this.token === this.tok.T_STRING || this.is("IDENTIFIER")) {
                name = this.text();
                this.next();
              } else if (this.version < 704) {
                this.error("IDENTIFIER");
              }
            } else if (this.token === this.tok.T_STRING) {
              name = this.text();
              this.next();
            } else {
              this.error("IDENTIFIER");
            }
          } else {
            if (this.version >= 700) {
              if (this.token === this.tok.T_STRING) {
                name = this.text();
                this.next();
              } else if (this.version >= 704) {
                if (!this.expect("(")) {
                  this.next();
                }
              } else {
                this.error(this.tok.T_STRING);
                this.next();
              }
            } else {
              if (this.expect(this.tok.T_STRING)) {
                name = this.text();
              }
              this.next();
            }
          }
          name = nameNode(name);
        }
        if (this.expect("("))
          this.next();
        const params = this.read_parameter_list(name.name === "__construct");
        if (this.expect(")"))
          this.next();
        if (type === 1) {
          use = this.read_lexical_vars();
        }
        if (this.token === ":") {
          if (this.next().token === "?") {
            nullable = true;
            this.next();
          }
          returnType = this.read_types();
        }
        const apply_attrgroup_location = (node) => {
          node.attrGroups = attrs || [];
          if (locStart && node.loc) {
            node.loc.start = locStart;
            if (node.loc.source) {
              node.loc.source = this.lexer._input.substr(
                node.loc.start.offset,
                node.loc.end.offset - node.loc.start.offset
              );
            }
          }
          return node;
        };
        if (type === 1) {
          return apply_attrgroup_location(
            result(params, isRef, use, returnType, nullable, isStatic)
          );
        }
        return apply_attrgroup_location(
          result(name, params, isRef, returnType, nullable)
        );
      },
      read_lexical_vars() {
        let result = [];
        if (this.token === this.tok.T_USE) {
          this.next();
          this.expect("(") && this.next();
          result = this.read_lexical_var_list();
          this.expect(")") && this.next();
        }
        return result;
      },
      read_list_with_dangling_comma(item) {
        const result = [];
        while (this.token != this.EOF) {
          result.push(item());
          if (this.token == ",") {
            this.next();
            if (this.version >= 800 && this.token === ")") {
              return result;
            }
          } else if (this.token == ")") {
            break;
          } else {
            this.error([",", ")"]);
            break;
          }
        }
        return result;
      },
      read_lexical_var_list() {
        return this.read_list_with_dangling_comma(this.read_lexical_var.bind(this));
      },
      /*
       * ```ebnf
       * lexical_var ::= '&'? T_VARIABLE
       * ```
       */
      read_lexical_var() {
        if (this.token === "&") {
          return this.read_byref(this.read_lexical_var.bind(this));
        }
        const result = this.node("variable");
        this.expect(this.tok.T_VARIABLE);
        const name = this.text().substring(1);
        this.next();
        return result(name, false);
      },
      /*
       * reads a list of parameters
       * ```ebnf
       *  parameter_list ::= (parameter ',')* parameter?
       * ```
       */
      read_parameter_list(is_class_constructor) {
        if (this.token !== ")") {
          let wasVariadic = false;
          return this.read_list_with_dangling_comma(
            function() {
              const parameter = this.read_parameter(is_class_constructor);
              if (parameter) {
                if (wasVariadic) {
                  this.raiseError(
                    "Unexpected parameter after a variadic parameter"
                  );
                }
                if (parameter.variadic) {
                  wasVariadic = true;
                }
              }
              return parameter;
            }.bind(this),
            ","
          );
        }
        return [];
      },
      /*
       * ```ebnf
       *  parameter ::= type? '&'? T_ELLIPSIS? T_VARIABLE ('=' expr)?
       * ```
       * @see https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L640
       */
      read_parameter(is_class_constructor) {
        const node = this.node("parameter");
        let parameterName = null;
        let value = null;
        let nullable = false;
        let readonly = false;
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE)
          attrs = this.read_attr_list();
        if (this.version >= 801 && this.token === this.tok.T_READ_ONLY) {
          if (is_class_constructor) {
            this.next();
            readonly = true;
          } else {
            this.raiseError(
              "readonly properties can be used only on class constructor"
            );
          }
        }
        const [flags, flagsSet] = this.read_promoted();
        if (!readonly && this.version >= 801 && this.token === this.tok.T_READ_ONLY) {
          if (is_class_constructor) {
            this.next();
            readonly = true;
          } else {
            this.raiseError(
              "readonly properties can be used only on class constructor"
            );
          }
        }
        if (this.token === "?") {
          this.next();
          nullable = true;
        }
        const types = this.read_types();
        if (nullable && !types) {
          this.raiseError(
            "Expecting a type definition combined with nullable operator"
          );
        }
        const isRef = this.is_reference();
        const isVariadic = this.is_variadic();
        if (this.expect(this.tok.T_VARIABLE)) {
          parameterName = this.node("identifier");
          const name = this.text().substring(1);
          this.next();
          parameterName = parameterName(name);
        }
        if (this.token == "=") {
          value = this.next().read_expr();
        }
        let hooks = [];
        if (this.version >= 804 && flags && this.token === "{") {
          hooks = this.read_property_hooks();
        }
        const result = node(
          parameterName,
          types,
          value,
          isRef,
          isVariadic,
          readonly,
          nullable,
          flags,
          hooks,
          flagsSet
        );
        if (attrs)
          result.attrGroups = attrs;
        return result;
      },
      read_types() {
        const MODE_UNSET = "unset";
        const MODE_UNION = "union";
        const MODE_INTERSECTION = "intersection";
        const types = [];
        let mode = MODE_UNSET;
        const node = this.node();
        const type = this.read_type();
        if (!type) {
          node.destroy();
          return null;
        }
        types.push(type);
        while (this.token === "|" || this.version >= 801 && this.token === "&") {
          const nextToken = this.peek();
          if (nextToken === this.tok.T_ELLIPSIS || nextToken === this.tok.T_VARIABLE) {
            break;
          }
          if (mode === MODE_UNSET) {
            mode = this.token === "|" ? MODE_UNION : MODE_INTERSECTION;
          } else {
            if (mode === MODE_UNION && this.token !== "|" || mode === MODE_INTERSECTION && this.token !== "&") {
              this.raiseError(
                'Unexpect token "' + this.token + '", "|" and "&" can not be mixed'
              );
            }
          }
          this.next();
          types.push(this.read_type());
        }
        if (types.length === 1) {
          node.destroy();
          return types[0];
        } else {
          return mode === MODE_INTERSECTION ? node("intersectiontype", types) : node("uniontype", types);
        }
      },
      read_promoted() {
        const MODIFIER_PUBLIC = 1;
        const MODIFIER_PROTECTED = 2;
        const MODIFIER_PRIVATE = 4;
        let firstModifier;
        if (this.token === this.tok.T_PUBLIC) {
          this.next();
          firstModifier = MODIFIER_PUBLIC;
        } else if (this.token === this.tok.T_PROTECTED) {
          this.next();
          firstModifier = MODIFIER_PROTECTED;
        } else if (this.token === this.tok.T_PRIVATE) {
          this.next();
          firstModifier = MODIFIER_PRIVATE;
        } else {
          return [0, 0];
        }
        if (this.version >= 804) {
          if (this.token === "(") {
            this.next();
            if (this.token !== this.tok.T_STRING || this.text() !== "set") {
              this.error("set");
            } else {
              this.next();
            }
            if (this.expect(")")) {
              this.next();
            }
            return [0, firstModifier];
          }
          let setModifier = 0;
          if (this.token === this.tok.T_PUBLIC) {
            this.next();
            setModifier = MODIFIER_PUBLIC;
          } else if (this.token === this.tok.T_PROTECTED) {
            this.next();
            setModifier = MODIFIER_PROTECTED;
          } else if (this.token === this.tok.T_PRIVATE) {
            this.next();
            setModifier = MODIFIER_PRIVATE;
          }
          if (setModifier > 0) {
            if (this.expect("(")) {
              this.next();
            }
            if (this.token !== this.tok.T_STRING || this.text() !== "set") {
              this.error("set");
            } else {
              this.next();
            }
            if (this.expect(")")) {
              this.next();
            }
            return [firstModifier, setModifier];
          }
        }
        return [firstModifier, 0];
      },
      /*
       * Reads a list of arguments
       * ```ebnf
       *  function_argument_list ::= '(' (argument_list (',' argument_list)*)? ')'
       * ```
       */
      read_argument_list() {
        let result = [];
        this.expect("(") && this.next();
        if (this.version >= 801 && this.token === this.tok.T_ELLIPSIS && this.peek() === ")") {
          const variadicNode = this.node("variadicplaceholder");
          this.next();
          result.push(variadicNode());
        } else if (this.token !== ")") {
          result = this.read_non_empty_argument_list();
        }
        this.expect(")") && this.next();
        return result;
      },
      /*
       * Reads non empty argument list
       */
      read_non_empty_argument_list() {
        let wasVariadic = false;
        return this.read_function_list(
          function() {
            const argument = this.read_argument();
            if (argument) {
              const isVariadic = argument.kind === "variadic";
              if (wasVariadic && !isVariadic) {
                this.raiseError(
                  "Unexpected non-variadic argument after a variadic argument"
                );
              }
              if (isVariadic) {
                wasVariadic = true;
              }
            }
            return argument;
          }.bind(this),
          ","
        );
      },
      /*
       * ```ebnf
       *    argument_list ::= T_STRING ':' expr | T_ELLIPSIS? expr
       * ```
       */
      read_argument() {
        if (this.token === this.tok.T_ELLIPSIS) {
          return this.node("variadic")(this.next().read_expr());
        }
        if (this.token === this.tok.T_STRING || Object.values(this.lexer.keywords).includes(this.token)) {
          const nextToken = this.peek();
          if (nextToken === ":") {
            if (this.version < 800) {
              this.raiseError("PHP 8+ is required to use named arguments");
            }
            return this.node("namedargument")(
              this.text(),
              this.next().next().read_expr()
            );
          }
        }
        return this.read_expr();
      },
      /*
       * read type hinting
       * ```ebnf
       *  type ::= T_ARRAY | T_CALLABLE | namespace_name
       * ```
       */
      read_type() {
        const result = this.node();
        if (this.token === this.tok.T_ARRAY || this.token === this.tok.T_CALLABLE) {
          const type = this.text();
          this.next();
          return result("typereference", type.toLowerCase(), type);
        } else if (this.token === this.tok.T_NAME_RELATIVE || this.token === this.tok.T_NAME_QUALIFIED || this.token === this.tok.T_NAME_FULLY_QUALIFIED || this.token === this.tok.T_STRING || this.token === this.tok.T_STATIC) {
          const type = this.text();
          const backup = [this.token, this.lexer.getState()];
          this.next();
          if (this.token !== this.tok.T_NS_SEPARATOR && this.ast.typereference.types.indexOf(type.toLowerCase()) > -1) {
            return result("typereference", type.toLowerCase(), type);
          } else {
            this.lexer.tokens.push(backup);
            this.next();
            result.destroy();
            return this.read_namespace_name();
          }
        } else if (this.version >= 802 && this.token === "(") {
          this.next();
          const innerTypes = [];
          innerTypes.push(this.read_type());
          while (this.token === "&") {
            const nextToken = this.peek();
            if (nextToken === this.tok.T_ELLIPSIS || nextToken === this.tok.T_VARIABLE) {
              break;
            }
            this.next();
            innerTypes.push(this.read_type());
          }
          this.expect(")") && this.next();
          return result("intersectiontype", innerTypes);
        }
        result.destroy();
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/if.js
var require_if = __commonJS({
  "node_modules/php-parser/src/parser/if.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads an IF statement
       *
       * ```ebnf
       *  if ::= T_IF '(' expr ')' ':' ...
       * ```
       */
      read_if() {
        const result = this.node("if");
        const test = this.next().read_if_expr();
        let body;
        let alternate = null;
        let shortForm = false;
        if (this.token === ":") {
          shortForm = true;
          body = this.node("block");
          this.next();
          const items = [];
          while (this.token !== this.EOF && this.token !== this.tok.T_ENDIF) {
            if (this.token === this.tok.T_ELSEIF) {
              alternate = this.read_elseif_short();
              break;
            } else if (this.token === this.tok.T_ELSE) {
              alternate = this.read_else_short();
              break;
            }
            items.push(this.read_inner_statement());
          }
          if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
            items.push(this.node("noop")());
          }
          body = body(null, items);
          this.expect(this.tok.T_ENDIF) && this.next();
          this.expectEndOfStatement();
        } else {
          body = this.read_statement();
          if (this.token === this.tok.T_ELSEIF) {
            alternate = this.read_if();
          } else if (this.token === this.tok.T_ELSE) {
            alternate = this.next().read_statement();
          }
        }
        return result(test, body, alternate, shortForm);
      },
      /*
       * reads an if expression : '(' expr ')'
       */
      read_if_expr() {
        this.expect("(") && this.next();
        const result = this.read_expr();
        this.expect(")") && this.next();
        return result;
      },
      /*
       * reads an elseif (expr): statements
       */
      read_elseif_short() {
        let alternate = null;
        const result = this.node("if");
        const test = this.next().read_if_expr();
        const body = this.node("block");
        if (this.expect(":"))
          this.next();
        const items = [];
        while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
          if (this.token === this.tok.T_ELSEIF) {
            alternate = this.read_elseif_short();
            break;
          } else if (this.token === this.tok.T_ELSE) {
            alternate = this.read_else_short();
            break;
          }
          items.push(this.read_inner_statement());
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        return result(test, body(null, items), alternate, true);
      },
      /*
       *
       */
      read_else_short() {
        this.next();
        const body = this.node("block");
        if (this.expect(":"))
          this.next();
        const items = [];
        while (this.token != this.EOF && this.token !== this.tok.T_ENDIF) {
          items.push(this.read_inner_statement());
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        return body(null, items);
      }
    };
  }
});

// node_modules/php-parser/src/parser/loops.js
var require_loops = __commonJS({
  "node_modules/php-parser/src/parser/loops.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a while statement
       * ```ebnf
       * while ::= T_WHILE (statement | ':' inner_statement_list T_ENDWHILE ';')
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L587
       * @return {While}
       */
      read_while() {
        const result = this.node("while");
        this.expect(this.tok.T_WHILE) && this.next();
        let body;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        const test = this.read_expr();
        if (this.expect(")"))
          this.next();
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDWHILE);
        } else {
          body = this.read_statement();
        }
        return result(test, body, shortForm);
      },
      /*
       * Reads a do / while loop
       * ```ebnf
       * do ::= T_DO statement T_WHILE '(' expr ')' ';'
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L423
       * @return {Do}
       */
      read_do() {
        const result = this.node("do");
        this.expect(this.tok.T_DO) && this.next();
        let test = null;
        const body = this.read_statement();
        if (this.expect(this.tok.T_WHILE)) {
          if (this.next().expect("("))
            this.next();
          test = this.read_expr();
          if (this.expect(")"))
            this.next();
          if (this.expect(";"))
            this.next();
        }
        return result(test, body);
      },
      /*
       * Read a for incremental loop
       * ```ebnf
       * for ::= T_FOR '(' for_exprs ';' for_exprs ';' for_exprs ')' for_statement
       * for_statement ::= statement | ':' inner_statement_list T_ENDFOR ';'
       * for_exprs ::= expr? (',' expr)*
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L425
       * @return {For}
       */
      read_for() {
        const result = this.node("for");
        this.expect(this.tok.T_FOR) && this.next();
        let init = [];
        let test = [];
        let increment = [];
        let body;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        if (this.token !== ";") {
          init = this.read_list(this.read_expr, ",");
          if (this.expect(";"))
            this.next();
        } else {
          this.next();
        }
        if (this.token !== ";") {
          test = this.read_list(this.read_expr, ",");
          if (this.expect(";"))
            this.next();
        } else {
          this.next();
        }
        if (this.token !== ")") {
          increment = this.read_list(this.read_expr, ",");
          if (this.expect(")"))
            this.next();
        } else {
          this.next();
        }
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDFOR);
        } else {
          body = this.read_statement();
        }
        return result(init, test, increment, body, shortForm);
      },
      /*
       * Reads a foreach loop
       * ```ebnf
       * foreach ::= '(' expr T_AS foreach_variable (T_DOUBLE_ARROW foreach_variable)? ')' statement
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L438
       * @return {Foreach}
       */
      read_foreach() {
        const result = this.node("foreach");
        this.expect(this.tok.T_FOREACH) && this.next();
        let key = null;
        let value = null;
        let body;
        let shortForm = false;
        if (this.expect("("))
          this.next();
        const source = this.read_expr();
        if (this.expect(this.tok.T_AS)) {
          this.next();
          value = this.read_foreach_variable();
          if (this.token === this.tok.T_DOUBLE_ARROW) {
            key = value;
            value = this.next().read_foreach_variable();
          }
        }
        if (key && key.kind === "list") {
          this.raiseError("Fatal Error : Cannot use list as key element");
        }
        if (this.expect(")"))
          this.next();
        if (this.token === ":") {
          shortForm = true;
          body = this.read_short_form(this.tok.T_ENDFOREACH);
        } else {
          body = this.read_statement();
        }
        return result(source, key, value, body, shortForm);
      },
      /*
       * Reads a foreach variable statement
       * ```ebnf
       * foreach_variable =
       *    variable |
       *    '&' variable |
       *    T_LIST '(' assignment_list ')' |
       *    '[' assignment_list ']'
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L544
       * @return {Expression}
       */
      read_foreach_variable() {
        if (this.token === this.tok.T_LIST || this.token === "[") {
          const isShort = this.token === "[";
          const result = this.node("list");
          this.next();
          if (!isShort && this.expect("("))
            this.next();
          const assignList = this.read_array_pair_list(isShort);
          if (this.expect(isShort ? "]" : ")"))
            this.next();
          return result(assignList, isShort);
        } else {
          return this.read_variable(false, false);
        }
      }
    };
  }
});

// node_modules/php-parser/src/parser/main.js
var require_main = __commonJS({
  "node_modules/php-parser/src/parser/main.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * ```ebnf
       * start ::= (namespace | top_statement)*
       * ```
       */
      read_start() {
        if (this.token == this.tok.T_NAMESPACE) {
          return this.read_namespace();
        } else {
          return this.read_top_statement();
        }
      }
    };
  }
});

// node_modules/php-parser/src/parser/namespace.js
var require_namespace = __commonJS({
  "node_modules/php-parser/src/parser/namespace.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a namespace declaration block
       * ```ebnf
       * namespace ::= T_NAMESPACE namespace_name? '{'
       *    top_statements
       * '}'
       * | T_NAMESPACE namespace_name ';' top_statements
       * ```
       * @see http://php.net/manual/en/language.namespaces.php
       * @return {Namespace}
       */
      read_namespace() {
        const result = this.node("namespace");
        let body;
        this.expect(this.tok.T_NAMESPACE) && this.next();
        let name;
        if (this.token === "{") {
          name = {
            name: [""]
          };
        } else {
          name = this.read_namespace_name();
        }
        this.currentNamespace = name;
        if (this.token === ";") {
          this.currentNamespace = name;
          body = this.next().read_top_statements(true);
          return result(name.name, body, false);
        } else if (this.token === "{") {
          this.currentNamespace = name;
          body = this.next().read_top_statements();
          this.expect("}") && this.next();
          if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
            body.push(this.node("noop")());
          }
          return result(name.name, body, true);
        } else {
          this.error(["{", ";"]);
          this.currentNamespace = name;
          body = this.read_top_statements();
          this.expect(this.EOF);
          return result(name, body, false);
        }
      },
      /*
       * Reads a namespace name
       * ```ebnf
       *  namespace_name ::= T_NS_SEPARATOR? (T_STRING T_NS_SEPARATOR)* T_STRING
       * ```
       * @see http://php.net/manual/en/language.namespaces.rules.php
       * @return {Reference}
       */
      read_namespace_name(resolveReference) {
        const result = this.node();
        let resolution;
        let name = this.text();
        switch (this.token) {
          case this.tok.T_NAME_RELATIVE:
            resolution = this.ast.name.RELATIVE_NAME;
            name = name.replace(/^namespace\\/, "");
            break;
          case this.tok.T_NAME_QUALIFIED:
            resolution = this.ast.name.QUALIFIED_NAME;
            break;
          case this.tok.T_NAME_FULLY_QUALIFIED:
            resolution = this.ast.name.FULL_QUALIFIED_NAME;
            break;
          default:
            resolution = this.ast.name.UNQUALIFIED_NAME;
            if (!this.expect(this.tok.T_STRING)) {
              return result("name", "", this.ast.name.FULL_QUALIFIED_NAME);
            }
        }
        this.next();
        if (resolveReference || this.token !== "(") {
          if (name.toLowerCase() === "parent") {
            return result("parentreference", name);
          } else if (name.toLowerCase() === "self") {
            return result("selfreference", name);
          }
        }
        return result("name", name, resolution);
      },
      /*
       * Reads a use statement
       * ```ebnf
       * use_statement ::= T_USE
       *   use_type? use_declarations |
       *   use_type use_statement '{' use_declarations '}' |
       *   use_statement '{' use_declarations(=>typed) '}'
       * ';'
       * ```
       * @see http://php.net/manual/en/language.namespaces.importing.php
       * @return {UseGroup}
       */
      read_use_statement() {
        let result = this.node("usegroup");
        let items = [];
        let name = null;
        this.expect(this.tok.T_USE) && this.next();
        const type = this.read_use_type();
        items.push(this.read_use_declaration(false));
        if (this.token === ",") {
          items = items.concat(this.next().read_use_declarations(false));
        } else if (this.token === "{") {
          name = items[0].name;
          items = this.next().read_use_declarations(type === null);
          this.expect("}") && this.next();
        }
        result = result(name, type, items);
        this.expect(";") && this.next();
        return result;
      },
      /*
       *
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1045
       */
      read_class_name_reference() {
        return this.read_variable(true, false);
      },
      /*
       * Reads a use declaration
       * ```ebnf
       * use_declaration ::= use_type? namespace_name use_alias
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
       * @return {UseItem}
       */
      read_use_declaration(typed) {
        const result = this.node("useitem");
        let type = null;
        if (typed)
          type = this.read_use_type();
        const name = this.read_namespace_name();
        const alias = this.read_use_alias();
        return result(name.name, alias, type);
      },
      /*
       * Reads a list of use declarations
       * ```ebnf
       * use_declarations ::= use_declaration (',' use_declaration)*
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L380
       * @return {UseItem[]}
       */
      read_use_declarations(typed) {
        const result = [this.read_use_declaration(typed)];
        while (this.token === ",") {
          this.next();
          if (typed) {
            if (this.token !== this.tok.T_NAME_RELATIVE && this.token !== this.tok.T_NAME_QUALIFIED && this.token !== this.tok.T_NAME_FULLY_QUALIFIED && this.token !== this.tok.T_FUNCTION && this.token !== this.tok.T_CONST && this.token !== this.tok.T_STRING) {
              break;
            }
          } else if (this.token !== this.tok.T_NAME_RELATIVE && this.token !== this.tok.T_NAME_QUALIFIED && this.token !== this.tok.T_NAME_FULLY_QUALIFIED && this.token !== this.tok.T_STRING && this.token !== this.tok.T_NS_SEPARATOR) {
            break;
          }
          result.push(this.read_use_declaration(typed));
        }
        return result;
      },
      /*
       * Reads a use statement
       * ```ebnf
       * use_alias ::= (T_AS T_STRING)?
       * ```
       * @return {String|null}
       */
      read_use_alias() {
        let result = null;
        if (this.token === this.tok.T_AS) {
          if (this.next().expect(this.tok.T_STRING)) {
            const aliasName = this.node("identifier");
            const name = this.text();
            this.next();
            result = aliasName(name);
          }
        }
        return result;
      },
      /*
       * Reads the namespace type declaration
       * ```ebnf
       * use_type ::= (T_FUNCTION | T_CONST)?
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L335
       * @return {String|null} Possible values : function, const
       */
      read_use_type() {
        if (this.token === this.tok.T_FUNCTION) {
          this.next();
          return this.ast.useitem.TYPE_FUNCTION;
        } else if (this.token === this.tok.T_CONST) {
          this.next();
          return this.ast.useitem.TYPE_CONST;
        }
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/scalar.js
var require_scalar = __commonJS({
  "node_modules/php-parser/src/parser/scalar.js"(exports2, module2) {
    "use strict";
    var specialChar = {
      "\\": "\\",
      $: "$",
      n: "\n",
      r: "\r",
      t: "	",
      f: String.fromCharCode(12),
      v: String.fromCharCode(11),
      e: String.fromCharCode(27)
    };
    module2.exports = {
      /*
       * Unescape special chars
       */
      resolve_special_chars(text, doubleQuote) {
        if (!doubleQuote) {
          return text.replace(/\\\\/g, "\\").replace(/\\'/g, "'");
        }
        return text.replace(/\\"/g, '"').replace(
          /\\([\\$nrtfve]|[xX][0-9a-fA-F]{1,2}|[0-7]{1,3}|u{([0-9a-fA-F]+)})/g,
          ($match, p1, p2) => {
            if (specialChar[p1]) {
              return specialChar[p1];
            } else if ("x" === p1[0] || "X" === p1[0]) {
              return String.fromCodePoint(parseInt(p1.substr(1), 16));
            } else if ("u" === p1[0]) {
              return String.fromCodePoint(parseInt(p2, 16));
            } else {
              return String.fromCodePoint(parseInt(p1, 8));
            }
          }
        );
      },
      /*
       * Remove all leading spaces each line for heredoc text if there is a indentation
       * @param {string} text
       * @param {number} indentation
       * @param {boolean} indentation_uses_spaces
       * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
       */
      remove_heredoc_leading_whitespace_chars(text, indentation, indentation_uses_spaces, first_encaps_node) {
        if (indentation === 0) {
          return text;
        }
        this.check_heredoc_indentation_level(
          text,
          indentation,
          indentation_uses_spaces,
          first_encaps_node
        );
        const matchedChar = indentation_uses_spaces ? " " : "	";
        const removementRegExp = new RegExp(
          `\\n${matchedChar}{${indentation}}`,
          "g"
        );
        const removementFirstEncapsNodeRegExp = new RegExp(
          `^${matchedChar}{${indentation}}`
        );
        if (first_encaps_node) {
          text = text.replace(removementFirstEncapsNodeRegExp, "");
        }
        return text.replace(removementRegExp, "\n");
      },
      /*
       * Check indentation level of heredoc in text, if mismatch, raiseError
       * @param {string} text
       * @param {number} indentation
       * @param {boolean} indentation_uses_spaces
       * @param {boolean} first_encaps_node if it is behind a variable, the first N spaces should not be removed
       */
      check_heredoc_indentation_level(text, indentation, indentation_uses_spaces, first_encaps_node) {
        const textSize = text.length;
        let offset = 0;
        let leadingWhitespaceCharCount = 0;
        let inCountingState = true;
        const chToCheck = indentation_uses_spaces ? " " : "	";
        let inCheckState = false;
        if (!first_encaps_node) {
          offset = text.indexOf("\n");
          if (offset === -1) {
            return;
          }
          offset++;
        }
        while (offset < textSize) {
          if (inCountingState) {
            if (text[offset] === chToCheck) {
              leadingWhitespaceCharCount++;
            } else {
              inCheckState = true;
            }
          }
          if (text[offset] !== "\n" && inCheckState && leadingWhitespaceCharCount < indentation) {
            this.raiseError(
              `Invalid body indentation level (expecting an indentation at least ${indentation})`
            );
          } else {
            inCheckState = false;
          }
          if (text[offset] === "\n") {
            inCountingState = true;
            leadingWhitespaceCharCount = 0;
          }
          offset++;
        }
      },
      /*
       * Reads dereferencable scalar
       */
      read_dereferencable_scalar() {
        let result = null;
        switch (this.token) {
          case this.tok.T_CONSTANT_ENCAPSED_STRING:
            {
              let value = this.node("string");
              const text = this.text();
              let offset = 0;
              if (text[0] === "b" || text[0] === "B") {
                offset = 1;
              }
              const isDoubleQuote = text[offset] === '"';
              this.next();
              const textValue = this.resolve_special_chars(
                text.substring(offset + 1, text.length - 1),
                isDoubleQuote
              );
              value = value(
                isDoubleQuote,
                textValue,
                offset === 1,
                // unicode flag
                text
              );
              if (this.token === this.tok.T_DOUBLE_COLON) {
                result = this.read_static_getter(value);
              } else {
                result = value;
              }
            }
            break;
          case this.tok.T_ARRAY:
            result = this.read_array();
            break;
          case "[":
            result = this.read_array();
            break;
        }
        return result;
      },
      /*
       * ```ebnf
       *  scalar ::= T_MAGIC_CONST
       *       | T_LNUMBER | T_DNUMBER
       *       | T_START_HEREDOC T_ENCAPSED_AND_WHITESPACE? T_END_HEREDOC
       *       | '"' encaps_list '"'
       *       | T_START_HEREDOC encaps_list T_END_HEREDOC
       *       | namespace_name (T_DOUBLE_COLON T_STRING)?
       * ```
       */
      read_scalar() {
        if (this.is("T_MAGIC_CONST")) {
          return this.get_magic_constant();
        } else {
          let value, node;
          switch (this.token) {
            case this.tok.T_LNUMBER:
            case this.tok.T_DNUMBER: {
              const result = this.node("number");
              value = this.text();
              this.next();
              return result(value, null);
            }
            case this.tok.T_START_HEREDOC:
              if (this.lexer.curCondition === "ST_NOWDOC") {
                const start = this.lexer.yylloc.first_offset;
                node = this.node("nowdoc");
                value = this.next().text();
                if (this.lexer.heredoc_label.indentation > 0) {
                  value = value.substring(
                    0,
                    value.length - this.lexer.heredoc_label.indentation
                  );
                }
                const lastCh = value[value.length - 1];
                if (lastCh === "\n") {
                  if (value[value.length - 2] === "\r") {
                    value = value.substring(0, value.length - 2);
                  } else {
                    value = value.substring(0, value.length - 1);
                  }
                } else if (lastCh === "\r") {
                  value = value.substring(0, value.length - 1);
                }
                this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE) && this.next();
                this.expect(this.tok.T_END_HEREDOC) && this.next();
                const raw = this.lexer._input.substring(
                  start,
                  this.lexer.yylloc.first_offset
                );
                node = node(
                  this.remove_heredoc_leading_whitespace_chars(
                    value,
                    this.lexer.heredoc_label.indentation,
                    this.lexer.heredoc_label.indentation_uses_spaces,
                    this.lexer.heredoc_label.first_encaps_node
                  ),
                  raw,
                  this.lexer.heredoc_label.label
                );
                this.lexer.heredoc_label.finished = true;
                return node;
              } else {
                return this.read_encapsed_string(this.tok.T_END_HEREDOC);
              }
            case '"':
              return this.read_encapsed_string('"');
            case 'b"':
            case 'B"': {
              return this.read_encapsed_string('"', true);
            }
            case this.tok.T_CONSTANT_ENCAPSED_STRING:
            case this.tok.T_ARRAY:
            case "[":
              return this.read_dereferencable_scalar();
            default: {
              const err = this.error("SCALAR");
              this.next();
              return err;
            }
          }
        }
      },
      /*
       * Handles the dereferencing
       */
      read_dereferencable(expr) {
        let result, offset;
        const node = this.node("offsetlookup");
        if (this.token === "[") {
          offset = this.next().read_expr();
          if (this.expect("]"))
            this.next();
          result = node(expr, offset);
        } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
          offset = this.read_encapsed_string_item(false);
          result = node(expr, offset);
        }
        return result;
      },
      /*
       * Reads and extracts an encapsed item
       * ```ebnf
       * encapsed_string_item ::= T_ENCAPSED_AND_WHITESPACE
       *  | T_DOLLAR_OPEN_CURLY_BRACES expr '}'
       *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '}'
       *  | T_DOLLAR_OPEN_CURLY_BRACES T_STRING_VARNAME '[' expr ']' '}'
       *  | T_CURLY_OPEN variable '}'
       *  | variable
       *  | variable '[' expr ']'
       *  | variable T_OBJECT_OPERATOR T_STRING
       * ```
       * @return {String|Variable|Expr|Lookup}
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L1219
       */
      read_encapsed_string_item(isDoubleQuote) {
        const encapsedPart = this.node("encapsedpart");
        let syntax = null;
        let curly = false;
        let result = this.node(), offset, node, name;
        if (this.token === this.tok.T_ENCAPSED_AND_WHITESPACE) {
          const text = this.text();
          this.next();
          result = result(
            "string",
            false,
            this.version >= 703 && !this.lexer.heredoc_label.finished ? this.resolve_special_chars(
              this.remove_heredoc_leading_whitespace_chars(
                text,
                this.lexer.heredoc_label.indentation,
                this.lexer.heredoc_label.indentation_uses_spaces,
                this.lexer.heredoc_label.first_encaps_node
              ),
              isDoubleQuote
            ) : this.resolve_special_chars(text, isDoubleQuote),
            false,
            text
          );
        } else if (this.token === this.tok.T_DOLLAR_OPEN_CURLY_BRACES) {
          syntax = "simple";
          curly = true;
          if (this.next().token === this.tok.T_STRING_VARNAME) {
            name = this.node("variable");
            const varName = this.text();
            this.next();
            result.destroy();
            if (this.token === "[") {
              name = name(varName, false);
              node = this.node("offsetlookup");
              offset = this.next().read_expr();
              this.expect("]") && this.next();
              result = node(name, offset);
            } else {
              result = name(varName, false);
            }
          } else {
            result = result("variable", this.read_expr(), false);
          }
          this.expect("}") && this.next();
        } else if (this.token === this.tok.T_CURLY_OPEN) {
          syntax = "complex";
          result.destroy();
          result = this.next().read_variable(false, false);
          this.expect("}") && this.next();
        } else if (this.token === this.tok.T_VARIABLE) {
          syntax = "simple";
          result.destroy();
          result = this.read_simple_variable();
          if (this.token === "[") {
            node = this.node("offsetlookup");
            offset = this.next().read_encaps_var_offset();
            this.expect("]") && this.next();
            result = node(result, offset);
          }
          if (this.token === this.tok.T_OBJECT_OPERATOR) {
            node = this.node("propertylookup");
            this.next().expect(this.tok.T_STRING);
            const what = this.node("identifier");
            name = this.text();
            this.next();
            result = node(result, what(name));
          }
        } else {
          this.expect(this.tok.T_ENCAPSED_AND_WHITESPACE);
          const value = this.text();
          this.next();
          result.destroy();
          result = result("string", false, value, false, value);
        }
        this.lexer.heredoc_label.first_encaps_node = false;
        return encapsedPart(result, syntax, curly);
      },
      /*
       * Reads an encapsed string
       */
      read_encapsed_string(expect, isBinary = false) {
        const labelStart = this.lexer.yylloc.first_offset;
        let node = this.node("encapsed");
        this.next();
        const start = this.lexer.yylloc.prev_offset - (isBinary ? 1 : 0);
        const value = [];
        let type;
        if (expect === "`") {
          type = this.ast.encapsed.TYPE_SHELL;
        } else if (expect === '"') {
          type = this.ast.encapsed.TYPE_STRING;
        } else {
          type = this.ast.encapsed.TYPE_HEREDOC;
        }
        while (this.token !== expect && this.token !== this.EOF) {
          value.push(this.read_encapsed_string_item(true));
        }
        if (type === this.ast.encapsed.TYPE_HEREDOC && value.length > 0 && value[value.length - 1].kind === "encapsedpart" && value[value.length - 1].expression.kind === "string") {
          const node2 = value[value.length - 1].expression;
          const lastCh = node2.value[node2.value.length - 1];
          if (lastCh === "\n") {
            if (node2.value[node2.value.length - 2] === "\r") {
              node2.value = node2.value.substring(0, node2.value.length - 2);
            } else {
              node2.value = node2.value.substring(0, node2.value.length - 1);
            }
          } else if (lastCh === "\r") {
            node2.value = node2.value.substring(0, node2.value.length - 1);
          }
        }
        this.expect(expect) && this.next();
        const raw = this.lexer._input.substring(
          type === "heredoc" ? labelStart : start - 1,
          this.lexer.yylloc.first_offset
        );
        node = node(value, raw, type);
        if (expect === this.tok.T_END_HEREDOC) {
          node.label = this.lexer.heredoc_label.label;
          this.lexer.heredoc_label.finished = true;
        }
        return node;
      },
      /*
       * Constant token
       */
      get_magic_constant() {
        const result = this.node("magic");
        const name = this.text();
        this.next();
        return result(name.toUpperCase(), name);
      }
    };
  }
});

// node_modules/php-parser/src/parser/statement.js
var require_statement = __commonJS({
  "node_modules/php-parser/src/parser/statement.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * reading a list of top statements (helper for top_statement*)
       * ```ebnf
       *  top_statements ::= top_statement*
       * ```
       */
      read_top_statements(stopAtNamespace) {
        let result = [];
        while (this.token !== this.EOF && this.token !== "}") {
          if (stopAtNamespace && this.token === this.tok.T_NAMESPACE)
            break;
          const statement = this.read_top_statement();
          if (statement) {
            if (Array.isArray(statement)) {
              result = result.concat(statement);
            } else {
              result.push(statement);
            }
          }
        }
        return result;
      },
      /*
       * reading a top statement
       * ```ebnf
       *  top_statement ::=
       *       namespace | function | class
       *       | interface | trait
       *       | use_statements | const_list
       *       | statement
       * ```
       */
      read_top_statement() {
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        switch (this.token) {
          case this.tok.T_FUNCTION:
            return this.read_function(false, false, attrs);
          case this.tok.T_ABSTRACT:
          case this.tok.T_FINAL:
          case this.tok.T_READ_ONLY:
          case this.tok.T_CLASS:
            return this.read_class_declaration_statement(attrs);
          case this.tok.T_INTERFACE:
            return this.read_interface_declaration_statement(attrs);
          case this.tok.T_TRAIT:
            return this.read_trait_declaration_statement(attrs);
          case this.tok.T_ENUM:
            return this.read_enum_declaration_statement(attrs);
          case this.tok.T_USE:
            return this.read_use_statement();
          case this.tok.T_CONST: {
            const result = this.node("constantstatement");
            const items = this.next().read_const_list();
            this.expectEndOfStatement();
            return result(null, items);
          }
          case this.tok.T_NAMESPACE:
            return this.read_namespace();
          case this.tok.T_HALT_COMPILER: {
            const result = this.node("halt");
            if (this.next().expect("("))
              this.next();
            if (this.expect(")"))
              this.next();
            this.expect(";");
            this.lexer.done = true;
            return result(this.lexer._input.substring(this.lexer.offset));
          }
          default:
            return this.read_statement();
        }
      },
      /*
       * reads a list of simple inner statements (helper for inner_statement*)
       * ```ebnf
       *  inner_statements ::= inner_statement*
       * ```
       */
      read_inner_statements() {
        let result = [];
        while (this.token != this.EOF && this.token !== "}") {
          const statement = this.read_inner_statement();
          if (statement) {
            if (Array.isArray(statement)) {
              result = result.concat(statement);
            } else {
              result.push(statement);
            }
          }
        }
        return result;
      },
      /*
       * Reads a list of constants declaration
       * ```ebnf
       *   const_list ::= T_CONST T_STRING '=' expr (',' T_STRING '=' expr)* ';'
       * ```
       */
      read_const_list() {
        return this.read_list(
          function() {
            this.expect(this.tok.T_STRING);
            const result = this.node("constant");
            let constName = this.node("identifier");
            const name = this.text();
            this.next();
            constName = constName(name);
            if (this.expect("=")) {
              return result(constName, this.next().read_expr());
            } else {
              return result(constName, null);
            }
          },
          ",",
          false
        );
      },
      /*
       * Reads a list of constants declaration
       * ```ebnf
       *   declare_list ::= IDENTIFIER '=' expr (',' IDENTIFIER '=' expr)*
       * ```
       * @retrurn {Array}
       */
      read_declare_list() {
        const result = [];
        while (this.token != this.EOF && this.token !== ")") {
          this.expect(this.tok.T_STRING);
          const directive = this.node("declaredirective");
          let key = this.node("identifier");
          const name = this.text();
          this.next();
          key = key(name);
          let value = null;
          if (this.expect("=")) {
            value = this.next().read_expr();
          }
          result.push(directive(key, value));
          if (this.token !== ",")
            break;
          this.next();
        }
        return result;
      },
      /*
       * reads a simple inner statement
       * ```ebnf
       *  inner_statement ::= '{' inner_statements '}' | token
       * ```
       */
      read_inner_statement() {
        let attrs = [];
        if (this.token === this.tok.T_ATTRIBUTE) {
          attrs = this.read_attr_list();
        }
        switch (this.token) {
          case this.tok.T_FUNCTION: {
            const result = this.read_function(false, false);
            result.attrGroups = attrs;
            return result;
          }
          case this.tok.T_ABSTRACT:
          case this.tok.T_FINAL:
          case this.tok.T_CLASS:
            return this.read_class_declaration_statement();
          case this.tok.T_INTERFACE:
            return this.read_interface_declaration_statement();
          case this.tok.T_TRAIT:
            return this.read_trait_declaration_statement(attrs);
          case this.tok.T_ENUM:
            return this.read_enum_declaration_statement(attrs);
          case this.tok.T_HALT_COMPILER: {
            this.raiseError(
              "__HALT_COMPILER() can only be used from the outermost scope"
            );
            let node = this.node("halt");
            this.next().expect("(") && this.next();
            this.expect(")") && this.next();
            node = node(this.lexer._input.substring(this.lexer.offset));
            this.expect(";") && this.next();
            return node;
          }
          default:
            return this.read_statement();
        }
      },
      /*
       * Reads statements
       */
      read_statement() {
        switch (this.token) {
          case "{":
            return this.read_code_block(false);
          case this.tok.T_IF:
            return this.read_if();
          case this.tok.T_SWITCH:
            return this.read_switch();
          case this.tok.T_FOR:
            return this.read_for();
          case this.tok.T_FOREACH:
            return this.read_foreach();
          case this.tok.T_WHILE:
            return this.read_while();
          case this.tok.T_DO:
            return this.read_do();
          case this.tok.T_COMMENT:
            return this.read_comment();
          case this.tok.T_DOC_COMMENT:
            return this.read_doc_comment();
          case this.tok.T_RETURN: {
            const result = this.node("return");
            this.next();
            const expr = this.read_optional_expr(";");
            this.expectEndOfStatement();
            return result(expr);
          }
          case this.tok.T_BREAK:
          case this.tok.T_CONTINUE: {
            const result = this.node(
              this.token === this.tok.T_CONTINUE ? "continue" : "break"
            );
            this.next();
            const level = this.read_optional_expr(";");
            this.expectEndOfStatement();
            return result(level);
          }
          case this.tok.T_GLOBAL: {
            const result = this.node("global");
            const items = this.next().read_list(this.read_simple_variable, ",");
            this.expectEndOfStatement();
            return result(items);
          }
          case this.tok.T_STATIC: {
            const current = [this.token, this.lexer.getState()];
            const result = this.node();
            if (this.next().token === this.tok.T_DOUBLE_COLON) {
              this.lexer.tokens.push(current);
              const expr = this.next().read_expr();
              this.expectEndOfStatement(expr);
              return result("expressionstatement", expr);
            }
            if (this.token === this.tok.T_FUNCTION) {
              return this.read_function(true, [0, 1, 0]);
            }
            const items = this.read_variable_declarations();
            this.expectEndOfStatement();
            return result("static", items);
          }
          case this.tok.T_ECHO: {
            const result = this.node("echo");
            const text = this.text();
            const shortForm = text === "<?=" || text === "<%=";
            const expressions = this.next().read_function_list(this.read_expr, ",");
            this.expectEndOfStatement();
            return result(expressions, shortForm);
          }
          case this.tok.T_INLINE_HTML: {
            const value = this.text();
            let prevChar = this.lexer.yylloc.first_offset > 0 ? this.lexer._input[this.lexer.yylloc.first_offset - 1] : null;
            const fixFirstLine = prevChar === "\r" || prevChar === "\n";
            if (fixFirstLine) {
              if (prevChar === "\n" && this.lexer.yylloc.first_offset > 1 && this.lexer._input[this.lexer.yylloc.first_offset - 2] === "\r") {
                prevChar = "\r\n";
              }
            }
            const result = this.node("inline");
            this.next();
            return result(value, fixFirstLine ? prevChar + value : value);
          }
          case this.tok.T_UNSET: {
            const result = this.node("unset");
            this.next().expect("(") && this.next();
            const variables = this.read_function_list(this.read_variable, ",");
            this.expect(")") && this.next();
            this.expect(";") && this.next();
            return result(variables);
          }
          case this.tok.T_DECLARE: {
            const result = this.node("declare");
            const body = [];
            let mode;
            this.next().expect("(") && this.next();
            const directives = this.read_declare_list();
            this.expect(")") && this.next();
            if (this.token === ":") {
              this.next();
              while (this.token != this.EOF && this.token !== this.tok.T_ENDDECLARE) {
                body.push(this.read_top_statement());
              }
              if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
                body.push(this.node("noop")());
              }
              this.expect(this.tok.T_ENDDECLARE) && this.next();
              this.expectEndOfStatement();
              mode = this.ast.declare.MODE_SHORT;
            } else if (this.token === "{") {
              this.next();
              while (this.token != this.EOF && this.token !== "}") {
                body.push(this.read_top_statement());
              }
              if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
                body.push(this.node("noop")());
              }
              this.expect("}") && this.next();
              mode = this.ast.declare.MODE_BLOCK;
            } else {
              this.expect(";") && this.next();
              mode = this.ast.declare.MODE_NONE;
            }
            return result(directives, body, mode);
          }
          case this.tok.T_TRY:
            return this.read_try();
          case this.tok.T_THROW: {
            const result = this.node("throw");
            const expr = this.next().read_expr();
            this.expectEndOfStatement();
            return result(expr);
          }
          case ";": {
            this.next();
            return null;
          }
          case this.tok.T_STRING: {
            const result = this.node();
            const current = [this.token, this.lexer.getState()];
            const labelNameText = this.text();
            let labelName = this.node("identifier");
            if (this.next().token === ":") {
              labelName = labelName(labelNameText);
              this.next();
              return result("label", labelName);
            } else {
              labelName.destroy();
            }
            result.destroy();
            this.lexer.tokens.push(current);
            const statement = this.node("expressionstatement");
            const expr = this.next().read_expr();
            this.expectEndOfStatement(expr);
            return statement(expr);
          }
          case this.tok.T_GOTO: {
            const result = this.node("goto");
            let labelName = null;
            if (this.next().expect(this.tok.T_STRING)) {
              labelName = this.node("identifier");
              const name = this.text();
              this.next();
              labelName = labelName(name);
              this.expectEndOfStatement();
            }
            return result(labelName);
          }
          default: {
            const statement = this.node("expressionstatement");
            const expr = this.read_expr();
            this.expectEndOfStatement(expr);
            return statement(expr);
          }
        }
      },
      /*
       * ```ebnf
       *  code_block ::= '{' (inner_statements | top_statements) '}'
       * ```
       */
      read_code_block(top) {
        const result = this.node("block");
        this.expect("{") && this.next();
        const body = top ? this.read_top_statements() : this.read_inner_statements();
        if (body.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          body.push(this.node("noop")());
        }
        this.expect("}") && this.next();
        return result(null, body);
      }
    };
  }
});

// node_modules/php-parser/src/parser/switch.js
var require_switch = __commonJS({
  "node_modules/php-parser/src/parser/switch.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a switch statement
       * ```ebnf
       *  switch ::= T_SWITCH '(' expr ')' switch_case_list
       * ```
       * @return {Switch}
       * @see http://php.net/manual/en/control-structures.switch.php
       */
      read_switch() {
        const result = this.node("switch");
        this.expect(this.tok.T_SWITCH) && this.next();
        this.expect("(") && this.next();
        const test = this.read_expr();
        this.expect(")") && this.next();
        const shortForm = this.token === ":";
        const body = this.read_switch_case_list();
        return result(test, body, shortForm);
      },
      /*
       * ```ebnf
       *  switch_case_list ::= '{' ';'? case_list* '}' | ':' ';'? case_list* T_ENDSWITCH ';'
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L566
       */
      read_switch_case_list() {
        let expect = null;
        const result = this.node("block");
        const items = [];
        if (this.token === "{") {
          expect = "}";
        } else if (this.token === ":") {
          expect = this.tok.T_ENDSWITCH;
        } else {
          this.expect(["{", ":"]);
        }
        this.next();
        if (this.token === ";") {
          this.next();
        }
        while (this.token !== this.EOF && this.token !== expect) {
          items.push(this.read_case_list(expect));
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        this.expect(expect) && this.next();
        if (expect === this.tok.T_ENDSWITCH) {
          this.expectEndOfStatement();
        }
        return result(null, items);
      },
      /*
       * ```ebnf
       *   case_list ::= ((T_CASE expr) | T_DEFAULT) (':' | ';') inner_statement*
       * ```
       */
      read_case_list(stopToken) {
        const result = this.node("case");
        let test = null;
        if (this.token === this.tok.T_CASE) {
          test = this.next().read_expr();
        } else if (this.token === this.tok.T_DEFAULT) {
          this.next();
        } else {
          this.expect([this.tok.T_CASE, this.tok.T_DEFAULT]);
        }
        this.expect([":", ";"]) && this.next();
        const body = this.node("block");
        const items = [];
        while (this.token !== this.EOF && this.token !== stopToken && this.token !== this.tok.T_CASE && this.token !== this.tok.T_DEFAULT) {
          items.push(this.read_inner_statement());
        }
        return result(test, body(null, items));
      }
    };
  }
});

// node_modules/php-parser/src/parser/try.js
var require_try = __commonJS({
  "node_modules/php-parser/src/parser/try.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * ```ebnf
       *  try ::= T_TRY '{' inner_statement* '}'
       *          (
       *              T_CATCH '(' namespace_name (variable)? ')' '{'  inner_statement* '}'
       *          )*
       *          (T_FINALLY '{' inner_statement* '}')?
       * ```
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L448
       * @return {Try}
       */
      read_try() {
        this.expect(this.tok.T_TRY);
        const result = this.node("try");
        let always = null;
        const catches = [];
        const body = this.next().read_statement();
        while (this.token === this.tok.T_CATCH) {
          const item = this.node("catch");
          this.next().expect("(") && this.next();
          const what = this.read_list(this.read_namespace_name, "|", false);
          let variable = null;
          if (this.version < 800 || this.token === this.tok.T_VARIABLE) {
            variable = this.read_variable(true, false);
          }
          this.expect(")");
          catches.push(item(this.next().read_statement(), what, variable));
        }
        if (this.token === this.tok.T_FINALLY) {
          always = this.next().read_statement();
        }
        return result(body, catches, always);
      }
    };
  }
});

// node_modules/php-parser/src/parser/utils.js
var require_utils2 = __commonJS({
  "node_modules/php-parser/src/parser/utils.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a short form of tokens
       * @param {Number} token - The ending token
       * @return {Block}
       */
      read_short_form(token) {
        const body = this.node("block");
        const items = [];
        if (this.expect(":"))
          this.next();
        while (this.token != this.EOF && this.token !== token) {
          items.push(this.read_inner_statement());
        }
        if (items.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
          items.push(this.node("noop")());
        }
        if (this.expect(token))
          this.next();
        this.expectEndOfStatement();
        return body(null, items);
      },
      /*
       * https://wiki.php.net/rfc/trailing-comma-function-calls
       * @param {*} item
       * @param {*} separator
       */
      read_function_list(item, separator) {
        const result = [];
        do {
          if (this.token == separator && this.version >= 703 && result.length > 0) {
            result.push(this.node("noop")());
            break;
          }
          result.push(item.apply(this, []));
          if (this.token != separator) {
            break;
          }
          if (this.next().token == ")" && this.version >= 703) {
            break;
          }
        } while (this.token != this.EOF);
        return result;
      },
      /*
       * Helper : reads a list of tokens / sample : T_STRING ',' T_STRING ...
       * ```ebnf
       * list ::= separator? ( item separator )* item
       * ```
       */
      read_list(item, separator, preserveFirstSeparator) {
        const result = [];
        if (this.token == separator) {
          if (preserveFirstSeparator) {
            result.push(typeof item === "function" ? this.node("noop")() : null);
            this.next();
          } else {
            this.error();
            return result;
          }
        }
        if (typeof item === "function") {
          do {
            const itemResult = item.apply(this, []);
            if (itemResult) {
              result.push(itemResult);
            }
            if (this.token != separator) {
              break;
            }
          } while (this.next().token != this.EOF);
        } else {
          if (this.expect(item)) {
            result.push(this.text());
          } else {
            return [];
          }
          while (this.next().token != this.EOF) {
            if (this.token != separator)
              break;
            if (this.next().token != item)
              break;
            result.push(this.text());
          }
        }
        return result;
      },
      /*
       * Reads a list of names separated by a comma
       *
       * ```ebnf
       * name_list ::= namespace (',' namespace)*
       * ```
       *
       * Sample code :
       * ```php
       * <?php class foo extends bar, baz { }
       * ```
       *
       * @see https://github.com/php/php-src/blob/master/Zend/zend_language_parser.y#L726
       * @return {Reference[]}
       */
      read_name_list() {
        return this.read_list(this.read_namespace_name, ",", false);
      },
      /*
       * Reads the byref token and assign it to the specified node
       * @param {*} cb
       */
      read_byref(cb) {
        let byref = this.node("byref");
        this.next();
        byref = byref(null);
        const result = cb();
        if (result) {
          this.ast.swapLocations(result, byref, result, this);
          result.byref = true;
        }
        return result;
      },
      /*
       * Reads a list of variables declarations
       *
       * ```ebnf
       * variable_declaration ::= T_VARIABLE ('=' expr)?*
       * variable_declarations ::= variable_declaration (',' variable_declaration)*
       * ```
       *
       * Sample code :
       * ```php
       * <?php static $a = 'hello', $b = 'world';
       * ```
       * @return {StaticVariable[]} Returns an array composed by a list of variables, or
       * assign values
       */
      read_variable_declarations() {
        return this.read_list(function() {
          const node = this.node("staticvariable");
          let variable = this.node("variable");
          if (this.expect(this.tok.T_VARIABLE)) {
            const name = this.text().substring(1);
            this.next();
            variable = variable(name, false);
          } else {
            variable = variable("#ERR", false);
          }
          if (this.token === "=") {
            return node(variable, this.next().read_expr());
          } else {
            return variable;
          }
        }, ",");
      },
      /*
       * Reads class extends
       */
      read_extends_from() {
        if (this.token === this.tok.T_EXTENDS) {
          return this.next().read_namespace_name();
        }
        return null;
      },
      /*
       * Reads interface extends list
       */
      read_interface_extends_list() {
        if (this.token === this.tok.T_EXTENDS) {
          return this.next().read_name_list();
        }
        return null;
      },
      /*
       * Reads implements list
       */
      read_implements_list() {
        if (this.token === this.tok.T_IMPLEMENTS) {
          return this.next().read_name_list();
        }
        return null;
      }
    };
  }
});

// node_modules/php-parser/src/parser/variable.js
var require_variable = __commonJS({
  "node_modules/php-parser/src/parser/variable.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      /*
       * Reads a variable
       *
       * ```ebnf
       *   variable ::= &? ...complex @todo
       * ```
       *
       * Some samples of parsed code :
       * ```php
       *  &$var                      // simple var
       *  $var                      // simple var
       *  classname::CONST_NAME     // dynamic class name with const retrieval
       *  foo()                     // function call
       *  $var->func()->property    // chained calls
       * ```
       */
      read_variable(read_only, encapsed) {
        let result;
        if (this.token === "&") {
          return this.read_byref(
            this.read_variable.bind(this, read_only, encapsed)
          );
        }
        if (this.is([this.tok.T_VARIABLE, "$"])) {
          result = this.read_reference_variable(encapsed);
        } else if (this.is([
          this.tok.T_NS_SEPARATOR,
          this.tok.T_STRING,
          this.tok.T_NAME_RELATIVE,
          this.tok.T_NAME_QUALIFIED,
          this.tok.T_NAME_FULLY_QUALIFIED,
          this.tok.T_NAMESPACE
        ])) {
          result = this.node();
          const name = this.read_namespace_name();
          if (this.token != this.tok.T_DOUBLE_COLON && this.token != "(" && ["parentreference", "selfreference"].indexOf(name.kind) === -1) {
            const literal = name.name.toLowerCase();
            if (literal === "true") {
              result = name.destroy(result("boolean", true, name.name));
            } else if (literal === "false") {
              result = name.destroy(result("boolean", false, name.name));
            } else if (literal === "null") {
              result = name.destroy(result("nullkeyword", name.name));
            } else {
              result.destroy(name);
              result = name;
            }
          } else {
            result.destroy(name);
            result = name;
          }
        } else if (this.token === this.tok.T_STATIC) {
          result = this.node("staticreference");
          const raw = this.text();
          this.next();
          result = result(raw);
        } else {
          this.expect("VARIABLE");
        }
        if (this.token === this.tok.T_DOUBLE_COLON) {
          result = this.read_static_getter(result, encapsed);
        }
        return this.recursive_variable_chain_scan(result, read_only, encapsed);
      },
      // resolves a static call
      read_static_getter(what, encapsed) {
        const result = this.node("staticlookup");
        let offset, name;
        if (this.next().is([this.tok.T_VARIABLE, "$"])) {
          offset = this.read_reference_variable(encapsed);
        } else if (this.token === this.tok.T_STRING || this.token === this.tok.T_CLASS || this.version >= 700 && this.is("IDENTIFIER")) {
          offset = this.node("identifier");
          name = this.text();
          this.next();
          offset = offset(name);
        } else if (this.token === "{") {
          offset = this.node("literal");
          name = this.next().read_expr();
          this.expect("}") && this.next();
          offset = offset("literal", name, null);
        } else {
          this.error([this.tok.T_VARIABLE, this.tok.T_STRING]);
          offset = this.node("identifier");
          name = this.text();
          this.next();
          offset = offset(name);
        }
        return result(what, offset);
      },
      read_what(is_static_lookup = false) {
        let what;
        let name;
        switch (this.next().token) {
          case this.tok.T_STRING:
            what = this.node("identifier");
            name = this.text();
            this.next();
            what = what(name);
            if (is_static_lookup && this.token === this.tok.T_OBJECT_OPERATOR) {
              this.error();
            }
            break;
          case this.tok.T_VARIABLE:
            what = this.node("variable");
            name = this.text().substring(1);
            this.next();
            what = what(name, false);
            break;
          case this.tok.T_CLASS:
            if (!is_static_lookup) {
              this.error();
            }
            what = this.node("identifier");
            name = this.text();
            this.next();
            what = what(name, false);
            break;
          case "$":
            what = this.node();
            this.next().expect(["$", "{", this.tok.T_VARIABLE]);
            if (this.token === "{") {
              name = this.next().read_expr();
              this.expect("}") && this.next();
              what = what("variable", name, true);
            } else {
              name = this.read_expr();
              what = what("variable", name, false);
            }
            break;
          case "{":
            what = this.node("encapsedpart");
            name = this.next().read_expr();
            this.expect("}") && this.next();
            what = what(name, "complex", false);
            break;
          default:
            this.error([this.tok.T_STRING, this.tok.T_VARIABLE, "$", "{"]);
            what = this.node("identifier");
            name = this.text();
            this.next();
            what = what(name);
            break;
        }
        return what;
      },
      recursive_variable_chain_scan(result, read_only, encapsed) {
        let node, offset;
        recursive_scan_loop:
          while (this.token != this.EOF) {
            switch (this.token) {
              case "(":
                if (read_only) {
                  return result;
                } else {
                  result = this.node("call")(result, this.read_argument_list());
                }
                break;
              case "[":
              case "{": {
                const backet = this.token;
                const isSquareBracket = backet === "[";
                node = this.node("offsetlookup");
                this.next();
                offset = false;
                if (encapsed) {
                  offset = this.read_encaps_var_offset();
                  this.expect(isSquareBracket ? "]" : "}") && this.next();
                } else {
                  const isCallableVariable = isSquareBracket ? this.token !== "]" : this.token !== "}";
                  if (isCallableVariable) {
                    offset = this.read_expr();
                    this.expect(isSquareBracket ? "]" : "}") && this.next();
                  } else {
                    this.next();
                  }
                }
                result = node(result, offset);
                break;
              }
              case this.tok.T_DOUBLE_COLON:
                node = this.node("staticlookup");
                result = node(result, this.read_what(true));
                break;
              case this.tok.T_OBJECT_OPERATOR: {
                node = this.node("propertylookup");
                result = node(result, this.read_what());
                break;
              }
              case this.tok.T_NULLSAFE_OBJECT_OPERATOR: {
                node = this.node("nullsafepropertylookup");
                result = node(result, this.read_what());
                break;
              }
              default:
                break recursive_scan_loop;
            }
          }
        return result;
      },
      /*
       * https://github.com/php/php-src/blob/493524454d66adde84e00d249d607ecd540de99f/Zend/zend_language_parser.y#L1231
       */
      read_encaps_var_offset() {
        let offset = this.node();
        if (this.token === this.tok.T_STRING) {
          const text = this.text();
          this.next();
          offset = offset("identifier", text);
        } else if (this.token === this.tok.T_NUM_STRING) {
          const num = this.text();
          this.next();
          offset = offset("number", num, null);
        } else if (this.token === "-") {
          this.next();
          const num = -1 * this.text();
          this.expect(this.tok.T_NUM_STRING) && this.next();
          offset = offset("number", num, null);
        } else if (this.token === this.tok.T_VARIABLE) {
          const name = this.text().substring(1);
          this.next();
          offset = offset("variable", name, false);
        } else {
          this.expect([
            this.tok.T_STRING,
            this.tok.T_NUM_STRING,
            "-",
            this.tok.T_VARIABLE
          ]);
          const text = this.text();
          this.next();
          offset = offset("identifier", text);
        }
        return offset;
      },
      /*
       * ```ebnf
       *  reference_variable ::=  simple_variable ('[' OFFSET ']')* | '{' EXPR '}'
       * ```
       * <code>
       *  $foo[123];      // foo is an array ==> gets its entry
       *  $foo{1};        // foo is a string ==> get the 2nd char offset
       *  ${'foo'}[123];  // get the dynamic var $foo
       *  $foo[123]{1};   // gets the 2nd char from the 123 array entry
       * </code>
       */
      read_reference_variable(encapsed) {
        let result = this.read_simple_variable();
        let offset;
        while (this.token != this.EOF) {
          const node = this.node();
          if (this.token == "{" && !encapsed) {
            offset = this.next().read_expr();
            this.expect("}") && this.next();
            result = node("offsetlookup", result, offset);
          } else {
            node.destroy();
            break;
          }
        }
        return result;
      },
      /*
       * ```ebnf
       *  simple_variable ::= T_VARIABLE | '$' '{' expr '}' | '$' simple_variable
       * ```
       */
      read_simple_variable() {
        let result = this.node("variable");
        let name;
        if (this.expect([this.tok.T_VARIABLE, "$"]) && this.token === this.tok.T_VARIABLE) {
          name = this.text().substring(1);
          this.next();
          result = result(name, false);
        } else {
          if (this.token === "$")
            this.next();
          switch (this.token) {
            case "{": {
              const expr = this.next().read_expr();
              this.expect("}") && this.next();
              result = result(expr, true);
              break;
            }
            case "$":
              result = result(this.read_simple_variable(), false);
              break;
            case this.tok.T_VARIABLE: {
              name = this.text().substring(1);
              const node = this.node("variable");
              this.next();
              result = result(node(name, false), false);
              break;
            }
            default:
              this.error(["{", "$", this.tok.T_VARIABLE]);
              name = this.text();
              this.next();
              result = result(name, false);
          }
        }
        return result;
      }
    };
  }
});

// node_modules/php-parser/src/parser.js
var require_parser = __commonJS({
  "node_modules/php-parser/src/parser.js"(exports2, module2) {
    "use strict";
    var Position = require_position();
    function isNumber(n) {
      return n != "." && n != "," && !isNaN(parseFloat(n)) && isFinite(n);
    }
    var Parser = function(lexer, ast) {
      this.lexer = lexer;
      this.ast = ast;
      this.tok = lexer.tok;
      this.EOF = lexer.EOF;
      this.token = null;
      this.prev = null;
      this.debug = false;
      this.version = 803;
      this.extractDoc = false;
      this.extractTokens = false;
      this.suppressErrors = false;
      const mapIt = function(item) {
        return [item, null];
      };
      this.entries = {
        // reserved_non_modifiers
        IDENTIFIER: new Map(
          [
            this.tok.T_ABSTRACT,
            this.tok.T_ARRAY,
            this.tok.T_AS,
            this.tok.T_BREAK,
            this.tok.T_CALLABLE,
            this.tok.T_CASE,
            this.tok.T_CATCH,
            this.tok.T_CLASS,
            this.tok.T_CLASS_C,
            this.tok.T_CLONE,
            this.tok.T_CONST,
            this.tok.T_CONTINUE,
            this.tok.T_DECLARE,
            this.tok.T_DEFAULT,
            this.tok.T_DIR,
            this.tok.T_DO,
            this.tok.T_ECHO,
            this.tok.T_ELSE,
            this.tok.T_ELSEIF,
            this.tok.T_EMPTY,
            this.tok.T_ENDDECLARE,
            this.tok.T_ENDFOR,
            this.tok.T_ENDFOREACH,
            this.tok.T_ENDIF,
            this.tok.T_ENDSWITCH,
            this.tok.T_ENDWHILE,
            this.tok.T_ENUM,
            this.tok.T_EVAL,
            this.tok.T_EXIT,
            this.tok.T_EXTENDS,
            this.tok.T_FILE,
            this.tok.T_FINAL,
            this.tok.T_FINALLY,
            this.tok.T_FN,
            this.tok.T_FOR,
            this.tok.T_FOREACH,
            this.tok.T_FUNC_C,
            this.tok.T_FUNCTION,
            this.tok.T_GLOBAL,
            this.tok.T_GOTO,
            this.tok.T_IF,
            this.tok.T_IMPLEMENTS,
            this.tok.T_INCLUDE,
            this.tok.T_INCLUDE_ONCE,
            this.tok.T_INSTANCEOF,
            this.tok.T_INSTEADOF,
            this.tok.T_INTERFACE,
            this.tok.T_ISSET,
            this.tok.T_LINE,
            this.tok.T_LIST,
            this.tok.T_LOGICAL_AND,
            this.tok.T_LOGICAL_OR,
            this.tok.T_LOGICAL_XOR,
            this.tok.T_MATCH,
            this.tok.T_METHOD_C,
            this.tok.T_NAMESPACE,
            this.tok.T_NEW,
            this.tok.T_NS_C,
            this.tok.T_PRINT,
            this.tok.T_PRIVATE,
            this.tok.T_PROTECTED,
            this.tok.T_PUBLIC,
            this.tok.T_READ_ONLY,
            this.tok.T_REQUIRE,
            this.tok.T_REQUIRE_ONCE,
            this.tok.T_RETURN,
            this.tok.T_STATIC,
            this.tok.T_SWITCH,
            this.tok.T_THROW,
            this.tok.T_TRAIT,
            this.tok.T_TRY,
            this.tok.T_UNSET,
            this.tok.T_USE,
            this.tok.T_VAR,
            this.tok.T_WHILE,
            this.tok.T_YIELD
          ].map(mapIt)
        ),
        VARIABLE: new Map(
          [
            this.tok.T_VARIABLE,
            "$",
            "&",
            this.tok.T_STRING,
            this.tok.T_NAME_RELATIVE,
            this.tok.T_NAME_QUALIFIED,
            this.tok.T_NAME_FULLY_QUALIFIED,
            this.tok.T_NAMESPACE,
            this.tok.T_STATIC
          ].map(mapIt)
        ),
        SCALAR: new Map(
          [
            this.tok.T_CONSTANT_ENCAPSED_STRING,
            this.tok.T_START_HEREDOC,
            this.tok.T_LNUMBER,
            this.tok.T_DNUMBER,
            this.tok.T_ARRAY,
            "[",
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C,
            '"',
            'b"',
            'B"',
            "-",
            this.tok.T_NS_SEPARATOR
          ].map(mapIt)
        ),
        T_MAGIC_CONST: new Map(
          [
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C
          ].map(mapIt)
        ),
        T_MEMBER_FLAGS: new Map(
          [
            this.tok.T_PUBLIC,
            this.tok.T_PRIVATE,
            this.tok.T_PROTECTED,
            this.tok.T_STATIC,
            this.tok.T_ABSTRACT,
            this.tok.T_FINAL,
            this.tok.T_READ_ONLY
          ].map(mapIt)
        ),
        EOS: new Map([";", this.EOF, this.tok.T_INLINE_HTML].map(mapIt)),
        EXPR: new Map(
          [
            "@",
            "-",
            "+",
            "!",
            "~",
            "(",
            "`",
            this.tok.T_LIST,
            this.tok.T_CLONE,
            this.tok.T_INC,
            this.tok.T_DEC,
            this.tok.T_NEW,
            this.tok.T_ISSET,
            this.tok.T_EMPTY,
            this.tok.T_MATCH,
            this.tok.T_INCLUDE,
            this.tok.T_INCLUDE_ONCE,
            this.tok.T_REQUIRE,
            this.tok.T_REQUIRE_ONCE,
            this.tok.T_EVAL,
            this.tok.T_INT_CAST,
            this.tok.T_DOUBLE_CAST,
            this.tok.T_STRING_CAST,
            this.tok.T_ARRAY_CAST,
            this.tok.T_OBJECT_CAST,
            this.tok.T_BOOL_CAST,
            this.tok.T_UNSET_CAST,
            this.tok.T_EXIT,
            this.tok.T_PRINT,
            this.tok.T_YIELD,
            this.tok.T_STATIC,
            this.tok.T_FUNCTION,
            this.tok.T_FN,
            // using VARIABLES :
            this.tok.T_VARIABLE,
            "$",
            this.tok.T_NS_SEPARATOR,
            this.tok.T_STRING,
            this.tok.T_NAME_RELATIVE,
            this.tok.T_NAME_QUALIFIED,
            this.tok.T_NAME_FULLY_QUALIFIED,
            // using SCALAR :
            this.tok.T_STRING,
            // @see variable.js line 45 > conflict with variable = shift/reduce :)
            this.tok.T_CONSTANT_ENCAPSED_STRING,
            this.tok.T_START_HEREDOC,
            this.tok.T_LNUMBER,
            this.tok.T_DNUMBER,
            this.tok.T_ARRAY,
            "[",
            this.tok.T_CLASS_C,
            this.tok.T_TRAIT_C,
            this.tok.T_FUNC_C,
            this.tok.T_METHOD_C,
            this.tok.T_LINE,
            this.tok.T_FILE,
            this.tok.T_DIR,
            this.tok.T_NS_C,
            '"',
            'b"',
            'B"',
            "-",
            this.tok.T_NS_SEPARATOR
          ].map(mapIt)
        )
      };
    };
    Parser.prototype.getTokenName = function(token) {
      if (!isNumber(token)) {
        return "'" + token + "'";
      } else {
        if (token == this.EOF)
          return "the end of file (EOF)";
        return this.lexer.engine.tokens.values[token];
      }
    };
    Parser.prototype.parse = function(code, filename) {
      this._errors = [];
      this.filename = filename || "eval";
      this.currentNamespace = [""];
      if (this.extractDoc) {
        this._docs = [];
      } else {
        this._docs = null;
      }
      if (this.extractTokens) {
        this._tokens = [];
      } else {
        this._tokens = null;
      }
      this._docIndex = 0;
      this._lastNode = null;
      this.lexer.setInput(code);
      this.lexer.all_tokens = this.extractTokens;
      this.lexer.comment_tokens = this.extractDoc;
      this.length = this.lexer._input.length;
      this.innerList = false;
      this.innerListForm = false;
      const program = this.node("program");
      const childs = [];
      this.next();
      while (this.token != this.EOF) {
        childs.push(this.read_start());
      }
      if (childs.length === 0 && this.extractDoc && this._docs.length > this._docIndex) {
        childs.push(this.node("noop")());
      }
      this.prev = [
        this.lexer.yylloc.last_line,
        this.lexer.yylloc.last_column,
        this.lexer.offset
      ];
      const result = program(childs, this._errors, this._docs, this._tokens);
      if (this.debug) {
        const errors = this.ast.checkNodes();
        if (errors.length > 0) {
          errors.forEach(function(error) {
            if (error.position) {
              console.log(
                "Node at line " + error.position.line + ", column " + error.position.column
              );
            }
            console.log(error.stack.join("\n"));
          });
          throw new Error("Some nodes are not closed");
        }
      }
      return result;
    };
    Parser.prototype.raiseError = function(message, msgExpect, expect, token) {
      message += " on line " + this.lexer.yylloc.first_line;
      if (!this.suppressErrors) {
        const err = new SyntaxError(
          message,
          this.filename,
          this.lexer.yylloc.first_line
        );
        err.lineNumber = this.lexer.yylloc.first_line;
        err.fileName = this.filename;
        err.columnNumber = this.lexer.yylloc.first_column;
        throw err;
      }
      const savedPrev = this.prev;
      this.prev = [
        this.lexer.yylloc.last_line,
        this.lexer.yylloc.last_column,
        this.lexer.offset
      ];
      const node = this.ast.prepare("error", null, this)(
        message,
        token,
        this.lexer.yylloc.first_line,
        expect
      );
      this.prev = savedPrev;
      this._errors.push(node);
      return node;
    };
    Parser.prototype.error = function(expect) {
      let msg = "Parse Error : syntax error";
      let token = this.getTokenName(this.token);
      let msgExpect = "";
      if (this.token !== this.EOF) {
        if (isNumber(this.token)) {
          let symbol = this.text();
          if (symbol.length > 10) {
            symbol = symbol.substring(0, 7) + "...";
          }
          token = "'" + symbol + "' (" + token + ")";
        }
        msg += ", unexpected " + token;
      }
      if (expect && !Array.isArray(expect)) {
        if (isNumber(expect) || expect.length === 1) {
          msgExpect = ", expecting " + this.getTokenName(expect);
        }
        msg += msgExpect;
      }
      return this.raiseError(msg, msgExpect, expect, token);
    };
    Parser.prototype.position = function() {
      return new Position(
        this.lexer.yylloc.first_line,
        this.lexer.yylloc.first_column,
        this.lexer.yylloc.first_offset
      );
    };
    Parser.prototype.node = function(name) {
      if (this.extractDoc) {
        let docs = null;
        if (this._docIndex < this._docs.length) {
          docs = this._docs.slice(this._docIndex);
          this._docIndex = this._docs.length;
          if (this.debug) {
            console.log(new Error("Append docs on " + name));
            console.log(docs);
          }
        }
        const node = this.ast.prepare(name, docs, this);
        node.postBuild = function(self) {
          if (this._docIndex < this._docs.length) {
            if (this._lastNode) {
              const offset = this.prev[2];
              let max = this._docIndex;
              for (; max < this._docs.length; max++) {
                if (this._docs[max].offset > offset) {
                  break;
                }
              }
              if (max > this._docIndex) {
                this._lastNode.setTrailingComments(
                  this._docs.slice(this._docIndex, max)
                );
                this._docIndex = max;
              }
            } else if (this.token === this.EOF) {
              self.setTrailingComments(this._docs.slice(this._docIndex));
              this._docIndex = this._docs.length;
            }
          }
          this._lastNode = self;
        }.bind(this);
        return node;
      }
      return this.ast.prepare(name, null, this);
    };
    Parser.prototype.expectEndOfStatement = function(node) {
      if (this.token === ";") {
        if (node && this.lexer.yytext === ";") {
          node.includeToken(this);
        }
      } else if (this.token !== this.tok.T_INLINE_HTML && this.token !== this.EOF) {
        this.error(";");
        return false;
      }
      this.next();
      return true;
    };
    var ignoreStack = ["parser.next", "parser.node", "parser.showlog"];
    Parser.prototype.showlog = function() {
      const stack = new Error().stack.split("\n");
      let line;
      for (let offset = 2; offset < stack.length; offset++) {
        line = stack[offset].trim();
        let found = false;
        for (let i = 0; i < ignoreStack.length; i++) {
          if (line.substring(3, 3 + ignoreStack[i].length) === ignoreStack[i]) {
            found = true;
            break;
          }
        }
        if (!found) {
          break;
        }
      }
      console.log(
        "Line " + this.lexer.yylloc.first_line + " : " + this.getTokenName(this.token) + ">" + this.lexer.yytext + "< @-->" + line
      );
      return this;
    };
    Parser.prototype.expect = function(token) {
      if (Array.isArray(token)) {
        if (token.indexOf(this.token) === -1) {
          this.error(token);
          return false;
        }
      } else if (this.token != token) {
        this.error(token);
        return false;
      }
      return true;
    };
    Parser.prototype.text = function() {
      return this.lexer.yytext;
    };
    Parser.prototype.next = function() {
      if (this.token !== ";" || this.lexer.yytext === ";") {
        this.prev = [
          this.lexer.yylloc.last_line,
          this.lexer.yylloc.last_column,
          this.lexer.offset
        ];
      }
      this.lex();
      if (this.debug) {
        this.showlog();
      }
      if (this.extractDoc) {
        while (this.token === this.tok.T_COMMENT || this.token === this.tok.T_DOC_COMMENT) {
          if (this.token === this.tok.T_COMMENT) {
            this._docs.push(this.read_comment());
          } else {
            this._docs.push(this.read_doc_comment());
          }
        }
      }
      return this;
    };
    Parser.prototype.peek = function() {
      const lexerState = this.lexer.getState();
      const nextToken = this.lexer.lex();
      this.lexer.setState(lexerState);
      return nextToken;
    };
    Parser.prototype.lex = function() {
      if (this.extractTokens) {
        do {
          this.token = this.lexer.lex() || /* istanbul ignore next */
          this.EOF;
          if (this.token === this.EOF)
            return this;
          let entry = this.lexer.yytext;
          if (Object.prototype.hasOwnProperty.call(
            this.lexer.engine.tokens.values,
            this.token
          )) {
            entry = [
              this.lexer.engine.tokens.values[this.token],
              entry,
              this.lexer.yylloc.first_line,
              this.lexer.yylloc.first_offset,
              this.lexer.offset
            ];
          } else {
            entry = [
              null,
              entry,
              this.lexer.yylloc.first_line,
              this.lexer.yylloc.first_offset,
              this.lexer.offset
            ];
          }
          this._tokens.push(entry);
          if (this.token === this.tok.T_CLOSE_TAG) {
            this.token = ";";
            return this;
          } else if (this.token === this.tok.T_OPEN_TAG_WITH_ECHO) {
            this.token = this.tok.T_ECHO;
            return this;
          }
        } while (this.token === this.tok.T_WHITESPACE || // ignore white space
        !this.extractDoc && (this.token === this.tok.T_COMMENT || // ignore single lines comments
        this.token === this.tok.T_DOC_COMMENT) || // ignore doc comments
        // ignore open tags
        this.token === this.tok.T_OPEN_TAG);
      } else {
        this.token = this.lexer.lex() || /* istanbul ignore next */
        this.EOF;
      }
      return this;
    };
    Parser.prototype.is = function(type) {
      if (Array.isArray(type)) {
        return type.indexOf(this.token) !== -1;
      }
      return this.entries[type].has(this.token);
    };
    [
      require_array(),
      require_class(),
      require_comment(),
      require_expr(),
      require_enum(),
      require_function(),
      require_if(),
      require_loops(),
      require_main(),
      require_namespace(),
      require_scalar(),
      require_statement(),
      require_switch(),
      require_try(),
      require_utils2(),
      require_variable()
    ].forEach(function(ext) {
      for (const k in ext) {
        if (Object.prototype.hasOwnProperty.call(Parser.prototype, k)) {
          throw new Error("Function " + k + " is already defined - collision");
        }
        Parser.prototype[k] = ext[k];
      }
    });
    module2.exports = Parser;
  }
});

// node_modules/php-parser/src/tokens.js
var require_tokens2 = __commonJS({
  "node_modules/php-parser/src/tokens.js"(exports2, module2) {
    "use strict";
    var TokenNames = {
      T_HALT_COMPILER: 101,
      T_USE: 102,
      T_ENCAPSED_AND_WHITESPACE: 103,
      T_OBJECT_OPERATOR: 104,
      T_STRING: 105,
      T_DOLLAR_OPEN_CURLY_BRACES: 106,
      T_STRING_VARNAME: 107,
      T_CURLY_OPEN: 108,
      T_NUM_STRING: 109,
      T_ISSET: 110,
      T_EMPTY: 111,
      T_INCLUDE: 112,
      T_INCLUDE_ONCE: 113,
      T_EVAL: 114,
      T_REQUIRE: 115,
      T_REQUIRE_ONCE: 116,
      T_NAMESPACE: 117,
      T_NS_SEPARATOR: 118,
      T_AS: 119,
      T_IF: 120,
      T_ENDIF: 121,
      T_WHILE: 122,
      T_DO: 123,
      T_FOR: 124,
      T_SWITCH: 125,
      T_BREAK: 126,
      T_CONTINUE: 127,
      T_RETURN: 128,
      T_GLOBAL: 129,
      T_STATIC: 130,
      T_ECHO: 131,
      T_INLINE_HTML: 132,
      T_UNSET: 133,
      T_FOREACH: 134,
      T_DECLARE: 135,
      T_TRY: 136,
      T_THROW: 137,
      T_GOTO: 138,
      T_FINALLY: 139,
      T_CATCH: 140,
      T_ENDDECLARE: 141,
      T_LIST: 142,
      T_CLONE: 143,
      T_PLUS_EQUAL: 144,
      T_MINUS_EQUAL: 145,
      T_MUL_EQUAL: 146,
      T_DIV_EQUAL: 147,
      T_CONCAT_EQUAL: 148,
      T_MOD_EQUAL: 149,
      T_AND_EQUAL: 150,
      T_OR_EQUAL: 151,
      T_XOR_EQUAL: 152,
      T_SL_EQUAL: 153,
      T_SR_EQUAL: 154,
      T_INC: 155,
      T_DEC: 156,
      T_BOOLEAN_OR: 157,
      T_BOOLEAN_AND: 158,
      T_LOGICAL_OR: 159,
      T_LOGICAL_AND: 160,
      T_LOGICAL_XOR: 161,
      T_SL: 162,
      T_SR: 163,
      T_IS_IDENTICAL: 164,
      T_IS_NOT_IDENTICAL: 165,
      T_IS_EQUAL: 166,
      T_IS_NOT_EQUAL: 167,
      T_IS_SMALLER_OR_EQUAL: 168,
      T_IS_GREATER_OR_EQUAL: 169,
      T_INSTANCEOF: 170,
      T_INT_CAST: 171,
      T_DOUBLE_CAST: 172,
      T_STRING_CAST: 173,
      T_ARRAY_CAST: 174,
      T_OBJECT_CAST: 175,
      T_BOOL_CAST: 176,
      T_UNSET_CAST: 177,
      T_EXIT: 178,
      T_PRINT: 179,
      T_YIELD: 180,
      T_YIELD_FROM: 181,
      T_FUNCTION: 182,
      T_DOUBLE_ARROW: 183,
      T_DOUBLE_COLON: 184,
      T_ARRAY: 185,
      T_CALLABLE: 186,
      T_CLASS: 187,
      T_ABSTRACT: 188,
      T_TRAIT: 189,
      T_FINAL: 190,
      T_EXTENDS: 191,
      T_INTERFACE: 192,
      T_IMPLEMENTS: 193,
      T_VAR: 194,
      T_PUBLIC: 195,
      T_PROTECTED: 196,
      T_PRIVATE: 197,
      T_CONST: 198,
      T_NEW: 199,
      T_INSTEADOF: 200,
      T_ELSEIF: 201,
      T_ELSE: 202,
      T_ENDSWITCH: 203,
      T_CASE: 204,
      T_DEFAULT: 205,
      T_ENDFOR: 206,
      T_ENDFOREACH: 207,
      T_ENDWHILE: 208,
      T_CONSTANT_ENCAPSED_STRING: 209,
      T_LNUMBER: 210,
      T_DNUMBER: 211,
      T_LINE: 212,
      T_FILE: 213,
      T_DIR: 214,
      T_TRAIT_C: 215,
      T_METHOD_C: 216,
      T_FUNC_C: 217,
      T_NS_C: 218,
      T_START_HEREDOC: 219,
      T_END_HEREDOC: 220,
      T_CLASS_C: 221,
      T_VARIABLE: 222,
      T_OPEN_TAG: 223,
      T_OPEN_TAG_WITH_ECHO: 224,
      T_CLOSE_TAG: 225,
      T_WHITESPACE: 226,
      T_COMMENT: 227,
      T_DOC_COMMENT: 228,
      T_ELLIPSIS: 229,
      T_COALESCE: 230,
      T_POW: 231,
      T_POW_EQUAL: 232,
      T_SPACESHIP: 233,
      T_COALESCE_EQUAL: 234,
      T_FN: 235,
      T_NULLSAFE_OBJECT_OPERATOR: 236,
      T_MATCH: 237,
      T_ATTRIBUTE: 238,
      T_ENUM: 239,
      T_READ_ONLY: 240,
      T_NAME_RELATIVE: 241,
      T_NAME_QUALIFIED: 242,
      T_NAME_FULLY_QUALIFIED: 243,
      T_PIPE: 244
    };
    var tokens = {
      values: Object.entries(TokenNames).reduce(
        (result, [key, value]) => ({ ...result, [value]: key }),
        {}
      ),
      names: TokenNames
    };
    module2.exports = Object.freeze(tokens);
  }
});

// node_modules/php-parser/src/ast/location.js
var require_location = __commonJS({
  "node_modules/php-parser/src/ast/location.js"(exports2, module2) {
    "use strict";
    var Location = function(source, start, end) {
      this.source = source;
      this.start = start;
      this.end = end;
    };
    module2.exports = Location;
  }
});

// node_modules/php-parser/src/ast/node.js
var require_node = __commonJS({
  "node_modules/php-parser/src/ast/node.js"(exports2, module2) {
    "use strict";
    var Node = function Node2(kind, docs, location) {
      this.kind = kind;
      if (docs) {
        this.leadingComments = docs;
      }
      if (location) {
        this.loc = location;
      }
    };
    Node.prototype.setTrailingComments = function(docs) {
      this.trailingComments = docs;
    };
    Node.prototype.destroy = function(node) {
      if (!node) {
        throw new Error(
          "Node already initialized, you must swap with another node"
        );
      }
      if (this.leadingComments) {
        if (node.leadingComments) {
          node.leadingComments = Array.concat(
            this.leadingComments,
            node.leadingComments
          );
        } else {
          node.leadingComments = this.leadingComments;
        }
      }
      if (this.trailingComments) {
        if (node.trailingComments) {
          node.trailingComments = Array.concat(
            this.trailingComments,
            node.trailingComments
          );
        } else {
          node.trailingComments = this.trailingComments;
        }
      }
      return node;
    };
    Node.prototype.includeToken = function(parser) {
      if (this.loc) {
        if (this.loc.end) {
          this.loc.end.line = parser.lexer.yylloc.last_line;
          this.loc.end.column = parser.lexer.yylloc.last_column;
          this.loc.end.offset = parser.lexer.offset;
        }
        if (parser.ast.withSource) {
          this.loc.source = parser.lexer._input.substring(
            this.loc.start.offset,
            parser.lexer.offset
          );
        }
      }
      return this;
    };
    Node.extends = function(type, constructor) {
      constructor.prototype = Object.create(this.prototype);
      constructor.extends = this.extends;
      constructor.prototype.constructor = constructor;
      constructor.kind = type;
      return constructor;
    };
    module2.exports = Node;
  }
});

// node_modules/php-parser/src/ast/expression.js
var require_expression = __commonJS({
  "node_modules/php-parser/src/ast/expression.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "expression";
    module2.exports = Node.extends(KIND, function Expression(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/array.js
var require_array2 = __commonJS({
  "node_modules/php-parser/src/ast/array.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "array";
    module2.exports = Expr.extends(
      KIND,
      function Array2(shortForm, items, docs, location) {
        Expr.apply(this, [KIND, docs, location]);
        this.items = items;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/arrowfunc.js
var require_arrowfunc = __commonJS({
  "node_modules/php-parser/src/ast/arrowfunc.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "arrowfunc";
    module2.exports = Expression.extends(
      KIND,
      function Closure(args, byref, body, type, nullable, isStatic, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.arguments = args;
        this.byref = byref;
        this.body = body;
        this.type = type;
        this.nullable = nullable;
        this.isStatic = isStatic || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/assign.js
var require_assign = __commonJS({
  "node_modules/php-parser/src/ast/assign.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "assign";
    module2.exports = Expression.extends(
      KIND,
      function Assign(left, right, operator, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.left = left;
        this.right = right;
        this.operator = operator;
      }
    );
  }
});

// node_modules/php-parser/src/ast/assignref.js
var require_assignref = __commonJS({
  "node_modules/php-parser/src/ast/assignref.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "assignref";
    module2.exports = Expression.extends(
      KIND,
      function AssignRef(left, right, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.left = left;
        this.right = right;
      }
    );
  }
});

// node_modules/php-parser/src/ast/attribute.js
var require_attribute2 = __commonJS({
  "node_modules/php-parser/src/ast/attribute.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "attribute";
    module2.exports = Node.extends(
      KIND,
      function Attribute(name, args, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.args = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/attrgroup.js
var require_attrgroup = __commonJS({
  "node_modules/php-parser/src/ast/attrgroup.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "attrgroup";
    module2.exports = Node.extends(KIND, function AttrGroup(attrs, docs, location) {
      Node.apply(this, [KIND, docs, location]);
      this.attrs = attrs || [];
    });
  }
});

// node_modules/php-parser/src/ast/operation.js
var require_operation = __commonJS({
  "node_modules/php-parser/src/ast/operation.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "operation";
    module2.exports = Expr.extends(KIND, function Operation(kind, docs, location) {
      Expr.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/bin.js
var require_bin = __commonJS({
  "node_modules/php-parser/src/ast/bin.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "bin";
    module2.exports = Operation.extends(
      KIND,
      function Bin(type, left, right, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.left = left;
        this.right = right;
      }
    );
  }
});

// node_modules/php-parser/src/ast/statement.js
var require_statement2 = __commonJS({
  "node_modules/php-parser/src/ast/statement.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "statement";
    module2.exports = Node.extends(KIND, function Statement(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/block.js
var require_block = __commonJS({
  "node_modules/php-parser/src/ast/block.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "block";
    module2.exports = Statement.extends(
      KIND,
      function Block(kind, children, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.children = children.filter(Boolean);
      }
    );
  }
});

// node_modules/php-parser/src/ast/literal.js
var require_literal = __commonJS({
  "node_modules/php-parser/src/ast/literal.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "literal";
    module2.exports = Expression.extends(
      KIND,
      function Literal(kind, value, raw, docs, location) {
        Expression.apply(this, [kind || KIND, docs, location]);
        this.value = value;
        if (raw) {
          this.raw = raw;
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/boolean.js
var require_boolean = __commonJS({
  "node_modules/php-parser/src/ast/boolean.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "boolean";
    module2.exports = Literal.extends(
      KIND,
      function Boolean2(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/break.js
var require_break = __commonJS({
  "node_modules/php-parser/src/ast/break.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "break";
    module2.exports = Statement.extends(KIND, function Break(level, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.level = level;
    });
  }
});

// node_modules/php-parser/src/ast/byref.js
var require_byref = __commonJS({
  "node_modules/php-parser/src/ast/byref.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "byref";
    module2.exports = Expression.extends(KIND, function ByRef(what, docs, location) {
      Expression.apply(this, [KIND, docs, location]);
      this.what = what;
    });
  }
});

// node_modules/php-parser/src/ast/call.js
var require_call = __commonJS({
  "node_modules/php-parser/src/ast/call.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "call";
    module2.exports = Expression.extends(
      KIND,
      function Call(what, args, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
        this.arguments = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/case.js
var require_case = __commonJS({
  "node_modules/php-parser/src/ast/case.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "case";
    module2.exports = Statement.extends(
      KIND,
      function Case(test, body, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/cast.js
var require_cast = __commonJS({
  "node_modules/php-parser/src/ast/cast.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "cast";
    module2.exports = Operation.extends(
      KIND,
      function Cast(type, raw, expr, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.raw = raw;
        this.expr = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/catch.js
var require_catch = __commonJS({
  "node_modules/php-parser/src/ast/catch.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "catch";
    module2.exports = Statement.extends(
      KIND,
      function Catch(body, what, variable, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.body = body;
        this.what = what;
        this.variable = variable;
      }
    );
  }
});

// node_modules/php-parser/src/ast/declaration.js
var require_declaration = __commonJS({
  "node_modules/php-parser/src/ast/declaration.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "declaration";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var VISIBILITY_MAP = [IS_PUBLIC, IS_PROTECTED, IS_PRIVATE];
    var Declaration = Statement.extends(
      KIND,
      function Declaration2(kind, name, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.name = name;
      }
    );
    Declaration.prototype.parseFlags = function(flags) {
      this.isAbstract = flags[2] === 1;
      this.isFinal = flags[2] === 2;
      this.isReadonly = flags[3] === 1;
      if (this.kind !== "class") {
        const [getVis, setVis] = flags[0];
        if (getVis === -1) {
          this.visibility = IS_UNDEFINED;
        } else if (getVis === null) {
          this.visibility = null;
        } else {
          this.visibility = VISIBILITY_MAP[getVis];
        }
        this.isStatic = flags[1] === 1;
        this.visibilitySet = setVis !== -1 ? VISIBILITY_MAP[setVis] : null;
      }
    };
    module2.exports = Declaration;
  }
});

// node_modules/php-parser/src/ast/class.js
var require_class2 = __commonJS({
  "node_modules/php-parser/src/ast/class.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "class";
    module2.exports = Declaration.extends(
      KIND,
      function Class(name, ext, impl, body, flags, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.isAnonymous = name ? false : true;
        this.extends = ext;
        this.implements = impl;
        this.body = body;
        this.attrGroups = [];
        this.parseFlags(flags);
      }
    );
  }
});

// node_modules/php-parser/src/ast/constantstatement.js
var require_constantstatement = __commonJS({
  "node_modules/php-parser/src/ast/constantstatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "constantstatement";
    module2.exports = Statement.extends(
      KIND,
      function ConstantStatement(kind, constants, docs, location) {
        Statement.apply(this, [kind || KIND, docs, location]);
        this.constants = constants;
      }
    );
  }
});

// node_modules/php-parser/src/ast/classconstant.js
var require_classconstant = __commonJS({
  "node_modules/php-parser/src/ast/classconstant.js"(exports2, module2) {
    "use strict";
    var ConstantStatement = require_constantstatement();
    var KIND = "classconstant";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var ClassConstant = ConstantStatement.extends(
      KIND,
      function ClassConstant2(kind, constants, flags, nullable, type, attrGroups, docs, location) {
        ConstantStatement.apply(this, [kind || KIND, constants, docs, location]);
        this.parseFlags(flags);
        this.nullable = nullable;
        this.type = type;
        this.attrGroups = attrGroups;
      }
    );
    ClassConstant.prototype.parseFlags = function(flags) {
      const getVis = flags[0][0];
      if (getVis === -1) {
        this.visibility = IS_UNDEFINED;
      } else if (getVis === null) {
        this.visibility = null;
      } else if (getVis === 0) {
        this.visibility = IS_PUBLIC;
      } else if (getVis === 1) {
        this.visibility = IS_PROTECTED;
      } else if (getVis === 2) {
        this.visibility = IS_PRIVATE;
      }
      this.final = flags[2] === 2;
    };
    module2.exports = ClassConstant;
  }
});

// node_modules/php-parser/src/ast/clone.js
var require_clone = __commonJS({
  "node_modules/php-parser/src/ast/clone.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "clone";
    module2.exports = Expression.extends(
      KIND,
      function Clone(what, properties, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
        if (properties) {
          this.properties = properties;
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/closure.js
var require_closure = __commonJS({
  "node_modules/php-parser/src/ast/closure.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "closure";
    module2.exports = Expression.extends(
      KIND,
      function Closure(args, byref, uses, type, nullable, isStatic, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.uses = uses;
        this.arguments = args;
        this.byref = byref;
        this.type = type;
        this.nullable = nullable;
        this.isStatic = isStatic || false;
        this.body = null;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/comment.js
var require_comment2 = __commonJS({
  "node_modules/php-parser/src/ast/comment.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    module2.exports = Node.extends(
      "comment",
      function Comment(kind, value, docs, location) {
        Node.apply(this, [kind, docs, location]);
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/commentblock.js
var require_commentblock = __commonJS({
  "node_modules/php-parser/src/ast/commentblock.js"(exports2, module2) {
    "use strict";
    var Comment = require_comment2();
    var KIND = "commentblock";
    module2.exports = Comment.extends(
      KIND,
      function CommentBlock(value, docs, location) {
        Comment.apply(this, [KIND, value, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/commentline.js
var require_commentline = __commonJS({
  "node_modules/php-parser/src/ast/commentline.js"(exports2, module2) {
    "use strict";
    var Comment = require_comment2();
    var KIND = "commentline";
    module2.exports = Comment.extends(
      KIND,
      function CommentLine(value, docs, location) {
        Comment.apply(this, [KIND, value, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/constant.js
var require_constant = __commonJS({
  "node_modules/php-parser/src/ast/constant.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "constant";
    module2.exports = Node.extends(
      KIND,
      function Constant(name, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/continue.js
var require_continue = __commonJS({
  "node_modules/php-parser/src/ast/continue.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "continue";
    module2.exports = Statement.extends(
      KIND,
      function Continue(level, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.level = level;
      }
    );
  }
});

// node_modules/php-parser/src/ast/declare.js
var require_declare = __commonJS({
  "node_modules/php-parser/src/ast/declare.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "declare";
    var Declare = Block.extends(
      KIND,
      function Declare2(directives, body, mode, docs, location) {
        Block.apply(this, [KIND, body, docs, location]);
        this.directives = directives;
        this.mode = mode;
      }
    );
    Declare.MODE_SHORT = "short";
    Declare.MODE_BLOCK = "block";
    Declare.MODE_NONE = "none";
    module2.exports = Declare;
  }
});

// node_modules/php-parser/src/ast/declaredirective.js
var require_declaredirective = __commonJS({
  "node_modules/php-parser/src/ast/declaredirective.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "declaredirective";
    module2.exports = Node.extends(
      KIND,
      function DeclareDirective(key, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.key = key;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/do.js
var require_do = __commonJS({
  "node_modules/php-parser/src/ast/do.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "do";
    module2.exports = Statement.extends(
      KIND,
      function Do(test, body, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/echo.js
var require_echo = __commonJS({
  "node_modules/php-parser/src/ast/echo.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "echo";
    module2.exports = Statement.extends(
      KIND,
      function Echo(expressions, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.shortForm = shortForm;
        this.expressions = expressions;
      }
    );
  }
});

// node_modules/php-parser/src/ast/empty.js
var require_empty = __commonJS({
  "node_modules/php-parser/src/ast/empty.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "empty";
    module2.exports = Expression.extends(
      KIND,
      function Empty(expression, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
      }
    );
  }
});

// node_modules/php-parser/src/ast/encapsed.js
var require_encapsed = __commonJS({
  "node_modules/php-parser/src/ast/encapsed.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "encapsed";
    var Encapsed = Literal.extends(
      KIND,
      function Encapsed2(value, raw, type, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.type = type;
      }
    );
    Encapsed.TYPE_STRING = "string";
    Encapsed.TYPE_SHELL = "shell";
    Encapsed.TYPE_HEREDOC = "heredoc";
    Encapsed.TYPE_OFFSET = "offset";
    module2.exports = Encapsed;
  }
});

// node_modules/php-parser/src/ast/encapsedpart.js
var require_encapsedpart = __commonJS({
  "node_modules/php-parser/src/ast/encapsedpart.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "encapsedpart";
    module2.exports = Expression.extends(
      KIND,
      function EncapsedPart(expression, syntax, curly, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
        this.syntax = syntax;
        this.curly = curly;
      }
    );
  }
});

// node_modules/php-parser/src/ast/entry.js
var require_entry = __commonJS({
  "node_modules/php-parser/src/ast/entry.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "entry";
    module2.exports = Expression.extends(
      KIND,
      function Entry(key, value, byRef, unpack, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.key = key;
        this.value = value;
        this.byRef = byRef;
        this.unpack = unpack;
      }
    );
  }
});

// node_modules/php-parser/src/ast/enum.js
var require_enum2 = __commonJS({
  "node_modules/php-parser/src/ast/enum.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "enum";
    module2.exports = Declaration.extends(
      KIND,
      function Enum(name, valueType, impl, body, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.valueType = valueType;
        this.implements = impl;
        this.body = body;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/enumcase.js
var require_enumcase = __commonJS({
  "node_modules/php-parser/src/ast/enumcase.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "enumcase";
    module2.exports = Node.extends(
      KIND,
      function EnumCase(name, value, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/error.js
var require_error = __commonJS({
  "node_modules/php-parser/src/ast/error.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "error";
    module2.exports = Node.extends(
      KIND,
      function Error2(message, token, line, expected, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.message = message;
        this.token = token;
        this.line = line;
        this.expected = expected;
      }
    );
  }
});

// node_modules/php-parser/src/ast/eval.js
var require_eval = __commonJS({
  "node_modules/php-parser/src/ast/eval.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "eval";
    module2.exports = Expression.extends(
      KIND,
      function Eval(source, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.source = source;
      }
    );
  }
});

// node_modules/php-parser/src/ast/exit.js
var require_exit = __commonJS({
  "node_modules/php-parser/src/ast/exit.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "exit";
    module2.exports = Expression.extends(
      KIND,
      function Exit(expression, useDie, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
        this.useDie = useDie;
      }
    );
  }
});

// node_modules/php-parser/src/ast/expressionstatement.js
var require_expressionstatement = __commonJS({
  "node_modules/php-parser/src/ast/expressionstatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "expressionstatement";
    module2.exports = Statement.extends(
      KIND,
      function ExpressionStatement(expr, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.expression = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/for.js
var require_for = __commonJS({
  "node_modules/php-parser/src/ast/for.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "for";
    module2.exports = Statement.extends(
      KIND,
      function For(init, test, increment, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.init = init;
        this.test = test;
        this.increment = increment;
        this.shortForm = shortForm;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/foreach.js
var require_foreach = __commonJS({
  "node_modules/php-parser/src/ast/foreach.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "foreach";
    module2.exports = Statement.extends(
      KIND,
      function Foreach(source, key, value, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.source = source;
        this.key = key;
        this.value = value;
        this.shortForm = shortForm;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/function.js
var require_function2 = __commonJS({
  "node_modules/php-parser/src/ast/function.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "function";
    module2.exports = Declaration.extends(
      KIND,
      function _Function(name, args, byref, type, nullable, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.arguments = args;
        this.byref = byref;
        this.type = type;
        this.nullable = nullable;
        this.body = null;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/global.js
var require_global = __commonJS({
  "node_modules/php-parser/src/ast/global.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "global";
    module2.exports = Statement.extends(
      KIND,
      function Global(items, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.items = items;
      }
    );
  }
});

// node_modules/php-parser/src/ast/goto.js
var require_goto = __commonJS({
  "node_modules/php-parser/src/ast/goto.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "goto";
    module2.exports = Statement.extends(KIND, function Goto(label, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.label = label;
    });
  }
});

// node_modules/php-parser/src/ast/halt.js
var require_halt = __commonJS({
  "node_modules/php-parser/src/ast/halt.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "halt";
    module2.exports = Statement.extends(KIND, function Halt(after, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.after = after;
    });
  }
});

// node_modules/php-parser/src/ast/identifier.js
var require_identifier = __commonJS({
  "node_modules/php-parser/src/ast/identifier.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "identifier";
    var Identifier = Node.extends(
      KIND,
      function Identifier2(name, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
      }
    );
    module2.exports = Identifier;
  }
});

// node_modules/php-parser/src/ast/if.js
var require_if2 = __commonJS({
  "node_modules/php-parser/src/ast/if.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "if";
    module2.exports = Statement.extends(
      KIND,
      function If(test, body, alternate, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.alternate = alternate;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/include.js
var require_include = __commonJS({
  "node_modules/php-parser/src/ast/include.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "include";
    module2.exports = Expression.extends(
      KIND,
      function Include(once, require2, target, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.once = once;
        this.require = require2;
        this.target = target;
      }
    );
  }
});

// node_modules/php-parser/src/ast/inline.js
var require_inline = __commonJS({
  "node_modules/php-parser/src/ast/inline.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "inline";
    module2.exports = Literal.extends(
      KIND,
      function Inline(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/interface.js
var require_interface = __commonJS({
  "node_modules/php-parser/src/ast/interface.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "interface";
    module2.exports = Declaration.extends(
      KIND,
      function Interface(name, ext, body, attrGroups, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.extends = ext;
        this.body = body;
        this.attrGroups = attrGroups;
      }
    );
  }
});

// node_modules/php-parser/src/ast/intersectiontype.js
var require_intersectiontype = __commonJS({
  "node_modules/php-parser/src/ast/intersectiontype.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "intersectiontype";
    module2.exports = Declaration.extends(
      KIND,
      function IntersectionType(types, docs, location) {
        Declaration.apply(this, [KIND, null, docs, location]);
        this.types = types;
      }
    );
  }
});

// node_modules/php-parser/src/ast/isset.js
var require_isset = __commonJS({
  "node_modules/php-parser/src/ast/isset.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "isset";
    module2.exports = Expression.extends(
      KIND,
      function Isset(variables, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/label.js
var require_label = __commonJS({
  "node_modules/php-parser/src/ast/label.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "label";
    module2.exports = Statement.extends(KIND, function Label(name, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.name = name;
    });
  }
});

// node_modules/php-parser/src/ast/list.js
var require_list = __commonJS({
  "node_modules/php-parser/src/ast/list.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "list";
    module2.exports = Expression.extends(
      KIND,
      function List(items, shortForm, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.items = items;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/lookup.js
var require_lookup = __commonJS({
  "node_modules/php-parser/src/ast/lookup.js"(exports2, module2) {
    "use strict";
    var Expr = require_expression();
    var KIND = "lookup";
    module2.exports = Expr.extends(
      KIND,
      function Lookup(kind, what, offset, docs, location) {
        Expr.apply(this, [kind || KIND, docs, location]);
        this.what = what;
        this.offset = offset;
      }
    );
  }
});

// node_modules/php-parser/src/ast/magic.js
var require_magic = __commonJS({
  "node_modules/php-parser/src/ast/magic.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "magic";
    module2.exports = Literal.extends(
      KIND,
      function Magic(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/match.js
var require_match = __commonJS({
  "node_modules/php-parser/src/ast/match.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "match";
    module2.exports = Expression.extends(
      KIND,
      function Match(cond, arms, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.cond = cond;
        this.arms = arms;
      }
    );
  }
});

// node_modules/php-parser/src/ast/matcharm.js
var require_matcharm = __commonJS({
  "node_modules/php-parser/src/ast/matcharm.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "matcharm";
    module2.exports = Expression.extends(
      KIND,
      function MatchArm(conds, body, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.conds = conds;
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/method.js
var require_method = __commonJS({
  "node_modules/php-parser/src/ast/method.js"(exports2, module2) {
    "use strict";
    var Function_ = require_function2();
    var KIND = "method";
    module2.exports = Function_.extends(KIND, function Method() {
      Function_.apply(this, arguments);
      this.kind = KIND;
    });
  }
});

// node_modules/php-parser/src/ast/reference.js
var require_reference = __commonJS({
  "node_modules/php-parser/src/ast/reference.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "reference";
    var Reference = Node.extends(KIND, function Reference2(kind, docs, location) {
      Node.apply(this, [kind || KIND, docs, location]);
    });
    module2.exports = Reference;
  }
});

// node_modules/php-parser/src/ast/name.js
var require_name = __commonJS({
  "node_modules/php-parser/src/ast/name.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "name";
    var Name = Reference.extends(
      KIND,
      function Name2(name, resolution, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.name = name.replace(/\\$/, "");
        this.resolution = resolution;
      }
    );
    Name.UNQUALIFIED_NAME = "uqn";
    Name.QUALIFIED_NAME = "qn";
    Name.FULL_QUALIFIED_NAME = "fqn";
    Name.RELATIVE_NAME = "rn";
    module2.exports = Name;
  }
});

// node_modules/php-parser/src/ast/namespace.js
var require_namespace2 = __commonJS({
  "node_modules/php-parser/src/ast/namespace.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "namespace";
    module2.exports = Block.extends(
      KIND,
      function Namespace(name, children, withBrackets, docs, location) {
        Block.apply(this, [KIND, children, docs, location]);
        this.name = name;
        this.withBrackets = withBrackets || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/namedargument.js
var require_namedargument = __commonJS({
  "node_modules/php-parser/src/ast/namedargument.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "namedargument";
    module2.exports = Expression.extends(
      KIND,
      function namedargument(name, value, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast/new.js
var require_new = __commonJS({
  "node_modules/php-parser/src/ast/new.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "new";
    module2.exports = Expression.extends(
      KIND,
      function New(what, args, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
        this.arguments = args;
      }
    );
  }
});

// node_modules/php-parser/src/ast/noop.js
var require_noop = __commonJS({
  "node_modules/php-parser/src/ast/noop.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "noop";
    module2.exports = Node.extends(KIND, function Noop(docs, location) {
      Node.apply(this, [KIND, docs, location]);
    });
  }
});

// node_modules/php-parser/src/ast/nowdoc.js
var require_nowdoc = __commonJS({
  "node_modules/php-parser/src/ast/nowdoc.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "nowdoc";
    module2.exports = Literal.extends(
      KIND,
      function Nowdoc(value, raw, label, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.label = label;
      }
    );
  }
});

// node_modules/php-parser/src/ast/nullkeyword.js
var require_nullkeyword = __commonJS({
  "node_modules/php-parser/src/ast/nullkeyword.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "nullkeyword";
    module2.exports = Node.extends(KIND, function NullKeyword(raw, docs, location) {
      Node.apply(this, [KIND, docs, location]);
      this.raw = raw;
    });
  }
});

// node_modules/php-parser/src/ast/nullsafepropertylookup.js
var require_nullsafepropertylookup = __commonJS({
  "node_modules/php-parser/src/ast/nullsafepropertylookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "nullsafepropertylookup";
    module2.exports = Lookup.extends(
      KIND,
      function NullSafePropertyLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/number.js
var require_number = __commonJS({
  "node_modules/php-parser/src/ast/number.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "number";
    module2.exports = Literal.extends(
      KIND,
      function Number2(value, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/offsetlookup.js
var require_offsetlookup = __commonJS({
  "node_modules/php-parser/src/ast/offsetlookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "offsetlookup";
    module2.exports = Lookup.extends(
      KIND,
      function OffsetLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/parameter.js
var require_parameter = __commonJS({
  "node_modules/php-parser/src/ast/parameter.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "parameter";
    module2.exports = Declaration.extends(
      KIND,
      function Parameter(name, type, value, isRef, isVariadic, readonly, nullable, flags, hooks, flagsSet, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.value = value;
        this.type = type;
        this.byref = isRef;
        this.variadic = isVariadic;
        this.readonly = readonly;
        this.nullable = nullable;
        this.flags = flags || 0;
        this.hooks = hooks || [];
        this.flagsSet = flagsSet || 0;
        this.attrGroups = [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/parentreference.js
var require_parentreference = __commonJS({
  "node_modules/php-parser/src/ast/parentreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "parentreference";
    var ParentReference = Reference.extends(
      KIND,
      function ParentReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = ParentReference;
  }
});

// node_modules/php-parser/src/ast/post.js
var require_post = __commonJS({
  "node_modules/php-parser/src/ast/post.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "post";
    module2.exports = Operation.extends(
      KIND,
      function Post(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/pre.js
var require_pre = __commonJS({
  "node_modules/php-parser/src/ast/pre.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "pre";
    module2.exports = Operation.extends(
      KIND,
      function Pre(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/print.js
var require_print = __commonJS({
  "node_modules/php-parser/src/ast/print.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "print";
    module2.exports = Expression.extends(
      KIND,
      function Print(expression, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expression = expression;
      }
    );
  }
});

// node_modules/php-parser/src/ast/program.js
var require_program = __commonJS({
  "node_modules/php-parser/src/ast/program.js"(exports2, module2) {
    "use strict";
    var Block = require_block();
    var KIND = "program";
    module2.exports = Block.extends(
      KIND,
      function Program(children, errors, comments, tokens, docs, location) {
        Block.apply(this, [KIND, children, docs, location]);
        this.errors = errors;
        if (comments) {
          this.comments = comments;
        }
        if (tokens) {
          this.tokens = tokens;
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/property.js
var require_property2 = __commonJS({
  "node_modules/php-parser/src/ast/property.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "property";
    module2.exports = Statement.extends(
      KIND,
      function Property(name, value, readonly, nullable, type, attrGroups, hooks, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.value = value;
        this.readonly = readonly;
        this.nullable = nullable;
        this.type = type;
        this.attrGroups = attrGroups;
        this.hooks = hooks || [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/propertyhook.js
var require_propertyhook = __commonJS({
  "node_modules/php-parser/src/ast/propertyhook.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "propertyhook";
    module2.exports = Node.extends(
      KIND,
      function PropertyHook(name, isFinal, byref, parameter, body, attrGroups, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.name = name;
        this.isFinal = isFinal;
        this.byref = byref;
        this.parameter = parameter;
        this.body = body;
        this.attrGroups = attrGroups || [];
      }
    );
  }
});

// node_modules/php-parser/src/ast/propertylookup.js
var require_propertylookup = __commonJS({
  "node_modules/php-parser/src/ast/propertylookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "propertylookup";
    module2.exports = Lookup.extends(
      KIND,
      function PropertyLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/propertystatement.js
var require_propertystatement = __commonJS({
  "node_modules/php-parser/src/ast/propertystatement.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "propertystatement";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    var VISIBILITY_MAP = [IS_PUBLIC, IS_PROTECTED, IS_PRIVATE];
    var PropertyStatement = Statement.extends(
      KIND,
      function PropertyStatement2(kind, properties, flags, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.properties = properties;
        this.parseFlags(flags);
      }
    );
    PropertyStatement.prototype.parseFlags = function(flags) {
      const [getVis, setVis] = flags[0];
      if (getVis === -1) {
        this.visibility = IS_UNDEFINED;
      } else if (getVis === null) {
        this.visibility = null;
      } else {
        this.visibility = VISIBILITY_MAP[getVis];
      }
      this.isStatic = flags[1] === 1;
      this.isAbstract = flags[2] === 1;
      this.isFinal = flags[2] === 2;
      this.visibilitySet = setVis !== -1 ? VISIBILITY_MAP[setVis] : null;
    };
    module2.exports = PropertyStatement;
  }
});

// node_modules/php-parser/src/ast/retif.js
var require_retif = __commonJS({
  "node_modules/php-parser/src/ast/retif.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "retif";
    module2.exports = Expression.extends(
      KIND,
      function RetIf(test, trueExpr, falseExpr, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.test = test;
        this.trueExpr = trueExpr;
        this.falseExpr = falseExpr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/return.js
var require_return = __commonJS({
  "node_modules/php-parser/src/ast/return.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "return";
    module2.exports = Statement.extends(KIND, function Return(expr, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.expr = expr;
    });
  }
});

// node_modules/php-parser/src/ast/selfreference.js
var require_selfreference = __commonJS({
  "node_modules/php-parser/src/ast/selfreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "selfreference";
    var SelfReference = Reference.extends(
      KIND,
      function SelfReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = SelfReference;
  }
});

// node_modules/php-parser/src/ast/silent.js
var require_silent = __commonJS({
  "node_modules/php-parser/src/ast/silent.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "silent";
    module2.exports = Expression.extends(
      KIND,
      function Silent(expr, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.expr = expr;
      }
    );
  }
});

// node_modules/php-parser/src/ast/static.js
var require_static = __commonJS({
  "node_modules/php-parser/src/ast/static.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "static";
    module2.exports = Statement.extends(
      KIND,
      function Static(variables, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticvariable.js
var require_staticvariable = __commonJS({
  "node_modules/php-parser/src/ast/staticvariable.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "staticvariable";
    module2.exports = Node.extends(
      KIND,
      function StaticVariable(variable, defaultValue, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.variable = variable;
        this.defaultValue = defaultValue;
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticlookup.js
var require_staticlookup = __commonJS({
  "node_modules/php-parser/src/ast/staticlookup.js"(exports2, module2) {
    "use strict";
    var Lookup = require_lookup();
    var KIND = "staticlookup";
    module2.exports = Lookup.extends(
      KIND,
      function StaticLookup(what, offset, docs, location) {
        Lookup.apply(this, [KIND, what, offset, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/staticreference.js
var require_staticreference = __commonJS({
  "node_modules/php-parser/src/ast/staticreference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "staticreference";
    var StaticReference = Reference.extends(
      KIND,
      function StaticReference2(raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.raw = raw;
      }
    );
    module2.exports = StaticReference;
  }
});

// node_modules/php-parser/src/ast/string.js
var require_string = __commonJS({
  "node_modules/php-parser/src/ast/string.js"(exports2, module2) {
    "use strict";
    var Literal = require_literal();
    var KIND = "string";
    module2.exports = Literal.extends(
      KIND,
      function String2(isDoubleQuote, value, unicode, raw, docs, location) {
        Literal.apply(this, [KIND, value, raw, docs, location]);
        this.unicode = unicode;
        this.isDoubleQuote = isDoubleQuote;
      }
    );
  }
});

// node_modules/php-parser/src/ast/switch.js
var require_switch2 = __commonJS({
  "node_modules/php-parser/src/ast/switch.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "switch";
    module2.exports = Statement.extends(
      KIND,
      function Switch(test, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/throw.js
var require_throw = __commonJS({
  "node_modules/php-parser/src/ast/throw.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "throw";
    module2.exports = Statement.extends(KIND, function Throw(what, docs, location) {
      Statement.apply(this, [KIND, docs, location]);
      this.what = what;
    });
  }
});

// node_modules/php-parser/src/ast/trait.js
var require_trait = __commonJS({
  "node_modules/php-parser/src/ast/trait.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "trait";
    module2.exports = Declaration.extends(
      KIND,
      function Trait(name, body, docs, location) {
        Declaration.apply(this, [KIND, name, docs, location]);
        this.body = body;
      }
    );
  }
});

// node_modules/php-parser/src/ast/traitalias.js
var require_traitalias = __commonJS({
  "node_modules/php-parser/src/ast/traitalias.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traitalias";
    var IS_UNDEFINED = "";
    var IS_PUBLIC = "public";
    var IS_PROTECTED = "protected";
    var IS_PRIVATE = "private";
    module2.exports = Node.extends(
      KIND,
      function TraitAlias(trait, method, as, flags, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.trait = trait;
        this.method = method;
        this.as = as;
        this.visibility = IS_UNDEFINED;
        if (flags) {
          const getVis = flags[0][0];
          if (getVis === 0) {
            this.visibility = IS_PUBLIC;
          } else if (getVis === 1) {
            this.visibility = IS_PROTECTED;
          } else if (getVis === 2) {
            this.visibility = IS_PRIVATE;
          }
        }
      }
    );
  }
});

// node_modules/php-parser/src/ast/traitprecedence.js
var require_traitprecedence = __commonJS({
  "node_modules/php-parser/src/ast/traitprecedence.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traitprecedence";
    module2.exports = Node.extends(
      KIND,
      function TraitPrecedence(trait, method, instead, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.trait = trait;
        this.method = method;
        this.instead = instead;
      }
    );
  }
});

// node_modules/php-parser/src/ast/traituse.js
var require_traituse = __commonJS({
  "node_modules/php-parser/src/ast/traituse.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "traituse";
    module2.exports = Node.extends(
      KIND,
      function TraitUse(traits, adaptations, docs, location) {
        Node.apply(this, [KIND, docs, location]);
        this.traits = traits;
        this.adaptations = adaptations;
      }
    );
  }
});

// node_modules/php-parser/src/ast/try.js
var require_try2 = __commonJS({
  "node_modules/php-parser/src/ast/try.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "try";
    module2.exports = Statement.extends(
      KIND,
      function Try(body, catches, always, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.body = body;
        this.catches = catches;
        this.always = always;
      }
    );
  }
});

// node_modules/php-parser/src/ast/typereference.js
var require_typereference = __commonJS({
  "node_modules/php-parser/src/ast/typereference.js"(exports2, module2) {
    "use strict";
    var Reference = require_reference();
    var KIND = "typereference";
    var TypeReference = Reference.extends(
      KIND,
      function TypeReference2(name, raw, docs, location) {
        Reference.apply(this, [KIND, docs, location]);
        this.name = name;
        this.raw = raw;
      }
    );
    TypeReference.types = [
      "int",
      "float",
      "string",
      "bool",
      "object",
      "array",
      "callable",
      "iterable",
      "void",
      "static",
      "null",
      "never",
      "mixed",
      "true",
      "false"
    ];
    module2.exports = TypeReference;
  }
});

// node_modules/php-parser/src/ast/unary.js
var require_unary = __commonJS({
  "node_modules/php-parser/src/ast/unary.js"(exports2, module2) {
    "use strict";
    var Operation = require_operation();
    var KIND = "unary";
    module2.exports = Operation.extends(
      KIND,
      function Unary(type, what, docs, location) {
        Operation.apply(this, [KIND, docs, location]);
        this.type = type;
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/uniontype.js
var require_uniontype = __commonJS({
  "node_modules/php-parser/src/ast/uniontype.js"(exports2, module2) {
    "use strict";
    var Declaration = require_declaration();
    var KIND = "uniontype";
    module2.exports = Declaration.extends(
      KIND,
      function UnionType(types, docs, location) {
        Declaration.apply(this, [KIND, null, docs, location]);
        this.types = types;
      }
    );
  }
});

// node_modules/php-parser/src/ast/unset.js
var require_unset = __commonJS({
  "node_modules/php-parser/src/ast/unset.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "unset";
    module2.exports = Statement.extends(
      KIND,
      function Unset(variables, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.variables = variables;
      }
    );
  }
});

// node_modules/php-parser/src/ast/usegroup.js
var require_usegroup = __commonJS({
  "node_modules/php-parser/src/ast/usegroup.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "usegroup";
    module2.exports = Statement.extends(
      KIND,
      function UseGroup(name, type, items, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.type = type;
        this.items = items;
      }
    );
  }
});

// node_modules/php-parser/src/ast/useitem.js
var require_useitem = __commonJS({
  "node_modules/php-parser/src/ast/useitem.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "useitem";
    var UseItem = Statement.extends(
      KIND,
      function UseItem2(name, alias, type, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.name = name;
        this.alias = alias;
        this.type = type;
      }
    );
    UseItem.TYPE_CONST = "const";
    UseItem.TYPE_FUNCTION = "function";
    module2.exports = UseItem;
  }
});

// node_modules/php-parser/src/ast/variable.js
var require_variable2 = __commonJS({
  "node_modules/php-parser/src/ast/variable.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "variable";
    module2.exports = Expression.extends(
      KIND,
      function Variable(name, curly, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.name = name;
        this.curly = curly || false;
      }
    );
  }
});

// node_modules/php-parser/src/ast/variadic.js
var require_variadic = __commonJS({
  "node_modules/php-parser/src/ast/variadic.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "variadic";
    module2.exports = Expression.extends(
      KIND,
      function variadic(what, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.what = what;
      }
    );
  }
});

// node_modules/php-parser/src/ast/variadicplaceholder.js
var require_variadicplaceholder = __commonJS({
  "node_modules/php-parser/src/ast/variadicplaceholder.js"(exports2, module2) {
    "use strict";
    var Node = require_node();
    var KIND = "variadicplaceholder";
    module2.exports = Node.extends(
      KIND,
      function VariadicPlaceholder(docs, location) {
        Node.apply(this, [KIND, docs, location]);
      }
    );
  }
});

// node_modules/php-parser/src/ast/while.js
var require_while = __commonJS({
  "node_modules/php-parser/src/ast/while.js"(exports2, module2) {
    "use strict";
    var Statement = require_statement2();
    var KIND = "while";
    module2.exports = Statement.extends(
      KIND,
      function While(test, body, shortForm, docs, location) {
        Statement.apply(this, [KIND, docs, location]);
        this.test = test;
        this.body = body;
        this.shortForm = shortForm;
      }
    );
  }
});

// node_modules/php-parser/src/ast/yield.js
var require_yield = __commonJS({
  "node_modules/php-parser/src/ast/yield.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "yield";
    module2.exports = Expression.extends(
      KIND,
      function Yield(value, key, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.value = value;
        this.key = key;
      }
    );
  }
});

// node_modules/php-parser/src/ast/yieldfrom.js
var require_yieldfrom = __commonJS({
  "node_modules/php-parser/src/ast/yieldfrom.js"(exports2, module2) {
    "use strict";
    var Expression = require_expression();
    var KIND = "yieldfrom";
    module2.exports = Expression.extends(
      KIND,
      function YieldFrom(value, docs, location) {
        Expression.apply(this, [KIND, docs, location]);
        this.value = value;
      }
    );
  }
});

// node_modules/php-parser/src/ast.js
var require_ast = __commonJS({
  "node_modules/php-parser/src/ast.js"(exports2, module2) {
    "use strict";
    var Location = require_location();
    var Position = require_position();
    var AST = function(withPositions, withSource) {
      this.withPositions = withPositions;
      this.withSource = withSource;
    };
    AST.precedence = {};
    [
      ["or"],
      ["xor"],
      ["and"],
      ["="],
      ["?"],
      ["??"],
      ["||"],
      ["&&"],
      ["|"],
      ["^"],
      ["&"],
      [
        "==",
        "!=",
        "===",
        "!==",
        /* '<>', */
        "<=>"
      ],
      ["<", "<=", ">", ">="],
      ["<<", ">>"],
      ["+", "-", "."],
      ["*", "/", "%"],
      ["!"],
      ["instanceof"],
      ["u-", "u+", "u~"],
      ["cast", "silent"],
      ["**"]
      // TODO: [ (array)
      // TODO: new
    ].forEach(function(list, index) {
      list.forEach(function(operator) {
        AST.precedence[operator] = index + 1;
      });
    });
    AST.prototype.isRightAssociative = function(operator) {
      return operator === "**" || operator === "??";
    };
    AST.prototype.swapLocations = function(target, first, last, parser) {
      if (this.withPositions) {
        if (!target || !target.loc || !first || !first.loc || !last || !last.loc) {
          return;
        }
        target.loc.start = first.loc.start;
        target.loc.end = last.loc.end;
        if (this.withSource) {
          target.loc.source = parser.lexer._input.substring(
            target.loc.start.offset,
            target.loc.end.offset
          );
        }
      }
    };
    AST.prototype.resolveLocations = function(target, first, last, parser) {
      if (this.withPositions) {
        if (!target || !target.loc || !first || !first.loc || !last || !last.loc) {
          return;
        }
        if (target.loc.start.offset > first.loc.start.offset) {
          target.loc.start = first.loc.start;
        }
        if (target.loc.end.offset < last.loc.end.offset) {
          target.loc.end = last.loc.end;
        }
        if (this.withSource) {
          target.loc.source = parser.lexer._input.substring(
            target.loc.start.offset,
            target.loc.end.offset
          );
        }
      }
    };
    AST.prototype.resolvePrecedence = function(result, parser) {
      let buffer, lLevel, rLevel;
      if (result.kind === "call") {
        this.resolveLocations(result, result.what, result, parser);
      } else if (result.kind === "propertylookup" || result.kind === "nullsafepropertylookup" || result.kind === "staticlookup" || result.kind === "offsetlookup" && result.offset) {
        this.resolveLocations(result, result.what, result.offset, parser);
      } else if (result.kind === "bin") {
        if (result.right && !result.right.parenthesizedExpression) {
          if (result.right.kind === "bin") {
            lLevel = AST.precedence[result.type];
            rLevel = AST.precedence[result.right.type];
            if (lLevel && rLevel && rLevel <= lLevel && (result.type !== result.right.type || !this.isRightAssociative(result.type))) {
              buffer = result.right;
              result.right = result.right.left;
              this.swapLocations(result, result.left, result.right, parser);
              buffer.left = this.resolvePrecedence(result, parser);
              this.swapLocations(buffer, buffer.left, buffer.right, parser);
              result = buffer;
            }
          } else if (result.right.kind === "retif") {
            lLevel = AST.precedence[result.type];
            rLevel = AST.precedence["?"];
            if (lLevel && rLevel && rLevel <= lLevel) {
              buffer = result.right;
              result.right = result.right.test;
              this.swapLocations(result, result.left, result.right, parser);
              buffer.test = this.resolvePrecedence(result, parser);
              this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
              result = buffer;
            }
          }
        }
      } else if ((result.kind === "silent" || result.kind === "cast") && result.expr && !result.expr.parenthesizedExpression) {
        if (result.expr.kind === "bin") {
          buffer = result.expr;
          result.expr = result.expr.left;
          this.swapLocations(result, result, result.expr, parser);
          buffer.left = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.left, buffer.right, parser);
          result = buffer;
        } else if (result.expr.kind === "retif") {
          buffer = result.expr;
          result.expr = result.expr.test;
          this.swapLocations(result, result, result.expr, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      } else if (result.kind === "unary") {
        if (result.what && !result.what.parenthesizedExpression) {
          if (result.what.kind === "bin") {
            lLevel = AST.precedence["u" + result.type] || AST.precedence[result.type];
            rLevel = AST.precedence[result.what.type];
            if (lLevel && rLevel && rLevel < lLevel) {
              buffer = result.what;
              result.what = result.what.left;
              this.swapLocations(result, result, result.what, parser);
              buffer.left = this.resolvePrecedence(result, parser);
              this.swapLocations(buffer, buffer.left, buffer.right, parser);
              result = buffer;
            }
          } else if (result.what.kind === "retif") {
            buffer = result.what;
            result.what = result.what.test;
            this.swapLocations(result, result, result.what, parser);
            buffer.test = this.resolvePrecedence(result, parser);
            this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
            result = buffer;
          }
        }
      } else if (result.kind === "retif") {
        if (result.falseExpr && result.falseExpr.kind === "retif" && !result.falseExpr.parenthesizedExpression) {
          buffer = result.falseExpr;
          result.falseExpr = buffer.test;
          this.swapLocations(result, result.test, result.falseExpr, parser);
          buffer.test = this.resolvePrecedence(result, parser);
          this.swapLocations(buffer, buffer.test, buffer.falseExpr, parser);
          result = buffer;
        }
      } else if (result.kind === "assign") {
        if (result.right && result.right.kind === "bin" && !result.right.parenthesizedExpression) {
          lLevel = AST.precedence["="];
          rLevel = AST.precedence[result.right.type];
          if (lLevel && rLevel && rLevel < lLevel) {
            buffer = result.right;
            result.right = result.right.left;
            buffer.left = result;
            this.swapLocations(buffer, buffer.left, result.right, parser);
            result = buffer;
          }
        }
      } else if (result.kind === "expressionstatement") {
        this.swapLocations(result, result.expression, result, parser);
      }
      return result;
    };
    AST.prototype.prepare = function(kind, docs, parser) {
      let start = null;
      if (this.withPositions || this.withSource) {
        start = parser.position();
      }
      const self = this;
      const result = function() {
        const args = Array.prototype.slice.call(arguments);
        args.push(docs);
        if (self.withPositions || self.withSource) {
          let nodeStart = start;
          let nodeEnd = new Position(
            parser.prev[0],
            parser.prev[1],
            parser.prev[2]
          );
          if (nodeStart.offset > nodeEnd.offset) {
            const tmp = nodeStart;
            nodeStart = nodeEnd;
            nodeEnd = tmp;
          }
          let src = null;
          if (self.withSource) {
            src = parser.lexer._input.substring(nodeStart.offset, nodeEnd.offset);
          }
          const location = new Location(src, nodeStart, nodeEnd);
          args.push(location);
        }
        if (!kind) {
          kind = args.shift();
        }
        const node = self[kind];
        if (typeof node !== "function") {
          throw new Error('Undefined node "' + kind + '"');
        }
        const astNode = Object.create(node.prototype);
        node.apply(astNode, args);
        result.instance = astNode;
        if (result.trailingComments) {
          astNode.trailingComments = result.trailingComments;
        }
        if (typeof result.postBuild === "function") {
          result.postBuild(astNode);
        }
        if (parser.debug) {
          delete self.stack[result.stackUid];
        }
        return self.resolvePrecedence(astNode, parser);
      };
      if (parser.debug) {
        if (!this.stack) {
          this.stack = {};
          this.stackUid = 1;
        }
        this.stack[++this.stackUid] = {
          position: start,
          stack: new Error().stack.split("\n").slice(3, 5)
        };
        result.stackUid = this.stackUid;
      }
      result.setTrailingComments = function(docs2) {
        if (result.instance) {
          result.instance.setTrailingComments(docs2);
        } else {
          result.trailingComments = docs2;
        }
      };
      result.destroy = function(target) {
        if (docs) {
          if (target) {
            if (!target.leadingComments) {
              target.leadingComments = docs;
            } else {
              target.leadingComments = docs.concat(target.leadingComments);
            }
          } else {
            parser._docIndex = parser._docs.length - docs.length;
          }
        }
        if (parser.debug) {
          delete self.stack[result.stackUid];
        }
      };
      return result;
    };
    AST.prototype.checkNodes = function() {
      const errors = [];
      for (const k in this.stack) {
        if (Object.prototype.hasOwnProperty.call(this.stack, k)) {
          this.stack[k].key = k;
          errors.push(this.stack[k]);
        }
      }
      this.stack = {};
      return errors;
    };
    [
      require_array2(),
      require_arrowfunc(),
      require_assign(),
      require_assignref(),
      require_attribute2(),
      require_attrgroup(),
      require_bin(),
      require_block(),
      require_boolean(),
      require_break(),
      require_byref(),
      require_call(),
      require_case(),
      require_cast(),
      require_catch(),
      require_class2(),
      require_classconstant(),
      require_clone(),
      require_closure(),
      require_comment2(),
      require_commentblock(),
      require_commentline(),
      require_constant(),
      require_constantstatement(),
      require_continue(),
      require_declaration(),
      require_declare(),
      require_declaredirective(),
      require_do(),
      require_echo(),
      require_empty(),
      require_encapsed(),
      require_encapsedpart(),
      require_entry(),
      require_enum2(),
      require_enumcase(),
      require_error(),
      require_eval(),
      require_exit(),
      require_expression(),
      require_expressionstatement(),
      require_for(),
      require_foreach(),
      require_function2(),
      require_global(),
      require_goto(),
      require_halt(),
      require_identifier(),
      require_if2(),
      require_include(),
      require_inline(),
      require_interface(),
      require_intersectiontype(),
      require_isset(),
      require_label(),
      require_list(),
      require_literal(),
      require_lookup(),
      require_magic(),
      require_match(),
      require_matcharm(),
      require_method(),
      require_name(),
      require_namespace2(),
      require_namedargument(),
      require_new(),
      require_node(),
      require_noop(),
      require_nowdoc(),
      require_nullkeyword(),
      require_nullsafepropertylookup(),
      require_number(),
      require_offsetlookup(),
      require_operation(),
      require_parameter(),
      require_parentreference(),
      require_post(),
      require_pre(),
      require_print(),
      require_program(),
      require_property2(),
      require_propertyhook(),
      require_propertylookup(),
      require_propertystatement(),
      require_reference(),
      require_retif(),
      require_return(),
      require_selfreference(),
      require_silent(),
      require_statement2(),
      require_static(),
      require_staticvariable(),
      require_staticlookup(),
      require_staticreference(),
      require_string(),
      require_switch2(),
      require_throw(),
      require_trait(),
      require_traitalias(),
      require_traitprecedence(),
      require_traituse(),
      require_try2(),
      require_typereference(),
      require_unary(),
      require_uniontype(),
      require_unset(),
      require_usegroup(),
      require_useitem(),
      require_variable2(),
      require_variadic(),
      require_variadicplaceholder(),
      require_while(),
      require_yield(),
      require_yieldfrom()
    ].forEach(function(ctor) {
      AST.prototype[ctor.kind] = ctor;
    });
    module2.exports = AST;
  }
});

// node_modules/php-parser/src/index.js
var require_src = __commonJS({
  "node_modules/php-parser/src/index.js"(exports2, module2) {
    "use strict";
    var lexer = require_lexer();
    var parser = require_parser();
    var tokens = require_tokens2();
    var AST = require_ast();
    function combine(src, to) {
      const keys = Object.keys(src);
      let i = keys.length;
      while (i--) {
        const k = keys[i];
        if (k === "__proto__" || k === "constructor" || k === "prototype") {
          continue;
        }
        const val = src[k];
        if (val === null) {
          delete to[k];
        } else if (typeof val === "function") {
          to[k] = val.bind(to);
        } else if (Array.isArray(val)) {
          to[k] = Array.isArray(to[k]) ? to[k].concat(val) : val;
        } else if (typeof val === "object") {
          to[k] = typeof to[k] === "object" ? combine(val, to[k]) : val;
        } else {
          to[k] = val;
        }
      }
      return to;
    }
    var Engine2 = function(options) {
      if (typeof this === "function") {
        return new this(options);
      }
      this.tokens = tokens;
      this.lexer = new lexer(this);
      this.ast = new AST();
      this.parser = new parser(this.lexer, this.ast);
      if (options && typeof options === "object") {
        if (options.parser) {
          if (!options.lexer) {
            options.lexer = {};
          }
          if (options.parser.version) {
            if (typeof options.parser.version === "string") {
              let version = options.parser.version.split(".");
              version = parseInt(version[0]) * 100 + parseInt(version[1]);
              if (isNaN(version)) {
                throw new Error("Bad version number : " + options.parser.version);
              } else {
                options.parser.version = version;
              }
            } else if (typeof options.parser.version !== "number") {
              throw new Error("Expecting a number for version");
            }
            if (options.parser.version < 500 || options.parser.version > 900) {
              throw new Error("Can only handle versions between 5.x to 8.x");
            }
          }
        }
        combine(options, this);
        this.lexer.version = this.parser.version;
      }
    };
    var getStringBuffer = function(buffer) {
      return typeof buffer.write === "function" ? buffer.toString() : buffer;
    };
    Engine2.create = function(options) {
      return new Engine2(options);
    };
    Engine2.parseEval = function(buffer, options) {
      const self = new Engine2(options);
      return self.parseEval(buffer);
    };
    Engine2.prototype.parseEval = function(buffer) {
      this.lexer.mode_eval = true;
      this.lexer.all_tokens = false;
      buffer = getStringBuffer(buffer);
      return this.parser.parse(buffer, "eval");
    };
    Engine2.parseCode = function(buffer, filename, options) {
      if (typeof filename === "object" && !options) {
        options = filename;
        filename = "unknown";
      }
      const self = new Engine2(options);
      return self.parseCode(buffer, filename);
    };
    Engine2.prototype.parseCode = function(buffer, filename) {
      this.lexer.mode_eval = false;
      this.lexer.all_tokens = false;
      buffer = getStringBuffer(buffer);
      return this.parser.parse(buffer, filename);
    };
    Engine2.tokenGetAll = function(buffer, options) {
      const self = new Engine2(options);
      return self.tokenGetAll(buffer);
    };
    Engine2.prototype.tokenGetAll = function(buffer) {
      this.lexer.mode_eval = false;
      this.lexer.all_tokens = true;
      buffer = getStringBuffer(buffer);
      const EOF = this.lexer.EOF;
      const names = this.tokens.values;
      this.lexer.setInput(buffer);
      let token = this.lexer.lex() || EOF;
      const result = [];
      while (token != EOF) {
        let entry = this.lexer.yytext;
        if (Object.prototype.hasOwnProperty.call(names, token)) {
          entry = [names[token], entry, this.lexer.yylloc.first_line];
        }
        result.push(entry);
        token = this.lexer.lex() || EOF;
      }
      return result;
    };
    module2.exports = Engine2;
    module2.exports.tokens = tokens;
    module2.exports.lexer = lexer;
    module2.exports.AST = AST;
    module2.exports.parser = parser;
    module2.exports.combine = combine;
    module2.exports.Engine = Engine2;
    module2.exports.default = Engine2;
  }
});

// node_modules/fast-glob/out/utils/array.js
var require_array3 = __commonJS({
  "node_modules/fast-glob/out/utils/array.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.splitWhen = exports2.flatten = void 0;
    function flatten(items) {
      return items.reduce((collection, item) => [].concat(collection, item), []);
    }
    exports2.flatten = flatten;
    function splitWhen(items, predicate) {
      const result = [[]];
      let groupIndex = 0;
      for (const item of items) {
        if (predicate(item)) {
          groupIndex++;
          result[groupIndex] = [];
        } else {
          result[groupIndex].push(item);
        }
      }
      return result;
    }
    exports2.splitWhen = splitWhen;
  }
});

// node_modules/fast-glob/out/utils/errno.js
var require_errno = __commonJS({
  "node_modules/fast-glob/out/utils/errno.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEnoentCodeError = void 0;
    function isEnoentCodeError(error) {
      return error.code === "ENOENT";
    }
    exports2.isEnoentCodeError = isEnoentCodeError;
  }
});

// node_modules/fast-glob/out/utils/fs.js
var require_fs = __commonJS({
  "node_modules/fast-glob/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name, stats) {
      return new DirentFromStats(name, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// node_modules/fast-glob/out/utils/path.js
var require_path = __commonJS({
  "node_modules/fast-glob/out/utils/path.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPosixPathToPattern = exports2.convertWindowsPathToPattern = exports2.convertPathToPattern = exports2.escapePosixPath = exports2.escapeWindowsPath = exports2.escape = exports2.removeLeadingDotSegment = exports2.makeAbsolute = exports2.unixify = void 0;
    var os2 = require("os");
    var path4 = require("path");
    var IS_WINDOWS_PLATFORM = os2.platform() === "win32";
    var LEADING_DOT_SEGMENT_CHARACTERS_COUNT = 2;
    var POSIX_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()*?[\]{|}]|^!|[!+@](?=\()|\\(?![!()*+?@[\]{|}]))/g;
    var WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE = /(\\?)([()[\]{}]|^!|[!+@](?=\())/g;
    var DOS_DEVICE_PATH_RE = /^\\\\([.?])/;
    var WINDOWS_BACKSLASHES_RE = /\\(?![!()+@[\]{}])/g;
    function unixify(filepath) {
      return filepath.replace(/\\/g, "/");
    }
    exports2.unixify = unixify;
    function makeAbsolute(cwd, filepath) {
      return path4.resolve(cwd, filepath);
    }
    exports2.makeAbsolute = makeAbsolute;
    function removeLeadingDotSegment(entry) {
      if (entry.charAt(0) === ".") {
        const secondCharactery = entry.charAt(1);
        if (secondCharactery === "/" || secondCharactery === "\\") {
          return entry.slice(LEADING_DOT_SEGMENT_CHARACTERS_COUNT);
        }
      }
      return entry;
    }
    exports2.removeLeadingDotSegment = removeLeadingDotSegment;
    exports2.escape = IS_WINDOWS_PLATFORM ? escapeWindowsPath : escapePosixPath;
    function escapeWindowsPath(pattern) {
      return pattern.replace(WINDOWS_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapeWindowsPath = escapeWindowsPath;
    function escapePosixPath(pattern) {
      return pattern.replace(POSIX_UNESCAPED_GLOB_SYMBOLS_RE, "\\$2");
    }
    exports2.escapePosixPath = escapePosixPath;
    exports2.convertPathToPattern = IS_WINDOWS_PLATFORM ? convertWindowsPathToPattern : convertPosixPathToPattern;
    function convertWindowsPathToPattern(filepath) {
      return escapeWindowsPath(filepath).replace(DOS_DEVICE_PATH_RE, "//$1").replace(WINDOWS_BACKSLASHES_RE, "/");
    }
    exports2.convertWindowsPathToPattern = convertWindowsPathToPattern;
    function convertPosixPathToPattern(filepath) {
      return escapePosixPath(filepath);
    }
    exports2.convertPosixPathToPattern = convertPosixPathToPattern;
  }
});

// node_modules/is-extglob/index.js
var require_is_extglob = __commonJS({
  "node_modules/is-extglob/index.js"(exports2, module2) {
    module2.exports = function isExtglob(str) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      var match;
      while (match = /(\\).|([@?!+*]\(.*\))/g.exec(str)) {
        if (match[2])
          return true;
        str = str.slice(match.index + match[0].length);
      }
      return false;
    };
  }
});

// node_modules/is-glob/index.js
var require_is_glob = __commonJS({
  "node_modules/is-glob/index.js"(exports2, module2) {
    var isExtglob = require_is_extglob();
    var chars = { "{": "}", "(": ")", "[": "]" };
    var strictCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      var pipeIndex = -2;
      var closeSquareIndex = -2;
      var closeCurlyIndex = -2;
      var closeParenIndex = -2;
      var backSlashIndex = -2;
      while (index < str.length) {
        if (str[index] === "*") {
          return true;
        }
        if (str[index + 1] === "?" && /[\].+)]/.test(str[index])) {
          return true;
        }
        if (closeSquareIndex !== -1 && str[index] === "[" && str[index + 1] !== "]") {
          if (closeSquareIndex < index) {
            closeSquareIndex = str.indexOf("]", index);
          }
          if (closeSquareIndex > index) {
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeSquareIndex) {
              return true;
            }
          }
        }
        if (closeCurlyIndex !== -1 && str[index] === "{" && str[index + 1] !== "}") {
          closeCurlyIndex = str.indexOf("}", index);
          if (closeCurlyIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeCurlyIndex) {
              return true;
            }
          }
        }
        if (closeParenIndex !== -1 && str[index] === "(" && str[index + 1] === "?" && /[:!=]/.test(str[index + 2]) && str[index + 3] !== ")") {
          closeParenIndex = str.indexOf(")", index);
          if (closeParenIndex > index) {
            backSlashIndex = str.indexOf("\\", index);
            if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
              return true;
            }
          }
        }
        if (pipeIndex !== -1 && str[index] === "(" && str[index + 1] !== "|") {
          if (pipeIndex < index) {
            pipeIndex = str.indexOf("|", index);
          }
          if (pipeIndex !== -1 && str[pipeIndex + 1] !== ")") {
            closeParenIndex = str.indexOf(")", pipeIndex);
            if (closeParenIndex > pipeIndex) {
              backSlashIndex = str.indexOf("\\", pipeIndex);
              if (backSlashIndex === -1 || backSlashIndex > closeParenIndex) {
                return true;
              }
            }
          }
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    var relaxedCheck = function(str) {
      if (str[0] === "!") {
        return true;
      }
      var index = 0;
      while (index < str.length) {
        if (/[*?{}()[\]]/.test(str[index])) {
          return true;
        }
        if (str[index] === "\\") {
          var open = str[index + 1];
          index += 2;
          var close = chars[open];
          if (close) {
            var n = str.indexOf(close, index);
            if (n !== -1) {
              index = n + 1;
            }
          }
          if (str[index] === "!") {
            return true;
          }
        } else {
          index++;
        }
      }
      return false;
    };
    module2.exports = function isGlob(str, options) {
      if (typeof str !== "string" || str === "") {
        return false;
      }
      if (isExtglob(str)) {
        return true;
      }
      var check = strictCheck;
      if (options && options.strict === false) {
        check = relaxedCheck;
      }
      return check(str);
    };
  }
});

// node_modules/glob-parent/index.js
var require_glob_parent = __commonJS({
  "node_modules/glob-parent/index.js"(exports2, module2) {
    "use strict";
    var isGlob = require_is_glob();
    var pathPosixDirname = require("path").posix.dirname;
    var isWin32 = require("os").platform() === "win32";
    var slash = "/";
    var backslash = /\\/g;
    var enclosure = /[\{\[].*[\}\]]$/;
    var globby = /(^|[^\\])([\{\[]|\([^\)]+$)/;
    var escaped = /\\([\!\*\?\|\[\]\(\)\{\}])/g;
    module2.exports = function globParent(str, opts) {
      var options = Object.assign({ flipBackslashes: true }, opts);
      if (options.flipBackslashes && isWin32 && str.indexOf(slash) < 0) {
        str = str.replace(backslash, slash);
      }
      if (enclosure.test(str)) {
        str += slash;
      }
      str += "a";
      do {
        str = pathPosixDirname(str);
      } while (isGlob(str) || globby.test(str));
      return str.replace(escaped, "$1");
    };
  }
});

// node_modules/braces/lib/utils.js
var require_utils3 = __commonJS({
  "node_modules/braces/lib/utils.js"(exports2) {
    "use strict";
    exports2.isInteger = (num) => {
      if (typeof num === "number") {
        return Number.isInteger(num);
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isInteger(Number(num));
      }
      return false;
    };
    exports2.find = (node, type) => node.nodes.find((node2) => node2.type === type);
    exports2.exceedsLimit = (min, max, step = 1, limit) => {
      if (limit === false)
        return false;
      if (!exports2.isInteger(min) || !exports2.isInteger(max))
        return false;
      return (Number(max) - Number(min)) / Number(step) >= limit;
    };
    exports2.escapeNode = (block, n = 0, type) => {
      const node = block.nodes[n];
      if (!node)
        return;
      if (type && node.type === type || node.type === "open" || node.type === "close") {
        if (node.escaped !== true) {
          node.value = "\\" + node.value;
          node.escaped = true;
        }
      }
    };
    exports2.encloseBrace = (node) => {
      if (node.type !== "brace")
        return false;
      if (node.commas >> 0 + node.ranges >> 0 === 0) {
        node.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isInvalidBrace = (block) => {
      if (block.type !== "brace")
        return false;
      if (block.invalid === true || block.dollar)
        return true;
      if (block.commas >> 0 + block.ranges >> 0 === 0) {
        block.invalid = true;
        return true;
      }
      if (block.open !== true || block.close !== true) {
        block.invalid = true;
        return true;
      }
      return false;
    };
    exports2.isOpenOrClose = (node) => {
      if (node.type === "open" || node.type === "close") {
        return true;
      }
      return node.open === true || node.close === true;
    };
    exports2.reduce = (nodes) => nodes.reduce((acc, node) => {
      if (node.type === "text")
        acc.push(node.value);
      if (node.type === "range")
        node.type = "text";
      return acc;
    }, []);
    exports2.flatten = (...args) => {
      const result = [];
      const flat = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          const ele = arr[i];
          if (Array.isArray(ele)) {
            flat(ele);
            continue;
          }
          if (ele !== void 0) {
            result.push(ele);
          }
        }
        return result;
      };
      flat(args);
      return result;
    };
  }
});

// node_modules/braces/lib/stringify.js
var require_stringify = __commonJS({
  "node_modules/braces/lib/stringify.js"(exports2, module2) {
    "use strict";
    var utils = require_utils3();
    module2.exports = (ast, options = {}) => {
      const stringify = (node, parent = {}) => {
        const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        let output = "";
        if (node.value) {
          if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
            return "\\" + node.value;
          }
          return node.value;
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += stringify(child);
          }
        }
        return output;
      };
      return stringify(ast);
    };
  }
});

// node_modules/is-number/index.js
var require_is_number = __commonJS({
  "node_modules/is-number/index.js"(exports2, module2) {
    "use strict";
    module2.exports = function(num) {
      if (typeof num === "number") {
        return num - num === 0;
      }
      if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
      }
      return false;
    };
  }
});

// node_modules/to-regex-range/index.js
var require_to_regex_range = __commonJS({
  "node_modules/to-regex-range/index.js"(exports2, module2) {
    "use strict";
    var isNumber = require_is_number();
    var toRegexRange = (min, max, options) => {
      if (isNumber(min) === false) {
        throw new TypeError("toRegexRange: expected the first argument to be a number");
      }
      if (max === void 0 || min === max) {
        return String(min);
      }
      if (isNumber(max) === false) {
        throw new TypeError("toRegexRange: expected the second argument to be a number.");
      }
      let opts = { relaxZeros: true, ...options };
      if (typeof opts.strictZeros === "boolean") {
        opts.relaxZeros = opts.strictZeros === false;
      }
      let relax = String(opts.relaxZeros);
      let shorthand = String(opts.shorthand);
      let capture = String(opts.capture);
      let wrap = String(opts.wrap);
      let cacheKey = min + ":" + max + "=" + relax + shorthand + capture + wrap;
      if (toRegexRange.cache.hasOwnProperty(cacheKey)) {
        return toRegexRange.cache[cacheKey].result;
      }
      let a = Math.min(min, max);
      let b = Math.max(min, max);
      if (Math.abs(a - b) === 1) {
        let result = min + "|" + max;
        if (opts.capture) {
          return `(${result})`;
        }
        if (opts.wrap === false) {
          return result;
        }
        return `(?:${result})`;
      }
      let isPadded = hasPadding(min) || hasPadding(max);
      let state = { min, max, a, b };
      let positives = [];
      let negatives = [];
      if (isPadded) {
        state.isPadded = isPadded;
        state.maxLen = String(state.max).length;
      }
      if (a < 0) {
        let newMin = b < 0 ? Math.abs(b) : 1;
        negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
        a = state.a = 0;
      }
      if (b >= 0) {
        positives = splitToPatterns(a, b, state, opts);
      }
      state.negatives = negatives;
      state.positives = positives;
      state.result = collatePatterns(negatives, positives, opts);
      if (opts.capture === true) {
        state.result = `(${state.result})`;
      } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
        state.result = `(?:${state.result})`;
      }
      toRegexRange.cache[cacheKey] = state;
      return state.result;
    };
    function collatePatterns(neg, pos, options) {
      let onlyNegative = filterPatterns(neg, pos, "-", false, options) || [];
      let onlyPositive = filterPatterns(pos, neg, "", false, options) || [];
      let intersected = filterPatterns(neg, pos, "-?", true, options) || [];
      let subpatterns = onlyNegative.concat(intersected).concat(onlyPositive);
      return subpatterns.join("|");
    }
    function splitToRanges(min, max) {
      let nines = 1;
      let zeros = 1;
      let stop = countNines(min, nines);
      let stops = /* @__PURE__ */ new Set([max]);
      while (min <= stop && stop <= max) {
        stops.add(stop);
        nines += 1;
        stop = countNines(min, nines);
      }
      stop = countZeros(max + 1, zeros) - 1;
      while (min < stop && stop <= max) {
        stops.add(stop);
        zeros += 1;
        stop = countZeros(max + 1, zeros) - 1;
      }
      stops = [...stops];
      stops.sort(compare);
      return stops;
    }
    function rangeToPattern(start, stop, options) {
      if (start === stop) {
        return { pattern: start, count: [], digits: 0 };
      }
      let zipped = zip(start, stop);
      let digits = zipped.length;
      let pattern = "";
      let count = 0;
      for (let i = 0; i < digits; i++) {
        let [startDigit, stopDigit] = zipped[i];
        if (startDigit === stopDigit) {
          pattern += startDigit;
        } else if (startDigit !== "0" || stopDigit !== "9") {
          pattern += toCharacterClass(startDigit, stopDigit, options);
        } else {
          count++;
        }
      }
      if (count) {
        pattern += options.shorthand === true ? "\\d" : "[0-9]";
      }
      return { pattern, count: [count], digits };
    }
    function splitToPatterns(min, max, tok, options) {
      let ranges = splitToRanges(min, max);
      let tokens = [];
      let start = min;
      let prev;
      for (let i = 0; i < ranges.length; i++) {
        let max2 = ranges[i];
        let obj = rangeToPattern(String(start), String(max2), options);
        let zeros = "";
        if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
          if (prev.count.length > 1) {
            prev.count.pop();
          }
          prev.count.push(obj.count[0]);
          prev.string = prev.pattern + toQuantifier(prev.count);
          start = max2 + 1;
          continue;
        }
        if (tok.isPadded) {
          zeros = padZeros(max2, tok, options);
        }
        obj.string = zeros + obj.pattern + toQuantifier(obj.count);
        tokens.push(obj);
        start = max2 + 1;
        prev = obj;
      }
      return tokens;
    }
    function filterPatterns(arr, comparison, prefix, intersection, options) {
      let result = [];
      for (let ele of arr) {
        let { string } = ele;
        if (!intersection && !contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
        if (intersection && contains(comparison, "string", string)) {
          result.push(prefix + string);
        }
      }
      return result;
    }
    function zip(a, b) {
      let arr = [];
      for (let i = 0; i < a.length; i++)
        arr.push([a[i], b[i]]);
      return arr;
    }
    function compare(a, b) {
      return a > b ? 1 : b > a ? -1 : 0;
    }
    function contains(arr, key, val) {
      return arr.some((ele) => ele[key] === val);
    }
    function countNines(min, len) {
      return Number(String(min).slice(0, -len) + "9".repeat(len));
    }
    function countZeros(integer, zeros) {
      return integer - integer % Math.pow(10, zeros);
    }
    function toQuantifier(digits) {
      let [start = 0, stop = ""] = digits;
      if (stop || start > 1) {
        return `{${start + (stop ? "," + stop : "")}}`;
      }
      return "";
    }
    function toCharacterClass(a, b, options) {
      return `[${a}${b - a === 1 ? "" : "-"}${b}]`;
    }
    function hasPadding(str) {
      return /^-?(0+)\d/.test(str);
    }
    function padZeros(value, tok, options) {
      if (!tok.isPadded) {
        return value;
      }
      let diff = Math.abs(tok.maxLen - String(value).length);
      let relax = options.relaxZeros !== false;
      switch (diff) {
        case 0:
          return "";
        case 1:
          return relax ? "0?" : "0";
        case 2:
          return relax ? "0{0,2}" : "00";
        default: {
          return relax ? `0{0,${diff}}` : `0{${diff}}`;
        }
      }
    }
    toRegexRange.cache = {};
    toRegexRange.clearCache = () => toRegexRange.cache = {};
    module2.exports = toRegexRange;
  }
});

// node_modules/fill-range/index.js
var require_fill_range = __commonJS({
  "node_modules/fill-range/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var toRegexRange = require_to_regex_range();
    var isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    var transform = (toNumber) => {
      return (value) => toNumber === true ? Number(value) : String(value);
    };
    var isValidValue = (value) => {
      return typeof value === "number" || typeof value === "string" && value !== "";
    };
    var isNumber = (num) => Number.isInteger(+num);
    var zeros = (input) => {
      let value = `${input}`;
      let index = -1;
      if (value[0] === "-")
        value = value.slice(1);
      if (value === "0")
        return false;
      while (value[++index] === "0")
        ;
      return index > 0;
    };
    var stringify = (start, end, options) => {
      if (typeof start === "string" || typeof end === "string") {
        return true;
      }
      return options.stringify === true;
    };
    var pad = (input, maxLength, toNumber) => {
      if (maxLength > 0) {
        let dash = input[0] === "-" ? "-" : "";
        if (dash)
          input = input.slice(1);
        input = dash + input.padStart(dash ? maxLength - 1 : maxLength, "0");
      }
      if (toNumber === false) {
        return String(input);
      }
      return input;
    };
    var toMaxLen = (input, maxLength) => {
      let negative = input[0] === "-" ? "-" : "";
      if (negative) {
        input = input.slice(1);
        maxLength--;
      }
      while (input.length < maxLength)
        input = "0" + input;
      return negative ? "-" + input : input;
    };
    var toSequence = (parts, options, maxLen) => {
      parts.negatives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      parts.positives.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      let prefix = options.capture ? "" : "?:";
      let positives = "";
      let negatives = "";
      let result;
      if (parts.positives.length) {
        positives = parts.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
      }
      if (parts.negatives.length) {
        negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
      }
      if (positives && negatives) {
        result = `${positives}|${negatives}`;
      } else {
        result = positives || negatives;
      }
      if (options.wrap) {
        return `(${prefix}${result})`;
      }
      return result;
    };
    var toRange = (a, b, isNumbers, options) => {
      if (isNumbers) {
        return toRegexRange(a, b, { wrap: false, ...options });
      }
      let start = String.fromCharCode(a);
      if (a === b)
        return start;
      let stop = String.fromCharCode(b);
      return `[${start}-${stop}]`;
    };
    var toRegex = (start, end, options) => {
      if (Array.isArray(start)) {
        let wrap = options.wrap === true;
        let prefix = options.capture ? "" : "?:";
        return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
      }
      return toRegexRange(start, end, options);
    };
    var rangeError = (...args) => {
      return new RangeError("Invalid range arguments: " + util.inspect(...args));
    };
    var invalidRange = (start, end, options) => {
      if (options.strictRanges === true)
        throw rangeError([start, end]);
      return [];
    };
    var invalidStep = (step, options) => {
      if (options.strictRanges === true) {
        throw new TypeError(`Expected step "${step}" to be a number`);
      }
      return [];
    };
    var fillNumbers = (start, end, step = 1, options = {}) => {
      let a = Number(start);
      let b = Number(end);
      if (!Number.isInteger(a) || !Number.isInteger(b)) {
        if (options.strictRanges === true)
          throw rangeError([start, end]);
        return [];
      }
      if (a === 0)
        a = 0;
      if (b === 0)
        b = 0;
      let descending = a > b;
      let startString = String(start);
      let endString = String(end);
      let stepString = String(step);
      step = Math.max(Math.abs(step), 1);
      let padded = zeros(startString) || zeros(endString) || zeros(stepString);
      let maxLen = padded ? Math.max(startString.length, endString.length, stepString.length) : 0;
      let toNumber = padded === false && stringify(start, end, options) === false;
      let format = options.transform || transform(toNumber);
      if (options.toRegex && step === 1) {
        return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
      }
      let parts = { negatives: [], positives: [] };
      let push = (num) => parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        if (options.toRegex === true && step > 1) {
          push(a);
        } else {
          range.push(pad(format(a, index), maxLen, toNumber));
        }
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return step > 1 ? toSequence(parts, options, maxLen) : toRegex(range, null, { wrap: false, ...options });
      }
      return range;
    };
    var fillLetters = (start, end, step = 1, options = {}) => {
      if (!isNumber(start) && start.length > 1 || !isNumber(end) && end.length > 1) {
        return invalidRange(start, end, options);
      }
      let format = options.transform || ((val) => String.fromCharCode(val));
      let a = `${start}`.charCodeAt(0);
      let b = `${end}`.charCodeAt(0);
      let descending = a > b;
      let min = Math.min(a, b);
      let max = Math.max(a, b);
      if (options.toRegex && step === 1) {
        return toRange(min, max, false, options);
      }
      let range = [];
      let index = 0;
      while (descending ? a >= b : a <= b) {
        range.push(format(a, index));
        a = descending ? a - step : a + step;
        index++;
      }
      if (options.toRegex === true) {
        return toRegex(range, null, { wrap: false, options });
      }
      return range;
    };
    var fill = (start, end, step, options = {}) => {
      if (end == null && isValidValue(start)) {
        return [start];
      }
      if (!isValidValue(start) || !isValidValue(end)) {
        return invalidRange(start, end, options);
      }
      if (typeof step === "function") {
        return fill(start, end, 1, { transform: step });
      }
      if (isObject(step)) {
        return fill(start, end, 0, step);
      }
      let opts = { ...options };
      if (opts.capture === true)
        opts.wrap = true;
      step = step || opts.step || 1;
      if (!isNumber(step)) {
        if (step != null && !isObject(step))
          return invalidStep(step, opts);
        return fill(start, end, 1, step);
      }
      if (isNumber(start) && isNumber(end)) {
        return fillNumbers(start, end, step, opts);
      }
      return fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
    };
    module2.exports = fill;
  }
});

// node_modules/braces/lib/compile.js
var require_compile = __commonJS({
  "node_modules/braces/lib/compile.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var utils = require_utils3();
    var compile = (ast, options = {}) => {
      const walk = (node, parent = {}) => {
        const invalidBlock = utils.isInvalidBrace(parent);
        const invalidNode = node.invalid === true && options.escapeInvalid === true;
        const invalid = invalidBlock === true || invalidNode === true;
        const prefix = options.escapeInvalid === true ? "\\" : "";
        let output = "";
        if (node.isOpen === true) {
          return prefix + node.value;
        }
        if (node.isClose === true) {
          console.log("node.isClose", prefix, node.value);
          return prefix + node.value;
        }
        if (node.type === "open") {
          return invalid ? prefix + node.value : "(";
        }
        if (node.type === "close") {
          return invalid ? prefix + node.value : ")";
        }
        if (node.type === "comma") {
          return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
        }
        if (node.value) {
          return node.value;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          const range = fill(...args, { ...options, wrap: false, toRegex: true, strictZeros: true });
          if (range.length !== 0) {
            return args.length > 1 && range.length > 1 ? `(${range})` : range;
          }
        }
        if (node.nodes) {
          for (const child of node.nodes) {
            output += walk(child, node);
          }
        }
        return output;
      };
      return walk(ast);
    };
    module2.exports = compile;
  }
});

// node_modules/braces/lib/expand.js
var require_expand = __commonJS({
  "node_modules/braces/lib/expand.js"(exports2, module2) {
    "use strict";
    var fill = require_fill_range();
    var stringify = require_stringify();
    var utils = require_utils3();
    var append = (queue = "", stash = "", enclose = false) => {
      const result = [];
      queue = [].concat(queue);
      stash = [].concat(stash);
      if (!stash.length)
        return queue;
      if (!queue.length) {
        return enclose ? utils.flatten(stash).map((ele) => `{${ele}}`) : stash;
      }
      for (const item of queue) {
        if (Array.isArray(item)) {
          for (const value of item) {
            result.push(append(value, stash, enclose));
          }
        } else {
          for (let ele of stash) {
            if (enclose === true && typeof ele === "string")
              ele = `{${ele}}`;
            result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
          }
        }
      }
      return utils.flatten(result);
    };
    var expand = (ast, options = {}) => {
      const rangeLimit = options.rangeLimit === void 0 ? 1e3 : options.rangeLimit;
      const walk = (node, parent = {}) => {
        node.queue = [];
        let p = parent;
        let q = parent.queue;
        while (p.type !== "brace" && p.type !== "root" && p.parent) {
          p = p.parent;
          q = p.queue;
        }
        if (node.invalid || node.dollar) {
          q.push(append(q.pop(), stringify(node, options)));
          return;
        }
        if (node.type === "brace" && node.invalid !== true && node.nodes.length === 2) {
          q.push(append(q.pop(), ["{}"]));
          return;
        }
        if (node.nodes && node.ranges > 0) {
          const args = utils.reduce(node.nodes);
          if (utils.exceedsLimit(...args, options.step, rangeLimit)) {
            throw new RangeError("expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.");
          }
          let range = fill(...args, options);
          if (range.length === 0) {
            range = stringify(node, options);
          }
          q.push(append(q.pop(), range));
          node.nodes = [];
          return;
        }
        const enclose = utils.encloseBrace(node);
        let queue = node.queue;
        let block = node;
        while (block.type !== "brace" && block.type !== "root" && block.parent) {
          block = block.parent;
          queue = block.queue;
        }
        for (let i = 0; i < node.nodes.length; i++) {
          const child = node.nodes[i];
          if (child.type === "comma" && node.type === "brace") {
            if (i === 1)
              queue.push("");
            queue.push("");
            continue;
          }
          if (child.type === "close") {
            q.push(append(q.pop(), queue, enclose));
            continue;
          }
          if (child.value && child.type !== "open") {
            queue.push(append(queue.pop(), child.value));
            continue;
          }
          if (child.nodes) {
            walk(child, node);
          }
        }
        return queue;
      };
      return utils.flatten(walk(ast));
    };
    module2.exports = expand;
  }
});

// node_modules/braces/lib/constants.js
var require_constants = __commonJS({
  "node_modules/braces/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      MAX_LENGTH: 1e4,
      // Digits
      CHAR_0: "0",
      /* 0 */
      CHAR_9: "9",
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: "A",
      /* A */
      CHAR_LOWERCASE_A: "a",
      /* a */
      CHAR_UPPERCASE_Z: "Z",
      /* Z */
      CHAR_LOWERCASE_Z: "z",
      /* z */
      CHAR_LEFT_PARENTHESES: "(",
      /* ( */
      CHAR_RIGHT_PARENTHESES: ")",
      /* ) */
      CHAR_ASTERISK: "*",
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: "&",
      /* & */
      CHAR_AT: "@",
      /* @ */
      CHAR_BACKSLASH: "\\",
      /* \ */
      CHAR_BACKTICK: "`",
      /* ` */
      CHAR_CARRIAGE_RETURN: "\r",
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: "^",
      /* ^ */
      CHAR_COLON: ":",
      /* : */
      CHAR_COMMA: ",",
      /* , */
      CHAR_DOLLAR: "$",
      /* . */
      CHAR_DOT: ".",
      /* . */
      CHAR_DOUBLE_QUOTE: '"',
      /* " */
      CHAR_EQUAL: "=",
      /* = */
      CHAR_EXCLAMATION_MARK: "!",
      /* ! */
      CHAR_FORM_FEED: "\f",
      /* \f */
      CHAR_FORWARD_SLASH: "/",
      /* / */
      CHAR_HASH: "#",
      /* # */
      CHAR_HYPHEN_MINUS: "-",
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: "<",
      /* < */
      CHAR_LEFT_CURLY_BRACE: "{",
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: "[",
      /* [ */
      CHAR_LINE_FEED: "\n",
      /* \n */
      CHAR_NO_BREAK_SPACE: "\xA0",
      /* \u00A0 */
      CHAR_PERCENT: "%",
      /* % */
      CHAR_PLUS: "+",
      /* + */
      CHAR_QUESTION_MARK: "?",
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: ">",
      /* > */
      CHAR_RIGHT_CURLY_BRACE: "}",
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: "]",
      /* ] */
      CHAR_SEMICOLON: ";",
      /* ; */
      CHAR_SINGLE_QUOTE: "'",
      /* ' */
      CHAR_SPACE: " ",
      /*   */
      CHAR_TAB: "	",
      /* \t */
      CHAR_UNDERSCORE: "_",
      /* _ */
      CHAR_VERTICAL_LINE: "|",
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: "\uFEFF"
      /* \uFEFF */
    };
  }
});

// node_modules/braces/lib/parse.js
var require_parse = __commonJS({
  "node_modules/braces/lib/parse.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var {
      MAX_LENGTH,
      CHAR_BACKSLASH,
      /* \ */
      CHAR_BACKTICK,
      /* ` */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_RIGHT_SQUARE_BRACKET,
      /* ] */
      CHAR_DOUBLE_QUOTE,
      /* " */
      CHAR_SINGLE_QUOTE,
      /* ' */
      CHAR_NO_BREAK_SPACE,
      CHAR_ZERO_WIDTH_NOBREAK_SPACE
    } = require_constants();
    var parse = (input, options = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      const opts = options || {};
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      if (input.length > max) {
        throw new SyntaxError(`Input length (${input.length}), exceeds max characters (${max})`);
      }
      const ast = { type: "root", input, nodes: [] };
      const stack = [ast];
      let block = ast;
      let prev = ast;
      let brackets = 0;
      const length = input.length;
      let index = 0;
      let depth = 0;
      let value;
      const advance = () => input[index++];
      const push = (node) => {
        if (node.type === "text" && prev.type === "dot") {
          prev.type = "text";
        }
        if (prev && prev.type === "text" && node.type === "text") {
          prev.value += node.value;
          return;
        }
        block.nodes.push(node);
        node.parent = block;
        node.prev = prev;
        prev = node;
        return node;
      };
      push({ type: "bos" });
      while (index < length) {
        block = stack[stack.length - 1];
        value = advance();
        if (value === CHAR_ZERO_WIDTH_NOBREAK_SPACE || value === CHAR_NO_BREAK_SPACE) {
          continue;
        }
        if (value === CHAR_BACKSLASH) {
          push({ type: "text", value: (options.keepEscaping ? value : "") + advance() });
          continue;
        }
        if (value === CHAR_RIGHT_SQUARE_BRACKET) {
          push({ type: "text", value: "\\" + value });
          continue;
        }
        if (value === CHAR_LEFT_SQUARE_BRACKET) {
          brackets++;
          let next;
          while (index < length && (next = advance())) {
            value += next;
            if (next === CHAR_LEFT_SQUARE_BRACKET) {
              brackets++;
              continue;
            }
            if (next === CHAR_BACKSLASH) {
              value += advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              brackets--;
              if (brackets === 0) {
                break;
              }
            }
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_PARENTHESES) {
          block = push({ type: "paren", nodes: [] });
          stack.push(block);
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_RIGHT_PARENTHESES) {
          if (block.type !== "paren") {
            push({ type: "text", value });
            continue;
          }
          block = stack.pop();
          push({ type: "text", value });
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_DOUBLE_QUOTE || value === CHAR_SINGLE_QUOTE || value === CHAR_BACKTICK) {
          const open = value;
          let next;
          if (options.keepQuotes !== true) {
            value = "";
          }
          while (index < length && (next = advance())) {
            if (next === CHAR_BACKSLASH) {
              value += next + advance();
              continue;
            }
            if (next === open) {
              if (options.keepQuotes === true)
                value += next;
              break;
            }
            value += next;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === CHAR_LEFT_CURLY_BRACE) {
          depth++;
          const dollar = prev.value && prev.value.slice(-1) === "$" || block.dollar === true;
          const brace = {
            type: "brace",
            open: true,
            close: false,
            dollar,
            depth,
            commas: 0,
            ranges: 0,
            nodes: []
          };
          block = push(brace);
          stack.push(block);
          push({ type: "open", value });
          continue;
        }
        if (value === CHAR_RIGHT_CURLY_BRACE) {
          if (block.type !== "brace") {
            push({ type: "text", value });
            continue;
          }
          const type = "close";
          block = stack.pop();
          block.close = true;
          push({ type, value });
          depth--;
          block = stack[stack.length - 1];
          continue;
        }
        if (value === CHAR_COMMA && depth > 0) {
          if (block.ranges > 0) {
            block.ranges = 0;
            const open = block.nodes.shift();
            block.nodes = [open, { type: "text", value: stringify(block) }];
          }
          push({ type: "comma", value });
          block.commas++;
          continue;
        }
        if (value === CHAR_DOT && depth > 0 && block.commas === 0) {
          const siblings = block.nodes;
          if (depth === 0 || siblings.length === 0) {
            push({ type: "text", value });
            continue;
          }
          if (prev.type === "dot") {
            block.range = [];
            prev.value += value;
            prev.type = "range";
            if (block.nodes.length !== 3 && block.nodes.length !== 5) {
              block.invalid = true;
              block.ranges = 0;
              prev.type = "text";
              continue;
            }
            block.ranges++;
            block.args = [];
            continue;
          }
          if (prev.type === "range") {
            siblings.pop();
            const before = siblings[siblings.length - 1];
            before.value += prev.value + value;
            prev = before;
            block.ranges--;
            continue;
          }
          push({ type: "dot", value });
          continue;
        }
        push({ type: "text", value });
      }
      do {
        block = stack.pop();
        if (block.type !== "root") {
          block.nodes.forEach((node) => {
            if (!node.nodes) {
              if (node.type === "open")
                node.isOpen = true;
              if (node.type === "close")
                node.isClose = true;
              if (!node.nodes)
                node.type = "text";
              node.invalid = true;
            }
          });
          const parent = stack[stack.length - 1];
          const index2 = parent.nodes.indexOf(block);
          parent.nodes.splice(index2, 1, ...block.nodes);
        }
      } while (stack.length > 0);
      push({ type: "eos" });
      return ast;
    };
    module2.exports = parse;
  }
});

// node_modules/braces/index.js
var require_braces = __commonJS({
  "node_modules/braces/index.js"(exports2, module2) {
    "use strict";
    var stringify = require_stringify();
    var compile = require_compile();
    var expand = require_expand();
    var parse = require_parse();
    var braces = (input, options = {}) => {
      let output = [];
      if (Array.isArray(input)) {
        for (const pattern of input) {
          const result = braces.create(pattern, options);
          if (Array.isArray(result)) {
            output.push(...result);
          } else {
            output.push(result);
          }
        }
      } else {
        output = [].concat(braces.create(input, options));
      }
      if (options && options.expand === true && options.nodupes === true) {
        output = [...new Set(output)];
      }
      return output;
    };
    braces.parse = (input, options = {}) => parse(input, options);
    braces.stringify = (input, options = {}) => {
      if (typeof input === "string") {
        return stringify(braces.parse(input, options), options);
      }
      return stringify(input, options);
    };
    braces.compile = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      return compile(input, options);
    };
    braces.expand = (input, options = {}) => {
      if (typeof input === "string") {
        input = braces.parse(input, options);
      }
      let result = expand(input, options);
      if (options.noempty === true) {
        result = result.filter(Boolean);
      }
      if (options.nodupes === true) {
        result = [...new Set(result)];
      }
      return result;
    };
    braces.create = (input, options = {}) => {
      if (input === "" || input.length < 3) {
        return [input];
      }
      return options.expand !== true ? braces.compile(input, options) : braces.expand(input, options);
    };
    module2.exports = braces;
  }
});

// node_modules/picomatch/lib/constants.js
var require_constants2 = __commonJS({
  "node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var path4 = require("path");
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      SEP: path4.sep,
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// node_modules/picomatch/lib/utils.js
var require_utils4 = __commonJS({
  "node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var path4 = require("path");
    var win32 = process.platform === "win32";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants2();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.supportsLookbehinds = () => {
      const segs = process.version.slice(1).split(".").map(Number);
      if (segs.length === 3 && segs[0] >= 9 || segs[0] === 8 && segs[1] >= 10) {
        return true;
      }
      return false;
    };
    exports2.isWindows = (options) => {
      if (options && typeof options.windows === "boolean") {
        return options.windows;
      }
      return win32 === true || path4.sep === "\\";
    };
    exports2.escapeLast = (input, char, lastIdx) => {
      const idx = input.lastIndexOf(char, lastIdx);
      if (idx === -1)
        return input;
      if (input[idx - 1] === "\\")
        return exports2.escapeLast(input, char, idx - 1);
      return `${input.slice(0, idx)}\\${input.slice(idx)}`;
    };
    exports2.removePrefix = (input, state = {}) => {
      let output = input;
      if (output.startsWith("./")) {
        output = output.slice(2);
        state.prefix = "./";
      }
      return output;
    };
    exports2.wrapOutput = (input, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output = `${prepend}(?:${input})${append}`;
      if (state.negated === true) {
        output = `(?:^(?!${output}).*$)`;
      }
      return output;
    };
  }
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils4();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants2();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input, options) => {
      const opts = options || {};
      const length = input.length - 1;
      const scanToEnd = opts.parts === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true)
            continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  code = advance();
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES) {
                  isGlob = token.isGlob = true;
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK)
            isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_LEFT_PARENTHESES) {
                backslashes = token.backslashes = true;
                code = advance();
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob)
          glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n = prevIndex ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value = input.slice(n, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (idx !== 0 || value !== "") {
            parts.push(value);
          }
          prevIndex = i;
        }
        if (prevIndex && prevIndex + 1 < input.length) {
          const value = input.slice(prevIndex + 1);
          parts.push(value);
          if (opts.tokens) {
            tokens[tokens.length - 1].value = value;
            depth(tokens[tokens.length - 1]);
            state.maxDepth += tokens[tokens.length - 1].depth;
          }
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// node_modules/picomatch/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants2();
    var utils = require_utils4();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const a = values[i];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var getStarExtglobSequenceOutput = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      for (const branch of branches) {
        const safeOutput = getStarExtglobSequenceOutput(branch);
        if (safeOutput) {
          return { risky: true, safeOutput };
        }
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      return { risky: false };
    };
    var parse = (input, options) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected a string");
      }
      input = REPLACEMENTS[input] || input;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const win32 = utils.isWindows(options);
      const PLATFORM_CHARS = constants.globChars(win32);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input = utils.removePrefix(input, state);
      len = input.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input[state.index + n];
      const advance = state.advance = () => input[++state.index] || "";
      const remaining = () => input.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output)
          append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.value += tok.value;
          prev.output = (prev.output || "") + tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input.slice(token.startIndex, state.index + 1);
        const body = input.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input)) {
        let backslashes = false;
        let output = input.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output = output.replace(/\\/g, "");
          } else {
            output = output.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output === input && opts.contains === true) {
          state.output = input;
          return state;
        }
        state.output = utils.wrapOutput(output, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output = "|";
          }
          push({ type: "comma", value, output });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".")
              prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output = value;
            if (next === "<" && !utils.supportsLookbehinds()) {
              throw new Error("Node.js v10 or higher is required for regex lookbehinds");
            }
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output = `\\${value}`;
            }
            push({ type: "text", value, output });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && eos()) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true)
          throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input = REPLACEMENTS[input] || input;
      const win32 = utils.isWindows(options);
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(win32);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true)
          return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match)
              return;
            const source2 = create(match[1]);
            if (!source2)
              return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output = utils.removePrefix(input, state);
      let source = create(output);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse;
  }
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var path4 = require("path");
    var scan = require_scan();
    var parse = require_parse2();
    var utils = require_utils4();
    var constants = require_constants2();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input) => picomatch(input, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2)
              return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = utils.isWindows(options);
      const regex = isState ? picomatch.compileRe(glob, options) : picomatch.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input, returnObject = false) => {
        const { isMatch, match, output } = picomatch.test(input, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input, output, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch.test = (input, regex, options, { glob, posix } = {}) => {
      if (typeof input !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input === glob;
      let output = match && format ? format(input) : input;
      if (match === false) {
        output = format ? format(input) : input;
        match = output === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch.matchBase(input, regex, options, posix);
        } else {
          match = regex.exec(output);
        }
      }
      return { isMatch: Boolean(match), match, output };
    };
    picomatch.matchBase = (input, glob, options, posix = utils.isWindows(options)) => {
      const regex = glob instanceof RegExp ? glob : picomatch.makeRe(glob, options);
      return regex.test(path4.basename(input));
    };
    picomatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    picomatch.parse = (pattern, options) => {
      if (Array.isArray(pattern))
        return pattern.map((p) => picomatch.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch.scan = (input, options) => scan(input, options);
    picomatch.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch.makeRe = (input, options = {}, returnOutput = false, returnState = false) => {
      if (!input || typeof input !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
        parsed.output = parse.fastpaths(input, options);
      }
      if (!parsed.output) {
        parsed = parse(input, options);
      }
      return picomatch.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true)
          throw err;
        return /$^/;
      }
    };
    picomatch.constants = constants;
    module2.exports = picomatch;
  }
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_picomatch();
  }
});

// node_modules/micromatch/index.js
var require_micromatch = __commonJS({
  "node_modules/micromatch/index.js"(exports2, module2) {
    "use strict";
    var util = require("util");
    var braces = require_braces();
    var picomatch = require_picomatch2();
    var utils = require_utils4();
    var isEmptyString = (v) => v === "" || v === "./";
    var hasBraces = (v) => {
      const index = v.indexOf("{");
      return index > -1 && v.indexOf("}", index) > -1;
    };
    var micromatch = (list, patterns, options) => {
      patterns = [].concat(patterns);
      list = [].concat(list);
      let omit = /* @__PURE__ */ new Set();
      let keep = /* @__PURE__ */ new Set();
      let items = /* @__PURE__ */ new Set();
      let negatives = 0;
      let onResult = (state) => {
        items.add(state.output);
        if (options && options.onResult) {
          options.onResult(state);
        }
      };
      for (let i = 0; i < patterns.length; i++) {
        let isMatch = picomatch(String(patterns[i]), { ...options, onResult }, true);
        let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
        if (negated)
          negatives++;
        for (let item of list) {
          let matched = isMatch(item, true);
          let match = negated ? !matched.isMatch : matched.isMatch;
          if (!match)
            continue;
          if (negated) {
            omit.add(matched.output);
          } else {
            omit.delete(matched.output);
            keep.add(matched.output);
          }
        }
      }
      let result = negatives === patterns.length ? [...items] : [...keep];
      let matches = result.filter((item) => !omit.has(item));
      if (options && matches.length === 0) {
        if (options.failglob === true) {
          throw new Error(`No matches found for "${patterns.join(", ")}"`);
        }
        if (options.nonull === true || options.nullglob === true) {
          return options.unescape ? patterns.map((p) => p.replace(/\\/g, "")) : patterns;
        }
      }
      return matches;
    };
    micromatch.match = micromatch;
    micromatch.matcher = (pattern, options) => picomatch(pattern, options);
    micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);
    micromatch.any = micromatch.isMatch;
    micromatch.not = (list, patterns, options = {}) => {
      patterns = [].concat(patterns).map(String);
      let result = /* @__PURE__ */ new Set();
      let items = [];
      let onResult = (state) => {
        if (options.onResult)
          options.onResult(state);
        items.push(state.output);
      };
      let matches = new Set(micromatch(list, patterns, { ...options, onResult }));
      for (let item of items) {
        if (!matches.has(item)) {
          result.add(item);
        }
      }
      return [...result];
    };
    micromatch.contains = (str, pattern, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      if (Array.isArray(pattern)) {
        return pattern.some((p) => micromatch.contains(str, p, options));
      }
      if (typeof pattern === "string") {
        if (isEmptyString(str) || isEmptyString(pattern)) {
          return false;
        }
        if (str.includes(pattern) || str.startsWith("./") && str.slice(2).includes(pattern)) {
          return true;
        }
      }
      return micromatch.isMatch(str, pattern, { ...options, contains: true });
    };
    micromatch.matchKeys = (obj, patterns, options) => {
      if (!utils.isObject(obj)) {
        throw new TypeError("Expected the first argument to be an object");
      }
      let keys = micromatch(Object.keys(obj), patterns, options);
      let res = {};
      for (let key of keys)
        res[key] = obj[key];
      return res;
    };
    micromatch.some = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (items.some((item) => isMatch(item))) {
          return true;
        }
      }
      return false;
    };
    micromatch.every = (list, patterns, options) => {
      let items = [].concat(list);
      for (let pattern of [].concat(patterns)) {
        let isMatch = picomatch(String(pattern), options);
        if (!items.every((item) => isMatch(item))) {
          return false;
        }
      }
      return true;
    };
    micromatch.all = (str, patterns, options) => {
      if (typeof str !== "string") {
        throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
      }
      return [].concat(patterns).every((p) => picomatch(p, options)(str));
    };
    micromatch.capture = (glob, input, options) => {
      let posix = utils.isWindows(options);
      let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
      let match = regex.exec(posix ? utils.toPosixSlashes(input) : input);
      if (match) {
        return match.slice(1).map((v) => v === void 0 ? "" : v);
      }
    };
    micromatch.makeRe = (...args) => picomatch.makeRe(...args);
    micromatch.scan = (...args) => picomatch.scan(...args);
    micromatch.parse = (patterns, options) => {
      let res = [];
      for (let pattern of [].concat(patterns || [])) {
        for (let str of braces(String(pattern), options)) {
          res.push(picomatch.parse(str, options));
        }
      }
      return res;
    };
    micromatch.braces = (pattern, options) => {
      if (typeof pattern !== "string")
        throw new TypeError("Expected a string");
      if (options && options.nobrace === true || !hasBraces(pattern)) {
        return [pattern];
      }
      return braces(pattern, options);
    };
    micromatch.braceExpand = (pattern, options) => {
      if (typeof pattern !== "string")
        throw new TypeError("Expected a string");
      return micromatch.braces(pattern, { ...options, expand: true });
    };
    micromatch.hasBraces = hasBraces;
    module2.exports = micromatch;
  }
});

// node_modules/fast-glob/out/utils/pattern.js
var require_pattern = __commonJS({
  "node_modules/fast-glob/out/utils/pattern.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAbsolute = exports2.partitionAbsoluteAndRelative = exports2.removeDuplicateSlashes = exports2.matchAny = exports2.convertPatternsToRe = exports2.makeRe = exports2.getPatternParts = exports2.expandBraceExpansion = exports2.expandPatternsWithBraceExpansion = exports2.isAffectDepthOfReadingPattern = exports2.endsWithSlashGlobStar = exports2.hasGlobStar = exports2.getBaseDirectory = exports2.isPatternRelatedToParentDirectory = exports2.getPatternsOutsideCurrentDirectory = exports2.getPatternsInsideCurrentDirectory = exports2.getPositivePatterns = exports2.getNegativePatterns = exports2.isPositivePattern = exports2.isNegativePattern = exports2.convertToNegativePattern = exports2.convertToPositivePattern = exports2.isDynamicPattern = exports2.isStaticPattern = void 0;
    var path4 = require("path");
    var globParent = require_glob_parent();
    var micromatch = require_micromatch();
    var GLOBSTAR = "**";
    var ESCAPE_SYMBOL = "\\";
    var COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
    var REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
    var REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
    var GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
    var BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;
    var DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;
    function isStaticPattern(pattern, options = {}) {
      return !isDynamicPattern(pattern, options);
    }
    exports2.isStaticPattern = isStaticPattern;
    function isDynamicPattern(pattern, options = {}) {
      if (pattern === "") {
        return false;
      }
      if (options.caseSensitiveMatch === false || pattern.includes(ESCAPE_SYMBOL)) {
        return true;
      }
      if (COMMON_GLOB_SYMBOLS_RE.test(pattern) || REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(pattern) || REGEX_GROUP_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(pattern)) {
        return true;
      }
      if (options.braceExpansion !== false && hasBraceExpansion(pattern)) {
        return true;
      }
      return false;
    }
    exports2.isDynamicPattern = isDynamicPattern;
    function hasBraceExpansion(pattern) {
      const openingBraceIndex = pattern.indexOf("{");
      if (openingBraceIndex === -1) {
        return false;
      }
      const closingBraceIndex = pattern.indexOf("}", openingBraceIndex + 1);
      if (closingBraceIndex === -1) {
        return false;
      }
      const braceContent = pattern.slice(openingBraceIndex, closingBraceIndex);
      return BRACE_EXPANSION_SEPARATORS_RE.test(braceContent);
    }
    function convertToPositivePattern(pattern) {
      return isNegativePattern(pattern) ? pattern.slice(1) : pattern;
    }
    exports2.convertToPositivePattern = convertToPositivePattern;
    function convertToNegativePattern(pattern) {
      return "!" + pattern;
    }
    exports2.convertToNegativePattern = convertToNegativePattern;
    function isNegativePattern(pattern) {
      return pattern.startsWith("!") && pattern[1] !== "(";
    }
    exports2.isNegativePattern = isNegativePattern;
    function isPositivePattern(pattern) {
      return !isNegativePattern(pattern);
    }
    exports2.isPositivePattern = isPositivePattern;
    function getNegativePatterns(patterns) {
      return patterns.filter(isNegativePattern);
    }
    exports2.getNegativePatterns = getNegativePatterns;
    function getPositivePatterns(patterns) {
      return patterns.filter(isPositivePattern);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getPatternsInsideCurrentDirectory(patterns) {
      return patterns.filter((pattern) => !isPatternRelatedToParentDirectory(pattern));
    }
    exports2.getPatternsInsideCurrentDirectory = getPatternsInsideCurrentDirectory;
    function getPatternsOutsideCurrentDirectory(patterns) {
      return patterns.filter(isPatternRelatedToParentDirectory);
    }
    exports2.getPatternsOutsideCurrentDirectory = getPatternsOutsideCurrentDirectory;
    function isPatternRelatedToParentDirectory(pattern) {
      return pattern.startsWith("..") || pattern.startsWith("./..");
    }
    exports2.isPatternRelatedToParentDirectory = isPatternRelatedToParentDirectory;
    function getBaseDirectory(pattern) {
      return globParent(pattern, { flipBackslashes: false });
    }
    exports2.getBaseDirectory = getBaseDirectory;
    function hasGlobStar(pattern) {
      return pattern.includes(GLOBSTAR);
    }
    exports2.hasGlobStar = hasGlobStar;
    function endsWithSlashGlobStar(pattern) {
      return pattern.endsWith("/" + GLOBSTAR);
    }
    exports2.endsWithSlashGlobStar = endsWithSlashGlobStar;
    function isAffectDepthOfReadingPattern(pattern) {
      const basename2 = path4.basename(pattern);
      return endsWithSlashGlobStar(pattern) || isStaticPattern(basename2);
    }
    exports2.isAffectDepthOfReadingPattern = isAffectDepthOfReadingPattern;
    function expandPatternsWithBraceExpansion(patterns) {
      return patterns.reduce((collection, pattern) => {
        return collection.concat(expandBraceExpansion(pattern));
      }, []);
    }
    exports2.expandPatternsWithBraceExpansion = expandPatternsWithBraceExpansion;
    function expandBraceExpansion(pattern) {
      const patterns = micromatch.braces(pattern, { expand: true, nodupes: true, keepEscaping: true });
      patterns.sort((a, b) => a.length - b.length);
      return patterns.filter((pattern2) => pattern2 !== "");
    }
    exports2.expandBraceExpansion = expandBraceExpansion;
    function getPatternParts(pattern, options) {
      let { parts } = micromatch.scan(pattern, Object.assign(Object.assign({}, options), { parts: true }));
      if (parts.length === 0) {
        parts = [pattern];
      }
      if (parts[0].startsWith("/")) {
        parts[0] = parts[0].slice(1);
        parts.unshift("");
      }
      return parts;
    }
    exports2.getPatternParts = getPatternParts;
    function makeRe(pattern, options) {
      return micromatch.makeRe(pattern, options);
    }
    exports2.makeRe = makeRe;
    function convertPatternsToRe(patterns, options) {
      return patterns.map((pattern) => makeRe(pattern, options));
    }
    exports2.convertPatternsToRe = convertPatternsToRe;
    function matchAny(entry, patternsRe) {
      return patternsRe.some((patternRe) => patternRe.test(entry));
    }
    exports2.matchAny = matchAny;
    function removeDuplicateSlashes(pattern) {
      return pattern.replace(DOUBLE_SLASH_RE, "/");
    }
    exports2.removeDuplicateSlashes = removeDuplicateSlashes;
    function partitionAbsoluteAndRelative(patterns) {
      const absolute = [];
      const relative2 = [];
      for (const pattern of patterns) {
        if (isAbsolute(pattern)) {
          absolute.push(pattern);
        } else {
          relative2.push(pattern);
        }
      }
      return [absolute, relative2];
    }
    exports2.partitionAbsoluteAndRelative = partitionAbsoluteAndRelative;
    function isAbsolute(pattern) {
      return path4.isAbsolute(pattern);
    }
    exports2.isAbsolute = isAbsolute;
  }
});

// node_modules/merge2/index.js
var require_merge2 = __commonJS({
  "node_modules/merge2/index.js"(exports2, module2) {
    "use strict";
    var Stream = require("stream");
    var PassThrough = Stream.PassThrough;
    var slice = Array.prototype.slice;
    module2.exports = merge2;
    function merge2() {
      const streamsQueue = [];
      const args = slice.call(arguments);
      let merging = false;
      let options = args[args.length - 1];
      if (options && !Array.isArray(options) && options.pipe == null) {
        args.pop();
      } else {
        options = {};
      }
      const doEnd = options.end !== false;
      const doPipeError = options.pipeError === true;
      if (options.objectMode == null) {
        options.objectMode = true;
      }
      if (options.highWaterMark == null) {
        options.highWaterMark = 64 * 1024;
      }
      const mergedStream = PassThrough(options);
      function addStream() {
        for (let i = 0, len = arguments.length; i < len; i++) {
          streamsQueue.push(pauseStreams(arguments[i], options));
        }
        mergeStream();
        return this;
      }
      function mergeStream() {
        if (merging) {
          return;
        }
        merging = true;
        let streams = streamsQueue.shift();
        if (!streams) {
          process.nextTick(endStream);
          return;
        }
        if (!Array.isArray(streams)) {
          streams = [streams];
        }
        let pipesCount = streams.length + 1;
        function next() {
          if (--pipesCount > 0) {
            return;
          }
          merging = false;
          mergeStream();
        }
        function pipe(stream) {
          function onend() {
            stream.removeListener("merge2UnpipeEnd", onend);
            stream.removeListener("end", onend);
            if (doPipeError) {
              stream.removeListener("error", onerror);
            }
            next();
          }
          function onerror(err) {
            mergedStream.emit("error", err);
          }
          if (stream._readableState.endEmitted) {
            return next();
          }
          stream.on("merge2UnpipeEnd", onend);
          stream.on("end", onend);
          if (doPipeError) {
            stream.on("error", onerror);
          }
          stream.pipe(mergedStream, { end: false });
          stream.resume();
        }
        for (let i = 0; i < streams.length; i++) {
          pipe(streams[i]);
        }
        next();
      }
      function endStream() {
        merging = false;
        mergedStream.emit("queueDrain");
        if (doEnd) {
          mergedStream.end();
        }
      }
      mergedStream.setMaxListeners(0);
      mergedStream.add = addStream;
      mergedStream.on("unpipe", function(stream) {
        stream.emit("merge2UnpipeEnd");
      });
      if (args.length) {
        addStream.apply(null, args);
      }
      return mergedStream;
    }
    function pauseStreams(streams, options) {
      if (!Array.isArray(streams)) {
        if (!streams._readableState && streams.pipe) {
          streams = streams.pipe(PassThrough(options));
        }
        if (!streams._readableState || !streams.pause || !streams.pipe) {
          throw new Error("Only readable stream can be merged.");
        }
        streams.pause();
      } else {
        for (let i = 0, len = streams.length; i < len; i++) {
          streams[i] = pauseStreams(streams[i], options);
        }
      }
      return streams;
    }
  }
});

// node_modules/fast-glob/out/utils/stream.js
var require_stream = __commonJS({
  "node_modules/fast-glob/out/utils/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.merge = void 0;
    var merge2 = require_merge2();
    function merge(streams) {
      const mergedStream = merge2(streams);
      streams.forEach((stream) => {
        stream.once("error", (error) => mergedStream.emit("error", error));
      });
      mergedStream.once("close", () => propagateCloseEventToSources(streams));
      mergedStream.once("end", () => propagateCloseEventToSources(streams));
      return mergedStream;
    }
    exports2.merge = merge;
    function propagateCloseEventToSources(streams) {
      streams.forEach((stream) => stream.emit("close"));
    }
  }
});

// node_modules/fast-glob/out/utils/string.js
var require_string2 = __commonJS({
  "node_modules/fast-glob/out/utils/string.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEmpty = exports2.isString = void 0;
    function isString(input) {
      return typeof input === "string";
    }
    exports2.isString = isString;
    function isEmpty(input) {
      return input === "";
    }
    exports2.isEmpty = isEmpty;
  }
});

// node_modules/fast-glob/out/utils/index.js
var require_utils5 = __commonJS({
  "node_modules/fast-glob/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.string = exports2.stream = exports2.pattern = exports2.path = exports2.fs = exports2.errno = exports2.array = void 0;
    var array = require_array3();
    exports2.array = array;
    var errno = require_errno();
    exports2.errno = errno;
    var fs3 = require_fs();
    exports2.fs = fs3;
    var path4 = require_path();
    exports2.path = path4;
    var pattern = require_pattern();
    exports2.pattern = pattern;
    var stream = require_stream();
    exports2.stream = stream;
    var string = require_string2();
    exports2.string = string;
  }
});

// node_modules/fast-glob/out/managers/tasks.js
var require_tasks = __commonJS({
  "node_modules/fast-glob/out/managers/tasks.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.convertPatternGroupToTask = exports2.convertPatternGroupsToTasks = exports2.groupPatternsByBaseDirectory = exports2.getNegativePatternsAsPositive = exports2.getPositivePatterns = exports2.convertPatternsToTasks = exports2.generate = void 0;
    var utils = require_utils5();
    function generate(input, settings) {
      const patterns = processPatterns(input, settings);
      const ignore = processPatterns(settings.ignore, settings);
      const positivePatterns = getPositivePatterns(patterns);
      const negativePatterns = getNegativePatternsAsPositive(patterns, ignore);
      const staticPatterns = positivePatterns.filter((pattern) => utils.pattern.isStaticPattern(pattern, settings));
      const dynamicPatterns = positivePatterns.filter((pattern) => utils.pattern.isDynamicPattern(pattern, settings));
      const staticTasks = convertPatternsToTasks(
        staticPatterns,
        negativePatterns,
        /* dynamic */
        false
      );
      const dynamicTasks = convertPatternsToTasks(
        dynamicPatterns,
        negativePatterns,
        /* dynamic */
        true
      );
      return staticTasks.concat(dynamicTasks);
    }
    exports2.generate = generate;
    function processPatterns(input, settings) {
      let patterns = input;
      if (settings.braceExpansion) {
        patterns = utils.pattern.expandPatternsWithBraceExpansion(patterns);
      }
      if (settings.baseNameMatch) {
        patterns = patterns.map((pattern) => pattern.includes("/") ? pattern : `**/${pattern}`);
      }
      return patterns.map((pattern) => utils.pattern.removeDuplicateSlashes(pattern));
    }
    function convertPatternsToTasks(positive, negative, dynamic) {
      const tasks = [];
      const patternsOutsideCurrentDirectory = utils.pattern.getPatternsOutsideCurrentDirectory(positive);
      const patternsInsideCurrentDirectory = utils.pattern.getPatternsInsideCurrentDirectory(positive);
      const outsideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsOutsideCurrentDirectory);
      const insideCurrentDirectoryGroup = groupPatternsByBaseDirectory(patternsInsideCurrentDirectory);
      tasks.push(...convertPatternGroupsToTasks(outsideCurrentDirectoryGroup, negative, dynamic));
      if ("." in insideCurrentDirectoryGroup) {
        tasks.push(convertPatternGroupToTask(".", patternsInsideCurrentDirectory, negative, dynamic));
      } else {
        tasks.push(...convertPatternGroupsToTasks(insideCurrentDirectoryGroup, negative, dynamic));
      }
      return tasks;
    }
    exports2.convertPatternsToTasks = convertPatternsToTasks;
    function getPositivePatterns(patterns) {
      return utils.pattern.getPositivePatterns(patterns);
    }
    exports2.getPositivePatterns = getPositivePatterns;
    function getNegativePatternsAsPositive(patterns, ignore) {
      const negative = utils.pattern.getNegativePatterns(patterns).concat(ignore);
      const positive = negative.map(utils.pattern.convertToPositivePattern);
      return positive;
    }
    exports2.getNegativePatternsAsPositive = getNegativePatternsAsPositive;
    function groupPatternsByBaseDirectory(patterns) {
      const group = {};
      return patterns.reduce((collection, pattern) => {
        const base = utils.pattern.getBaseDirectory(pattern);
        if (base in collection) {
          collection[base].push(pattern);
        } else {
          collection[base] = [pattern];
        }
        return collection;
      }, group);
    }
    exports2.groupPatternsByBaseDirectory = groupPatternsByBaseDirectory;
    function convertPatternGroupsToTasks(positive, negative, dynamic) {
      return Object.keys(positive).map((base) => {
        return convertPatternGroupToTask(base, positive[base], negative, dynamic);
      });
    }
    exports2.convertPatternGroupsToTasks = convertPatternGroupsToTasks;
    function convertPatternGroupToTask(base, positive, negative, dynamic) {
      return {
        dynamic,
        positive,
        negative,
        base,
        patterns: [].concat(positive, negative.map(utils.pattern.convertToNegativePattern))
      };
    }
    exports2.convertPatternGroupToTask = convertPatternGroupToTask;
  }
});

// node_modules/@nodelib/fs.stat/out/providers/async.js
var require_async = __commonJS({
  "node_modules/@nodelib/fs.stat/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read(path4, settings, callback) {
      settings.fs.lstat(path4, (lstatError, lstat) => {
        if (lstatError !== null) {
          callFailureCallback(callback, lstatError);
          return;
        }
        if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
          callSuccessCallback(callback, lstat);
          return;
        }
        settings.fs.stat(path4, (statError, stat) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              callFailureCallback(callback, statError);
              return;
            }
            callSuccessCallback(callback, lstat);
            return;
          }
          if (settings.markSymbolicLink) {
            stat.isSymbolicLink = () => true;
          }
          callSuccessCallback(callback, stat);
        });
      });
    }
    exports2.read = read;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// node_modules/@nodelib/fs.stat/out/providers/sync.js
var require_sync = __commonJS({
  "node_modules/@nodelib/fs.stat/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    function read(path4, settings) {
      const lstat = settings.fs.lstatSync(path4);
      if (!lstat.isSymbolicLink() || !settings.followSymbolicLink) {
        return lstat;
      }
      try {
        const stat = settings.fs.statSync(path4);
        if (settings.markSymbolicLink) {
          stat.isSymbolicLink = () => true;
        }
        return stat;
      } catch (error) {
        if (!settings.throwErrorOnBrokenSymbolicLink) {
          return lstat;
        }
        throw error;
      }
    }
    exports2.read = read;
  }
});

// node_modules/@nodelib/fs.stat/out/adapters/fs.js
var require_fs2 = __commonJS({
  "node_modules/@nodelib/fs.stat/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      stat: fs3.stat,
      lstatSync: fs3.lstatSync,
      statSync: fs3.statSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// node_modules/@nodelib/fs.stat/out/settings.js
var require_settings = __commonJS({
  "node_modules/@nodelib/fs.stat/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fs3 = require_fs2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLink = this._getValue(this._options.followSymbolicLink, true);
        this.fs = fs3.createFileSystemAdapter(this._options.fs);
        this.markSymbolicLink = this._getValue(this._options.markSymbolicLink, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// node_modules/@nodelib/fs.stat/out/index.js
var require_out = __commonJS({
  "node_modules/@nodelib/fs.stat/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.statSync = exports2.stat = exports2.Settings = void 0;
    var async = require_async();
    var sync = require_sync();
    var settings_1 = require_settings();
    exports2.Settings = settings_1.default;
    function stat(path4, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path4, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path4, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.stat = stat;
    function statSync(path4, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path4, settings);
    }
    exports2.statSync = statSync;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// node_modules/queue-microtask/index.js
var require_queue_microtask = __commonJS({
  "node_modules/queue-microtask/index.js"(exports2, module2) {
    var promise;
    module2.exports = typeof queueMicrotask === "function" ? queueMicrotask.bind(typeof window !== "undefined" ? window : global) : (cb) => (promise || (promise = Promise.resolve())).then(cb).catch((err) => setTimeout(() => {
      throw err;
    }, 0));
  }
});

// node_modules/run-parallel/index.js
var require_run_parallel = __commonJS({
  "node_modules/run-parallel/index.js"(exports2, module2) {
    module2.exports = runParallel;
    var queueMicrotask2 = require_queue_microtask();
    function runParallel(tasks, cb) {
      let results, pending, keys;
      let isSync = true;
      if (Array.isArray(tasks)) {
        results = [];
        pending = tasks.length;
      } else {
        keys = Object.keys(tasks);
        results = {};
        pending = keys.length;
      }
      function done(err) {
        function end() {
          if (cb)
            cb(err, results);
          cb = null;
        }
        if (isSync)
          queueMicrotask2(end);
        else
          end();
      }
      function each(i, err, result) {
        results[i] = result;
        if (--pending === 0 || err) {
          done(err);
        }
      }
      if (!pending) {
        done(null);
      } else if (keys) {
        keys.forEach(function(key) {
          tasks[key](function(err, result) {
            each(key, err, result);
          });
        });
      } else {
        tasks.forEach(function(task, i) {
          task(function(err, result) {
            each(i, err, result);
          });
        });
      }
      isSync = false;
    }
  }
});

// node_modules/@nodelib/fs.scandir/out/constants.js
var require_constants3 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/constants.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = void 0;
    var NODE_PROCESS_VERSION_PARTS = process.versions.node.split(".");
    if (NODE_PROCESS_VERSION_PARTS[0] === void 0 || NODE_PROCESS_VERSION_PARTS[1] === void 0) {
      throw new Error(`Unexpected behavior. The 'process.versions.node' variable has invalid value: ${process.versions.node}`);
    }
    var MAJOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[0], 10);
    var MINOR_VERSION = Number.parseInt(NODE_PROCESS_VERSION_PARTS[1], 10);
    var SUPPORTED_MAJOR_VERSION = 10;
    var SUPPORTED_MINOR_VERSION = 10;
    var IS_MATCHED_BY_MAJOR = MAJOR_VERSION > SUPPORTED_MAJOR_VERSION;
    var IS_MATCHED_BY_MAJOR_AND_MINOR = MAJOR_VERSION === SUPPORTED_MAJOR_VERSION && MINOR_VERSION >= SUPPORTED_MINOR_VERSION;
    exports2.IS_SUPPORT_READDIR_WITH_FILE_TYPES = IS_MATCHED_BY_MAJOR || IS_MATCHED_BY_MAJOR_AND_MINOR;
  }
});

// node_modules/@nodelib/fs.scandir/out/utils/fs.js
var require_fs3 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/utils/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createDirentFromStats = void 0;
    var DirentFromStats = class {
      constructor(name, stats) {
        this.name = name;
        this.isBlockDevice = stats.isBlockDevice.bind(stats);
        this.isCharacterDevice = stats.isCharacterDevice.bind(stats);
        this.isDirectory = stats.isDirectory.bind(stats);
        this.isFIFO = stats.isFIFO.bind(stats);
        this.isFile = stats.isFile.bind(stats);
        this.isSocket = stats.isSocket.bind(stats);
        this.isSymbolicLink = stats.isSymbolicLink.bind(stats);
      }
    };
    function createDirentFromStats(name, stats) {
      return new DirentFromStats(name, stats);
    }
    exports2.createDirentFromStats = createDirentFromStats;
  }
});

// node_modules/@nodelib/fs.scandir/out/utils/index.js
var require_utils6 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/utils/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fs = void 0;
    var fs3 = require_fs3();
    exports2.fs = fs3;
  }
});

// node_modules/@nodelib/fs.scandir/out/providers/common.js
var require_common = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/providers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = void 0;
    function joinPathSegments(a, b, separator) {
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// node_modules/@nodelib/fs.scandir/out/providers/async.js
var require_async2 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var rpl = require_run_parallel();
    var constants_1 = require_constants3();
    var utils = require_utils6();
    var common = require_common();
    function read(directory, settings, callback) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        readdirWithFileTypes(directory, settings, callback);
        return;
      }
      readdir(directory, settings, callback);
    }
    exports2.read = read;
    function readdirWithFileTypes(directory, settings, callback) {
      settings.fs.readdir(directory, { withFileTypes: true }, (readdirError, dirents) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const entries = dirents.map((dirent) => ({
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        }));
        if (!settings.followSymbolicLinks) {
          callSuccessCallback(callback, entries);
          return;
        }
        const tasks = entries.map((entry) => makeRplTaskEntry(entry, settings));
        rpl(tasks, (rplError, rplEntries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, rplEntries);
        });
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function makeRplTaskEntry(entry, settings) {
      return (done) => {
        if (!entry.dirent.isSymbolicLink()) {
          done(null, entry);
          return;
        }
        settings.fs.stat(entry.path, (statError, stats) => {
          if (statError !== null) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              done(statError);
              return;
            }
            done(null, entry);
            return;
          }
          entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          done(null, entry);
        });
      };
    }
    function readdir(directory, settings, callback) {
      settings.fs.readdir(directory, (readdirError, names) => {
        if (readdirError !== null) {
          callFailureCallback(callback, readdirError);
          return;
        }
        const tasks = names.map((name) => {
          const path4 = common.joinPathSegments(directory, name, settings.pathSegmentSeparator);
          return (done) => {
            fsStat.stat(path4, settings.fsStatSettings, (error, stats) => {
              if (error !== null) {
                done(error);
                return;
              }
              const entry = {
                name,
                path: path4,
                dirent: utils.fs.createDirentFromStats(name, stats)
              };
              if (settings.stats) {
                entry.stats = stats;
              }
              done(null, entry);
            });
          };
        });
        rpl(tasks, (rplError, entries) => {
          if (rplError !== null) {
            callFailureCallback(callback, rplError);
            return;
          }
          callSuccessCallback(callback, entries);
        });
      });
    }
    exports2.readdir = readdir;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, result) {
      callback(null, result);
    }
  }
});

// node_modules/@nodelib/fs.scandir/out/providers/sync.js
var require_sync2 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readdir = exports2.readdirWithFileTypes = exports2.read = void 0;
    var fsStat = require_out();
    var constants_1 = require_constants3();
    var utils = require_utils6();
    var common = require_common();
    function read(directory, settings) {
      if (!settings.stats && constants_1.IS_SUPPORT_READDIR_WITH_FILE_TYPES) {
        return readdirWithFileTypes(directory, settings);
      }
      return readdir(directory, settings);
    }
    exports2.read = read;
    function readdirWithFileTypes(directory, settings) {
      const dirents = settings.fs.readdirSync(directory, { withFileTypes: true });
      return dirents.map((dirent) => {
        const entry = {
          dirent,
          name: dirent.name,
          path: common.joinPathSegments(directory, dirent.name, settings.pathSegmentSeparator)
        };
        if (entry.dirent.isSymbolicLink() && settings.followSymbolicLinks) {
          try {
            const stats = settings.fs.statSync(entry.path);
            entry.dirent = utils.fs.createDirentFromStats(entry.name, stats);
          } catch (error) {
            if (settings.throwErrorOnBrokenSymbolicLink) {
              throw error;
            }
          }
        }
        return entry;
      });
    }
    exports2.readdirWithFileTypes = readdirWithFileTypes;
    function readdir(directory, settings) {
      const names = settings.fs.readdirSync(directory);
      return names.map((name) => {
        const entryPath = common.joinPathSegments(directory, name, settings.pathSegmentSeparator);
        const stats = fsStat.statSync(entryPath, settings.fsStatSettings);
        const entry = {
          name,
          path: entryPath,
          dirent: utils.fs.createDirentFromStats(name, stats)
        };
        if (settings.stats) {
          entry.stats = stats;
        }
        return entry;
      });
    }
    exports2.readdir = readdir;
  }
});

// node_modules/@nodelib/fs.scandir/out/adapters/fs.js
var require_fs4 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/adapters/fs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createFileSystemAdapter = exports2.FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    exports2.FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      stat: fs3.stat,
      lstatSync: fs3.lstatSync,
      statSync: fs3.statSync,
      readdir: fs3.readdir,
      readdirSync: fs3.readdirSync
    };
    function createFileSystemAdapter(fsMethods) {
      if (fsMethods === void 0) {
        return exports2.FILE_SYSTEM_ADAPTER;
      }
      return Object.assign(Object.assign({}, exports2.FILE_SYSTEM_ADAPTER), fsMethods);
    }
    exports2.createFileSystemAdapter = createFileSystemAdapter;
  }
});

// node_modules/@nodelib/fs.scandir/out/settings.js
var require_settings2 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsStat = require_out();
    var fs3 = require_fs4();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, false);
        this.fs = fs3.createFileSystemAdapter(this._options.fs);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path4.sep);
        this.stats = this._getValue(this._options.stats, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, true);
        this.fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this.followSymbolicLinks,
          fs: this.fs,
          throwErrorOnBrokenSymbolicLink: this.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// node_modules/@nodelib/fs.scandir/out/index.js
var require_out2 = __commonJS({
  "node_modules/@nodelib/fs.scandir/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.scandirSync = exports2.scandir = void 0;
    var async = require_async2();
    var sync = require_sync2();
    var settings_1 = require_settings2();
    exports2.Settings = settings_1.default;
    function scandir(path4, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        async.read(path4, getSettings(), optionsOrSettingsOrCallback);
        return;
      }
      async.read(path4, getSettings(optionsOrSettingsOrCallback), callback);
    }
    exports2.scandir = scandir;
    function scandirSync(path4, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      return sync.read(path4, settings);
    }
    exports2.scandirSync = scandirSync;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// node_modules/reusify/reusify.js
var require_reusify = __commonJS({
  "node_modules/reusify/reusify.js"(exports2, module2) {
    "use strict";
    function reusify(Constructor) {
      var head = new Constructor();
      var tail = head;
      function get() {
        var current = head;
        if (current.next) {
          head = current.next;
        } else {
          head = new Constructor();
          tail = head;
        }
        current.next = null;
        return current;
      }
      function release(obj) {
        tail.next = obj;
        tail = obj;
      }
      return {
        get,
        release
      };
    }
    module2.exports = reusify;
  }
});

// node_modules/fastq/queue.js
var require_queue = __commonJS({
  "node_modules/fastq/queue.js"(exports2, module2) {
    "use strict";
    var reusify = require_reusify();
    function fastqueue(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      if (!(_concurrency >= 1)) {
        throw new Error("fastqueue concurrency must be equal to or greater than 1");
      }
      var cache = reusify(Task);
      var queueHead = null;
      var queueTail = null;
      var _running = 0;
      var errorHandler = null;
      var self = {
        push,
        drain: noop,
        saturated: noop,
        pause,
        paused: false,
        get concurrency() {
          return _concurrency;
        },
        set concurrency(value) {
          if (!(value >= 1)) {
            throw new Error("fastqueue concurrency must be equal to or greater than 1");
          }
          _concurrency = value;
          if (self.paused)
            return;
          for (; queueHead && _running < _concurrency; ) {
            _running++;
            release();
          }
        },
        running,
        resume,
        idle,
        length,
        getQueue,
        unshift,
        empty: noop,
        kill,
        killAndDrain,
        error,
        abort
      };
      return self;
      function running() {
        return _running;
      }
      function pause() {
        self.paused = true;
      }
      function length() {
        var current = queueHead;
        var counter = 0;
        while (current) {
          current = current.next;
          counter++;
        }
        return counter;
      }
      function getQueue() {
        var current = queueHead;
        var tasks = [];
        while (current) {
          tasks.push(current.value);
          current = current.next;
        }
        return tasks;
      }
      function resume() {
        if (!self.paused)
          return;
        self.paused = false;
        if (queueHead === null) {
          _running++;
          release();
          return;
        }
        for (; queueHead && _running < _concurrency; ) {
          _running++;
          release();
        }
      }
      function idle() {
        return _running === 0 && self.length() === 0;
      }
      function push(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self.paused) {
          if (queueTail) {
            queueTail.next = current;
            queueTail = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function unshift(value, done) {
        var current = cache.get();
        current.context = context;
        current.release = release;
        current.value = value;
        current.callback = done || noop;
        current.errorHandler = errorHandler;
        if (_running >= _concurrency || self.paused) {
          if (queueHead) {
            current.next = queueHead;
            queueHead = current;
          } else {
            queueHead = current;
            queueTail = current;
            self.saturated();
          }
        } else {
          _running++;
          worker.call(context, current.value, current.worked);
        }
      }
      function release(holder) {
        if (holder) {
          cache.release(holder);
        }
        var next = queueHead;
        if (next && _running <= _concurrency) {
          if (!self.paused) {
            if (queueTail === queueHead) {
              queueTail = null;
            }
            queueHead = next.next;
            next.next = null;
            worker.call(context, next.value, next.worked);
            if (queueTail === null) {
              self.empty();
            }
          } else {
            _running--;
          }
        } else if (--_running === 0) {
          self.drain();
        }
      }
      function kill() {
        queueHead = null;
        queueTail = null;
        self.drain = noop;
      }
      function killAndDrain() {
        queueHead = null;
        queueTail = null;
        self.drain();
        self.drain = noop;
      }
      function abort() {
        var current = queueHead;
        queueHead = null;
        queueTail = null;
        while (current) {
          var next = current.next;
          var callback = current.callback;
          var errorHandler2 = current.errorHandler;
          var val = current.value;
          var context2 = current.context;
          current.value = null;
          current.callback = noop;
          current.errorHandler = null;
          if (errorHandler2) {
            errorHandler2(new Error("abort"), val);
          }
          callback.call(context2, new Error("abort"));
          current.release(current);
          current = next;
        }
        self.drain = noop;
      }
      function error(handler) {
        errorHandler = handler;
      }
    }
    function noop() {
    }
    function Task() {
      this.value = null;
      this.callback = noop;
      this.next = null;
      this.release = noop;
      this.context = null;
      this.errorHandler = null;
      var self = this;
      this.worked = function worked(err, result) {
        var callback = self.callback;
        var errorHandler = self.errorHandler;
        var val = self.value;
        self.value = null;
        self.callback = noop;
        if (self.errorHandler) {
          errorHandler(err, val);
        }
        callback.call(self.context, err, result);
        self.release(self);
      };
    }
    function queueAsPromised(context, worker, _concurrency) {
      if (typeof context === "function") {
        _concurrency = worker;
        worker = context;
        context = null;
      }
      function asyncWrapper(arg, cb) {
        worker.call(this, arg).then(function(res) {
          cb(null, res);
        }, cb);
      }
      var queue = fastqueue(context, asyncWrapper, _concurrency);
      var pushCb = queue.push;
      var unshiftCb = queue.unshift;
      queue.push = push;
      queue.unshift = unshift;
      queue.drained = drained;
      return queue;
      function push(value) {
        var p = new Promise(function(resolve, reject) {
          pushCb(value, function(err, result) {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          });
        });
        p.catch(noop);
        return p;
      }
      function unshift(value) {
        var p = new Promise(function(resolve, reject) {
          unshiftCb(value, function(err, result) {
            if (err) {
              reject(err);
              return;
            }
            resolve(result);
          });
        });
        p.catch(noop);
        return p;
      }
      function drained() {
        var p = new Promise(function(resolve) {
          process.nextTick(function() {
            if (queue.idle()) {
              resolve();
            } else {
              var previousDrain = queue.drain;
              queue.drain = function() {
                if (typeof previousDrain === "function")
                  previousDrain();
                resolve();
                queue.drain = previousDrain;
              };
            }
          });
        });
        return p;
      }
    }
    module2.exports = fastqueue;
    module2.exports.promise = queueAsPromised;
  }
});

// node_modules/@nodelib/fs.walk/out/readers/common.js
var require_common2 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/readers/common.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joinPathSegments = exports2.replacePathSegmentSeparator = exports2.isAppliedFilter = exports2.isFatalError = void 0;
    function isFatalError(settings, error) {
      if (settings.errorFilter === null) {
        return true;
      }
      return !settings.errorFilter(error);
    }
    exports2.isFatalError = isFatalError;
    function isAppliedFilter(filter, value) {
      return filter === null || filter(value);
    }
    exports2.isAppliedFilter = isAppliedFilter;
    function replacePathSegmentSeparator(filepath, separator) {
      return filepath.split(/[/\\]/).join(separator);
    }
    exports2.replacePathSegmentSeparator = replacePathSegmentSeparator;
    function joinPathSegments(a, b, separator) {
      if (a === "") {
        return b;
      }
      if (a.endsWith(separator)) {
        return a + b;
      }
      return a + separator + b;
    }
    exports2.joinPathSegments = joinPathSegments;
  }
});

// node_modules/@nodelib/fs.walk/out/readers/reader.js
var require_reader = __commonJS({
  "node_modules/@nodelib/fs.walk/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var common = require_common2();
    var Reader = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._root = common.replacePathSegmentSeparator(_root, _settings.pathSegmentSeparator);
      }
    };
    exports2.default = Reader;
  }
});

// node_modules/@nodelib/fs.walk/out/readers/async.js
var require_async3 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var events_1 = require("events");
    var fsScandir = require_out2();
    var fastq = require_queue();
    var common = require_common2();
    var reader_1 = require_reader();
    var AsyncReader = class extends reader_1.default {
      constructor(_root, _settings) {
        super(_root, _settings);
        this._settings = _settings;
        this._scandir = fsScandir.scandir;
        this._emitter = new events_1.EventEmitter();
        this._queue = fastq(this._worker.bind(this), this._settings.concurrency);
        this._isFatalError = false;
        this._isDestroyed = false;
        this._queue.drain = () => {
          if (!this._isFatalError) {
            this._emitter.emit("end");
          }
        };
      }
      read() {
        this._isFatalError = false;
        this._isDestroyed = false;
        setImmediate(() => {
          this._pushToQueue(this._root, this._settings.basePath);
        });
        return this._emitter;
      }
      get isDestroyed() {
        return this._isDestroyed;
      }
      destroy() {
        if (this._isDestroyed) {
          throw new Error("The reader is already destroyed");
        }
        this._isDestroyed = true;
        this._queue.killAndDrain();
      }
      onEntry(callback) {
        this._emitter.on("entry", callback);
      }
      onError(callback) {
        this._emitter.once("error", callback);
      }
      onEnd(callback) {
        this._emitter.once("end", callback);
      }
      _pushToQueue(directory, base) {
        const queueItem = { directory, base };
        this._queue.push(queueItem, (error) => {
          if (error !== null) {
            this._handleError(error);
          }
        });
      }
      _worker(item, done) {
        this._scandir(item.directory, this._settings.fsScandirSettings, (error, entries) => {
          if (error !== null) {
            done(error, void 0);
            return;
          }
          for (const entry of entries) {
            this._handleEntry(entry, item.base);
          }
          done(null, void 0);
        });
      }
      _handleError(error) {
        if (this._isDestroyed || !common.isFatalError(this._settings, error)) {
          return;
        }
        this._isFatalError = true;
        this._isDestroyed = true;
        this._emitter.emit("error", error);
      }
      _handleEntry(entry, base) {
        if (this._isDestroyed || this._isFatalError) {
          return;
        }
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._emitEntry(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _emitEntry(entry) {
        this._emitter.emit("entry", entry);
      }
    };
    exports2.default = AsyncReader;
  }
});

// node_modules/@nodelib/fs.walk/out/providers/async.js
var require_async4 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async3();
    var AsyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._storage = [];
      }
      read(callback) {
        this._reader.onError((error) => {
          callFailureCallback(callback, error);
        });
        this._reader.onEntry((entry) => {
          this._storage.push(entry);
        });
        this._reader.onEnd(() => {
          callSuccessCallback(callback, this._storage);
        });
        this._reader.read();
      }
    };
    exports2.default = AsyncProvider;
    function callFailureCallback(callback, error) {
      callback(error);
    }
    function callSuccessCallback(callback, entries) {
      callback(null, entries);
    }
  }
});

// node_modules/@nodelib/fs.walk/out/providers/stream.js
var require_stream2 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var async_1 = require_async3();
    var StreamProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new async_1.default(this._root, this._settings);
        this._stream = new stream_1.Readable({
          objectMode: true,
          read: () => {
          },
          destroy: () => {
            if (!this._reader.isDestroyed) {
              this._reader.destroy();
            }
          }
        });
      }
      read() {
        this._reader.onError((error) => {
          this._stream.emit("error", error);
        });
        this._reader.onEntry((entry) => {
          this._stream.push(entry);
        });
        this._reader.onEnd(() => {
          this._stream.push(null);
        });
        this._reader.read();
        return this._stream;
      }
    };
    exports2.default = StreamProvider;
  }
});

// node_modules/@nodelib/fs.walk/out/readers/sync.js
var require_sync3 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsScandir = require_out2();
    var common = require_common2();
    var reader_1 = require_reader();
    var SyncReader = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._scandir = fsScandir.scandirSync;
        this._storage = [];
        this._queue = /* @__PURE__ */ new Set();
      }
      read() {
        this._pushToQueue(this._root, this._settings.basePath);
        this._handleQueue();
        return this._storage;
      }
      _pushToQueue(directory, base) {
        this._queue.add({ directory, base });
      }
      _handleQueue() {
        for (const item of this._queue.values()) {
          this._handleDirectory(item.directory, item.base);
        }
      }
      _handleDirectory(directory, base) {
        try {
          const entries = this._scandir(directory, this._settings.fsScandirSettings);
          for (const entry of entries) {
            this._handleEntry(entry, base);
          }
        } catch (error) {
          this._handleError(error);
        }
      }
      _handleError(error) {
        if (!common.isFatalError(this._settings, error)) {
          return;
        }
        throw error;
      }
      _handleEntry(entry, base) {
        const fullpath = entry.path;
        if (base !== void 0) {
          entry.path = common.joinPathSegments(base, entry.name, this._settings.pathSegmentSeparator);
        }
        if (common.isAppliedFilter(this._settings.entryFilter, entry)) {
          this._pushToStorage(entry);
        }
        if (entry.dirent.isDirectory() && common.isAppliedFilter(this._settings.deepFilter, entry)) {
          this._pushToQueue(fullpath, base === void 0 ? void 0 : entry.path);
        }
      }
      _pushToStorage(entry) {
        this._storage.push(entry);
      }
    };
    exports2.default = SyncReader;
  }
});

// node_modules/@nodelib/fs.walk/out/providers/sync.js
var require_sync4 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync3();
    var SyncProvider = class {
      constructor(_root, _settings) {
        this._root = _root;
        this._settings = _settings;
        this._reader = new sync_1.default(this._root, this._settings);
      }
      read() {
        return this._reader.read();
      }
    };
    exports2.default = SyncProvider;
  }
});

// node_modules/@nodelib/fs.walk/out/settings.js
var require_settings3 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsScandir = require_out2();
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.basePath = this._getValue(this._options.basePath, void 0);
        this.concurrency = this._getValue(this._options.concurrency, Number.POSITIVE_INFINITY);
        this.deepFilter = this._getValue(this._options.deepFilter, null);
        this.entryFilter = this._getValue(this._options.entryFilter, null);
        this.errorFilter = this._getValue(this._options.errorFilter, null);
        this.pathSegmentSeparator = this._getValue(this._options.pathSegmentSeparator, path4.sep);
        this.fsScandirSettings = new fsScandir.Settings({
          followSymbolicLinks: this._options.followSymbolicLinks,
          fs: this._options.fs,
          pathSegmentSeparator: this._options.pathSegmentSeparator,
          stats: this._options.stats,
          throwErrorOnBrokenSymbolicLink: this._options.throwErrorOnBrokenSymbolicLink
        });
      }
      _getValue(option, value) {
        return option !== null && option !== void 0 ? option : value;
      }
    };
    exports2.default = Settings;
  }
});

// node_modules/@nodelib/fs.walk/out/index.js
var require_out3 = __commonJS({
  "node_modules/@nodelib/fs.walk/out/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Settings = exports2.walkStream = exports2.walkSync = exports2.walk = void 0;
    var async_1 = require_async4();
    var stream_1 = require_stream2();
    var sync_1 = require_sync4();
    var settings_1 = require_settings3();
    exports2.Settings = settings_1.default;
    function walk(directory, optionsOrSettingsOrCallback, callback) {
      if (typeof optionsOrSettingsOrCallback === "function") {
        new async_1.default(directory, getSettings()).read(optionsOrSettingsOrCallback);
        return;
      }
      new async_1.default(directory, getSettings(optionsOrSettingsOrCallback)).read(callback);
    }
    exports2.walk = walk;
    function walkSync(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new sync_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkSync = walkSync;
    function walkStream(directory, optionsOrSettings) {
      const settings = getSettings(optionsOrSettings);
      const provider = new stream_1.default(directory, settings);
      return provider.read();
    }
    exports2.walkStream = walkStream;
    function getSettings(settingsOrOptions = {}) {
      if (settingsOrOptions instanceof settings_1.default) {
        return settingsOrOptions;
      }
      return new settings_1.default(settingsOrOptions);
    }
  }
});

// node_modules/fast-glob/out/readers/reader.js
var require_reader2 = __commonJS({
  "node_modules/fast-glob/out/readers/reader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var fsStat = require_out();
    var utils = require_utils5();
    var Reader = class {
      constructor(_settings) {
        this._settings = _settings;
        this._fsStatSettings = new fsStat.Settings({
          followSymbolicLink: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          throwErrorOnBrokenSymbolicLink: this._settings.followSymbolicLinks
        });
      }
      _getFullEntryPath(filepath) {
        return path4.resolve(this._settings.cwd, filepath);
      }
      _makeEntry(stats, pattern) {
        const entry = {
          name: pattern,
          path: pattern,
          dirent: utils.fs.createDirentFromStats(pattern, stats)
        };
        if (this._settings.stats) {
          entry.stats = stats;
        }
        return entry;
      }
      _isFatalError(error) {
        return !utils.errno.isEnoentCodeError(error) && !this._settings.suppressErrors;
      }
    };
    exports2.default = Reader;
  }
});

// node_modules/fast-glob/out/readers/stream.js
var require_stream3 = __commonJS({
  "node_modules/fast-glob/out/readers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderStream = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkStream = fsWalk.walkStream;
        this._stat = fsStat.stat;
      }
      dynamic(root, options) {
        return this._walkStream(root, options);
      }
      static(patterns, options) {
        const filepaths = patterns.map(this._getFullEntryPath, this);
        const stream = new stream_1.PassThrough({ objectMode: true });
        stream._write = (index, _enc, done) => {
          return this._getEntry(filepaths[index], patterns[index], options).then((entry) => {
            if (entry !== null && options.entryFilter(entry)) {
              stream.push(entry);
            }
            if (index === filepaths.length - 1) {
              stream.end();
            }
            done();
          }).catch(done);
        };
        for (let i = 0; i < filepaths.length; i++) {
          stream.write(i);
        }
        return stream;
      }
      _getEntry(filepath, pattern, options) {
        return this._getStat(filepath).then((stats) => this._makeEntry(stats, pattern)).catch((error) => {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        });
      }
      _getStat(filepath) {
        return new Promise((resolve, reject) => {
          this._stat(filepath, this._fsStatSettings, (error, stats) => {
            return error === null ? resolve(stats) : reject(error);
          });
        });
      }
    };
    exports2.default = ReaderStream;
  }
});

// node_modules/fast-glob/out/readers/async.js
var require_async5 = __commonJS({
  "node_modules/fast-glob/out/readers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var stream_1 = require_stream3();
    var ReaderAsync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkAsync = fsWalk.walk;
        this._readerStream = new stream_1.default(this._settings);
      }
      dynamic(root, options) {
        return new Promise((resolve, reject) => {
          this._walkAsync(root, options, (error, entries) => {
            if (error === null) {
              resolve(entries);
            } else {
              reject(error);
            }
          });
        });
      }
      async static(patterns, options) {
        const entries = [];
        const stream = this._readerStream.static(patterns, options);
        return new Promise((resolve, reject) => {
          stream.once("error", reject);
          stream.on("data", (entry) => entries.push(entry));
          stream.once("end", () => resolve(entries));
        });
      }
    };
    exports2.default = ReaderAsync;
  }
});

// node_modules/fast-glob/out/providers/matchers/matcher.js
var require_matcher = __commonJS({
  "node_modules/fast-glob/out/providers/matchers/matcher.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils5();
    var Matcher = class {
      constructor(_patterns, _settings, _micromatchOptions) {
        this._patterns = _patterns;
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this._storage = [];
        this._fillStorage();
      }
      _fillStorage() {
        for (const pattern of this._patterns) {
          const segments = this._getPatternSegments(pattern);
          const sections = this._splitSegmentsIntoSections(segments);
          this._storage.push({
            complete: sections.length <= 1,
            pattern,
            segments,
            sections
          });
        }
      }
      _getPatternSegments(pattern) {
        const parts = utils.pattern.getPatternParts(pattern, this._micromatchOptions);
        return parts.map((part) => {
          const dynamic = utils.pattern.isDynamicPattern(part, this._settings);
          if (!dynamic) {
            return {
              dynamic: false,
              pattern: part
            };
          }
          return {
            dynamic: true,
            pattern: part,
            patternRe: utils.pattern.makeRe(part, this._micromatchOptions)
          };
        });
      }
      _splitSegmentsIntoSections(segments) {
        return utils.array.splitWhen(segments, (segment) => segment.dynamic && utils.pattern.hasGlobStar(segment.pattern));
      }
    };
    exports2.default = Matcher;
  }
});

// node_modules/fast-glob/out/providers/matchers/partial.js
var require_partial = __commonJS({
  "node_modules/fast-glob/out/providers/matchers/partial.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var matcher_1 = require_matcher();
    var PartialMatcher = class extends matcher_1.default {
      match(filepath) {
        const parts = filepath.split("/");
        const levels = parts.length;
        const patterns = this._storage.filter((info) => !info.complete || info.segments.length > levels);
        for (const pattern of patterns) {
          const section = pattern.sections[0];
          if (!pattern.complete && levels > section.length) {
            return true;
          }
          const match = parts.every((part, index) => {
            const segment = pattern.segments[index];
            if (segment.dynamic && segment.patternRe.test(part)) {
              return true;
            }
            if (!segment.dynamic && segment.pattern === part) {
              return true;
            }
            return false;
          });
          if (match) {
            return true;
          }
        }
        return false;
      }
    };
    exports2.default = PartialMatcher;
  }
});

// node_modules/fast-glob/out/providers/filters/deep.js
var require_deep = __commonJS({
  "node_modules/fast-glob/out/providers/filters/deep.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils5();
    var partial_1 = require_partial();
    var DeepFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
      }
      getFilter(basePath, positive, negative) {
        const matcher = this._getMatcher(positive);
        const negativeRe = this._getNegativePatternsRe(negative);
        return (entry) => this._filter(basePath, entry, matcher, negativeRe);
      }
      _getMatcher(patterns) {
        return new partial_1.default(patterns, this._settings, this._micromatchOptions);
      }
      _getNegativePatternsRe(patterns) {
        const affectDepthOfReadingPatterns = patterns.filter(utils.pattern.isAffectDepthOfReadingPattern);
        return utils.pattern.convertPatternsToRe(affectDepthOfReadingPatterns, this._micromatchOptions);
      }
      _filter(basePath, entry, matcher, negativeRe) {
        if (this._isSkippedByDeep(basePath, entry.path)) {
          return false;
        }
        if (this._isSkippedSymbolicLink(entry)) {
          return false;
        }
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._isSkippedByPositivePatterns(filepath, matcher)) {
          return false;
        }
        return this._isSkippedByNegativePatterns(filepath, negativeRe);
      }
      _isSkippedByDeep(basePath, entryPath) {
        if (this._settings.deep === Infinity) {
          return false;
        }
        return this._getEntryLevel(basePath, entryPath) >= this._settings.deep;
      }
      _getEntryLevel(basePath, entryPath) {
        const entryPathDepth = entryPath.split("/").length;
        if (basePath === "") {
          return entryPathDepth;
        }
        const basePathDepth = basePath.split("/").length;
        return entryPathDepth - basePathDepth;
      }
      _isSkippedSymbolicLink(entry) {
        return !this._settings.followSymbolicLinks && entry.dirent.isSymbolicLink();
      }
      _isSkippedByPositivePatterns(entryPath, matcher) {
        return !this._settings.baseNameMatch && !matcher.match(entryPath);
      }
      _isSkippedByNegativePatterns(entryPath, patternsRe) {
        return !utils.pattern.matchAny(entryPath, patternsRe);
      }
    };
    exports2.default = DeepFilter;
  }
});

// node_modules/fast-glob/out/providers/filters/entry.js
var require_entry2 = __commonJS({
  "node_modules/fast-glob/out/providers/filters/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils5();
    var EntryFilter = class {
      constructor(_settings, _micromatchOptions) {
        this._settings = _settings;
        this._micromatchOptions = _micromatchOptions;
        this.index = /* @__PURE__ */ new Map();
      }
      getFilter(positive, negative) {
        const [absoluteNegative, relativeNegative] = utils.pattern.partitionAbsoluteAndRelative(negative);
        const patterns = {
          positive: {
            all: utils.pattern.convertPatternsToRe(positive, this._micromatchOptions)
          },
          negative: {
            absolute: utils.pattern.convertPatternsToRe(absoluteNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true })),
            relative: utils.pattern.convertPatternsToRe(relativeNegative, Object.assign(Object.assign({}, this._micromatchOptions), { dot: true }))
          }
        };
        return (entry) => this._filter(entry, patterns);
      }
      _filter(entry, patterns) {
        const filepath = utils.path.removeLeadingDotSegment(entry.path);
        if (this._settings.unique && this._isDuplicateEntry(filepath)) {
          return false;
        }
        if (this._onlyFileFilter(entry) || this._onlyDirectoryFilter(entry)) {
          return false;
        }
        const isMatched = this._isMatchToPatternsSet(filepath, patterns, entry.dirent.isDirectory());
        if (this._settings.unique && isMatched) {
          this._createIndexRecord(filepath);
        }
        return isMatched;
      }
      _isDuplicateEntry(filepath) {
        return this.index.has(filepath);
      }
      _createIndexRecord(filepath) {
        this.index.set(filepath, void 0);
      }
      _onlyFileFilter(entry) {
        return this._settings.onlyFiles && !entry.dirent.isFile();
      }
      _onlyDirectoryFilter(entry) {
        return this._settings.onlyDirectories && !entry.dirent.isDirectory();
      }
      _isMatchToPatternsSet(filepath, patterns, isDirectory) {
        const isMatched = this._isMatchToPatterns(filepath, patterns.positive.all, isDirectory);
        if (!isMatched) {
          return false;
        }
        const isMatchedByRelativeNegative = this._isMatchToPatterns(filepath, patterns.negative.relative, isDirectory);
        if (isMatchedByRelativeNegative) {
          return false;
        }
        const isMatchedByAbsoluteNegative = this._isMatchToAbsoluteNegative(filepath, patterns.negative.absolute, isDirectory);
        if (isMatchedByAbsoluteNegative) {
          return false;
        }
        return true;
      }
      _isMatchToAbsoluteNegative(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const fullpath = utils.path.makeAbsolute(this._settings.cwd, filepath);
        return this._isMatchToPatterns(fullpath, patternsRe, isDirectory);
      }
      _isMatchToPatterns(filepath, patternsRe, isDirectory) {
        if (patternsRe.length === 0) {
          return false;
        }
        const isMatched = utils.pattern.matchAny(filepath, patternsRe);
        if (!isMatched && isDirectory) {
          return utils.pattern.matchAny(filepath + "/", patternsRe);
        }
        return isMatched;
      }
    };
    exports2.default = EntryFilter;
  }
});

// node_modules/fast-glob/out/providers/filters/error.js
var require_error2 = __commonJS({
  "node_modules/fast-glob/out/providers/filters/error.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils5();
    var ErrorFilter = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getFilter() {
        return (error) => this._isNonFatalError(error);
      }
      _isNonFatalError(error) {
        return utils.errno.isEnoentCodeError(error) || this._settings.suppressErrors;
      }
    };
    exports2.default = ErrorFilter;
  }
});

// node_modules/fast-glob/out/providers/transformers/entry.js
var require_entry3 = __commonJS({
  "node_modules/fast-glob/out/providers/transformers/entry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var utils = require_utils5();
    var EntryTransformer = class {
      constructor(_settings) {
        this._settings = _settings;
      }
      getTransformer() {
        return (entry) => this._transform(entry);
      }
      _transform(entry) {
        let filepath = entry.path;
        if (this._settings.absolute) {
          filepath = utils.path.makeAbsolute(this._settings.cwd, filepath);
          filepath = utils.path.unixify(filepath);
        }
        if (this._settings.markDirectories && entry.dirent.isDirectory()) {
          filepath += "/";
        }
        if (!this._settings.objectMode) {
          return filepath;
        }
        return Object.assign(Object.assign({}, entry), { path: filepath });
      }
    };
    exports2.default = EntryTransformer;
  }
});

// node_modules/fast-glob/out/providers/provider.js
var require_provider = __commonJS({
  "node_modules/fast-glob/out/providers/provider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var path4 = require("path");
    var deep_1 = require_deep();
    var entry_1 = require_entry2();
    var error_1 = require_error2();
    var entry_2 = require_entry3();
    var Provider = class {
      constructor(_settings) {
        this._settings = _settings;
        this.errorFilter = new error_1.default(this._settings);
        this.entryFilter = new entry_1.default(this._settings, this._getMicromatchOptions());
        this.deepFilter = new deep_1.default(this._settings, this._getMicromatchOptions());
        this.entryTransformer = new entry_2.default(this._settings);
      }
      _getRootDirectory(task) {
        return path4.resolve(this._settings.cwd, task.base);
      }
      _getReaderOptions(task) {
        const basePath = task.base === "." ? "" : task.base;
        return {
          basePath,
          pathSegmentSeparator: "/",
          concurrency: this._settings.concurrency,
          deepFilter: this.deepFilter.getFilter(basePath, task.positive, task.negative),
          entryFilter: this.entryFilter.getFilter(task.positive, task.negative),
          errorFilter: this.errorFilter.getFilter(),
          followSymbolicLinks: this._settings.followSymbolicLinks,
          fs: this._settings.fs,
          stats: this._settings.stats,
          throwErrorOnBrokenSymbolicLink: this._settings.throwErrorOnBrokenSymbolicLink,
          transform: this.entryTransformer.getTransformer()
        };
      }
      _getMicromatchOptions() {
        return {
          dot: this._settings.dot,
          matchBase: this._settings.baseNameMatch,
          nobrace: !this._settings.braceExpansion,
          nocase: !this._settings.caseSensitiveMatch,
          noext: !this._settings.extglob,
          noglobstar: !this._settings.globstar,
          posix: true,
          strictSlashes: false
        };
      }
    };
    exports2.default = Provider;
  }
});

// node_modules/fast-glob/out/providers/async.js
var require_async6 = __commonJS({
  "node_modules/fast-glob/out/providers/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var async_1 = require_async5();
    var provider_1 = require_provider();
    var ProviderAsync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new async_1.default(this._settings);
      }
      async read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = await this.api(root, task, options);
        return entries.map((entry) => options.transform(entry));
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderAsync;
  }
});

// node_modules/fast-glob/out/providers/stream.js
var require_stream4 = __commonJS({
  "node_modules/fast-glob/out/providers/stream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var stream_1 = require("stream");
    var stream_2 = require_stream3();
    var provider_1 = require_provider();
    var ProviderStream = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new stream_2.default(this._settings);
      }
      read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const source = this.api(root, task, options);
        const destination = new stream_1.Readable({ objectMode: true, read: () => {
        } });
        source.once("error", (error) => destination.emit("error", error)).on("data", (entry) => destination.emit("data", options.transform(entry))).once("end", () => destination.emit("end"));
        destination.once("close", () => source.destroy());
        return destination;
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderStream;
  }
});

// node_modules/fast-glob/out/readers/sync.js
var require_sync5 = __commonJS({
  "node_modules/fast-glob/out/readers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var fsStat = require_out();
    var fsWalk = require_out3();
    var reader_1 = require_reader2();
    var ReaderSync = class extends reader_1.default {
      constructor() {
        super(...arguments);
        this._walkSync = fsWalk.walkSync;
        this._statSync = fsStat.statSync;
      }
      dynamic(root, options) {
        return this._walkSync(root, options);
      }
      static(patterns, options) {
        const entries = [];
        for (const pattern of patterns) {
          const filepath = this._getFullEntryPath(pattern);
          const entry = this._getEntry(filepath, pattern, options);
          if (entry === null || !options.entryFilter(entry)) {
            continue;
          }
          entries.push(entry);
        }
        return entries;
      }
      _getEntry(filepath, pattern, options) {
        try {
          const stats = this._getStat(filepath);
          return this._makeEntry(stats, pattern);
        } catch (error) {
          if (options.errorFilter(error)) {
            return null;
          }
          throw error;
        }
      }
      _getStat(filepath) {
        return this._statSync(filepath, this._fsStatSettings);
      }
    };
    exports2.default = ReaderSync;
  }
});

// node_modules/fast-glob/out/providers/sync.js
var require_sync6 = __commonJS({
  "node_modules/fast-glob/out/providers/sync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var sync_1 = require_sync5();
    var provider_1 = require_provider();
    var ProviderSync = class extends provider_1.default {
      constructor() {
        super(...arguments);
        this._reader = new sync_1.default(this._settings);
      }
      read(task) {
        const root = this._getRootDirectory(task);
        const options = this._getReaderOptions(task);
        const entries = this.api(root, task, options);
        return entries.map(options.transform);
      }
      api(root, task, options) {
        if (task.dynamic) {
          return this._reader.dynamic(root, options);
        }
        return this._reader.static(task.patterns, options);
      }
    };
    exports2.default = ProviderSync;
  }
});

// node_modules/fast-glob/out/settings.js
var require_settings4 = __commonJS({
  "node_modules/fast-glob/out/settings.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = void 0;
    var fs3 = require("fs");
    var os2 = require("os");
    var CPU_COUNT = Math.max(os2.cpus().length, 1);
    exports2.DEFAULT_FILE_SYSTEM_ADAPTER = {
      lstat: fs3.lstat,
      lstatSync: fs3.lstatSync,
      stat: fs3.stat,
      statSync: fs3.statSync,
      readdir: fs3.readdir,
      readdirSync: fs3.readdirSync
    };
    var Settings = class {
      constructor(_options = {}) {
        this._options = _options;
        this.absolute = this._getValue(this._options.absolute, false);
        this.baseNameMatch = this._getValue(this._options.baseNameMatch, false);
        this.braceExpansion = this._getValue(this._options.braceExpansion, true);
        this.caseSensitiveMatch = this._getValue(this._options.caseSensitiveMatch, true);
        this.concurrency = this._getValue(this._options.concurrency, CPU_COUNT);
        this.cwd = this._getValue(this._options.cwd, process.cwd());
        this.deep = this._getValue(this._options.deep, Infinity);
        this.dot = this._getValue(this._options.dot, false);
        this.extglob = this._getValue(this._options.extglob, true);
        this.followSymbolicLinks = this._getValue(this._options.followSymbolicLinks, true);
        this.fs = this._getFileSystemMethods(this._options.fs);
        this.globstar = this._getValue(this._options.globstar, true);
        this.ignore = this._getValue(this._options.ignore, []);
        this.markDirectories = this._getValue(this._options.markDirectories, false);
        this.objectMode = this._getValue(this._options.objectMode, false);
        this.onlyDirectories = this._getValue(this._options.onlyDirectories, false);
        this.onlyFiles = this._getValue(this._options.onlyFiles, true);
        this.stats = this._getValue(this._options.stats, false);
        this.suppressErrors = this._getValue(this._options.suppressErrors, false);
        this.throwErrorOnBrokenSymbolicLink = this._getValue(this._options.throwErrorOnBrokenSymbolicLink, false);
        this.unique = this._getValue(this._options.unique, true);
        if (this.onlyDirectories) {
          this.onlyFiles = false;
        }
        if (this.stats) {
          this.objectMode = true;
        }
        this.ignore = [].concat(this.ignore);
      }
      _getValue(option, value) {
        return option === void 0 ? value : option;
      }
      _getFileSystemMethods(methods = {}) {
        return Object.assign(Object.assign({}, exports2.DEFAULT_FILE_SYSTEM_ADAPTER), methods);
      }
    };
    exports2.default = Settings;
  }
});

// node_modules/fast-glob/out/index.js
var require_out4 = __commonJS({
  "node_modules/fast-glob/out/index.js"(exports2, module2) {
    "use strict";
    var taskManager = require_tasks();
    var async_1 = require_async6();
    var stream_1 = require_stream4();
    var sync_1 = require_sync6();
    var settings_1 = require_settings4();
    var utils = require_utils5();
    async function FastGlob(source, options) {
      assertPatternsInput(source);
      const works = getWorks(source, async_1.default, options);
      const result = await Promise.all(works);
      return utils.array.flatten(result);
    }
    (function(FastGlob2) {
      FastGlob2.glob = FastGlob2;
      FastGlob2.globSync = sync;
      FastGlob2.globStream = stream;
      FastGlob2.async = FastGlob2;
      function sync(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, sync_1.default, options);
        return utils.array.flatten(works);
      }
      FastGlob2.sync = sync;
      function stream(source, options) {
        assertPatternsInput(source);
        const works = getWorks(source, stream_1.default, options);
        return utils.stream.merge(works);
      }
      FastGlob2.stream = stream;
      function generateTasks(source, options) {
        assertPatternsInput(source);
        const patterns = [].concat(source);
        const settings = new settings_1.default(options);
        return taskManager.generate(patterns, settings);
      }
      FastGlob2.generateTasks = generateTasks;
      function isDynamicPattern(source, options) {
        assertPatternsInput(source);
        const settings = new settings_1.default(options);
        return utils.pattern.isDynamicPattern(source, settings);
      }
      FastGlob2.isDynamicPattern = isDynamicPattern;
      function escapePath(source) {
        assertPatternsInput(source);
        return utils.path.escape(source);
      }
      FastGlob2.escapePath = escapePath;
      function convertPathToPattern(source) {
        assertPatternsInput(source);
        return utils.path.convertPathToPattern(source);
      }
      FastGlob2.convertPathToPattern = convertPathToPattern;
      let posix;
      (function(posix2) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapePosixPath(source);
        }
        posix2.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertPosixPathToPattern(source);
        }
        posix2.convertPathToPattern = convertPathToPattern2;
      })(posix = FastGlob2.posix || (FastGlob2.posix = {}));
      let win32;
      (function(win322) {
        function escapePath2(source) {
          assertPatternsInput(source);
          return utils.path.escapeWindowsPath(source);
        }
        win322.escapePath = escapePath2;
        function convertPathToPattern2(source) {
          assertPatternsInput(source);
          return utils.path.convertWindowsPathToPattern(source);
        }
        win322.convertPathToPattern = convertPathToPattern2;
      })(win32 = FastGlob2.win32 || (FastGlob2.win32 = {}));
    })(FastGlob || (FastGlob = {}));
    function getWorks(source, _Provider, options) {
      const patterns = [].concat(source);
      const settings = new settings_1.default(options);
      const tasks = taskManager.generate(patterns, settings);
      const provider = new _Provider(settings);
      return tasks.map(provider.read, provider);
    }
    function assertPatternsInput(input) {
      const source = [].concat(input);
      const isValidSource = source.every((item) => utils.string.isString(item) && !utils.string.isEmpty(item));
      if (!isValidSource) {
        throw new TypeError("Patterns must be a string (non empty) or an array of strings");
      }
    }
    module2.exports = FastGlob;
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode7 = __toESM(require("vscode"));

// src/indexer/symbolResolver.ts
var SymbolResolver = class {
  classesByFqcn = /* @__PURE__ */ new Map();
  symbolsById = /* @__PURE__ */ new Map();
  classMethods = /* @__PURE__ */ new Map();
  descendantsCache = /* @__PURE__ */ new Map();
  addClass(classDef) {
    this.classesByFqcn.set(classDef.fqcn, classDef);
    this.descendantsCache.clear();
  }
  removeClass(fqcn) {
    this.classesByFqcn.delete(fqcn);
    this.descendantsCache.clear();
  }
  addSymbol(symbol) {
    this.symbolsById.set(symbol.id, symbol);
    if (symbol.kind === "method" || symbol.kind === "staticMethod") {
      let methodsMap = this.classMethods.get(symbol.containerName);
      if (!methodsMap) {
        methodsMap = /* @__PURE__ */ new Map();
        this.classMethods.set(symbol.containerName, methodsMap);
      }
      methodsMap.set(symbol.name, symbol);
    }
  }
  removeSymbol(symbolId) {
    const symbol = this.symbolsById.get(symbolId);
    if (symbol) {
      if (symbol.kind === "method" || symbol.kind === "staticMethod") {
        const methodsMap = this.classMethods.get(symbol.containerName);
        if (methodsMap) {
          methodsMap.delete(symbol.name);
        }
      }
      this.symbolsById.delete(symbolId);
    }
  }
  getSymbol(symbolId) {
    return this.symbolsById.get(symbolId);
  }
  getClass(fqcn) {
    return this.classesByFqcn.get(fqcn);
  }
  /**
   * Resolve method symbol for a given class FQCN and method name.
   * Walks up parent classes, traits, and interfaces if not directly declared in class FQCN.
   */
  resolveMethod(targetClassFqcn, methodName) {
    const directSymbolId = `${targetClassFqcn}::${methodName}`;
    const directSymbol = this.symbolsById.get(directSymbolId);
    if (directSymbol) {
      return directSymbol;
    }
    const visited = /* @__PURE__ */ new Set();
    const queue = [targetClassFqcn];
    while (queue.length > 0) {
      const currentFqcn = queue.shift();
      if (visited.has(currentFqcn))
        continue;
      visited.add(currentFqcn);
      const symbolId = `${currentFqcn}::${methodName}`;
      const symbol = this.symbolsById.get(symbolId);
      if (symbol) {
        return symbol;
      }
      const classDef = this.classesByFqcn.get(currentFqcn);
      if (classDef) {
        if (classDef.extendsClass) {
          queue.push(classDef.extendsClass);
        }
        for (const traitFqcn of classDef.usedTraits) {
          queue.push(traitFqcn);
        }
        for (const interfaceFqcn of classDef.implementsInterfaces) {
          queue.push(interfaceFqcn);
        }
      }
    }
    return void 0;
  }
  /**
   * Find all subclasses (descendants) that inherit or implement the target class/interface/trait.
   */
  getDescendants(targetClassFqcn) {
    if (this.descendantsCache.has(targetClassFqcn)) {
      return this.descendantsCache.get(targetClassFqcn);
    }
    const descendants = [];
    for (const [fqcn, classDef] of this.classesByFqcn.entries()) {
      if (fqcn === targetClassFqcn)
        continue;
      if (classDef.extendsClass === targetClassFqcn || classDef.implementsInterfaces.includes(targetClassFqcn) || classDef.usedTraits.includes(targetClassFqcn)) {
        descendants.push(fqcn);
        descendants.push(...this.getDescendants(fqcn));
      }
    }
    const result = Array.from(new Set(descendants));
    this.descendantsCache.set(targetClassFqcn, result);
    return result;
  }
  /**
   * Clear all symbols and class definitions
   */
  clear() {
    this.classesByFqcn.clear();
    this.symbolsById.clear();
    this.classMethods.clear();
    this.descendantsCache.clear();
  }
};

// src/graph/callGraph.ts
var CallGraph = class {
  constructor(symbolResolver) {
    this.symbolResolver = symbolResolver;
  }
  // callerSymbolId -> CallSite[]
  outgoingMap = /* @__PURE__ */ new Map();
  // targetName -> CallSite[] (index for fast incoming call resolution)
  incomingNameMap = /* @__PURE__ */ new Map();
  // Map of fileUri -> CallSite[] (for quick cleanup on file edit/delete)
  fileCallSites = /* @__PURE__ */ new Map();
  addCallSite(callSite) {
    let outgoing = this.outgoingMap.get(callSite.callerSymbolId);
    if (!outgoing) {
      outgoing = [];
      this.outgoingMap.set(callSite.callerSymbolId, outgoing);
    }
    outgoing.push(callSite);
    let incByName = this.incomingNameMap.get(callSite.targetName);
    if (!incByName) {
      incByName = [];
      this.incomingNameMap.set(callSite.targetName, incByName);
    }
    incByName.push(callSite);
    let fileSites = this.fileCallSites.get(callSite.fileUri);
    if (!fileSites) {
      fileSites = [];
      this.fileCallSites.set(callSite.fileUri, fileSites);
    }
    fileSites.push(callSite);
  }
  removeFile(fileUri) {
    const sites = this.fileCallSites.get(fileUri) || [];
    for (const site of sites) {
      const outgoing = this.outgoingMap.get(site.callerSymbolId);
      if (outgoing) {
        const idx = outgoing.indexOf(site);
        if (idx !== -1) {
          outgoing.splice(idx, 1);
        }
        if (outgoing.length === 0) {
          this.outgoingMap.delete(site.callerSymbolId);
        }
      }
      const incByName = this.incomingNameMap.get(site.targetName);
      if (incByName) {
        const idx = incByName.indexOf(site);
        if (idx !== -1) {
          incByName.splice(idx, 1);
        }
        if (incByName.length === 0) {
          this.incomingNameMap.delete(site.targetName);
        }
      }
    }
    this.fileCallSites.delete(fileUri);
  }
  clear() {
    this.outgoingMap.clear();
    this.incomingNameMap.clear();
    this.fileCallSites.clear();
  }
  /**
   * Get all symbols/calls made BY the given symbolId.
   */
  getOutgoingCalls(symbolId) {
    const callSites = this.outgoingMap.get(symbolId) || [];
    const results = [];
    for (const site of callSites) {
      let targetSymbol;
      if (site.callType === "function") {
        const funcSymbolId = site.targetClass ? `function:${site.targetClass}` : `function:${site.targetName}`;
        targetSymbol = this.symbolResolver.getSymbol(funcSymbolId);
        if (!targetSymbol) {
          targetSymbol = this.symbolResolver.getSymbol(`function:${site.targetName}`);
        }
      } else if (site.targetClass) {
        targetSymbol = this.symbolResolver.resolveMethod(site.targetClass, site.targetName);
      } else {
        const callerSymbol = this.symbolResolver.getSymbol(symbolId);
        if (callerSymbol && callerSymbol.containerName) {
          targetSymbol = this.symbolResolver.resolveMethod(callerSymbol.containerName, site.targetName);
        }
      }
      results.push({
        targetSymbol,
        targetName: site.targetName,
        targetClass: site.targetClass,
        callSite: site
      });
    }
    return results;
  }
  /**
   * Get all symbols that CALL the given symbolId.
   */
  getIncomingCalls(targetSymbolId) {
    const targetSymbol = this.symbolResolver.getSymbol(targetSymbolId);
    const results = [];
    const targetName = targetSymbol ? targetSymbol.name : this.extractNameFromId(targetSymbolId);
    const targetContainer = targetSymbol ? targetSymbol.containerName : this.extractContainerFromId(targetSymbolId);
    const validTargetClasses = /* @__PURE__ */ new Set();
    if (targetContainer) {
      validTargetClasses.add(targetContainer);
      const descendants = this.symbolResolver.getDescendants(targetContainer);
      for (const d of descendants) {
        validTargetClasses.add(d);
      }
    }
    const candidateSites = this.incomingNameMap.get(targetName) || [];
    for (const site of candidateSites) {
      const callerSymbol = this.symbolResolver.getSymbol(site.callerSymbolId);
      if (!callerSymbol)
        continue;
      let isMatch = false;
      if (site.callType === "function" && (targetSymbolId.startsWith("function:") || !targetContainer)) {
        isMatch = true;
      } else if (site.targetClass) {
        if (validTargetClasses.has(site.targetClass)) {
          isMatch = true;
        }
      } else if (callerSymbol.containerName && validTargetClasses.has(callerSymbol.containerName)) {
        isMatch = true;
      }
      if (isMatch) {
        results.push({
          callerSymbol,
          callSite: site
        });
      }
    }
    return results;
  }
  extractNameFromId(id) {
    const parts = id.split("::");
    if (parts.length > 1)
      return parts[1];
    if (id.startsWith("function:"))
      return id.substring("function:".length);
    return id;
  }
  extractContainerFromId(id) {
    const parts = id.split("::");
    if (parts.length > 1)
      return parts[0];
    return "";
  }
};

// src/cache/cacheManager.ts
var CacheManager = class {
  cache = /* @__PURE__ */ new Map();
  get(fileUri, mtime) {
    const cached = this.cache.get(fileUri);
    if (cached && cached.mtime === mtime) {
      return cached;
    }
    return null;
  }
  set(fileUri, data) {
    this.cache.set(fileUri, data);
  }
  delete(fileUri) {
    this.cache.delete(fileUri);
  }
  clear() {
    this.cache.clear();
  }
  getAll() {
    return Array.from(this.cache.values());
  }
  get size() {
    return this.cache.size;
  }
};

// src/workers/workerPool.ts
var import_worker_threads = require("worker_threads");
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var fs = __toESM(require("fs"));

// src/parser/phpParser.ts
var Engine = require_src();
var PhpAstParser = class {
  engine;
  constructor() {
    this.engine = new Engine({
      parser: {
        extractDoc: true,
        suppressErrors: true
      },
      ast: {
        withPositions: true,
        withComments: false
      }
    });
  }
  parse(code, fileUri, mtime) {
    const classes = [];
    const symbols = [];
    const callSites = [];
    try {
      const ast = this.engine.parseCode(code, fileUri);
      this.traverseProgram(ast, fileUri, classes, symbols, callSites);
    } catch (err) {
    }
    return {
      fileUri,
      mtime,
      classes,
      symbols,
      callSites
    };
  }
  traverseProgram(ast, fileUri, classes, symbols, callSites) {
    if (!ast || typeof ast !== "object") {
      return;
    }
    let currentNamespace = "";
    const currentAliases = {};
    const children = ast.children || ast.body || (Array.isArray(ast) ? ast : []);
    for (const node of children) {
      if (!node || typeof node !== "object")
        continue;
      if (node.kind === "namespace") {
        currentNamespace = this.getNodeName(node.name) || "";
        const nsChildren = node.children || node.body || [];
        this.traverseTopLevelNodes(nsChildren, currentNamespace, { ...currentAliases }, fileUri, classes, symbols, callSites);
      } else {
        this.traverseTopLevelNode(node, currentNamespace, currentAliases, fileUri, classes, symbols, callSites);
      }
    }
  }
  traverseTopLevelNodes(nodes, namespace, aliases, fileUri, classes, symbols, callSites) {
    for (const node of nodes) {
      if (!node || typeof node !== "object")
        continue;
      this.traverseTopLevelNode(node, namespace, aliases, fileUri, classes, symbols, callSites);
    }
  }
  traverseTopLevelNode(node, namespace, aliases, fileUri, classes, symbols, callSites) {
    if (node.kind === "usegroup") {
      this.extractUseGroup(node, aliases);
    } else if (node.kind === "class" || node.kind === "interface" || node.kind === "trait") {
      this.extractClassLike(node, namespace, aliases, fileUri, classes, symbols, callSites);
    } else if (node.kind === "function") {
      this.extractStandaloneFunction(node, namespace, aliases, fileUri, symbols, callSites);
    }
  }
  extractUseGroup(node, aliases) {
    const items = node.items || [];
    for (const item of items) {
      if (!item)
        continue;
      const rawName = item.name || "";
      const fqcn = rawName.startsWith("\\") ? rawName.substring(1) : rawName;
      let alias = item.alias;
      if (alias && typeof alias === "object") {
        alias = alias.name || alias;
      }
      if (!alias) {
        const parts = fqcn.split("\\");
        alias = parts[parts.length - 1];
      }
      if (typeof alias === "string" && alias.length > 0) {
        aliases[alias] = fqcn;
      }
    }
  }
  extractClassLike(node, namespace, aliases, fileUri, classes, symbols, callSites) {
    const className = this.getNodeName(node.name);
    if (!className)
      return;
    const fqcn = namespace ? `${namespace}\\${className}` : className;
    const kind = node.kind;
    let extendsClass;
    if (node.extends) {
      const extName = Array.isArray(node.extends) ? this.getNodeName(node.extends[0]) : this.getNodeName(node.extends);
      if (extName) {
        extendsClass = this.resolveFqcn(extName, namespace, aliases);
      }
    }
    const implementsInterfaces = [];
    if (node.implements && Array.isArray(node.implements)) {
      for (const impl of node.implements) {
        const implName = this.getNodeName(impl);
        if (implName) {
          implementsInterfaces.push(this.resolveFqcn(implName, namespace, aliases));
        }
      }
    }
    const usedTraits = [];
    const bodyNodes = node.body || node.children || [];
    for (const child of bodyNodes) {
      if (child && child.kind === "traituse") {
        const traits = child.traits || [];
        for (const t of traits) {
          const tName = this.getNodeName(t);
          if (tName) {
            usedTraits.push(this.resolveFqcn(tName, namespace, aliases));
          }
        }
      }
    }
    const classDef = {
      fqcn,
      name: className,
      namespace,
      kind,
      extendsClass,
      implementsInterfaces,
      usedTraits,
      fileUri,
      range: this.getRange(node),
      useAliases: { ...aliases }
    };
    classes.push(classDef);
    symbols.push({
      id: fqcn,
      name: className,
      containerName: namespace,
      fqcn,
      kind,
      fileUri,
      range: classDef.range,
      selectionRange: this.getRange(node.name || node)
    });
    for (const child of bodyNodes) {
      if (!child || typeof child !== "object")
        continue;
      if (child.kind === "method") {
        this.extractMethod(child, fqcn, namespace, aliases, fileUri, symbols, callSites);
      }
    }
  }
  extractMethod(node, classFqcn, namespace, aliases, fileUri, symbols, callSites) {
    const methodName = this.getNodeName(node.name);
    if (!methodName)
      return;
    const symbolId = `${classFqcn}::${methodName}`;
    const isStatic = Boolean(node.isStatic);
    const visibility = node.visibility || "public";
    const range = this.getRange(node);
    const selectionRange = this.getRange(node.name || node);
    const symbol = {
      id: symbolId,
      name: methodName,
      containerName: classFqcn,
      fqcn: classFqcn,
      kind: isStatic ? "staticMethod" : "method",
      fileUri,
      range,
      selectionRange,
      isStatic,
      visibility
    };
    symbols.push(symbol);
    if (node.body) {
      this.extractCallsInAst(node.body, symbolId, classFqcn, namespace, aliases, fileUri, callSites);
    }
  }
  extractStandaloneFunction(node, namespace, aliases, fileUri, symbols, callSites) {
    const funcName = this.getNodeName(node.name);
    if (!funcName)
      return;
    const fqcn = namespace ? `${namespace}\\${funcName}` : funcName;
    const symbolId = `function:${fqcn}`;
    const range = this.getRange(node);
    const selectionRange = this.getRange(node.name || node);
    const symbol = {
      id: symbolId,
      name: funcName,
      containerName: namespace,
      fqcn,
      kind: "function",
      fileUri,
      range,
      selectionRange
    };
    symbols.push(symbol);
    if (node.body) {
      this.extractCallsInAst(node.body, symbolId, namespace, namespace, aliases, fileUri, callSites);
    }
  }
  extractCallsInAst(astNode, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites) {
    if (!astNode || typeof astNode !== "object")
      return;
    if (astNode.kind === "call") {
      this.processCallNode(astNode, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
    }
    for (const key of Object.keys(astNode)) {
      if (key === "loc" || key === "comments" || key === "doc")
        continue;
      const val = astNode[key];
      if (Array.isArray(val)) {
        for (const child of val) {
          if (child && typeof child === "object") {
            this.extractCallsInAst(child, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
          }
        }
      } else if (val && typeof val === "object" && val.kind) {
        this.extractCallsInAst(val, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites);
      }
    }
  }
  processCallNode(callNode, callerSymbolId, enclosingClassFqcn, namespace, aliases, fileUri, callSites) {
    var _a;
    const what = callNode.what;
    if (!what)
      return;
    const range = this.getRange(callNode);
    if (what.kind === "propertylookup") {
      const targetName = this.getNodeName(what.offset);
      if (targetName) {
        const objExpr = what.what;
        let isThis = false;
        if (objExpr && (objExpr.kind === "variable" || objExpr.name === "this")) {
          if (objExpr.name === "this" || ((_a = objExpr.name) == null ? void 0 : _a.name) === "this") {
            isThis = true;
          }
        }
        callSites.push({
          callerSymbolId,
          targetName,
          targetClass: isThis ? enclosingClassFqcn : null,
          callType: isThis ? "instance" : "instance",
          fileUri,
          range
        });
      }
    } else if (what.kind === "staticlookup") {
      const targetName = this.getNodeName(what.offset);
      const classRef = this.getNodeName(what.what);
      if (targetName && classRef) {
        let callType = "static";
        let targetClass = null;
        const lowerRef = classRef.toLowerCase();
        if (lowerRef === "self") {
          callType = "self";
          targetClass = enclosingClassFqcn;
        } else if (lowerRef === "static") {
          callType = "static_keyword";
          targetClass = enclosingClassFqcn;
        } else if (lowerRef === "parent") {
          callType = "parent";
          targetClass = enclosingClassFqcn;
        } else {
          targetClass = this.resolveFqcn(classRef, namespace, aliases);
        }
        callSites.push({
          callerSymbolId,
          targetName,
          targetClass,
          callType,
          fileUri,
          range
        });
      }
    } else if (what.kind === "name" || what.kind === "identifier") {
      const funcName = this.getNodeName(what);
      if (funcName) {
        const targetClass = this.resolveFqcn(funcName, namespace, aliases);
        callSites.push({
          callerSymbolId,
          targetName: funcName,
          targetClass: targetClass !== funcName ? targetClass : null,
          callType: "function",
          fileUri,
          range
        });
      }
    }
  }
  resolveFqcn(name, currentNamespace, aliases) {
    if (!name)
      return "";
    if (name.startsWith("\\")) {
      return name.substring(1);
    }
    const parts = name.split("\\");
    const firstPart = parts[0];
    if (aliases[firstPart]) {
      if (parts.length > 1) {
        return `${aliases[firstPart]}\\${parts.slice(1).join("\\")}`;
      }
      return aliases[firstPart];
    }
    return currentNamespace ? `${currentNamespace}\\${name}` : name;
  }
  getNodeName(node) {
    if (!node)
      return null;
    if (typeof node === "string")
      return node;
    if (typeof node.name === "string")
      return node.name;
    if (typeof node.value === "string")
      return node.value;
    if (typeof node.raw === "string")
      return node.raw;
    if (node.kind === "selfreference")
      return "self";
    if (node.kind === "staticreference")
      return "static";
    if (node.kind === "parentreference")
      return "parent";
    if (node.kind === "name" || node.kind === "identifier") {
      return node.name || node.value || null;
    }
    return null;
  }
  getRange(node) {
    if (node && node.loc) {
      return {
        startLine: (node.loc.start ? node.loc.start.line : 1) - 1,
        startCol: node.loc.start ? node.loc.start.column : 0,
        endLine: (node.loc.end ? node.loc.end.line : 1) - 1,
        endCol: node.loc.end ? node.loc.end.column : 0
      };
    }
    return { startLine: 0, startCol: 0, endLine: 0, endCol: 0 };
  }
};

// src/workers/workerPool.ts
var WorkerPool = class {
  workers = [];
  idleWorkers = [];
  taskQueue = [];
  activeTasks = /* @__PURE__ */ new Map();
  nextTaskId = 1;
  fallbackParser = null;
  useWorkers = true;
  constructor(maxWorkers) {
    const numWorkers = maxWorkers || Math.min(os.cpus().length, 4);
    let workerScript = path.join(__dirname, "indexer.worker.js");
    if (!fs.existsSync(workerScript)) {
      const distScript = path.join(__dirname, "..", "..", "dist", "workers", "indexer.worker.js");
      if (fs.existsSync(distScript)) {
        workerScript = distScript;
      } else {
        const distScript2 = path.join(__dirname, "workers", "indexer.worker.js");
        if (fs.existsSync(distScript2)) {
          workerScript = distScript2;
        }
      }
    }
    if (fs.existsSync(workerScript)) {
      try {
        for (let i = 0; i < numWorkers; i++) {
          const worker = new import_worker_threads.Worker(workerScript);
          worker.on("message", (msg) => {
            this.handleWorkerResult(worker, msg);
          });
          worker.on("error", (err) => {
            console.error("Worker thread error:", err);
            this.useWorkers = false;
          });
          this.workers.push(worker);
          this.idleWorkers.push(worker);
        }
      } catch (e) {
        console.warn("WorkerPool failed to initialize worker threads, falling back to main thread parsing:", e);
        this.useWorkers = false;
        this.fallbackParser = new PhpAstParser();
      }
    } else {
      this.useWorkers = false;
      this.fallbackParser = new PhpAstParser();
    }
  }
  async parseFile(fileUri, code, mtime) {
    if (!this.useWorkers || this.workers.length === 0) {
      if (!this.fallbackParser) {
        this.fallbackParser = new PhpAstParser();
      }
      return this.fallbackParser.parse(code, fileUri, mtime);
    }
    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      const task = { id: taskId, fileUri, code, mtime, resolve, reject };
      const worker = this.idleWorkers.pop();
      if (worker) {
        this.dispatchTask(worker, task);
      } else {
        this.taskQueue.push(task);
      }
    });
  }
  dispatchTask(worker, task) {
    this.activeTasks.set(task.id, task);
    worker.postMessage({ id: task.id, fileUri: task.fileUri, code: task.code, mtime: task.mtime });
  }
  handleWorkerResult(worker, msg) {
    const task = this.activeTasks.get(msg.id);
    if (task) {
      this.activeTasks.delete(msg.id);
      if (msg.error) {
        task.reject(new Error(msg.error));
      } else if (msg.data) {
        task.resolve(msg.data);
      } else {
        task.reject(new Error("No data returned from worker"));
      }
    }
    const nextTask = this.taskQueue.shift();
    if (nextTask) {
      this.dispatchTask(worker, nextTask);
    } else {
      this.idleWorkers.push(worker);
    }
  }
  dispose() {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.activeTasks.clear();
    this.taskQueue = [];
  }
};

// src/indexer/workspaceIndexer.ts
var fs2 = __toESM(require("fs"));
var import_fast_glob = __toESM(require_out4());

// src/utils/logger.ts
var vscode = __toESM(require("vscode"));
var Logger = class {
  static channel;
  static initialize() {
    if (!this.channel) {
      this.channel = vscode.window.createOutputChannel("PHP Call Hierarchy");
    }
  }
  static info(message) {
    var _a;
    const formatted = `[INFO ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${message}`;
    console.log(formatted);
    (_a = this.channel) == null ? void 0 : _a.appendLine(formatted);
  }
  static warn(message) {
    var _a;
    const formatted = `[WARN ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${message}`;
    console.warn(formatted);
    (_a = this.channel) == null ? void 0 : _a.appendLine(formatted);
  }
  static error(message, error) {
    var _a;
    const errStr = error ? ` - ${error.stack || error.message || error}` : "";
    const formatted = `[ERROR ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${message}${errStr}`;
    console.error(formatted);
    (_a = this.channel) == null ? void 0 : _a.appendLine(formatted);
  }
  static show() {
    var _a;
    (_a = this.channel) == null ? void 0 : _a.show();
  }
};

// src/utils/fileUtils.ts
var path2 = __toESM(require("path"));
function normalizePath(filePath) {
  let normalized = filePath.replace(/\\/g, "/");
  if (normalized.length > 1 && normalized[1] === ":") {
    normalized = normalized[0].toLowerCase() + normalized.substring(1);
  }
  return normalized;
}
function relativePath(basePath, targetPath) {
  const normBase = normalizePath(basePath);
  const normTarget = normalizePath(targetPath);
  return path2.relative(normBase, normTarget).replace(/\\/g, "/");
}

// src/indexer/workspaceIndexer.ts
var WorkspaceIndexer = class {
  cacheManager;
  symbolResolver;
  callGraph;
  workerPool;
  isIndexing = false;
  constructor(symbolResolver, callGraph, cacheManager, workerPool) {
    this.symbolResolver = symbolResolver;
    this.callGraph = callGraph;
    this.cacheManager = cacheManager || new CacheManager();
    this.workerPool = workerPool || new WorkerPool();
  }
  async indexWorkspace(workspacePath, options, cancellationToken, onProgress) {
    if (this.isIndexing) {
      Logger.warn("Indexing is already in progress");
    }
    this.isIndexing = true;
    const startTime = Date.now();
    try {
      const normPath = normalizePath(workspacePath);
      Logger.info(`Scanning directory for PHP files: ${normPath}`);
      const ignorePatterns = options.excludePatterns || [
        "**/vendor/**",
        "**/node_modules/**",
        "**/storage/**",
        "**/cache/**",
        "**/build/**",
        "**/dist/**"
      ];
      const phpFiles = await (0, import_fast_glob.default)("**/*.php", {
        cwd: normPath,
        absolute: true,
        ignore: ignorePatterns,
        onlyFiles: true,
        suppressErrors: true
      });
      const totalFiles = phpFiles.length;
      Logger.info(`Found ${totalFiles} PHP files to index (excluding configured patterns).`);
      let indexedCount = 0;
      const batchSize = 10;
      for (let i = 0; i < totalFiles; i += batchSize) {
        if (cancellationToken == null ? void 0 : cancellationToken.isCancellationRequested) {
          Logger.info("Workspace indexing cancelled by user");
          break;
        }
        const batch = phpFiles.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (filePath) => {
            const normalizedFileUri = normalizePath(filePath);
            await this.indexSingleFile(normalizedFileUri);
            indexedCount++;
          })
        );
        if (onProgress) {
          onProgress(indexedCount, totalFiles);
        }
      }
      const durationMs = Date.now() - startTime;
      Logger.info(`Workspace indexing completed in ${durationMs}ms. Indexed ${indexedCount}/${totalFiles} files.`);
      return { indexedFiles: indexedCount, totalFiles, durationMs };
    } finally {
      this.isIndexing = false;
    }
  }
  async indexSingleFile(filePath) {
    const normalizedFileUri = normalizePath(filePath);
    try {
      if (!fs2.existsSync(normalizedFileUri)) {
        this.removeSingleFile(normalizedFileUri);
        return null;
      }
      const stats = await fs2.promises.stat(normalizedFileUri);
      const mtime = stats.mtimeMs;
      const cached = this.cacheManager.get(normalizedFileUri, mtime);
      if (cached) {
        this.applyIndexData(cached);
        return cached;
      }
      this.removeSingleFile(normalizedFileUri);
      const code = await fs2.promises.readFile(normalizedFileUri, "utf-8");
      const fileData = await this.workerPool.parseFile(normalizedFileUri, code, mtime);
      this.cacheManager.set(normalizedFileUri, fileData);
      this.applyIndexData(fileData);
      return fileData;
    } catch (err) {
      Logger.error(`Failed to index file: ${normalizedFileUri}`, err);
      return null;
    }
  }
  removeSingleFile(filePath) {
    const normalizedFileUri = normalizePath(filePath);
    const cached = this.cacheManager.get(normalizedFileUri, -1) || this.cacheManager.getAll().find((d) => d.fileUri === normalizedFileUri);
    if (cached) {
      for (const cls of cached.classes) {
        this.symbolResolver.removeClass(cls.fqcn);
      }
      for (const sym of cached.symbols) {
        this.symbolResolver.removeSymbol(sym.id);
      }
    }
    this.callGraph.removeFile(normalizedFileUri);
    this.cacheManager.delete(normalizedFileUri);
  }
  applyIndexData(data) {
    for (const cls of data.classes) {
      this.symbolResolver.addClass(cls);
    }
    for (const sym of data.symbols) {
      this.symbolResolver.addSymbol(sym);
    }
    for (const site of data.callSites) {
      this.callGraph.addCallSite(site);
    }
  }
  clear() {
    this.cacheManager.clear();
    this.symbolResolver.clear();
    this.callGraph.clear();
  }
  dispose() {
    this.workerPool.dispose();
  }
};

// src/providers/CallHierarchyTreeDataProvider.ts
var vscode2 = __toESM(require("vscode"));
var path3 = __toESM(require("path"));
var CallHierarchyItemNode = class extends vscode2.TreeItem {
  constructor(hierarchyNode, collapsibleState) {
    var _a;
    const symbol = hierarchyNode.symbol;
    const name = symbol.name;
    const container = symbol.containerName ? `${symbol.containerName}` : "";
    const label = symbol.kind === "function" ? `${name}()` : `${name}()`;
    super(label, collapsibleState);
    this.hierarchyNode = hierarchyNode;
    this.collapsibleState = collapsibleState;
    const relFile = ((_a = vscode2.workspace.workspaceFolders) == null ? void 0 : _a[0]) ? relativePath(vscode2.workspace.workspaceFolders[0].uri.fsPath, symbol.fileUri) : path3.basename(symbol.fileUri);
    const line = symbol.range.startLine + 1;
    let desc = container ? `${container} \u2022 ${relFile}:${line}` : `${relFile}:${line}`;
    if (hierarchyNode.childCount !== void 0 && hierarchyNode.childCount > 0) {
      desc += ` (${hierarchyNode.childCount})`;
    }
    if (hierarchyNode.callSiteCount !== void 0 && hierarchyNode.callSiteCount > 1) {
      desc += ` [${hierarchyNode.callSiteCount} calls]`;
    }
    if (hierarchyNode.isCycle) {
      desc += " [recursive]";
    }
    this.description = desc;
    this.tooltip = `${symbol.fqcn || symbol.id}
File: ${symbol.fileUri}:${line}
Kind: ${symbol.kind}`;
    if (hierarchyNode.isCycle) {
      this.iconPath = new vscode2.ThemeIcon("sync-ignored");
    } else if (hierarchyNode.direction === "incoming") {
      this.iconPath = new vscode2.ThemeIcon("call-incoming");
    } else {
      this.iconPath = new vscode2.ThemeIcon("call-outgoing");
    }
    this.command = {
      command: "vscode.open",
      title: "Open File",
      arguments: [
        vscode2.Uri.file(symbol.fileUri),
        {
          selection: new vscode2.Range(
            symbol.selectionRange.startLine,
            symbol.selectionRange.startCol,
            symbol.selectionRange.endLine,
            symbol.selectionRange.endCol
          ),
          preserveFocus: true
        }
      ]
    };
    this.contextValue = "callHierarchyNode";
  }
};
var CallHierarchyTreeDataProvider = class {
  constructor(callGraph, symbolResolver, getConfig) {
    this.callGraph = callGraph;
    this.symbolResolver = symbolResolver;
    this.getConfig = getConfig;
  }
  _onDidChangeTreeData = new vscode2.EventEmitter();
  onDidChangeTreeData = this._onDidChangeTreeData.event;
  rootSymbolId = null;
  mode = "incoming";
  setRootSymbol(symbolId, mode = "incoming") {
    this.rootSymbolId = symbolId;
    this.mode = mode;
    this.refresh();
  }
  setMode(mode) {
    this.mode = mode;
    this.refresh();
  }
  getMode() {
    return this.mode;
  }
  refresh() {
    this._onDidChangeTreeData.fire();
  }
  getTreeItem(element) {
    return element;
  }
  async getChildren(element) {
    if (!this.rootSymbolId) {
      return [];
    }
    const { maxDepth, maxResults } = this.getConfig();
    if (!element) {
      const rootSymbol = this.symbolResolver.getSymbol(this.rootSymbolId);
      if (!rootSymbol) {
        return [];
      }
      const rootNode = {
        symbol: rootSymbol,
        direction: this.mode,
        parentSymbolIds: [rootSymbol.id],
        depth: 0
      };
      const childrenNodes = await this.fetchChildNodes(rootNode, maxResults);
      rootNode.childCount = childrenNodes.length;
      const treeNode = new CallHierarchyItemNode(
        rootNode,
        childrenNodes.length > 0 ? vscode2.TreeItemCollapsibleState.Expanded : vscode2.TreeItemCollapsibleState.None
      );
      return [treeNode];
    }
    const parentNode = element.hierarchyNode;
    if (parentNode.isCycle || parentNode.depth >= maxDepth) {
      return [];
    }
    const childHierarchyNodes = await this.fetchChildNodes(parentNode, maxResults);
    return childHierarchyNodes.map((childNode) => {
      const isCollapsible = !childNode.isCycle && childNode.depth < maxDepth && (childNode.childCount === void 0 || childNode.childCount > 0);
      return new CallHierarchyItemNode(
        childNode,
        isCollapsible ? vscode2.TreeItemCollapsibleState.Collapsed : vscode2.TreeItemCollapsibleState.None
      );
    });
  }
  async fetchChildNodes(parentNode, maxResults) {
    const symbolId = parentNode.symbol.id;
    const currentDepth = parentNode.depth + 1;
    const parentPath = parentNode.parentSymbolIds;
    const childNodes = [];
    if (this.mode === "incoming") {
      const incoming = this.callGraph.getIncomingCalls(symbolId);
      const groupedMap = /* @__PURE__ */ new Map();
      for (const inc of incoming) {
        const id = inc.callerSymbol.id;
        let group = groupedMap.get(id);
        if (!group) {
          group = { callerSymbol: inc.callerSymbol, callSites: [] };
          groupedMap.set(id, group);
        }
        group.callSites.push(inc.callSite);
      }
      const limited = Array.from(groupedMap.values()).slice(0, maxResults);
      for (const group of limited) {
        const callerSymbol = group.callerSymbol;
        const isCycle = parentPath.includes(callerSymbol.id);
        const node = {
          symbol: callerSymbol,
          direction: "incoming",
          callSite: group.callSites[0],
          parentSymbolIds: [...parentPath, callerSymbol.id],
          isCycle,
          depth: currentDepth,
          callSiteCount: group.callSites.length
        };
        if (!isCycle) {
          const grandChildren = this.callGraph.getIncomingCalls(callerSymbol.id);
          const uniqueCallerIds = new Set(grandChildren.map((g) => g.callerSymbol.id));
          node.childCount = uniqueCallerIds.size;
        }
        childNodes.push(node);
      }
    } else {
      const outgoing = this.callGraph.getOutgoingCalls(symbolId);
      const groupedMap = /* @__PURE__ */ new Map();
      for (const out of outgoing) {
        let targetSymbol = out.targetSymbol;
        if (!targetSymbol) {
          const dummyId = out.targetClass ? `${out.targetClass}::${out.targetName}` : out.targetName;
          targetSymbol = {
            id: dummyId,
            name: out.targetName,
            containerName: out.targetClass || "",
            fqcn: out.targetClass || "",
            kind: "method",
            fileUri: out.callSite.fileUri,
            range: out.callSite.range,
            selectionRange: out.callSite.range
          };
        }
        const id = targetSymbol.id;
        let group = groupedMap.get(id);
        if (!group) {
          group = { targetSymbol, callSites: [] };
          groupedMap.set(id, group);
        }
        group.callSites.push(out.callSite);
      }
      const limited = Array.from(groupedMap.values()).slice(0, maxResults);
      for (const group of limited) {
        const targetSymbol = group.targetSymbol;
        const isCycle = parentPath.includes(targetSymbol.id);
        const node = {
          symbol: targetSymbol,
          direction: "outgoing",
          callSite: group.callSites[0],
          parentSymbolIds: [...parentPath, targetSymbol.id],
          isCycle,
          depth: currentDepth,
          callSiteCount: group.callSites.length
        };
        if (!isCycle && targetSymbol.id) {
          const grandChildren = this.callGraph.getOutgoingCalls(targetSymbol.id);
          const uniqueTargetIds = new Set(
            grandChildren.map(
              (g) => g.targetSymbol ? g.targetSymbol.id : g.targetClass ? `${g.targetClass}::${g.targetName}` : g.targetName
            )
          );
          node.childCount = uniqueTargetIds.size;
        }
        childNodes.push(node);
      }
    }
    return childNodes;
  }
};

// src/commands/showIncomingCalls.ts
var vscode3 = __toESM(require("vscode"));
function registerShowIncomingCallsCommand(context, treeProvider, symbolResolver, treeView) {
  return vscode3.commands.registerCommand("php-call-hierarchy.showIncomingCalls", async (item) => {
    let symbol;
    if (item && item.hierarchyNode && item.hierarchyNode.symbol) {
      symbol = item.hierarchyNode.symbol;
    } else {
      symbol = await findSymbolAtCursor(symbolResolver);
    }
    if (symbol) {
      treeProvider.setRootSymbol(symbol.id, "incoming");
      try {
        await vscode3.commands.executeCommand("phpCallHierarchyView.focus");
      } catch {
        try {
          await vscode3.commands.executeCommand("phpCallHierarchyExplorerView.focus");
        } catch {
        }
      }
      setTimeout(async () => {
        const children = await treeProvider.getChildren();
        if (children && children.length > 0) {
          treeView.reveal(children[0], { select: true, focus: true, expand: true }).then(
            () => {
            },
            () => {
            }
          );
        }
      }, 50);
      vscode3.window.setStatusBarMessage(`PHP Call Hierarchy: Incoming calls for ${symbol.name}`, 3e3);
    } else {
      vscode3.window.showWarningMessage("No PHP function or method found at active cursor position.");
    }
  });
}
async function findSymbolAtCursor(symbolResolver) {
  const editor = vscode3.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "php") {
    return void 0;
  }
  const filePath = normalizePath(editor.document.uri.fsPath);
  const position = editor.selection.active;
  const line = position.line;
  const col = position.character;
  const matchingSymbols = [];
  const allSymbols = symbolResolver.symbolsById;
  if (allSymbols) {
    for (const sym of allSymbols.values()) {
      if (normalizePath(sym.fileUri) === filePath) {
        if ((line > sym.range.startLine || line === sym.range.startLine && col >= sym.range.startCol) && (line < sym.range.endLine || line === sym.range.endLine && col <= sym.range.endCol)) {
          matchingSymbols.push(sym);
        }
      }
    }
  }
  if (matchingSymbols.length === 0) {
    return void 0;
  }
  matchingSymbols.sort((a, b) => {
    const rangeA = (a.range.endLine - a.range.startLine) * 1e3 + (a.range.endCol - a.range.startCol);
    const rangeB = (b.range.endLine - b.range.startLine) * 1e3 + (b.range.endCol - b.range.startCol);
    return rangeA - rangeB;
  });
  return matchingSymbols[0];
}

// src/commands/showOutgoingCalls.ts
var vscode4 = __toESM(require("vscode"));
function registerShowOutgoingCallsCommand(context, treeProvider, symbolResolver, treeView) {
  return vscode4.commands.registerCommand("php-call-hierarchy.showOutgoingCalls", async (item) => {
    let symbol;
    if (item && item.hierarchyNode && item.hierarchyNode.symbol) {
      symbol = item.hierarchyNode.symbol;
    } else {
      symbol = await findSymbolAtCursor(symbolResolver);
    }
    if (symbol) {
      treeProvider.setRootSymbol(symbol.id, "outgoing");
      try {
        await vscode4.commands.executeCommand("phpCallHierarchyView.focus");
      } catch {
        try {
          await vscode4.commands.executeCommand("phpCallHierarchyExplorerView.focus");
        } catch {
        }
      }
      setTimeout(async () => {
        const children = await treeProvider.getChildren();
        if (children && children.length > 0) {
          treeView.reveal(children[0], { select: true, focus: true, expand: true }).then(
            () => {
            },
            () => {
            }
          );
        }
      }, 50);
      vscode4.window.setStatusBarMessage(`PHP Call Hierarchy: Outgoing calls for ${symbol.name}`, 3e3);
    } else {
      vscode4.window.showWarningMessage("No PHP function or method found at active cursor position.");
    }
  });
}

// src/commands/refreshGraph.ts
var vscode5 = __toESM(require("vscode"));
function registerRefreshGraphCommand(context, indexer, treeProvider) {
  return vscode5.commands.registerCommand("php-call-hierarchy.refresh", async () => {
    const workspaceFolders = vscode5.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode5.window.showWarningMessage("No workspace folder open to index.");
      return;
    }
    const config = vscode5.workspace.getConfiguration("phpCallHierarchy");
    const excludePatterns = config.get("excludePatterns") || [];
    await vscode5.window.withProgress(
      {
        location: vscode5.ProgressLocation.Notification,
        title: "PHP Call Hierarchy: Re-indexing workspace...",
        cancellable: true
      },
      async (progress, token) => {
        indexer.clear();
        let total = 0;
        let lastReported = 0;
        await indexer.indexWorkspace(
          workspaceFolders[0].uri.fsPath,
          { excludePatterns },
          token,
          (indexed, count) => {
            total = count;
            const pct = Math.round(indexed / count * 100);
            if (pct - lastReported >= 5) {
              lastReported = pct;
              progress.report({ message: `${indexed}/${count} files (${pct}%)` });
            }
          }
        );
        treeProvider.refresh();
        vscode5.window.showInformationMessage(`PHP Call Hierarchy re-indexed ${total} PHP files.`);
      }
    );
  });
}

// src/commands/searchSymbol.ts
var vscode6 = __toESM(require("vscode"));
function registerSearchSymbolCommand(context, symbolResolver, treeProvider, treeView) {
  return vscode6.commands.registerCommand("php-call-hierarchy.search", async () => {
    var _a, _b;
    const allSymbolsMap = symbolResolver.symbolsById;
    if (!allSymbolsMap || allSymbolsMap.size === 0) {
      vscode6.window.showWarningMessage("No indexed PHP symbols found. Try refreshing the workspace index.");
      return;
    }
    const items = [];
    const workspacePath = ((_b = (_a = vscode6.workspace.workspaceFolders) == null ? void 0 : _a[0]) == null ? void 0 : _b.uri.fsPath) || "";
    for (const symbol of allSymbolsMap.values()) {
      if (symbol.kind === "method" || symbol.kind === "staticMethod" || symbol.kind === "function") {
        const relFile = workspacePath ? relativePath(workspacePath, symbol.fileUri) : symbol.fileUri;
        const line = symbol.range.startLine + 1;
        items.push({
          label: `$(symbol-method) ${symbol.name}`,
          description: symbol.containerName ? `${symbol.containerName} \u2022 ${relFile}:${line}` : `${relFile}:${line}`,
          detail: symbol.fqcn || symbol.id,
          symbolId: symbol.id
        });
      }
    }
    if (items.length === 0) {
      vscode6.window.showWarningMessage("No functions or methods found in index.");
      return;
    }
    const selected = await vscode6.window.showQuickPick(items, {
      placeHolder: "Search PHP function or method for Call Hierarchy...",
      matchOnDescription: true,
      matchOnDetail: true
    });
    if (selected) {
      treeProvider.setRootSymbol(selected.symbolId, "incoming");
      try {
        await vscode6.commands.executeCommand("phpCallHierarchyView.focus");
      } catch {
        try {
          await vscode6.commands.executeCommand("phpCallHierarchyExplorerView.focus");
        } catch {
        }
      }
      setTimeout(async () => {
        const children = await treeProvider.getChildren();
        if (children && children.length > 0) {
          treeView.reveal(children[0], { select: true, focus: true, expand: true }).then(
            () => {
            },
            () => {
            }
          );
        }
      }, 50);
    }
  });
}

// src/utils/debounce.ts
function debounce(func, waitMs) {
  let timeoutId;
  const debounced = (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, waitMs);
  };
  return debounced;
}

// src/extension.ts
async function activate(context) {
  Logger.initialize();
  Logger.info("Activating PHP Call Hierarchy extension...");
  const symbolResolver = new SymbolResolver();
  const callGraph = new CallGraph(symbolResolver);
  const cacheManager = new CacheManager();
  const workerPool = new WorkerPool();
  const indexer = new WorkspaceIndexer(symbolResolver, callGraph, cacheManager, workerPool);
  const getConfig = () => {
    const config = vscode7.workspace.getConfiguration("phpCallHierarchy");
    return {
      maxDepth: config.get("maxDepth") || 5,
      maxResults: config.get("maxResults") || 50,
      excludePatterns: config.get("excludePatterns") || [
        "**/vendor/**",
        "**/node_modules/**",
        "**/storage/**",
        "**/cache/**",
        "**/build/**",
        "**/dist/**"
      ],
      autoIndexOnStart: config.get("autoIndexOnStart") ?? true
    };
  };
  const treeProvider = new CallHierarchyTreeDataProvider(callGraph, symbolResolver, getConfig);
  const treeView = vscode7.window.createTreeView("phpCallHierarchyView", {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });
  const explorerTreeView = vscode7.window.createTreeView("phpCallHierarchyExplorerView", {
    treeDataProvider: treeProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(treeView, explorerTreeView);
  context.subscriptions.push(
    registerShowIncomingCallsCommand(context, treeProvider, symbolResolver, treeView),
    registerShowOutgoingCallsCommand(context, treeProvider, symbolResolver, treeView),
    registerRefreshGraphCommand(context, indexer, treeProvider),
    registerSearchSymbolCommand(context, symbolResolver, treeProvider, treeView)
  );
  const debouncedIndexSingleFile = debounce((fileUri) => {
    indexer.indexSingleFile(fileUri).then(() => {
      treeProvider.refresh();
    });
  }, 300);
  context.subscriptions.push(
    vscode7.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === "php" || doc.fileName.endsWith(".php")) {
        debouncedIndexSingleFile(normalizePath(doc.fileName));
      }
    })
  );
  context.subscriptions.push(
    vscode7.workspace.onDidDeleteFiles((e) => {
      for (const fileUri of e.files) {
        if (fileUri.fsPath.endsWith(".php")) {
          indexer.removeSingleFile(normalizePath(fileUri.fsPath));
        }
      }
      treeProvider.refresh();
    })
  );
  context.subscriptions.push(
    vscode7.workspace.onDidRenameFiles((e) => {
      for (const file of e.files) {
        if (file.oldUri.fsPath.endsWith(".php")) {
          indexer.removeSingleFile(normalizePath(file.oldUri.fsPath));
        }
        if (file.newUri.fsPath.endsWith(".php")) {
          debouncedIndexSingleFile(normalizePath(file.newUri.fsPath));
        }
      }
    })
  );
  const cfg = getConfig();
  if (cfg.autoIndexOnStart && vscode7.workspace.workspaceFolders && vscode7.workspace.workspaceFolders.length > 0) {
    const rootPath = vscode7.workspace.workspaceFolders[0].uri.fsPath;
    Logger.info(`Auto-indexing workspace on activation: ${rootPath}`);
    setTimeout(() => {
      indexer.indexWorkspace(rootPath, { excludePatterns: cfg.excludePatterns }).then(
        (res) => {
          Logger.info(`Auto-indexing finished in ${res.durationMs}ms (${res.indexedFiles}/${res.totalFiles} files)`);
          treeProvider.refresh();
        },
        (err) => {
          Logger.error("Auto-indexing error", err);
        }
      );
    }, 100);
  }
  context.subscriptions.push({
    dispose: () => {
      indexer.dispose();
    }
  });
  Logger.info("PHP Call Hierarchy extension activated successfully.");
}
function deactivate() {
  Logger.info("Deactivating PHP Call Hierarchy extension.");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
/*! Bundled license information:

is-extglob/index.js:
  (*!
   * is-extglob <https://github.com/jonschlinkert/is-extglob>
   *
   * Copyright (c) 2014-2016, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

is-glob/index.js:
  (*!
   * is-glob <https://github.com/jonschlinkert/is-glob>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   *)

is-number/index.js:
  (*!
   * is-number <https://github.com/jonschlinkert/is-number>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

to-regex-range/index.js:
  (*!
   * to-regex-range <https://github.com/micromatch/to-regex-range>
   *
   * Copyright (c) 2015-present, Jon Schlinkert.
   * Released under the MIT License.
   *)

fill-range/index.js:
  (*!
   * fill-range <https://github.com/jonschlinkert/fill-range>
   *
   * Copyright (c) 2014-present, Jon Schlinkert.
   * Licensed under the MIT License.
   *)

queue-microtask/index.js:
  (*! queue-microtask. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)

run-parallel/index.js:
  (*! run-parallel. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=extension.js.map
