const mkdirp 	= require('mkdirp');
const path 		= require('path');

function buildWebApp(mPath) {
	
	console.log("Try to create folder: " + mPath);
	
	if(mPath === undefined){
		console.error("Kein Pfad angegeben!")
	}else{
		mkdirp(mPath, function (err) {
			if (err) console.error(err)
			else console.log('Created Folder: ' + mPath)
		});
	}
	
}

module.exports = {
    buildWebApp: buildWebApp
};