// Generated by CoffeeScript 1.3.3
var CS, JS, any, beingDeclared, concatMap, difference, envEnrichments, exports, expr, foldl1, forceBlock, genSym, jsReserved, makeReturn, map, needsCaching, statementNodes, stmt, undef, union, usedAsExpression, _ref, _ref1, _ref2,
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ref = require('./functional-helpers'), any = _ref.any, concatMap = _ref.concatMap, difference = _ref.difference, foldl1 = _ref.foldl1, map = _ref.map, union = _ref.union;

_ref1 = require('./helpers'), beingDeclared = _ref1.beingDeclared, usedAsExpression = _ref1.usedAsExpression, envEnrichments = _ref1.envEnrichments;

CS = require('./nodes');

JS = require('./js-nodes');

exports = (_ref2 = typeof module !== "undefined" && module !== null ? module.exports : void 0) != null ? _ref2 : this;

jsReserved = ['break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield'];

statementNodes = [JS.BlockStatement, JS.BreakStatement, JS.ContinueStatement, JS.DebuggerStatement, JS.DoWhileStatement, JS.EmptyStatement, JS.ExpressionStatement, JS.ForInStatement, JS.ForStatement, JS.FunctionDeclaration, JS.IfStatement, JS.LabeledStatement, JS.ReturnStatement, JS.SwitchStatement, JS.ThrowStatement, JS.TryStatement, JS.VariableDeclaration, JS.WhileStatement, JS.WithStatement];

genSym = (function() {
  var format, genSymCounters;
  genSymCounters = {};
  format = function(pre, n) {
    return "" + pre + "$" + n;
  };
  return function(pre) {
    var existingPre, value;
    for (existingPre in genSymCounters) {
      if (!__hasProp.call(genSymCounters, existingPre)) continue;
      value = genSymCounters[existingPre];
      if (!(pre === existingPre)) {
        continue;
      }
      ++genSymCounters[pre];
      return format(pre, value);
    }
    genSymCounters[pre] = 1;
    return format(pre, 0);
  };
})();

undef = new JS.UnaryExpression('void', new JS.Literal(0));

makeReturn = function(node) {
  if (node == null) {
    return new JS.ReturnStatement(undef);
  }
  if (node["instanceof"](JS.BlockStatement)) {
    return new JS.BlockStatement(__slice.call(node.body.slice(0, -1)).concat([makeReturn(node.body.slice(-1)[0])]));
  } else if (node["instanceof"](JS.SequenceExpression)) {
    return new JS.SequenceExpression(__slice.call(node.expressions.slice(0, -1)).concat([makeReturn(node.expressions.slice(-1)[0])]));
  } else {
    return new JS.ReturnStatement(expr(node));
  }
};

needsCaching = function(node) {
  return (envEnrichments(node, [])).length > 0 || (node["instanceof"](CS.FunctionApplications, CS.DoOp, CS.NewOp)) || (any(difference(node.childNodes, node.listMembers), function(n) {
    return needsCaching(node[n]);
  })) || (any(node.listMembers, function(n) {
    return any(node[n], needsCaching);
  }));
};

stmt = function(e) {
  var walk;
  if (e == null) {
    return e;
  }
  if (e["instanceof"].apply(e, statementNodes)) {
    return e;
  } else if (e["instanceof"](JS.SequenceExpression)) {
    walk = function(seq) {
      return concatMap(seq.expressions, function(e) {
        if (e["instanceof"](JS.SequenceExpression)) {
          return walk(e);
        } else {
          return [stmt(e)];
        }
      });
    };
    return new JS.BlockStatement(walk(e));
  } else if (e["instanceof"](JS.ConditionalExpression)) {
    return new JS.IfStatement(expr(e.test), stmt(e.consequent), stmt(e.alternate));
  } else {
    return new JS.ExpressionStatement(e);
  }
};

expr = function(s) {
  var alternate, consequent, _ref3, _ref4;
  if (s == null) {
    return s;
  }
  if (!s["instanceof"].apply(s, statementNodes)) {
    return s;
  } else if (s["instanceof"](JS.BlockStatement)) {
    switch (s.body.length) {
      case 0:
        return undef;
      case 1:
        return expr(s.body[0]);
      default:
        return new JS.SequenceExpression(map(s.body, expr));
    }
  } else if (s["instanceof"](JS.BreakStatement)) {

  } else if (s["instanceof"](JS.ExpressionStatement)) {
    return s.expression;
  } else if (s["instanceof"](JS.IfStatement)) {
    consequent = expr((_ref3 = s.consequent) != null ? _ref3 : undef);
    alternate = expr((_ref4 = s.alternate) != null ? _ref4 : undef);
    return new JS.ConditionalExpression(s.test, consequent, alternate);
  } else {
    throw new Error("expr: " + s.type);
  }
};

