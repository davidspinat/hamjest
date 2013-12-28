'use strict';

var _ = require('lodash-node')
	, q = require('q')
	, Matcher = require('./Matcher')
	, asMatcher = require('./IsEqual').asMatcher
	, anything = require('./ISAnything').anything
	;

var IsFulfilled = function (valueOrMatcher) {
	var anyValue = (arguments.length === 0);
	var valueMatcher = (anyValue ? anything() : asMatcher(valueOrMatcher));
	Matcher.call(this, {
		matches: function (actual) {
			if (!q.isPromise(actual)) {
				return false;
			}

			if (!q.isFulfilled(actual)) {
				return false;
			}

			return valueMatcher.matches(actual.inspect().value);
		},
		describeTo: function (description) {
			description.append('fulfilled promise');
			if (!anyValue) {
				description.append(' (');
				valueMatcher.describeTo(description);
				description.append(')');
			}
		},
		describeMismatch: function (actual, description) {
			if(!q.isPromise(actual)) {
				description
					.append('was not a promise (')
					.appendValue(actual)
					.append(')');
			}
			else if (!q.isFulfilled(actual)) {
				description
					.append('was not fulfilled (')
					.appendValue(actual.inspect())
					.append(')');
			}
			else {
				description
					.append('was fulfilled with ')
					.appendValue(actual.inspect().value);
			}
		}
	});
};
IsFulfilled.prototype = _.create(Matcher.prototype, { 'constructor': IsFulfilled });

module.exports = {
	IsFulfilled: IsFulfilled,
	fulfilled: function (operand) {
		if(arguments.length === 0) {
			return new IsFulfilled();
		}
		else {
			return new IsFulfilled(operand);
		}
	}
};