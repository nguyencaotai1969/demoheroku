
module.exports = function(client){
	if (!!client && client.redT) {
		client.red({
			taixiu: {time_remain: client.redT.TaiXiu_time},
			mini:   {baucua:{time_remain: client.redT.BauCua_time}}
		});
	}
}
