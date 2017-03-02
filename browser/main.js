(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

const dom = require( './src/api/dom' )
const ddom = require( './depject/api/dom' )

const section = document.querySelector( 'section' )
const pre = document.querySelector( 'pre' )

const log = ( api, data, name ) => {
  const helloParent = api.helloParent( data )

  pre.textContent += `${ name }:\n`
  pre.textContent += `${ api.stringify( helloParent ) }\n\n`
}

log( dom, section, 'dom' )
log( ddom, section, 'depject dom' )

section.remove()

},{"./depject/api/dom":4,"./src/api/dom":14}],2:[function(require,module,exports){
'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides default functions with more efficient ones from the DOM
const parent = ( root, node ) => node.parentNode
const stringify = ( api, node ) => api.isText( node ) ? api.text( node ) : node.outerHTML

module.exports = {
  isElement: {
    gives: 'isElement',
    create: () => isElement
  },
  isText: {
    gives: 'isText',
    create: () => isText
  },
  text: {
    gives: 'text',
    create: () => text
  },
  children: {
    gives: 'children',
    create: () => children
  },
  nodeName: {
    gives: 'nodeName',
    create: () => nodeName
  },
  parent: {
    gives: 'parent',
    create: () => parent
  },
  stringify: {
    gives: 'stringify',
    needs: { isText: 'first', text: 'first' },
    create: api => node => stringify( api, node )
  }
}

},{}],3:[function(require,module,exports){
'use strict'

const walk = ( api, node, cb ) =>
  cb( node ) ||
  api.children( node ).some( child =>
    walk( api, child, cb )
  )

const find = ( api, node, predicate ) => {
  let found

  api.walk( node, n => {
    if( predicate( n ) ){
      found = n

      return true
    }
  })

  return found
}

const parent = ( api, root, node ) =>
  api.find( root, n => api.children( n ).includes( node ) )

const stringify = ( api, node ) => {
  if( api.isText( node ) )
    return api.text( node )

  const tag = api.nodeName( node )
  const children = api.children( node )
  const innerHTML = children.map( child => stringify( api, child ) ).join( '' )

  return `<${ tag }>${ innerHTML }</${ tag }>`
}

module.exports = {
  walk: {
    gives: 'walk',
    needs: { children: 'first' },
    create: api => ( node, cb ) => walk( api, node, cb )
  },
  find: {
    gives: 'find',
    needs: { walk: 'first' },
    create: api => ( node, predicate ) => find( api, node, predicate )
  },
  parent: {
    gives: 'parent',
    needs: { find: 'first', children: 'first' },
    create: api => ( root, node ) => parent( api, root, node )
  },
  stringify: {
    gives: 'stringify',
    needs: { isText: 'first',  text: 'first', nodeName: 'first', children: 'first' },
    create: api => node => stringify( api, node )
  }
}

},{}],4:[function(require,module,exports){
'use strict'

const Api = require( './' )
const adapter = require( '../adapters/dom' )
const helloParent = require( '../plugins/helloParent' )

module.exports = Api( adapter, helloParent )

},{"../adapters/dom":2,"../plugins/helloParent":6,"./":5}],5:[function(require,module,exports){
'use strict'

const combine = require( 'depject' )
const common = require( './common' )

const Api = ( adapter, ...plugins ) => {
  const sockets = combine( [ adapter, common, ...plugins ] )

  const api = Object.keys( sockets ).reduce( ( api, key ) => {
    api[ key ] = sockets[ key ][ 0 ]

    return api
  }, {})

  return api
}

module.exports = Api

},{"./common":3,"depject":10}],6:[function(require,module,exports){
'use strict'

const helloParent = ( api, node ) => {
  const { isText, text, find, parent } = api

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}

module.exports = {
  gives: 'helloParent',
  needs: { isText: 'first', text: 'first', find: 'first', parent: 'first' },
  create: api => node => helloParent( api, node )
}

},{}],7:[function(require,module,exports){
module.exports = {
  reduce: function (funs) {
    return function (value, context) {
      if (!funs.length) throw new Error('depject.reduce: no functions available to reduce')
      return funs.reduce(function (value, fn) {
        return fn(value, context)
      }, value)
    }
  },
  first: function (funs) {
    return function (value) {
      if (!funs.length) throw new Error('depject.first: no functions available to take first')
      var args = [].slice.call(arguments)
      for (var i = 0; i < funs.length; i++) {
        var _value = funs[i].apply(this, args)
        if (_value) return _value
      }
    }
  },
  map: function (funs) {
    return function (value) {
      if (!funs.length) throw new Error('depject.map: no functions available to map')
      var args = [].slice.call(arguments)
      return funs.map(function (fn) {
        return fn.apply(this, args)
      })
    }
  }
}


},{}],8:[function(require,module,exports){
var N = require('libnested')

module.exports = function assertGiven (gives, given, key) {
  if (!given) {
    throw new Error('create function should return a function or an object in: ' + key)
  }

  if (typeof gives === 'string' && typeof given !== 'function') {
    throw new Error('create function should return a function when gives is a string in: ' + key)
  } else if (isObject(gives) && isObject(given)) {
    firstMissingKey(gives, given, function (path) {
      throw new Error('keys returned by create must match keys in given. missing: ' + path.join('.') + ' in ' + key)
    })
  }
}

function firstMissingKey (gives, given, onMissingKey) {
  return N.each(gives, function (value, path) {
    if (N.get(given, path) === undefined) {
      onMissingKey(path)
      return false
    }
  })
}

function isObject (o) {
  return o && typeof o === 'object'
}

},{"libnested":12}],9:[function(require,module,exports){
var N = require('libnested')

var apply = require('./apply')

module.exports = function entry (sockets, needs) {
  return N.map(needs, function (type, path) {
    var dependency = N.get(sockets, path)
    if (!dependency) {
      dependency = N.set(sockets, path, [])
    }
    return apply[type](dependency)
  })
}

},{"./apply":7,"libnested":12}],10:[function(require,module,exports){
var N = require('libnested')

var isModule = require('./is')
var assertGiven = require('./assertGiven')
var getNeeded = require('./entry')

module.exports = function combine () {
  var nestedModules = Array.prototype.slice.call(arguments)
  var modules = flattenNested(nestedModules)

  assertDependencies(modules)

  var combinedModules = {}

  for (var key in modules) {
    var module = modules[key]
    var needed = getNeeded(combinedModules, module.needs)
    var given = module.create(needed)

    assertGiven(module.gives, given, key)

    addGivenToCombined(given, combinedModules, module)
  }

  if (isEmpty(combinedModules)) {
    throw new Error('could not resolve any modules')
  }

  return combinedModules
}

function isString (s) {
  return typeof s === 'string'
}

function isEmpty (e) {
  for (var k in e) return false
  return true
}

function isObject (o) {
  return o && typeof o === 'object'
}

function append (obj, path, value) {
  var a = N.get(obj, path)
  if (!a) N.set(obj, path, a = [])
  a.push(value)
}

function flattenNested (modules) {
  return modules.reduce(function (a, b) {
    eachModule(b, function (value, path) {
      var k = path.join('/')
      a[k] = value
    })
    return a
  }, {})
}

function assertDependencies (modules) {
  var allNeeds = {}
  var allGives = {}

  for (var key in modules) {
    var module = modules[key]
    N.each(module.needs, function (v, path) {
      N.set(allNeeds, path, key)
    })
    if (isString(module.gives)) {
      N.set(allGives, [module.gives], true)
    } else {
      N.each(module.gives, function (v, path) {
        N.set(allGives, path, true)
      })
    }
  }

  N.each(allNeeds, function (key, path) {
    if (!N.get(allGives, path)) { throw new Error('unmet need: `' + path.join('.') + '`, needed by module ' + ((isNaN(key)) ? '`' + key + '`' : '')) }
  })
}

function addGivenToCombined (given, combined, module) {
  if (isString(module.gives)) {
    append(combined, [module.gives], given)
  } else {
    N.each(module.gives, function (_, path) {
      var fun = N.get(given, path)
      append(combined, path, fun)
    })
  }
}

function eachModule (obj, iter, path) {
  path = path || []
  if (isModule(obj)) iter(obj, path.concat(k))
  for (var k in obj) {
    if (isObject(obj[k])) {
      eachModule(obj[k], iter, path.concat(k))
    }
  }
}

},{"./assertGiven":8,"./entry":9,"./is":11,"libnested":12}],11:[function(require,module,exports){
var N = require('libnested')

function isFunction (f) {
  return typeof f === 'function'
}

function isTrue (b) {
  return b === true
}

function isGives (o) {
  return isString(o) || N.each(o, isTrue)
}

function isType (t) {
  return ({map: true, first: true, reduce: true})[t]
}

function isNeeds (n) {
  return N.each(n, isType)
}

function isModule (m) {
  return m && isFunction(m.create) && isGives(m.gives) && (!m.needs || isNeeds(m.needs))
}

function isString (s) {
  return typeof s === 'string'
}

module.exports = isModule

},{"libnested":12}],12:[function(require,module,exports){
function isObject (o) {
  return o && 'object' === typeof o && !Array.isArray(o)
}

function get (obj, path, dft) {
  for(var i = 0; i < path.length; i++) {
    if(null == (obj = obj[path[i]])) return dft
  }
  return obj
}

function set (obj, path, value) {
  if(!obj) throw new Error('libnested.set: first arg must be an object')
  for(var i = 0; i < path.length; i++)
    if(i === path.length - 1)
      obj[path[i]] = value
    else if(null == obj[path[i]])
      obj = (obj[path[i]] = {})
    else
      obj = obj[path[i]]
  return value
}

function each (obj, iter, path) {
  path = path || []
  for(var k in obj) {
    if(isObject(obj[k])) {
      if(false === each(obj[k], iter, path.concat(k))) return false
    } else {
      if(false === iter(obj[k], path.concat(k))) return false
    }
  }
  return true
}

function map (obj, iter, out) {
  var out = out || {}
  each(obj, function (val, path) {
    set(out, path, iter(val, path))
  })
  return out
}

function paths (obj) {
  var out = []
  each(obj, function (_, path) {
    out.push(path)
  })
  return out
}

exports.get = get
exports.set = set
exports.each = each
exports.map = map
exports.paths = paths

},{}],13:[function(require,module,exports){
'use strict'

const isElement = node => !node.nodeName.startsWith( '#' )
const isText = node => node.nodeName === '#text'
const text = node => node.nodeValue
const children = node => 'childNodes' in node ? Array.from( node.childNodes ) : []
const nodeName = node => node.nodeName

// overrides default functions with more efficient ones from the DOM
const parent = ( root, node ) => node.parentNode
const stringify = node => isText( node ) ? text( node ) : node.outerHTML

module.exports = {
  isElement, isText, text, children, nodeName, parent, stringify
}

},{}],14:[function(require,module,exports){
'use strict'

const Api = require( './' )
const adapter = require( '../adapters/dom' )
const helloParent = require( '../plugins/helloParent' )

module.exports = Api( adapter, { helloParent } )

},{"../adapters/dom":13,"../plugins/helloParent":16,"./":15}],15:[function(require,module,exports){
'use strict'
const Plugins = require( '../plugins' )

const Api = ( adapter, plugins = {} ) => {
  const walk = ( node, cb ) =>
    cb( node ) ||
    api.children( node ).some( child =>
      api.walk( child, cb )
    )

  const find = ( node, predicate ) => {
    let found

    api.walk( node, n => {
      if( predicate( n ) ){
        found = n

        return true
      }
    })

    return found
  }

  const parent = ( root, node ) =>
    api.find( root, n => api.children( n ).includes( node ) )

  const stringify = node => {
    if( api.isText( node ) )
      return api.text( node )

    const tag = api.nodeName( node )
    const innerHTML = api.children( node ).map( stringify ).join( '' )

    return `<${ tag }>${ innerHTML }</${ tag }>`
  }

  const api = { walk, find, parent, stringify }

  Object.assign( api, adapter )

  Plugins( api, plugins )

  return api
}

module.exports = Api

},{"../plugins":17}],16:[function(require,module,exports){
'use strict'

const helloParent = ( api, node ) => {
  const { isText, text, find, parent } = api

  const isHelloText = n =>
    isText( n ) && text( n ).includes( 'Hello' )

  const textNode = find( node, isHelloText )

  if( textNode )
    return parent( node, textNode )
}

module.exports = helloParent

},{}],17:[function(require,module,exports){
'use strict'

const Plugins = ( api, obj ) =>
  Object.keys( obj ).forEach( fname =>
    api[ fname ] = ( ...args ) => obj[ fname ]( api, ...args )
  )

module.exports = Plugins

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJicm93c2VyLmpzIiwiZGVwamVjdC9hZGFwdGVycy9kb20uanMiLCJkZXBqZWN0L2FwaS9jb21tb24uanMiLCJkZXBqZWN0L2FwaS9kb20uanMiLCJkZXBqZWN0L2FwaS9pbmRleC5qcyIsImRlcGplY3QvcGx1Z2lucy9oZWxsb1BhcmVudC5qcyIsIm5vZGVfbW9kdWxlcy9kZXBqZWN0L2FwcGx5LmpzIiwibm9kZV9tb2R1bGVzL2RlcGplY3QvYXNzZXJ0R2l2ZW4uanMiLCJub2RlX21vZHVsZXMvZGVwamVjdC9lbnRyeS5qcyIsIm5vZGVfbW9kdWxlcy9kZXBqZWN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2RlcGplY3QvaXMuanMiLCJub2RlX21vZHVsZXMvbGlibmVzdGVkL2luZGV4LmpzIiwic3JjL2FkYXB0ZXJzL2RvbS5qcyIsInNyYy9hcGkvZG9tLmpzIiwic3JjL2FwaS9pbmRleC5qcyIsInNyYy9wbHVnaW5zL2hlbGxvUGFyZW50LmpzIiwic3JjL3BsdWdpbnMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGRvbSA9IHJlcXVpcmUoICcuL3NyYy9hcGkvZG9tJyApXG5jb25zdCBkZG9tID0gcmVxdWlyZSggJy4vZGVwamVjdC9hcGkvZG9tJyApXG5cbmNvbnN0IHNlY3Rpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnc2VjdGlvbicgKVxuY29uc3QgcHJlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ3ByZScgKVxuXG5jb25zdCBsb2cgPSAoIGFwaSwgZGF0YSwgbmFtZSApID0+IHtcbiAgY29uc3QgaGVsbG9QYXJlbnQgPSBhcGkuaGVsbG9QYXJlbnQoIGRhdGEgKVxuXG4gIHByZS50ZXh0Q29udGVudCArPSBgJHsgbmFtZSB9OlxcbmBcbiAgcHJlLnRleHRDb250ZW50ICs9IGAkeyBhcGkuc3RyaW5naWZ5KCBoZWxsb1BhcmVudCApIH1cXG5cXG5gXG59XG5cbmxvZyggZG9tLCBzZWN0aW9uLCAnZG9tJyApXG5sb2coIGRkb20sIHNlY3Rpb24sICdkZXBqZWN0IGRvbScgKVxuXG5zZWN0aW9uLnJlbW92ZSgpXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgaXNFbGVtZW50ID0gbm9kZSA9PiAhbm9kZS5ub2RlTmFtZS5zdGFydHNXaXRoKCAnIycgKVxuY29uc3QgaXNUZXh0ID0gbm9kZSA9PiBub2RlLm5vZGVOYW1lID09PSAnI3RleHQnXG5jb25zdCB0ZXh0ID0gbm9kZSA9PiBub2RlLm5vZGVWYWx1ZVxuY29uc3QgY2hpbGRyZW4gPSBub2RlID0+ICdjaGlsZE5vZGVzJyBpbiBub2RlID8gQXJyYXkuZnJvbSggbm9kZS5jaGlsZE5vZGVzICkgOiBbXVxuY29uc3Qgbm9kZU5hbWUgPSBub2RlID0+IG5vZGUubm9kZU5hbWVcblxuLy8gb3ZlcnJpZGVzIGRlZmF1bHQgZnVuY3Rpb25zIHdpdGggbW9yZSBlZmZpY2llbnQgb25lcyBmcm9tIHRoZSBET01cbmNvbnN0IHBhcmVudCA9ICggcm9vdCwgbm9kZSApID0+IG5vZGUucGFyZW50Tm9kZVxuY29uc3Qgc3RyaW5naWZ5ID0gKCBhcGksIG5vZGUgKSA9PiBhcGkuaXNUZXh0KCBub2RlICkgPyBhcGkudGV4dCggbm9kZSApIDogbm9kZS5vdXRlckhUTUxcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzRWxlbWVudDoge1xuICAgIGdpdmVzOiAnaXNFbGVtZW50JyxcbiAgICBjcmVhdGU6ICgpID0+IGlzRWxlbWVudFxuICB9LFxuICBpc1RleHQ6IHtcbiAgICBnaXZlczogJ2lzVGV4dCcsXG4gICAgY3JlYXRlOiAoKSA9PiBpc1RleHRcbiAgfSxcbiAgdGV4dDoge1xuICAgIGdpdmVzOiAndGV4dCcsXG4gICAgY3JlYXRlOiAoKSA9PiB0ZXh0XG4gIH0sXG4gIGNoaWxkcmVuOiB7XG4gICAgZ2l2ZXM6ICdjaGlsZHJlbicsXG4gICAgY3JlYXRlOiAoKSA9PiBjaGlsZHJlblxuICB9LFxuICBub2RlTmFtZToge1xuICAgIGdpdmVzOiAnbm9kZU5hbWUnLFxuICAgIGNyZWF0ZTogKCkgPT4gbm9kZU5hbWVcbiAgfSxcbiAgcGFyZW50OiB7XG4gICAgZ2l2ZXM6ICdwYXJlbnQnLFxuICAgIGNyZWF0ZTogKCkgPT4gcGFyZW50XG4gIH0sXG4gIHN0cmluZ2lmeToge1xuICAgIGdpdmVzOiAnc3RyaW5naWZ5JyxcbiAgICBuZWVkczogeyBpc1RleHQ6ICdmaXJzdCcsIHRleHQ6ICdmaXJzdCcgfSxcbiAgICBjcmVhdGU6IGFwaSA9PiBub2RlID0+IHN0cmluZ2lmeSggYXBpLCBub2RlIClcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IHdhbGsgPSAoIGFwaSwgbm9kZSwgY2IgKSA9PlxuICBjYiggbm9kZSApIHx8XG4gIGFwaS5jaGlsZHJlbiggbm9kZSApLnNvbWUoIGNoaWxkID0+XG4gICAgd2FsayggYXBpLCBjaGlsZCwgY2IgKVxuICApXG5cbmNvbnN0IGZpbmQgPSAoIGFwaSwgbm9kZSwgcHJlZGljYXRlICkgPT4ge1xuICBsZXQgZm91bmRcblxuICBhcGkud2Fsayggbm9kZSwgbiA9PiB7XG4gICAgaWYoIHByZWRpY2F0ZSggbiApICl7XG4gICAgICBmb3VuZCA9IG5cblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGZvdW5kXG59XG5cbmNvbnN0IHBhcmVudCA9ICggYXBpLCByb290LCBub2RlICkgPT5cbiAgYXBpLmZpbmQoIHJvb3QsIG4gPT4gYXBpLmNoaWxkcmVuKCBuICkuaW5jbHVkZXMoIG5vZGUgKSApXG5cbmNvbnN0IHN0cmluZ2lmeSA9ICggYXBpLCBub2RlICkgPT4ge1xuICBpZiggYXBpLmlzVGV4dCggbm9kZSApIClcbiAgICByZXR1cm4gYXBpLnRleHQoIG5vZGUgKVxuXG4gIGNvbnN0IHRhZyA9IGFwaS5ub2RlTmFtZSggbm9kZSApXG4gIGNvbnN0IGNoaWxkcmVuID0gYXBpLmNoaWxkcmVuKCBub2RlIClcbiAgY29uc3QgaW5uZXJIVE1MID0gY2hpbGRyZW4ubWFwKCBjaGlsZCA9PiBzdHJpbmdpZnkoIGFwaSwgY2hpbGQgKSApLmpvaW4oICcnIClcblxuICByZXR1cm4gYDwkeyB0YWcgfT4keyBpbm5lckhUTUwgfTwvJHsgdGFnIH0+YFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgd2Fsazoge1xuICAgIGdpdmVzOiAnd2FsaycsXG4gICAgbmVlZHM6IHsgY2hpbGRyZW46ICdmaXJzdCcgfSxcbiAgICBjcmVhdGU6IGFwaSA9PiAoIG5vZGUsIGNiICkgPT4gd2FsayggYXBpLCBub2RlLCBjYiApXG4gIH0sXG4gIGZpbmQ6IHtcbiAgICBnaXZlczogJ2ZpbmQnLFxuICAgIG5lZWRzOiB7IHdhbGs6ICdmaXJzdCcgfSxcbiAgICBjcmVhdGU6IGFwaSA9PiAoIG5vZGUsIHByZWRpY2F0ZSApID0+IGZpbmQoIGFwaSwgbm9kZSwgcHJlZGljYXRlIClcbiAgfSxcbiAgcGFyZW50OiB7XG4gICAgZ2l2ZXM6ICdwYXJlbnQnLFxuICAgIG5lZWRzOiB7IGZpbmQ6ICdmaXJzdCcsIGNoaWxkcmVuOiAnZmlyc3QnIH0sXG4gICAgY3JlYXRlOiBhcGkgPT4gKCByb290LCBub2RlICkgPT4gcGFyZW50KCBhcGksIHJvb3QsIG5vZGUgKVxuICB9LFxuICBzdHJpbmdpZnk6IHtcbiAgICBnaXZlczogJ3N0cmluZ2lmeScsXG4gICAgbmVlZHM6IHsgaXNUZXh0OiAnZmlyc3QnLCAgdGV4dDogJ2ZpcnN0Jywgbm9kZU5hbWU6ICdmaXJzdCcsIGNoaWxkcmVuOiAnZmlyc3QnIH0sXG4gICAgY3JlYXRlOiBhcGkgPT4gbm9kZSA9PiBzdHJpbmdpZnkoIGFwaSwgbm9kZSApXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBBcGkgPSByZXF1aXJlKCAnLi8nIClcbmNvbnN0IGFkYXB0ZXIgPSByZXF1aXJlKCAnLi4vYWRhcHRlcnMvZG9tJyApXG5jb25zdCBoZWxsb1BhcmVudCA9IHJlcXVpcmUoICcuLi9wbHVnaW5zL2hlbGxvUGFyZW50JyApXG5cbm1vZHVsZS5leHBvcnRzID0gQXBpKCBhZGFwdGVyLCBoZWxsb1BhcmVudCApXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgY29tYmluZSA9IHJlcXVpcmUoICdkZXBqZWN0JyApXG5jb25zdCBjb21tb24gPSByZXF1aXJlKCAnLi9jb21tb24nIClcblxuY29uc3QgQXBpID0gKCBhZGFwdGVyLCAuLi5wbHVnaW5zICkgPT4ge1xuICBjb25zdCBzb2NrZXRzID0gY29tYmluZSggWyBhZGFwdGVyLCBjb21tb24sIC4uLnBsdWdpbnMgXSApXG5cbiAgY29uc3QgYXBpID0gT2JqZWN0LmtleXMoIHNvY2tldHMgKS5yZWR1Y2UoICggYXBpLCBrZXkgKSA9PiB7XG4gICAgYXBpWyBrZXkgXSA9IHNvY2tldHNbIGtleSBdWyAwIF1cblxuICAgIHJldHVybiBhcGlcbiAgfSwge30pXG5cbiAgcmV0dXJuIGFwaVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFwaVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGhlbGxvUGFyZW50ID0gKCBhcGksIG5vZGUgKSA9PiB7XG4gIGNvbnN0IHsgaXNUZXh0LCB0ZXh0LCBmaW5kLCBwYXJlbnQgfSA9IGFwaVxuXG4gIGNvbnN0IGlzSGVsbG9UZXh0ID0gbiA9PlxuICAgIGlzVGV4dCggbiApICYmIHRleHQoIG4gKS5pbmNsdWRlcyggJ0hlbGxvJyApXG5cbiAgY29uc3QgdGV4dE5vZGUgPSBmaW5kKCBub2RlLCBpc0hlbGxvVGV4dCApXG5cbiAgaWYoIHRleHROb2RlIClcbiAgICByZXR1cm4gcGFyZW50KCBub2RlLCB0ZXh0Tm9kZSApXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnaXZlczogJ2hlbGxvUGFyZW50JyxcbiAgbmVlZHM6IHsgaXNUZXh0OiAnZmlyc3QnLCB0ZXh0OiAnZmlyc3QnLCBmaW5kOiAnZmlyc3QnLCBwYXJlbnQ6ICdmaXJzdCcgfSxcbiAgY3JlYXRlOiBhcGkgPT4gbm9kZSA9PiBoZWxsb1BhcmVudCggYXBpLCBub2RlIClcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICByZWR1Y2U6IGZ1bmN0aW9uIChmdW5zKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgY29udGV4dCkge1xuICAgICAgaWYgKCFmdW5zLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdkZXBqZWN0LnJlZHVjZTogbm8gZnVuY3Rpb25zIGF2YWlsYWJsZSB0byByZWR1Y2UnKVxuICAgICAgcmV0dXJuIGZ1bnMucmVkdWNlKGZ1bmN0aW9uICh2YWx1ZSwgZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuKHZhbHVlLCBjb250ZXh0KVxuICAgICAgfSwgdmFsdWUpXG4gICAgfVxuICB9LFxuICBmaXJzdDogZnVuY3Rpb24gKGZ1bnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIWZ1bnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ2RlcGplY3QuZmlyc3Q6IG5vIGZ1bmN0aW9ucyBhdmFpbGFibGUgdG8gdGFrZSBmaXJzdCcpXG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmdW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBfdmFsdWUgPSBmdW5zW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXG4gICAgICAgIGlmIChfdmFsdWUpIHJldHVybiBfdmFsdWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIG1hcDogZnVuY3Rpb24gKGZ1bnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoIWZ1bnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoJ2RlcGplY3QubWFwOiBubyBmdW5jdGlvbnMgYXZhaWxhYmxlIHRvIG1hcCcpXG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgICAgcmV0dXJuIGZ1bnMubWFwKGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncylcbiAgICAgIH0pXG4gICAgfVxuICB9XG59XG5cbiIsInZhciBOID0gcmVxdWlyZSgnbGlibmVzdGVkJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBhc3NlcnRHaXZlbiAoZ2l2ZXMsIGdpdmVuLCBrZXkpIHtcbiAgaWYgKCFnaXZlbikge1xuICAgIHRocm93IG5ldyBFcnJvcignY3JlYXRlIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBmdW5jdGlvbiBvciBhbiBvYmplY3QgaW46ICcgKyBrZXkpXG4gIH1cblxuICBpZiAodHlwZW9mIGdpdmVzID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgZ2l2ZW4gIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NyZWF0ZSBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgZnVuY3Rpb24gd2hlbiBnaXZlcyBpcyBhIHN0cmluZyBpbjogJyArIGtleSlcbiAgfSBlbHNlIGlmIChpc09iamVjdChnaXZlcykgJiYgaXNPYmplY3QoZ2l2ZW4pKSB7XG4gICAgZmlyc3RNaXNzaW5nS2V5KGdpdmVzLCBnaXZlbiwgZnVuY3Rpb24gKHBhdGgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigna2V5cyByZXR1cm5lZCBieSBjcmVhdGUgbXVzdCBtYXRjaCBrZXlzIGluIGdpdmVuLiBtaXNzaW5nOiAnICsgcGF0aC5qb2luKCcuJykgKyAnIGluICcgKyBrZXkpXG4gICAgfSlcbiAgfVxufVxuXG5mdW5jdGlvbiBmaXJzdE1pc3NpbmdLZXkgKGdpdmVzLCBnaXZlbiwgb25NaXNzaW5nS2V5KSB7XG4gIHJldHVybiBOLmVhY2goZ2l2ZXMsIGZ1bmN0aW9uICh2YWx1ZSwgcGF0aCkge1xuICAgIGlmIChOLmdldChnaXZlbiwgcGF0aCkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgb25NaXNzaW5nS2V5KHBhdGgpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0IChvKSB7XG4gIHJldHVybiBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0J1xufVxuIiwidmFyIE4gPSByZXF1aXJlKCdsaWJuZXN0ZWQnKVxuXG52YXIgYXBwbHkgPSByZXF1aXJlKCcuL2FwcGx5JylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbnRyeSAoc29ja2V0cywgbmVlZHMpIHtcbiAgcmV0dXJuIE4ubWFwKG5lZWRzLCBmdW5jdGlvbiAodHlwZSwgcGF0aCkge1xuICAgIHZhciBkZXBlbmRlbmN5ID0gTi5nZXQoc29ja2V0cywgcGF0aClcbiAgICBpZiAoIWRlcGVuZGVuY3kpIHtcbiAgICAgIGRlcGVuZGVuY3kgPSBOLnNldChzb2NrZXRzLCBwYXRoLCBbXSlcbiAgICB9XG4gICAgcmV0dXJuIGFwcGx5W3R5cGVdKGRlcGVuZGVuY3kpXG4gIH0pXG59XG4iLCJ2YXIgTiA9IHJlcXVpcmUoJ2xpYm5lc3RlZCcpXG5cbnZhciBpc01vZHVsZSA9IHJlcXVpcmUoJy4vaXMnKVxudmFyIGFzc2VydEdpdmVuID0gcmVxdWlyZSgnLi9hc3NlcnRHaXZlbicpXG52YXIgZ2V0TmVlZGVkID0gcmVxdWlyZSgnLi9lbnRyeScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY29tYmluZSAoKSB7XG4gIHZhciBuZXN0ZWRNb2R1bGVzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICB2YXIgbW9kdWxlcyA9IGZsYXR0ZW5OZXN0ZWQobmVzdGVkTW9kdWxlcylcblxuICBhc3NlcnREZXBlbmRlbmNpZXMobW9kdWxlcylcblxuICB2YXIgY29tYmluZWRNb2R1bGVzID0ge31cblxuICBmb3IgKHZhciBrZXkgaW4gbW9kdWxlcykge1xuICAgIHZhciBtb2R1bGUgPSBtb2R1bGVzW2tleV1cbiAgICB2YXIgbmVlZGVkID0gZ2V0TmVlZGVkKGNvbWJpbmVkTW9kdWxlcywgbW9kdWxlLm5lZWRzKVxuICAgIHZhciBnaXZlbiA9IG1vZHVsZS5jcmVhdGUobmVlZGVkKVxuXG4gICAgYXNzZXJ0R2l2ZW4obW9kdWxlLmdpdmVzLCBnaXZlbiwga2V5KVxuXG4gICAgYWRkR2l2ZW5Ub0NvbWJpbmVkKGdpdmVuLCBjb21iaW5lZE1vZHVsZXMsIG1vZHVsZSlcbiAgfVxuXG4gIGlmIChpc0VtcHR5KGNvbWJpbmVkTW9kdWxlcykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZXNvbHZlIGFueSBtb2R1bGVzJylcbiAgfVxuXG4gIHJldHVybiBjb21iaW5lZE1vZHVsZXNcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcgKHMpIHtcbiAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJ1xufVxuXG5mdW5jdGlvbiBpc0VtcHR5IChlKSB7XG4gIGZvciAodmFyIGsgaW4gZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0IChvKSB7XG4gIHJldHVybiBvICYmIHR5cGVvZiBvID09PSAnb2JqZWN0J1xufVxuXG5mdW5jdGlvbiBhcHBlbmQgKG9iaiwgcGF0aCwgdmFsdWUpIHtcbiAgdmFyIGEgPSBOLmdldChvYmosIHBhdGgpXG4gIGlmICghYSkgTi5zZXQob2JqLCBwYXRoLCBhID0gW10pXG4gIGEucHVzaCh2YWx1ZSlcbn1cblxuZnVuY3Rpb24gZmxhdHRlbk5lc3RlZCAobW9kdWxlcykge1xuICByZXR1cm4gbW9kdWxlcy5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBlYWNoTW9kdWxlKGIsIGZ1bmN0aW9uICh2YWx1ZSwgcGF0aCkge1xuICAgICAgdmFyIGsgPSBwYXRoLmpvaW4oJy8nKVxuICAgICAgYVtrXSA9IHZhbHVlXG4gICAgfSlcbiAgICByZXR1cm4gYVxuICB9LCB7fSlcbn1cblxuZnVuY3Rpb24gYXNzZXJ0RGVwZW5kZW5jaWVzIChtb2R1bGVzKSB7XG4gIHZhciBhbGxOZWVkcyA9IHt9XG4gIHZhciBhbGxHaXZlcyA9IHt9XG5cbiAgZm9yICh2YXIga2V5IGluIG1vZHVsZXMpIHtcbiAgICB2YXIgbW9kdWxlID0gbW9kdWxlc1trZXldXG4gICAgTi5lYWNoKG1vZHVsZS5uZWVkcywgZnVuY3Rpb24gKHYsIHBhdGgpIHtcbiAgICAgIE4uc2V0KGFsbE5lZWRzLCBwYXRoLCBrZXkpXG4gICAgfSlcbiAgICBpZiAoaXNTdHJpbmcobW9kdWxlLmdpdmVzKSkge1xuICAgICAgTi5zZXQoYWxsR2l2ZXMsIFttb2R1bGUuZ2l2ZXNdLCB0cnVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBOLmVhY2gobW9kdWxlLmdpdmVzLCBmdW5jdGlvbiAodiwgcGF0aCkge1xuICAgICAgICBOLnNldChhbGxHaXZlcywgcGF0aCwgdHJ1ZSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgTi5lYWNoKGFsbE5lZWRzLCBmdW5jdGlvbiAoa2V5LCBwYXRoKSB7XG4gICAgaWYgKCFOLmdldChhbGxHaXZlcywgcGF0aCkpIHsgdGhyb3cgbmV3IEVycm9yKCd1bm1ldCBuZWVkOiBgJyArIHBhdGguam9pbignLicpICsgJ2AsIG5lZWRlZCBieSBtb2R1bGUgJyArICgoaXNOYU4oa2V5KSkgPyAnYCcgKyBrZXkgKyAnYCcgOiAnJykpIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gYWRkR2l2ZW5Ub0NvbWJpbmVkIChnaXZlbiwgY29tYmluZWQsIG1vZHVsZSkge1xuICBpZiAoaXNTdHJpbmcobW9kdWxlLmdpdmVzKSkge1xuICAgIGFwcGVuZChjb21iaW5lZCwgW21vZHVsZS5naXZlc10sIGdpdmVuKVxuICB9IGVsc2Uge1xuICAgIE4uZWFjaChtb2R1bGUuZ2l2ZXMsIGZ1bmN0aW9uIChfLCBwYXRoKSB7XG4gICAgICB2YXIgZnVuID0gTi5nZXQoZ2l2ZW4sIHBhdGgpXG4gICAgICBhcHBlbmQoY29tYmluZWQsIHBhdGgsIGZ1bilcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2hNb2R1bGUgKG9iaiwgaXRlciwgcGF0aCkge1xuICBwYXRoID0gcGF0aCB8fCBbXVxuICBpZiAoaXNNb2R1bGUob2JqKSkgaXRlcihvYmosIHBhdGguY29uY2F0KGspKVxuICBmb3IgKHZhciBrIGluIG9iaikge1xuICAgIGlmIChpc09iamVjdChvYmpba10pKSB7XG4gICAgICBlYWNoTW9kdWxlKG9ialtrXSwgaXRlciwgcGF0aC5jb25jYXQoaykpXG4gICAgfVxuICB9XG59XG4iLCJ2YXIgTiA9IHJlcXVpcmUoJ2xpYm5lc3RlZCcpXG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24gKGYpIHtcbiAgcmV0dXJuIHR5cGVvZiBmID09PSAnZnVuY3Rpb24nXG59XG5cbmZ1bmN0aW9uIGlzVHJ1ZSAoYikge1xuICByZXR1cm4gYiA9PT0gdHJ1ZVxufVxuXG5mdW5jdGlvbiBpc0dpdmVzIChvKSB7XG4gIHJldHVybiBpc1N0cmluZyhvKSB8fCBOLmVhY2gobywgaXNUcnVlKVxufVxuXG5mdW5jdGlvbiBpc1R5cGUgKHQpIHtcbiAgcmV0dXJuICh7bWFwOiB0cnVlLCBmaXJzdDogdHJ1ZSwgcmVkdWNlOiB0cnVlfSlbdF1cbn1cblxuZnVuY3Rpb24gaXNOZWVkcyAobikge1xuICByZXR1cm4gTi5lYWNoKG4sIGlzVHlwZSlcbn1cblxuZnVuY3Rpb24gaXNNb2R1bGUgKG0pIHtcbiAgcmV0dXJuIG0gJiYgaXNGdW5jdGlvbihtLmNyZWF0ZSkgJiYgaXNHaXZlcyhtLmdpdmVzKSAmJiAoIW0ubmVlZHMgfHwgaXNOZWVkcyhtLm5lZWRzKSlcbn1cblxuZnVuY3Rpb24gaXNTdHJpbmcgKHMpIHtcbiAgcmV0dXJuIHR5cGVvZiBzID09PSAnc3RyaW5nJ1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTW9kdWxlXG4iLCJmdW5jdGlvbiBpc09iamVjdCAobykge1xuICByZXR1cm4gbyAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIG8gJiYgIUFycmF5LmlzQXJyYXkobylcbn1cblxuZnVuY3Rpb24gZ2V0IChvYmosIHBhdGgsIGRmdCkge1xuICBmb3IodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIGlmKG51bGwgPT0gKG9iaiA9IG9ialtwYXRoW2ldXSkpIHJldHVybiBkZnRcbiAgfVxuICByZXR1cm4gb2JqXG59XG5cbmZ1bmN0aW9uIHNldCAob2JqLCBwYXRoLCB2YWx1ZSkge1xuICBpZighb2JqKSB0aHJvdyBuZXcgRXJyb3IoJ2xpYm5lc3RlZC5zZXQ6IGZpcnN0IGFyZyBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKVxuICAgIGlmKGkgPT09IHBhdGgubGVuZ3RoIC0gMSlcbiAgICAgIG9ialtwYXRoW2ldXSA9IHZhbHVlXG4gICAgZWxzZSBpZihudWxsID09IG9ialtwYXRoW2ldXSlcbiAgICAgIG9iaiA9IChvYmpbcGF0aFtpXV0gPSB7fSlcbiAgICBlbHNlXG4gICAgICBvYmogPSBvYmpbcGF0aFtpXV1cbiAgcmV0dXJuIHZhbHVlXG59XG5cbmZ1bmN0aW9uIGVhY2ggKG9iaiwgaXRlciwgcGF0aCkge1xuICBwYXRoID0gcGF0aCB8fCBbXVxuICBmb3IodmFyIGsgaW4gb2JqKSB7XG4gICAgaWYoaXNPYmplY3Qob2JqW2tdKSkge1xuICAgICAgaWYoZmFsc2UgPT09IGVhY2gob2JqW2tdLCBpdGVyLCBwYXRoLmNvbmNhdChrKSkpIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICBpZihmYWxzZSA9PT0gaXRlcihvYmpba10sIHBhdGguY29uY2F0KGspKSkgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmZ1bmN0aW9uIG1hcCAob2JqLCBpdGVyLCBvdXQpIHtcbiAgdmFyIG91dCA9IG91dCB8fCB7fVxuICBlYWNoKG9iaiwgZnVuY3Rpb24gKHZhbCwgcGF0aCkge1xuICAgIHNldChvdXQsIHBhdGgsIGl0ZXIodmFsLCBwYXRoKSlcbiAgfSlcbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBwYXRocyAob2JqKSB7XG4gIHZhciBvdXQgPSBbXVxuICBlYWNoKG9iaiwgZnVuY3Rpb24gKF8sIHBhdGgpIHtcbiAgICBvdXQucHVzaChwYXRoKVxuICB9KVxuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydHMuZ2V0ID0gZ2V0XG5leHBvcnRzLnNldCA9IHNldFxuZXhwb3J0cy5lYWNoID0gZWFjaFxuZXhwb3J0cy5tYXAgPSBtYXBcbmV4cG9ydHMucGF0aHMgPSBwYXRoc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGlzRWxlbWVudCA9IG5vZGUgPT4gIW5vZGUubm9kZU5hbWUuc3RhcnRzV2l0aCggJyMnIClcbmNvbnN0IGlzVGV4dCA9IG5vZGUgPT4gbm9kZS5ub2RlTmFtZSA9PT0gJyN0ZXh0J1xuY29uc3QgdGV4dCA9IG5vZGUgPT4gbm9kZS5ub2RlVmFsdWVcbmNvbnN0IGNoaWxkcmVuID0gbm9kZSA9PiAnY2hpbGROb2RlcycgaW4gbm9kZSA/IEFycmF5LmZyb20oIG5vZGUuY2hpbGROb2RlcyApIDogW11cbmNvbnN0IG5vZGVOYW1lID0gbm9kZSA9PiBub2RlLm5vZGVOYW1lXG5cbi8vIG92ZXJyaWRlcyBkZWZhdWx0IGZ1bmN0aW9ucyB3aXRoIG1vcmUgZWZmaWNpZW50IG9uZXMgZnJvbSB0aGUgRE9NXG5jb25zdCBwYXJlbnQgPSAoIHJvb3QsIG5vZGUgKSA9PiBub2RlLnBhcmVudE5vZGVcbmNvbnN0IHN0cmluZ2lmeSA9IG5vZGUgPT4gaXNUZXh0KCBub2RlICkgPyB0ZXh0KCBub2RlICkgOiBub2RlLm91dGVySFRNTFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaXNFbGVtZW50LCBpc1RleHQsIHRleHQsIGNoaWxkcmVuLCBub2RlTmFtZSwgcGFyZW50LCBzdHJpbmdpZnlcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBBcGkgPSByZXF1aXJlKCAnLi8nIClcbmNvbnN0IGFkYXB0ZXIgPSByZXF1aXJlKCAnLi4vYWRhcHRlcnMvZG9tJyApXG5jb25zdCBoZWxsb1BhcmVudCA9IHJlcXVpcmUoICcuLi9wbHVnaW5zL2hlbGxvUGFyZW50JyApXG5cbm1vZHVsZS5leHBvcnRzID0gQXBpKCBhZGFwdGVyLCB7IGhlbGxvUGFyZW50IH0gKVxuIiwiJ3VzZSBzdHJpY3QnXG5jb25zdCBQbHVnaW5zID0gcmVxdWlyZSggJy4uL3BsdWdpbnMnIClcblxuY29uc3QgQXBpID0gKCBhZGFwdGVyLCBwbHVnaW5zID0ge30gKSA9PiB7XG4gIGNvbnN0IHdhbGsgPSAoIG5vZGUsIGNiICkgPT5cbiAgICBjYiggbm9kZSApIHx8XG4gICAgYXBpLmNoaWxkcmVuKCBub2RlICkuc29tZSggY2hpbGQgPT5cbiAgICAgIGFwaS53YWxrKCBjaGlsZCwgY2IgKVxuICAgIClcblxuICBjb25zdCBmaW5kID0gKCBub2RlLCBwcmVkaWNhdGUgKSA9PiB7XG4gICAgbGV0IGZvdW5kXG5cbiAgICBhcGkud2Fsayggbm9kZSwgbiA9PiB7XG4gICAgICBpZiggcHJlZGljYXRlKCBuICkgKXtcbiAgICAgICAgZm91bmQgPSBuXG5cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZvdW5kXG4gIH1cblxuICBjb25zdCBwYXJlbnQgPSAoIHJvb3QsIG5vZGUgKSA9PlxuICAgIGFwaS5maW5kKCByb290LCBuID0+IGFwaS5jaGlsZHJlbiggbiApLmluY2x1ZGVzKCBub2RlICkgKVxuXG4gIGNvbnN0IHN0cmluZ2lmeSA9IG5vZGUgPT4ge1xuICAgIGlmKCBhcGkuaXNUZXh0KCBub2RlICkgKVxuICAgICAgcmV0dXJuIGFwaS50ZXh0KCBub2RlIClcblxuICAgIGNvbnN0IHRhZyA9IGFwaS5ub2RlTmFtZSggbm9kZSApXG4gICAgY29uc3QgaW5uZXJIVE1MID0gYXBpLmNoaWxkcmVuKCBub2RlICkubWFwKCBzdHJpbmdpZnkgKS5qb2luKCAnJyApXG5cbiAgICByZXR1cm4gYDwkeyB0YWcgfT4keyBpbm5lckhUTUwgfTwvJHsgdGFnIH0+YFxuICB9XG5cbiAgY29uc3QgYXBpID0geyB3YWxrLCBmaW5kLCBwYXJlbnQsIHN0cmluZ2lmeSB9XG5cbiAgT2JqZWN0LmFzc2lnbiggYXBpLCBhZGFwdGVyIClcblxuICBQbHVnaW5zKCBhcGksIHBsdWdpbnMgKVxuXG4gIHJldHVybiBhcGlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBcGlcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBoZWxsb1BhcmVudCA9ICggYXBpLCBub2RlICkgPT4ge1xuICBjb25zdCB7IGlzVGV4dCwgdGV4dCwgZmluZCwgcGFyZW50IH0gPSBhcGlcblxuICBjb25zdCBpc0hlbGxvVGV4dCA9IG4gPT5cbiAgICBpc1RleHQoIG4gKSAmJiB0ZXh0KCBuICkuaW5jbHVkZXMoICdIZWxsbycgKVxuXG4gIGNvbnN0IHRleHROb2RlID0gZmluZCggbm9kZSwgaXNIZWxsb1RleHQgKVxuXG4gIGlmKCB0ZXh0Tm9kZSApXG4gICAgcmV0dXJuIHBhcmVudCggbm9kZSwgdGV4dE5vZGUgKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhlbGxvUGFyZW50XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgUGx1Z2lucyA9ICggYXBpLCBvYmogKSA9PlxuICBPYmplY3Qua2V5cyggb2JqICkuZm9yRWFjaCggZm5hbWUgPT5cbiAgICBhcGlbIGZuYW1lIF0gPSAoIC4uLmFyZ3MgKSA9PiBvYmpbIGZuYW1lIF0oIGFwaSwgLi4uYXJncyApXG4gIClcblxubW9kdWxlLmV4cG9ydHMgPSBQbHVnaW5zXG4iXX0=
