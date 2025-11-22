'use strict';

var INITIAL_STATE = 1;
var FAIL_STATE = 0;
/**
 * A StateMachine represents a deterministic finite automaton.
 * It can perform matches over a sequence of values, similar to a regular expression.
 */

class StateMachine {
  constructor(dfa) {
    this.stateTable = dfa.stateTable;
    this.accepting = dfa.accepting;
    this.tags = dfa.tags;
  }
  /**
   * Returns an iterable object that yields pattern matches over the input sequence.
   * Matches are of the form [startIndex, endIndex, tags].
   */


  match(str) {
    var self = this;
    return {
      *[Symbol.iterator]() {
        var state = INITIAL_STATE;
        var startRun = null;
        var lastAccepting = null;
        var lastState = null;

        for (var p = 0; p < str.length; p++) {
          var c = str[p];
          lastState = state;
          state = self.stateTable[state][c];

          if (state === FAIL_STATE) {
            // yield the last match if any
            if (startRun != null && lastAccepting != null && lastAccepting >= startRun) {
              yield [startRun, lastAccepting, self.tags[lastState]];
            } // reset the state as if we started over from the initial state


            state = self.stateTable[INITIAL_STATE][c];
            startRun = null;
          } // start a run if not in the failure state


          if (state !== FAIL_STATE && startRun == null) {
            startRun = p;
          } // if accepting, mark the potential match end


          if (self.accepting[state]) {
            lastAccepting = p;
          } // reset the state to the initial state if we get into the failure state


          if (state === FAIL_STATE) {
            state = INITIAL_STATE;
          }
        } // yield the last match if any


        if (startRun != null && lastAccepting != null && lastAccepting >= startRun) {
          yield [startRun, lastAccepting, self.tags[state]];
        }
      }

    };
  }
  /**
   * For each match over the input sequence, action functions matching
   * the tag definitions in the input pattern are called with the startIndex,
   * endIndex, and sub-match sequence.
   */


  apply(str, actions) {
    for (var [start, end, tags] of this.match(str)) {
      for (var tag of tags) {
        if (typeof actions[tag] === 'function') {
          actions[tag](start, end, str.slice(start, end + 1));
        }
      }
    }
  }

}

module.exports = StateMachine;
//# sourceMappingURL=index.js.map
