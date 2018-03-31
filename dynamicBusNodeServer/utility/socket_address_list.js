module.exports = function(socketMap) {
	let list = [];
	for(let i in socketMap) {
		list.push(i);
	}
	return list;
}