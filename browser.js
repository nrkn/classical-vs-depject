'use strict'

const Dom = require( './dom' )
const Plugins = require( './plugins' )
const adapter = require( './adapters/dom' )
const helloParent = require( './plugins/helloParent' )

const D = Dom( adapter )

Plugins( D, { helloParent } )

const section = document.querySelector( 'section' )
const pre = document.querySelector( 'pre' )
const hp = D.helloParent( section )

section.remove()
pre.textContent = D.stringify( hp )
