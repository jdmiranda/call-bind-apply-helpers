/* eslint-disable no-console, func-style, space-before-function-paren, array-bracket-newline, no-unused-vars, curly, no-plusplus */

'use strict';

var callBind = require('./index');
var applyBind = require('./applyBind');

// Benchmark configuration
var ITERATIONS = 1000000;

// Test function
function testFunction(a, b, c) {
	return a + b + c;
}

// Helper to measure performance
function benchmark(name, fn) {
	var start = Date.now();
	for (var i = 0; i < ITERATIONS; i++) {
		fn();
	}
	var end = Date.now();
	var duration = end - start;
	var opsPerSec = Math.round((ITERATIONS / duration) * 1000);
	console.log(name + ': ' + opsPerSec.toLocaleString() + ' ops/sec (' + duration + 'ms for ' + ITERATIONS.toLocaleString() + ' iterations)');
	return opsPerSec;
}

console.log('=== call-bind-apply-helpers Performance Benchmark ===\n');
console.log('Iterations per test: ' + ITERATIONS.toLocaleString() + '\n');

// Baseline: native function call
console.log('--- Baseline (Native) ---');
var baselineOps = benchmark('Native function call', function() {
	testFunction(1, 2, 3);
});

var nativeBound = testFunction.bind(null, 1, 2, 3);
var nativeBoundOps = benchmark('Native bind() + call', function() {
	nativeBound();
});

console.log('\n--- callBind() wrapper performance ---');

// Test 1: callBind with no receiver (cached path)
var bound1 = callBind([testFunction]);
var callBindNoReceiverOps = benchmark('callBind([func]) - no receiver (cached)', function() {
	bound1(null, 1, 2, 3);
});

// Test 2: callBind with receiver
var sentinel = { name: 'test' };
var bound2 = callBind([testFunction, sentinel]);
var callBindWithReceiverOps = benchmark('callBind([func, receiver])', function() {
	bound2(1, 2, 3);
});

// Test 3: callBind with receiver and args
var bound3 = callBind([testFunction, sentinel, 1]);
var callBindWithArgsOps = benchmark('callBind([func, receiver, arg])', function() {
	bound3(2, 3);
});

// Test 4: Repeated callBind on same function (tests cache effectiveness)
var repeatedCallBindOps = benchmark('callBind([func]) - repeated (cache hit)', function() {
	callBind([testFunction]);
});

console.log('\n--- applyBind() wrapper performance ---');

// Test 5: applyBind wrapper
var applyBound = applyBind;
var applyBindOps = benchmark('applyBind() wrapper', function() {
	applyBound(testFunction, null, [1, 2, 3]);
});

console.log('\n--- Cache effectiveness ---');

// Test cache hits vs misses
var cacheHits = 0;
var cacheMisses = 0;
var funcs = [testFunction];

// Pre-populate cache
callBind([testFunction]);

var cacheTestStart = Date.now();
for (var i = 0; i < ITERATIONS; i++) {
	var result = callBind([funcs[i % funcs.length]]);
	if (result) cacheHits++;
}
var cacheTestEnd = Date.now();
var cacheTestDuration = cacheTestEnd - cacheTestStart;
var cacheOpsPerSec = Math.round((ITERATIONS / cacheTestDuration) * 1000);

console.log('Cached lookups: ' + cacheOpsPerSec.toLocaleString() + ' ops/sec (' + cacheTestDuration + 'ms)');

console.log('\n=== Performance Summary ===');
console.log('Native function call: ' + baselineOps.toLocaleString() + ' ops/sec (baseline)');
console.log('Native bind + call: ' + nativeBoundOps.toLocaleString() + ' ops/sec (' + Math.round((nativeBoundOps / baselineOps) * 100) + '% of baseline)');
console.log('callBind no receiver (cached): ' + callBindNoReceiverOps.toLocaleString() + ' ops/sec (' + Math.round((callBindNoReceiverOps / baselineOps) * 100) + '% of baseline)');
console.log('callBind with receiver: ' + callBindWithReceiverOps.toLocaleString() + ' ops/sec (' + Math.round((callBindWithReceiverOps / baselineOps) * 100) + '% of baseline)');
console.log('callBind with args: ' + callBindWithArgsOps.toLocaleString() + ' ops/sec (' + Math.round((callBindWithArgsOps / baselineOps) * 100) + '% of baseline)');
console.log('callBind repeated (cache): ' + repeatedCallBindOps.toLocaleString() + ' ops/sec (' + Math.round((repeatedCallBindOps / callBindNoReceiverOps) * 100) + 'x faster)');
console.log('applyBind wrapper: ' + applyBindOps.toLocaleString() + ' ops/sec (' + Math.round((applyBindOps / baselineOps) * 100) + '% of baseline)');

console.log('\n=== Optimizations Applied ===');
console.log('1. WeakMap cache for bound functions (single-arg binds)');
console.log('2. Pre-bound actualApply function (cached at module load)');
console.log('3. Cached Reflect.apply lookup');
console.log('4. Pre-bound bind.call for fast path execution');
console.log('5. Reduced closure overhead in hot paths');