forceBlock = function(node) {
  if (node == null) {
    return node;
  }
  node = stmt(node);
  if (node["instanceof"](JS.BlockStatement)) {
    return node;
  } else {
    return new JS.BlockStatement([node]);
  }
};

exports.Compiler = (function() {
  var defaultRules,
    _this = this;

  Compiler.compile = function() {
    var _ref3;
    return (_ref3 = new Compiler).compile.apply(_ref3, arguments);
  };

  defaultRules = [
    [
      CS.Program, function(_arg) {
        var block, declarations, declarator, inScope, v;
        block = _arg.block, inScope = _arg.inScope;
        if (block == null) {
          return new JS.Program([]);
        }
        block = stmt(block);
        block = block["instanceof"](JS.BlockStatement) ? block.body : [block];
        if (inScope.length > 0) {
          declarations = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = inScope.length; _i < _len; _i++) {
              v = inScope[_i];
              _results.push(new JS.VariableDeclarator(new JS.Identifier(v)));
            }
            return _results;
          })();
          declarator = new JS.VariableDeclaration(declarations);
          declarator.kind = 'var';
          block.unshift(declarator);
        }
        return new JS.Program(block);
      }
    ], [
      CS.Block, function(_arg) {
        var statements;
        statements = _arg.statements;
        switch (statements.length) {
          case 0:
            return new JS.EmptyStatement;
          case 1:
            return new stmt(statements[0]);
          default:
            return new JS.BlockStatement(map(statements, stmt));
        }
      }
    ], [
      CS.SeqOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.SequenceExpression([left, right]);
      }
    ], [
      CS.Conditional, function(_arg) {
        var block, compile, condition, elseBlock;
        condition = _arg.condition, block = _arg.block, elseBlock = _arg.elseBlock, compile = _arg.compile;
        return new JS.IfStatement(expr(condition), forceBlock(block), forceBlock(elseBlock));
      }
    ], [
      CS.ArrayInitialiser, function(_arg) {
        var members;
        members = _arg.members;
        return new JS.ArrayExpression(map(members, expr));
      }
    ], [
      CS.ObjectInitialiser, function(_arg) {
        var members;
        members = _arg.members;
        return new JS.ObjectExpression(members);
      }
    ], [
      CS.ObjectInitialiserMember, function(_arg) {
        var expression, key;
        key = _arg.key, expression = _arg.expression;
        return new JS.Property(key, expr(expression));
      }
    ], [
      CS.Function, function(_arg) {
        var block, parameters;
        parameters = _arg.parameters, block = _arg.block;
        return new JS.FunctionExpression(null, parameters, forceBlock(makeReturn(block)));
      }
    ], [
      CS.AssignOp, function(_arg) {
        var assignee, assignment, assignments, compile, e, expression, i, m, _i, _j, _len, _len1, _ref3, _ref4;
        assignee = _arg.assignee, expression = _arg.expression, compile = _arg.compile;
        switch (false) {
          case !this.assignee["instanceof"](CS.ArrayInitialiser):
            assignments = [];
            e = this.expression;
            if (needsCaching(this.expression)) {
              e = new CS.GenSym(genSym('cache'));
              assignments.push(new CS.AssignOp(e, this.expression));
            }
            _ref3 = this.assignee.members;
            for (i = _i = 0, _len = _ref3.length; _i < _len; i = ++_i) {
              m = _ref3[i];
              assignments.push(new CS.AssignOp(m, new CS.DynamicMemberAccessOp(e, new CS.Int(i))));
            }
            if (!assignments.length) {
              return undef;
            }
            return compile(foldl1(assignments, function(a, b) {
              return new CS.SeqOp(a, b);
            }));
          case !this.assignee["instanceof"](CS.ObjectInitialiser):
            assignments = [];
            e = this.expression;
            if (needsCaching(this.expression)) {
              e = new CS.GenSym(genSym('cache'));
              assignments.push(new CS.AssignOp(e, this.expression));
            }
            _ref4 = this.assignee.members;
            for (i = _j = 0, _len1 = _ref4.length; _j < _len1; i = ++_j) {
              m = _ref4[i];
              assignments.push(new CS.AssignOp(m.expression, new CS.MemberAccessOp(e, m.key.data)));
            }
            if (!assignments.length) {
              return undef;
            }
            return compile(foldl1(assignments, function(a, b) {
              return new CS.SeqOp(a, b);
            }));
          case !this.assignee["instanceof"](CS.Identifier, CS.GenSym, CS.MemberAccessOps):
            assignment = new JS.AssignmentExpression(assignee, expression);
            assignment.operator = '=';
            return assignment;
          default:
            throw new Error("compile: AssignOp: unassignable assignee: " + this.assignee.className);
        }
      }
    ], [
      CS.FunctionApplication, function(_arg) {
        var args, fn;
        fn = _arg["function"], args = _arg["arguments"];
        return new JS.CallExpression(expr(fn), map(args, expr));
      }
    ], [
      CS.NewOp, function(_arg) {
        var args, constructor;
        constructor = _arg.constructor, args = _arg["arguments"];
        return new JS.NewExpression(constructor, args);
      }
    ], [
      CS.ConcatOp, function(_arg) {
        var ancestry, left, leftmost, plusOp, right, _ref3;
        left = _arg.left, right = _arg.right, ancestry = _arg.ancestry;
        plusOp = new JS.BinaryExpression('+', left, right);
        if (!ancestry[0]["instanceof"](CS.ConcatOp)) {
          leftmost = plusOp;
          while ((_ref3 = leftmost.left) != null ? _ref3.left : void 0) {
            leftmost = leftmost.left;
          }
          leftmost.left = new JS.BinaryExpression('+', new JS.Literal(''), leftmost.left);
        }
        return plusOp;
      }
    ], [
      CS.MemberAccessOp, function(_arg) {
        var expression, _ref3;
        expression = _arg.expression;
        if (_ref3 = this.memberName, __indexOf.call(jsReserved, _ref3) >= 0) {
          return new JS.MemberExpression(true, expression, new JS.Literal(this.memberName));
        } else {
          return new JS.MemberExpression(false, expression, new JS.Identifier(this.memberName));
        }
      }
    ], [
      CS.DynamicMemberAccessOp, function(_arg) {
        var expression, indexingExpr;
        expression = _arg.expression, indexingExpr = _arg.indexingExpr;
        return new JS.MemberExpression(true, expression, indexingExpr);
      }
    ], [
      CS.UnaryExistsOp, function(_arg) {
        var compile, expression, inScope, nullTest, typeofTest, _ref3;
        expression = _arg.expression, inScope = _arg.inScope, compile = _arg.compile;
        nullTest = new JS.BinaryExpression('!=', new JS.Literal(null), expression);
        if ((expression["instanceof"](JS.Identifier)) && (_ref3 = expression.name, __indexOf.call(inScope, _ref3) < 0)) {
          typeofTest = new JS.BinaryExpression('!==', new JS.Literal('undefined'), new JS.UnaryExpression('typeof', expression));
          return new JS.BinaryExpression('&&', typeofTest, nullTest);
        } else {
          return nullTest;
        }
      }
    ], [
      CS.DoOp, function(_arg) {
        var args, compile, expression, param;
        expression = _arg.expression, compile = _arg.compile;
        args = [];
        if (this.expression["instanceof"](CS.Function)) {
          args = (function() {
            var _i, _len, _ref3, _results;
            _ref3 = this.expression.parameters;
            _results = [];
            for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
              param = _ref3[_i];
              switch (false) {
                case !param["instanceof"](CS.AssignOp):
                  _results.push(param.expression);
                  break;
                case !param["instanceof"](CS.Identifier, CS.MemberAccessOp):
                  _results.push(param);
                  break;
                default:
                  _results.push((new CS.Undefined).g());
              }
            }
            return _results;
          }).call(this);
        }
        return compile(new CS.FunctionApplication(this.expression, args));
      }
    ], [
      CS.Return, function(_arg) {
        var e;
        e = _arg.expression;
        return new JS.ReturnStatement(expr(e));
      }
    ], [
      CS.DivideOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('/', expr(left), expr(right));
      }
    ], [
      CS.MultiplyOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('*', expr(left), expr(right));
      }
    ], [
      CS.RemOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('%', expr(left), expr(right));
      }
    ], [
      CS.PlusOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('+', expr(left), expr(right));
      }
    ], [
      CS.SubtractOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('-', expr(left), expr(right));
      }
    ], [
      CS.OfOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('in', expr(left), expr(right));
      }
    ], [
      CS.InstanceofOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('instanceof', expr(left), expr(right));
      }
    ], [
      CS.LogicalAndOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('&&', expr(left), expr(right));
      }
    ], [
      CS.LogicalOrOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('||', expr(left), expr(right));
      }
    ], [
      CS.EQOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('===', expr(left), expr(right));
      }
    ], [
      CS.NEQOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('!==', expr(left), expr(right));
      }
    ], [
      CS.GTEOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('>=', expr(left), expr(right));
      }
    ], [
      CS.GTOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('>', expr(left), expr(right));
      }
    ], [
      CS.LTEOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('<=', expr(left), expr(right));
      }
    ], [
      CS.LTOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('<', expr(left), expr(right));
      }
    ], [
      CS.BitAndOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('&', expr(left), expr(right));
      }
    ], [
      CS.BitOrOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('|', expr(left), expr(right));
      }
    ], [
      CS.BitXorOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('^', expr(left), expr(right));
      }
    ], [
      CS.LeftShiftOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('<<', expr(left), expr(right));
      }
    ], [
      CS.SignedRightShiftOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('>>', expr(left), expr(right));
      }
    ], [
      CS.UnsignedRightShiftOp, function(_arg) {
        var left, right;
        left = _arg.left, right = _arg.right;
        return new JS.BinaryExpression('>>>', expr(left), expr(right));
      }
    ], [
      CS.PreIncrementOp, function(_arg) {
        var e;
        e = _arg.expression;
        return new JS.UpdateExpression('++', true, expr(e));
      }
    ], [
      CS.Identifier, CS.GenSym, function() {
        return new JS.Identifier(this.data);
      }
    ], [
      CS.Bool, CS.Int, CS.Float, CS.String, function() {
        return new JS.Literal(this.data);
      }
    ], [
      CS.Null, function() {
        return new JS.Literal(null);
      }
    ], [
      CS.Undefined, function() {
        return undef;
      }
    ], [
      CS.This, function() {
        return new JS.ThisExpression;
      }
    ]
  ];

  function Compiler() {
    var ctor, ctors, handler, _i, _j, _k, _len, _len1, _ref3;
    this.rules = {};
    for (_i = 0, _len = defaultRules.length; _i < _len; _i++) {
      _ref3 = defaultRules[_i], ctors = 2 <= _ref3.length ? __slice.call(_ref3, 0, _j = _ref3.length - 1) : (_j = 0, []), handler = _ref3[_j++];
      for (_k = 0, _len1 = ctors.length; _k < _len1; _k++) {
        ctor = ctors[_k];
        this.addRule(ctor.prototype.className, handler);
      }
    }
  }

  Compiler.prototype.addRule = function(ctor, handler) {
    this.rules[ctor] = handler;
    return this;
  };

  Compiler.prototype.compile = (function() {
    var defaultRule, walk;
    walk = function(fn, inScope, ancestry) {
      var child, childName, children, jsNode, member, _i, _len, _ref3, _ref4;
      if (inScope == null) {
        inScope = [];
      }
      if (ancestry == null) {
        ancestry = [];
      }
      if (((_ref3 = ancestry[0]) != null ? _ref3["instanceof"](CS.Function, CS.BoundFunction) : void 0) && this === ancestry[0].block) {
        inScope = union(inScope, concatMap(ancestry[0].parameters, beingDeclared));
      }
      ancestry.unshift(this);
      children = {};
      _ref4 = this.childNodes;
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        childName = _ref4[_i];
        if (this[childName] != null) {
          children[childName] = (function() {
            var _j, _len1, _ref5, _results;
            if (__indexOf.call(this.listMembers, childName) >= 0) {
              _ref5 = this[childName];
              _results = [];
              for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
                member = _ref5[_j];
                jsNode = walk.call(member, fn, inScope, ancestry);
                inScope = union(inScope, envEnrichments(member, inScope));
                _results.push(jsNode);
              }
              return _results;
            } else {
              child = this[childName];
              jsNode = walk.call(child, fn, inScope, ancestry);
              inScope = union(inScope, envEnrichments(child, inScope));
              return jsNode;
            }
          }).call(this);
        }
      }
      children.inScope = inScope;
      children.ancestry = ancestry;
      children.compile = function(node) {
        return walk.call(node.g(), fn, inScope, ancestry);
      };
      ancestry.shift();
      return fn.call(this, children);
    };
    defaultRule = function() {
      throw new Error("compile: Non-exhaustive patterns in case: " + this.className);
    };
    return function(ast) {
      var rules;
      rules = this.rules;
      return walk.call(ast, function() {
        var _ref3;
        return ((_ref3 = rules[this.className]) != null ? _ref3 : defaultRule).apply(this, arguments);
      });
    };
  })();

  return Compiler;

}).call(this);