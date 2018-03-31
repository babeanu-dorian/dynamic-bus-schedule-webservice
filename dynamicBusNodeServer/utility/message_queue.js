// constructor for a new empty list:
// processFunc should take in a value (list element) and a callback,
// process the value and call the callback afterwards
module.exports = function(processElem) {
	return {
		first:null,
		last:null,
		processElem: processElem,
		process: function() {
			if (this.first != null)
				processElem(this.first.val, this.dequeue.bind(this, this.process.bind(this)));
		},
		enqueue: function(val, callback) {
			if (this.first === null) {
				this.first = this.last = {
					val: val,
					next: null
				};
			} else {
				this.last.next = {
					val: val,
					next: null
				};
				this.last = this.last.next;
			}
			this.process();
			if (callback)
				callback();
		},
		dequeue: function(callback) {
			// check for singleton queue
			if (this.last === this.first)
				this.last = null;
			// check for empty queue
			if (this.first !== null)
				this.first = this.first.next;

			if (callback)
				callback();
		}
	}
}