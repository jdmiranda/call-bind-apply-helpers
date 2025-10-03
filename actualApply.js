'use strict';

var bind = require('function-bind');

var $apply = require('./functionApply');
var $call = require('./functionCall');
var $reflectApply = require('./reflectApply');

// Cache the bound apply function to avoid repeated bind operations
var boundApply = $reflectApply || bind.call($call, $apply);

/** @type {import('./actualApply')} */
module.exports = boundApply;
