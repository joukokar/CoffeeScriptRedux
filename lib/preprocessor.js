// Generated by CoffeeScript 2.0.0-beta6-dev
var EventEmitter, pointToErrorLocation, Preprocessor, StringScanner;
EventEmitter = require('events').EventEmitter;
pointToErrorLocation = require('./helpers').pointToErrorLocation;
StringScanner = require('StringScanner');
this.Preprocessor = Preprocessor = function (super$) {
  var DEDENT, INDENT, TERM, ws;
  extends$(Preprocessor, super$);
  ws = '\\t\\x0B\\f\\r \\xA0\\u1680\\u180E\\u2000-\\u200A\\u202F\\u205F\\u3000\\uFEFF';
  INDENT = '\uefef';
  DEDENT = '\ueffe';
  TERM = '\uefff';
  function Preprocessor(param$) {
    this.options = param$;
    if (null == this.options)
      this.options = {};
    this.preprocessed = '';
    this.base = null;
    this.indents = [];
    this.context = [];
  }
  Preprocessor.process = function (input, options) {
    if (null == options)
      options = {};
    return new Preprocessor(options).process(input);
  };
  Preprocessor.prototype.err = function (c) {
    var columns, context, lines, token;
    token = function () {
      switch (c) {
      case INDENT:
        return 'INDENT';
      case DEDENT:
        return 'DEDENT';
      case TERM:
        return 'TERM';
      default:
        return '"' + c.replace(/"/g, '\\"') + '"';
      }
    }.call(this);
    lines = this.ss.str.substr(0, this.ss.pos).split(/\n/) || [''];
    columns = null != lines[lines.length - 1] ? lines[lines.length - 1].length : 0;
    context = pointToErrorLocation(this.ss.str, lines.length, columns);
    throw new Error('Unexpected ' + token + '\n' + context);
  };
  Preprocessor.prototype.peek = function () {
    if (this.context.length) {
      return this.context[this.context.length - 1];
    } else {
      return null;
    }
  };
  Preprocessor.prototype.observe = function (c) {
    var top;
    top = this.peek();
    switch (c) {
    case '"""':
    case "'''":
    case '"':
    case "'":
    case '###':
    case '`':
    case '///':
    case '/':
      if (top === c) {
        this.context.pop();
      } else {
        this.context.push(c);
      }
      break;
    case INDENT:
    case '#':
    case '#{':
    case '[':
    case '(':
    case '{':
    case '\\':
    case 'regexp-[':
    case 'regexp-(':
    case 'regexp-{':
    case 'heregexp-#':
    case 'heregexp-[':
    case 'heregexp-(':
    case 'heregexp-{':
      this.context.push(c);
      break;
    case DEDENT:
      if (!(top === INDENT))
        this.err(c);
      this.context.pop();
      break;
    case '\n':
      if (!(top === '#' || top === 'heregexp-#'))
        this.err(c);
      this.context.pop();
      break;
    case ']':
      if (!(top === '[' || top === 'regexp-[' || top === 'heregexp-['))
        this.err(c);
      this.context.pop();
      break;
    case ')':
      if (!(top === '(' || top === 'regexp-(' || top === 'heregexp-('))
        this.err(c);
      this.context.pop();
      break;
    case '}':
      if (!(top === '#{' || top === '{' || top === 'regexp-{' || top === 'heregexp-{'))
        this.err(c);
      this.context.pop();
      break;
    case 'end-\\':
      if (!(top === '\\'))
        this.err(c);
      this.context.pop();
      break;
    default:
      throw new Error('undefined token observed: ' + c);
    }
    return this.context;
  };
  Preprocessor.prototype.p = function (s) {
    if (null != s)
      this.preprocessed = '' + this.preprocessed + s;
    return s;
  };
  Preprocessor.prototype.scan = function (r) {
    return this.p(this.ss.scan(r));
  };
  Preprocessor.prototype.process = function (input) {
    var context, indent, indentIndex, lastChar, lineLen, lines, message, nonIdentifierBefore, pos, spaceBefore, tok;
    if (this.options.literate)
      input = input.replace(/^( {0,3}\S)/gm, '    #$1');
    this.ss = new StringScanner(input);
    while (!this.ss.eos()) {
      switch (this.peek()) {
      case null:
      case INDENT:
      case '#{':
      case '[':
      case '(':
      case '{':
        if (this.ss.bol() || this.scan(new RegExp('(?:[' + ws + ']*\\n)+'))) {
          this.scan(new RegExp('(?:[' + ws + ']*(\\#\\#?(?!\\#)[^\\n]*)?\\n)+'));
          if (null != this.base) {
            if (!(this.ss.eos() || null != this.scan(this.base)))
              throw new Error('inconsistent base indentation');
          } else {
            this.base = new RegExp('' + this.scan(new RegExp('[' + ws + ']*')) + '');
          }
          indentIndex = 0;
          while (indentIndex < this.indents.length) {
            indent = this.indents[indentIndex];
            if (this.ss.check(new RegExp('' + indent + ''))) {
              this.scan(new RegExp('' + indent + ''));
            } else if (this.ss.eos() || this.ss.check(new RegExp('[^' + ws + ']'))) {
              this.indents.splice(indentIndex, 1);
              --indentIndex;
              this.observe(DEDENT);
              this.p('' + DEDENT + TERM);
            } else {
              lines = this.ss.str.substr(0, this.ss.pos).split(/\n/) || [''];
              message = 'Syntax error on line ' + lines.length + ': indentation is ambiguous';
              lineLen = this.indents.reduce(function (l, r) {
                return l + r.length;
              }, 0);
              context = pointToErrorLocation(this.ss.str, lines.length, lineLen);
              throw new Error('' + message + '\n' + context);
            }
            ++indentIndex;
          }
          if (this.ss.check(new RegExp('[' + ws + ']+[^' + ws + '#]'))) {
            this.indents.push(this.scan(new RegExp('[' + ws + ']+')));
            this.observe(INDENT);
            this.p(INDENT);
          }
        }
        tok = function () {
          switch (this.peek()) {
          case '[':
            this.scan(/[^\n'"\\\/#`[({\]]+/);
            return this.scan(/\]/);
          case '(':
            this.scan(/[^\n'"\\\/#`[({)]+/);
            return this.scan(/\)/);
          case '#{':
          case '{':
            this.scan(/[^\n'"\\\/#`[({}]+/);
            return this.scan(/\}/);
          default: {
              this.scan(/[^\n'"\\\/#`[({]+/);
              return null;
            }
          }
        }.call(this);
        if (tok) {
          this.observe(tok);
          continue;
        }
        if (tok = this.scan(/"""|'''|\/\/\/|###|["'`#[({\\]/)) {
          this.observe(tok);
        } else if (tok = this.scan(/\//)) {
          pos = this.ss.position();
          if (pos > 1) {
            lastChar = this.ss.string()[pos - 2];
            spaceBefore = new RegExp('[' + ws + ']').test(lastChar);
            nonIdentifierBefore = /[\W_$]/.test(lastChar);
          }
          if (pos === 1 || (spaceBefore ? !this.ss.check(new RegExp('[' + ws + '=]')) : nonIdentifierBefore))
            this.observe('/');
        }
        break;
      case '\\':
        if (this.scan(/[\s\S]/))
          this.observe('end-\\');
        break;
      case '"""':
        this.scan(/(?:[^"#\\]+|""?(?!")|#(?!{)|\\.)+/);
        this.ss.scan(/\\\n/);
        if (tok = this.scan(/#{|"""/)) {
          this.observe(tok);
        } else if (tok = this.scan(/#{|"""/)) {
          this.observe(tok);
        }
        break;
      case '"':
        this.scan(/(?:[^"#\\]+|#(?!{)|\\.)+/);
        this.ss.scan(/\\\n/);
        if (tok = this.scan(/#{|"/))
          this.observe(tok);
        break;
      case "'''":
        this.scan(/(?:[^'\\]+|''?(?!')|\\.)+/);
        this.ss.scan(/\\\n/);
        if (tok = this.scan(/'''/))
          this.observe(tok);
        break;
      case "'":
        this.scan(/(?:[^'\\]+|\\.)+/);
        this.ss.scan(/\\\n/);
        if (tok = this.scan(/'/))
          this.observe(tok);
        break;
      case '###':
        this.scan(/(?:[^#]+|##?(?!#))+/);
        if (tok = this.scan(/###/))
          this.observe(tok);
        break;
      case '#':
        this.scan(/[^\n]+/);
        if (tok = this.scan(/\n/))
          this.observe(tok);
        break;
      case '`':
        this.scan(/[^`]+/);
        if (tok = this.scan(/`/))
          this.observe(tok);
        break;
      case '///':
        this.scan(/(?:[^[/#\\]+|\/\/?(?!\/)|\\.)+/);
        if (tok = this.scan(/#{|\/\/\/|\\/)) {
          this.observe(tok);
        } else if (this.ss.scan(/#/)) {
          this.observe('heregexp-#');
        } else if (tok = this.scan(/[\[]/)) {
          this.observe('heregexp-' + tok);
        }
        break;
      case 'heregexp-[':
        this.scan(/(?:[^\]\/\\]+|\/\/?(?!\/))+/);
        if (tok = this.scan(/[\]\\]|#{|\/\/\//))
          this.observe(tok);
        break;
      case 'heregexp-#':
        this.ss.scan(/(?:[^\n/]+|\/\/?(?!\/))+/);
        if (tok = this.scan(/\n|\/\/\//))
          this.observe(tok);
        break;
      case '/':
        this.scan(/[^[/\\]+/);
        if (tok = this.scan(/[\/\\]/)) {
          this.observe(tok);
        } else if (tok = this.scan(/\[/)) {
          this.observe('regexp-' + tok);
        }
        break;
      case 'regexp-[':
        this.scan(/[^\]\\]+/);
        if (tok = this.scan(/[\]\\]/))
          this.observe(tok);
      }
    }
    this.scan(new RegExp('[' + ws + '\\n]*$'));
    while (this.context.length) {
      switch (this.peek()) {
      case INDENT:
        this.observe(DEDENT);
        this.p('' + DEDENT + TERM);
        break;
      case '#':
        this.observe('\n');
        this.p('\n');
        break;
      default:
        throw new Error('Unclosed "' + this.peek().replace(/"/g, '\\"') + '" at EOF');
      }
    }
    return this.preprocessed;
  };
  return Preprocessor;
}(EventEmitter);
function isOwn$(o, p) {
  return {}.hasOwnProperty.call(o, p);
}
function extends$(child, parent) {
  for (var key in parent)
    if (isOwn$(parent, key))
      child[key] = parent[key];
  function ctor() {
    this.constructor = child;
  }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
}