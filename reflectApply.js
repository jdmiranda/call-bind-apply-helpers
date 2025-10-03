'use strict';

// Cache the Reflect.apply check result at module load time
var reflectApply = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;

/** @type {import('./reflectApply')} */
module.exports = reflectApply;
