// Generated by CoffeeScript 2.0.0-beta6-dev
var all, any, beingDeclared, concat, concatMap, CS, declarationsFor, difference, envEnrichments, exports, foldl, foldl1, isFalsey, isTruthy, makeDispatcher, mayHaveSideEffects, union, usedAsExpression;
cache$ = require('./functional-helpers');
all = cache$.all;
any = cache$.any;
concat = cache$.concat;
concatMap = cache$.concatMap;
difference = cache$.difference;
foldl = cache$.foldl;
foldl1 = cache$.foldl1;
union = cache$.union;
cache$1 = require('./helpers');
beingDeclared = cache$1.beingDeclared;
declarationsFor = cache$1.declarationsFor;
usedAsExpression = cache$1.usedAsExpression;
envEnrichments = cache$1.envEnrichments;
CS = require('./nodes');
exports = null != ('undefined' !== typeof module && null != module ? module.exports : void 0) ? 'undefined' !== typeof module && null != module ? module.exports : void 0 : this;
makeDispatcher = function (defaultValue, handlers, defaultHandler) {
  var cache$2, ctor, ctors, handler, handlers_, size$;
  if (null == defaultHandler)
    defaultHandler = function () {
    };
  handlers_ = {};
  for (var i$ = 0, length$ = handlers.length; i$ < length$; ++i$) {
    {
      cache$2 = handlers[i$];
      size$ = cache$2.length;
      ctors = size$ > 1 ? [].slice.call(cache$2, 0, size$ - 1) : [];
      handler = cache$2[size$ - 1];
    }
    for (var i$1 = 0, length$1 = ctors.length; i$1 < length$1; ++i$1) {
      ctor = ctors[i$1];
      handlers_[ctor.prototype.className] = handler;
    }
  }
  return function (node, args) {
    args = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
    if (!(null != node))
      return defaultValue;
    handler = Object.prototype.hasOwnProperty.call(handlers_, node.className) ? handlers_[node.className] : defaultHandler;
    return handler.apply(node, args);
  };
};
isTruthy = makeDispatcher(false, [
  [
    CS.ArrayInitialiser,
    CS.Class,
    CS.DeleteOp,
    CS.ForIn,
    CS.ForOf,
    CS.Function,
    CS.BoundFunction,
    CS.HeregExp,
    CS.ObjectInitialiser,
    CS.Range,
    CS.RegExp,
    CS.Slice,
    CS.TypeofOp,
    CS.While,
    function () {
      return true;
    }
  ],
  [
    CS.AssignOp,
    function () {
      return isTruthy(this.expression);
    }
  ],
  [
    CS.Block,
    function () {
      if (this.statements.length === 0) {
        return false;
      } else {
        return isTruthy(this.statements[this.statements.length - 1]);
      }
    }
  ],
  [
    CS.Bool,
    CS.Float,
    CS.Int,
    CS.String,
    function () {
      return !!this.data;
    }
  ],
  [
    CS.Conditional,
    function () {
      return isTruthy(this.condition) && isTruthy(this.consequent) || isFalsey(this.condition) && isTruthy(this.alternate);
    }
  ],
  [
    CS.LogicalAndOp,
    function () {
      return isTruthy(this.left) && isTruthy(this.right);
    }
  ],
  [
    CS.LogicalNotOp,
    function () {
      return isFalsey(this.expression);
    }
  ],
  [
    CS.LogicalOrOp,
    function () {
      return isTruthy(this.left) || isTruthy(this.right);
    }
  ],
  [
    CS.Program,
    function () {
      return isTruthy(this.body);
    }
  ],
  [
    CS.SeqOp,
    function () {
      return isTruthy(this.right);
    }
  ],
  [
    CS.Switch,
    function () {
      return all(this.cases, isTruthy) && (null != this.alternate ? isTruthy(this.alternate) : true);
    }
  ],
  [
    CS.SwitchCase,
    function () {
      return isTruthy(this.consequent);
    }
  ],
  [
    CS.UnaryExistsOp,
    function () {
      return isTruthy(this.expression) || this.expression['instanceof'](CS.Int, CS.Float, CS.String, CS.UnaryPlusOp, CS.UnaryNegateOp, CS.LogicalNotOp);
    }
  ]
], function () {
  return false;
});
isFalsey = makeDispatcher(false, [
  [
    CS.Null,
    CS.Undefined,
    function () {
      return true;
    }
  ],
  [
    CS.AssignOp,
    function () {
      return isFalsey(this.expression);
    }
  ],
  [
    CS.Block,
    function () {
      if (this.statements.length === 0) {
        return true;
      } else {
        return isFalsey(this.statements[this.statements.length - 1]);
      }
    }
  ],
  [
    CS.Bool,
    CS.Float,
    CS.Int,
    CS.String,
    function () {
      return !this.data;
    }
  ],
  [
    CS.Conditional,
    function () {
      return isTruthy(this.condition) && isFalsey(this.consequent) || isFalsey(this.condition) && isFalsey(this.alternate);
    }
  ],
  [
    CS.LogicalAndOp,
    function () {
      return isFalsey(this.left) || isFalsey(this.right);
    }
  ],
  [
    CS.LogicalNotOp,
    function () {
      return isTruthy(this.expression);
    }
  ],
  [
    CS.LogicalOrOp,
    function () {
      return isFalsey(this.left) && isFalsey(this.right);
    }
  ],
  [
    CS.Program,
    function () {
      return isFalsey(this.body);
    }
  ],
  [
    CS.SeqOp,
    function () {
      return isFalsey(this.right);
    }
  ],
  [
    CS.Switch,
    function () {
      return all(this.cases, isFalsey) && (null != this.alternate ? isFalsey(this.alternate) : true);
    }
  ],
  [
    CS.SwitchCase,
    function () {
      return isFalsey(this.block);
    }
  ],
  [
    CS.UnaryExistsOp,
    function () {
      return this.expression['instanceof'](CS.Null, CS.Undefined);
    }
  ]
], function () {
  return false;
});
mayHaveSideEffects = makeDispatcher(false, [
  [
    CS.Function,
    CS.BoundFunction,
    CS.Null,
    CS.RegExp,
    CS.This,
    CS.Undefined,
    function () {
      return false;
    }
  ],
  [
    CS.Break,
    CS.Continue,
    CS.Debugger,
    CS.DeleteOp,
    CS.NewOp,
    CS.Return,
    CS.Super,
    CS.PreDecrementOp,
    CS.PreIncrementOp,
    CS.PostDecrementOp,
    CS.PostIncrementOp,
    CS.ClassProtoAssignOp,
    CS.Constructor,
    CS.Throw,
    CS.JavaScript,
    CS.ExtendsOp,
    function () {
      return true;
    }
  ],
  [
    CS.Class,
    function (inScope) {
      return mayHaveSideEffects(this.parent, inScope) || null != this.nameAssignee && (this.name || beingDeclared(this.nameAssignee).length > 0);
    }
  ],
  [
    CS.Conditional,
    function (inScope) {
      return mayHaveSideEffects(this.condition, inScope) || !isFalsey(this.condition) && mayHaveSideEffects(this.consequent, inScope) || !isTruthy(this.condition) && mayHaveSideEffects(this.alternate, inScope);
    }
  ],
  [
    CS.DoOp,
    function (inScope) {
      var args, newScope;
      if (!this.expression['instanceof'](CS.Functions))
        return true;
      newScope = difference(inScope, concatMap(this.expression.parameters, beingDeclared));
      args = function (accum$) {
        var p;
        for (var i$ = 0, length$ = this.expression.parameters.length; i$ < length$; ++i$) {
          p = this.expression.parameters[i$];
          accum$.push(p['instanceof'](CS.AssignOp) ? p.expression : p);
        }
        return accum$;
      }.call(this, []);
      if (any(args, function (a) {
          return mayHaveSideEffects(a, newScope);
        }))
        return true;
      return mayHaveSideEffects(this.expression.body, newScope);
    }
  ],
  [
    CS.ExistsOp,
    function (inScope) {
      if (mayHaveSideEffects(this.left, inScope))
        return true;
      if (this.left['instanceof'](CS.Undefined, CS.Null))
        return false;
      return mayHaveSideEffects(this.right, inScope);
    }
  ],
  [
    CS.FunctionApplication,
    CS.SoakedFunctionApplication,
    function (inScope) {
      var newScope;
      if (!this['function']['instanceof'](CS.Function, CS.BoundFunction))
        return true;
      newScope = difference(inScope, concatMap(this['function'].parameters, beingDeclared));
      if (any(this['arguments'], function (a) {
          return mayHaveSideEffects(a, newScope);
        }))
        return true;
      return mayHaveSideEffects(this['function'].body, newScope);
    }
  ],
  [
    CS.LogicalAndOp,
    function (inScope) {
      if (mayHaveSideEffects(this.left, inScope))
        return true;
      if (isFalsey(this.left))
        return false;
      return mayHaveSideEffects(this.right, inScope);
    }
  ],
  [
    CS.LogicalOrOp,
    function (inScope) {
      if (mayHaveSideEffects(this.left, inScope))
        return true;
      if (isTruthy(this.left))
        return false;
      return mayHaveSideEffects(this.right, inScope);
    }
  ],
  [
    CS.While,
    function (inScope) {
      return mayHaveSideEffects(this.condition, inScope) || !isFalsey(this.condition) && mayHaveSideEffects(this.body, inScope);
    }
  ],
  [
    CS.AssignOp,
    CS.ClassProtoAssignOp,
    CS.CompoundAssignOp,
    function (inScope) {
      return true;
    }
  ],
  [
    CS.Bool,
    CS.Float,
    CS.Identifier,
    CS.Int,
    CS.String,
    function () {
      return false;
    }
  ]
], function (inScope) {
  var this$;
  return any(this.childNodes, (this$ = this, function (child) {
    if (in$(child, this$.listMembers)) {
      return any(this$[child], function (m) {
        return mayHaveSideEffects(m, inScope);
      });
    } else {
      return mayHaveSideEffects(this$[child], inScope);
    }
  }));
});
exports.Optimiser = function () {
  var defaultRules, this$;
  Optimiser.optimise = (this$ = Optimiser, function () {
    var cache$2;
    return (cache$2 = new this$).optimise.apply(cache$2, [].slice.call(arguments).concat());
  });
  Optimiser.isTruthy = isTruthy;
  Optimiser.isFalsey = isFalsey;
  Optimiser.mayHaveSideEffects = mayHaveSideEffects;
  defaultRules = [
    [
      CS.Program,
      function () {
        if (null != this.body && mayHaveSideEffects(this.body, [])) {
          return this;
        } else {
          return new CS.Program(null);
        }
      }
    ],
    [
      CS.Block,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        switch (this.statements.length) {
        case 0:
          return new CS.Undefined().g();
        case 1:
          return this.statements[0];
        default:
          return foldl(this.statements[0], this.statements.slice(1), function (expr, s) {
            return new CS.SeqOp(expr, s);
          });
        }
      }
    ],
    [
      CS.SeqOp,
      function (param$) {
        var ancestry, cache$2, canDropLast, decls, inScope;
        {
          cache$2 = param$;
          inScope = cache$2.inScope;
          ancestry = cache$2.ancestry;
        }
        canDropLast = !usedAsExpression(this, ancestry);
        if (mayHaveSideEffects(this.left, inScope)) {
          if (mayHaveSideEffects(this.right, inScope)) {
            return this;
          } else if (!canDropLast) {
            return this;
          } else if (this.right['instanceof'](CS.Undefined)) {
            return this.left;
          } else {
            return new CS.SeqOp(this.left, declarationsFor(this.right, union(inScope, envEnrichments(this.left, inScope))));
          }
        } else if (this.right['instanceof'](CS.Identifier) && this.right.data === 'eval' && ((null != ancestry[0] ? ancestry[0]['instanceof'](CS.FunctionApplication) : void 0) && ancestry[0]['function'] === this || (null != ancestry[0] ? ancestry[0]['instanceof'](CS.DoOp) : void 0) && ancestry[0].expression === this)) {
          if (this.left['instanceof'](CS.Int) && (0 <= this.left.data && this.left.data <= 9)) {
            return this;
          } else if (mayHaveSideEffects(this.left, inScope)) {
            return this;
          } else {
            return new CS.SeqOp(new CS.Int(0).g(), this.right);
          }
        } else if (mayHaveSideEffects(this.right, inScope)) {
          decls = declarationsFor(this.left, inScope);
          if (decls['instanceof'](CS.Undefined)) {
            return this.right;
          } else {
            return this;
          }
        } else if (canDropLast) {
          return declarationsFor(this, inScope);
        } else {
          return this.right;
        }
      }
    ],
    [
      CS.AssignOp,
      function () {
        if (!this.expression['instanceof'](CS.SeqOp))
          return this;
        return new CS.SeqOp(this.expression.left, new CS.AssignOp(this.assignee, this.expression.right));
      }
    ],
    [
      CS.While,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        if (isFalsey(this.condition)) {
          return new CS.Block([
            mayHaveSideEffects(this.condition, inScope) ? new CS.SeqOp(this.condition, declarationsFor(this.body)) : null != this.body ? declarationsFor(this.body, inScope) : new CS.Undefined,
            new CS.ArrayInitialiser([])
          ]);
        } else if (isTruthy(this.condition)) {
          if (mayHaveSideEffects(this.condition, inScope)) {
            return this;
          } else if (null != this.body) {
            if (this instanceof CS.Loop) {
              return this;
            } else {
              return new CS.Loop(this.body).g();
            }
          } else {
            return new CS.ArrayInitialiser([]);
          }
        } else {
          return this;
        }
      }
    ],
    [
      CS.Conditional,
      function (param$) {
        var block, cache$2, cache$3, decls, inScope, removedBlock;
        inScope = param$.inScope;
        if (isFalsey(this.condition)) {
          cache$2 = [
            this.consequent,
            this.alternate
          ];
          removedBlock = cache$2[0];
          block = cache$2[1];
          cache$2;
        } else if (isTruthy(this.condition)) {
          cache$3 = [
            this.consequent,
            this.alternate
          ];
          block = cache$3[0];
          removedBlock = cache$3[1];
          cache$3;
        } else {
          return this;
        }
        decls = declarationsFor(removedBlock, inScope);
        block = null != block ? new CS.SeqOp(decls, block) : decls;
        if (mayHaveSideEffects(this.condition, inScope))
          block = new CS.SeqOp(this.condition, block);
        return block;
      }
    ],
    [
      CS.ForIn,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        if (!(this.target['instanceof'](CS.ArrayInitialiser) && this.target.members.length === 0))
          return this;
        return new CS.SeqOp(declarationsFor(this, inScope), new CS.ArrayInitialiser([]).g());
      }
    ],
    [
      CS.ForOf,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        if (!(this.isOwn && this.target['instanceof'](CS.ObjectInitialiser) && this.target.members.length === 0))
          return this;
        return new CS.SeqOp(declarationsFor(this, inScope), new CS.ArrayInitialiser([]).g());
      }
    ],
    [
      CS.ForIn,
      CS.ForOf,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        if (!isFalsey(this.filter))
          return this;
        return new CS.SeqOp(declarationsFor(this, inScope), new CS.ArrayInitialiser([]).g());
      }
    ],
    [
      CS.ForIn,
      function () {
        if (!isTruthy(this.filter))
          return this;
        return new CS.ForIn(this.valAssignee, this.keyAssignee, this.target, this.step, null, this.body);
      }
    ],
    [
      CS.ForOf,
      function () {
        if (!isTruthy(this.filter))
          return this;
        return new CS.ForOf(this.isOwn, this.keyAssignee, this.valAssignee, this.target, null, this.body);
      }
    ],
    [
      CS.ArrayInitialiser,
      function (param$) {
        var ancestry, cache$2, inScope;
        {
          cache$2 = param$;
          inScope = cache$2.inScope;
          ancestry = cache$2.ancestry;
        }
        if (usedAsExpression(this, ancestry)) {
          return this;
        } else {
          return foldl(new CS.Undefined().g(), this.members, function (expr, m) {
            return new CS.SeqOp(expr, m);
          });
        }
      }
    ],
    [
      CS.ExistsOp,
      function () {
        if (this.left['instanceof'](CS.Null, CS.Undefined)) {
          return this.right;
        } else {
          return this;
        }
      }
    ],
    [
      CS.UnaryExistsOp,
      function () {
        if (this.expression['instanceof'](CS.Null, CS.Undefined)) {
          return new CS.Bool(false).g();
        } else {
          return this;
        }
      }
    ],
    [
      CS.LogicalNotOp,
      function (param$) {
        var inScope;
        inScope = param$.inScope;
        switch (false) {
        case !this.expression['instanceof'](CS.Int, CS.Float, CS.String, CS.Bool):
          return new CS.Bool(!this.expression.data).g();
        case !this.expression['instanceof'](CS.Functions):
          return new CS.Bool(false).g();
        case !this.expression['instanceof'](CS.Null, CS.Undefined):
          return new CS.Bool(true).g();
        case !this.expression['instanceof'](CS.ArrayInitialiser, CS.ObjectInitialiser):
          if (mayHaveSideEffects(this.expression, inScope)) {
            return this;
          } else {
            return new CS.SeqOp(declarationsFor(this.expression, inScope), new CS.Bool(false).g());
          }
        case !this.expression['instanceof'](CS.LogicalNotOp):
          if (this.expression.expression['instanceof'](CS.LogicalNotOp)) {
            return this.expression.expression;
          } else {
            return this;
          }
        default:
          return this;
        }
      }
    ],
    [
      CS.TypeofOp,
      function () {
        switch (false) {
        case !this.expression['instanceof'](CS.Int, CS.Float, CS.UnaryNegateOp, CS.UnaryPlusOp):
          return new CS.String('number').g();
        case !this.expression['instanceof'](CS.String):
          return new CS.String('string').g();
        case !this.expression['instanceof'](CS.Functions):
          return new CS.String('function').g();
        case !this.expression['instanceof'](CS.Undefined):
          return new CS.String('undefined').g();
        default:
          return this;
        }
      }
    ],
    [
      CS.SeqOp,
      function (param$) {
        var ancestry;
        ancestry = param$.ancestry;
        if (!((null != ancestry[0] ? ancestry[0]['instanceof'](CS.Functions) : void 0) && ancestry[0].body === this))
          return this;
        if (this.right['instanceof'](CS.Return) && null != this.right.expression) {
          return new CS.SeqOp(this.left, this.right.expression);
        } else if (this.right['instanceof'](CS.Undefined)) {
          return new CS.SeqOp(this.left, new CS.Return);
        } else {
          return this;
        }
      }
    ],
    [
      CS.Function,
      CS.BoundFunction,
      function () {
        if (!(null != this.block && (this.block['instanceof'](CS.Undefined) || this.block['instanceof'](CS.Return) && !(null != this.block.expression))))
          return this;
        return new this.constructor(this.parameters, null);
      }
    ],
    [
      CS.Return,
      function () {
        if (null != this.expression ? this.expression['instanceof'](CS.Undefined) : void 0) {
          return new CS.Return;
        } else {
          return this;
        }
      }
    ],
    [
      CS.Slice,
      function () {
        if ((null != this.left ? this.left['instanceof'](CS.Int, CS.String) : void 0) && +this.left.data === 0) {
          return new CS.Slice(this.expression, this.isInclusive, null, this.right);
        } else if (this.isInclusive && (null != this.right ? this.right['instanceof'](CS.UnaryNegateOp) : void 0) && this.right.expression['instanceof'](CS.Int) && this.right.expression.data === 1) {
          return new CS.Slice(this.expression, true, this.left, null);
        } else {
          return this;
        }
      }
    ]
  ];
  function Optimiser() {
    var cache$2, ctor, ctors, handler, size$;
    this.rules = {};
    for (var i$ = 0, length$ = defaultRules.length; i$ < length$; ++i$) {
      {
        cache$2 = defaultRules[i$];
        size$ = cache$2.length;
        ctors = size$ > 1 ? [].slice.call(cache$2, 0, size$ - 1) : [];
        handler = cache$2[size$ - 1];
      }
      for (var i$1 = 0, length$1 = ctors.length; i$1 < length$1; ++i$1) {
        ctor = ctors[i$1];
        this.addRule(ctor.prototype.className, handler);
      }
    }
  }
  Optimiser.prototype.addRule = function (ctor, handler) {
    (null != this.rules[ctor] ? this.rules[ctor] : this.rules[ctor] = []).push(handler);
    return this;
  };
  Optimiser.prototype.optimise = function () {
    var walk;
    walk = function (fn, inScope, ancestry) {
      var childName, jsNode, member, n, p;
      if (null == inScope)
        inScope = [];
      if (null == ancestry)
        ancestry = [];
      if (!(null != this) || this === global)
        throw new Error('Optimiser rules must produce a node. `null` is not a node.');
      if (in$(this, ancestry))
        return this;
      ancestry.unshift(this);
      for (var i$ = 0, length$ = this.childNodes.length; i$ < length$; ++i$) {
        childName = this.childNodes[i$];
        if (!(null != this[childName]))
          continue;
        if (in$(childName, this.listMembers)) {
          for (var i$1 = 0, length$1 = this[childName].length; i$1 < length$1; ++i$1) {
            member = this[childName][i$1];
            n = i$1;
            while (this[childName][n] !== walk.call(this[childName][n] = fn.call(this[childName][n], {
                inScope: inScope,
                ancestry: ancestry
              }), fn, inScope, ancestry)) {
            }
            inScope = union(inScope, envEnrichments(this[childName][n], inScope));
          }
        } else {
          while (this[childName] !== walk.call(this[childName] = fn.call(this[childName], {
              inScope: inScope,
              ancestry: ancestry
            }), fn, inScope, ancestry)) {
          }
          inScope = union(inScope, envEnrichments(this[childName], inScope));
        }
      }
      ancestry.shift();
      jsNode = fn.call(this, {
        inScope: inScope,
        ancestry: ancestry
      });
      for (var cache$2 = [
            'raw',
            'line',
            'column',
            'offset'
          ], i$2 = 0, length$2 = cache$2.length; i$2 < length$2; ++i$2) {
        p = cache$2[i$2];
        jsNode[p] = this[p];
      }
      return jsNode;
    };
    return function (ast) {
      var rules;
      rules = this.rules;
      return walk.call(ast, function () {
        var cache$3, memo, oldClassName, rule;
        memo = this;
        oldClassName = null;
        while (oldClassName !== memo.className) {
          for (var cache$2 = (cache$3 = rules[oldClassName = memo.className], null != cache$3 ? cache$3 : []), i$ = 0, length$ = cache$2.length; i$ < length$; ++i$) {
            rule = cache$2[i$];
            memo = rule.apply(memo, arguments);
            if (!(oldClassName === memo.className))
              break;
          }
        }
        return memo;
      });
    };
  }();
  return Optimiser;
}();
function in$(member, list) {
  for (var i = 0, length = list.length; i < length; ++i)
    if (i in list && list[i] === member)
      return true;
  return false;
}