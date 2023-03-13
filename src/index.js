const BellClient = require('./Structures/BellClient');

const client = new BellClient();

process.on('unhandledRejection', (reason, pr) => {
	console.log(' [antiCrash] :: Unhandled Rejection/Catch');
	console.log(reason, pr);
});

client.start();
