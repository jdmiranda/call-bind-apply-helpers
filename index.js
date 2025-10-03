'use strict';

var bind = require('function-bind');
var $TypeError = require('es-errors/type');

var $call = require('./functionCall');
var $actualApply = require('./actualApply');

// Cache bound functions to avoid repeated bind operations for the same function
var boundFunctionCache = typeof WeakMap === 'undefined' ? null : new WeakMap();

/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
module.exports = function callBindBasic(args) {
	if (args.length < 1 || typeof args[0] !== 'function') {
		throw new $TypeError('a function is required');
	}

	var func = args[0];

	// Fast path: check cache for single-argument binds (most common case)
	if (boundFunctionCache && args.length === 1) {
		var cached = boundFunctionCache.get(func);
		if (cached) {
			return cached;
		}
		var result = $actualApply(bind, $call, args);
		boundFunctionCache.set(func, result);
		return result;
	}

	return $actualApply(bind, $call, args);
};
