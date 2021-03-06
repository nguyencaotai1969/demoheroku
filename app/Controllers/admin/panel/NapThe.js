
var NapThe   = require('../../../Models/NapThe');
var MenhGia  = require('../../../Models/MenhGia');
var UserInfo = require('../../../Models/UserInfo');

function get_data(client, data){
	if (!!data && !!data.page) {
		var status = data.status>>0;
		var page   = data.page>>0;
		var kmess  = 10;

		if (page > 0) {
			if (status == -1) {
				NapThe.estimatedDocumentCount().exec(function(err, total){
					NapThe.find({}, {}, {sort:{'_id':-1}, skip: (page-1)*kmess, limit: kmess}, function(err, result) {
						if (result.length) {
							Promise.all(result.map(function(obj){
								obj = obj._doc;
								var user = UserInfo.findOne({id: obj.uid}, 'name').exec();
								return Promise.all([user]).then(values => {
									if (values[0]) {
										values = values[0]._doc;
										delete values._id;
										Object.assign(obj, values);
										delete obj.__v;
										delete obj.GD;
										delete obj.uid;
										return obj;
									}
									return obj;
								});
							}))
							.then(function(arrayOfResults) {
								client.red({nap_the:{get_data:{data:arrayOfResults, page:page, kmess:kmess, total:total}}});
							})
						}else{
							client.red({nap_the:{get_data:{data:result, page:page, kmess:kmess, total:total}}});
						}
					});
				});
			}else{
				var query = status == 0 ? {status: 0} : {status: {$gt: 0}};
				NapThe.countDocuments(query).exec(function(err, total){
					NapThe.find(query, {}, {sort:{'_id':-1}, skip: (page-1)*kmess, limit: kmess}, function(err, result) {
						if (result.length) {
							Promise.all(result.map(function(obj){
								obj = obj._doc;
								var user = UserInfo.findOne({id: obj.uid}, 'name').exec();
								return Promise.all([user]).then(values => {
									if (values[0]) {
										values = values[0]._doc;
										delete values._id;
										Object.assign(obj, values);
										delete obj.__v;
										delete obj.GD;
										delete obj.uid;
										return obj;
									}
									return obj;
								});
							}))
							.then(function(arrayOfResults) {
								client.red({nap_the:{get_data:{data:arrayOfResults, page:page, kmess:kmess, total:total}}});
							})
						}else{
							client.red({nap_the:{get_data:{data:result, page:page, kmess:kmess, total:total}}});
						}
					});
				});
			}
		}
	}
}

function update(client, data){
	if (!!data && !!data.id) {
		var status = data.status>>0;
		var id     = data.id;

		NapThe.findOne({'_id':id}, 'uid menhGia nhan status', function(err, check){
			if (check) {
				if (check.status == status) {
					client.red({notice:{title: 'CH?? ??', text: 'Kh??ng Th??? C???p Nh???t...' + '\n' + 'V?? Th??? C??o ??ang trong tr???ng th??i ???????c ch???n...'}});
				}else{
					if (status == 1) {
						MenhGia.findOne({'name':check.menhGia, 'nap': true}, 'values', function(err, checkMenhGia){
							if (!!checkMenhGia) {
								NapThe.updateOne({'_id':id}, {$set:{nhan: checkMenhGia.values, status: status}}).exec();
								UserInfo.findOneAndUpdate({'id':check.uid}, {$inc:{red:checkMenhGia.values}}).exec(function(err3, user){
									if (user) {
										if (void 0 !== client.redT.users[check.uid]) {
											Promise.all(client.redT.users[check.uid].map(function(obj){
												obj.red({user:{red:user.red*1+checkMenhGia.values}});
											}));
										}
									}
								});
								client.red({notice:{title: 'TH??NG TIN N???P TH???', text: 'C???p nh???t th??nh c??ng...'},nap_the:{update:{id: id, status: status, nhan: checkMenhGia.values}}});

							}else{
								client.red({notice:{title: 'L???I H??? TH???NG', text: 'M???nh gi?? n??y kh??ng t???n t???i tr??n h??? th???ng...'}});
							}
						});
					}else{
						if (check.status == 1) {
							NapThe.updateOne({'_id':id}, {$set:{nhan:0, status:status}}).exec();
							UserInfo.updateOne({'id':check.uid}, {$inc:{red:-check.nhan}}).exec();
						}else{
							NapThe.updateOne({'_id':id}, {$set:{status: status}}).exec();
						}
						client.red({notice:{title: 'TH??NG TIN N???P TH???', text: 'C???p nh???t th??nh c??ng...'}, nap_the:{update:{id: id, status: status, nhan: 0}}});
					}
				}
			}else{
				client.red({notice:{title: 'L???I', text: 'Th??? kh??ng t???n t???i.'}});
			}
		});
	}
}

module.exports = function(client, data) {
	if (!!data) {
		if (!!data.get_data) {
			get_data(client, data.get_data)
		}
		if (!!data.update) {
			update(client, data.update)
		}
	}
}
