module.exports = function(key, id, serverList) {

	return {
		key:key,
		id:id,
		serverList:serverList,
		schedule:[],
		update: function() {
			//Get Schedule from socket, update it to this.schedule and sort
		}
	}
}