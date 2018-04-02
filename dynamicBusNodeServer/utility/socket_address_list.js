module.exports = function(socketMap) {
	let list = [];
	for(let i in socketMap) {
		list.push({
			socketAddress : i,
			httpAddress : socketMap[i].httpAddress
		});
	}
	return list;
}