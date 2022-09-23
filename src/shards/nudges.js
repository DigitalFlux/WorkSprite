exports.bundledActions = [
	{
		name: ["notifyme"],
		action: (args) => {
			let focusArg = 1;
			if(args[focusArg - 1] === "in") {
				focusArg = 2;
			}
			// when to pop notification dialog
			let delay = 0;
			if (args[focusArg] === "seconds" ||
				args[focusArg] === "secs" ||
				args[focusArg] === "sec" ||
				args[focusArg] === "s") {
				delay = parseInt(args[focusArg - 1]) * 1000;
			} else if (args[focusArg] === "minutes" ||
				args[focusArg] === "mins" ||
				args[focusArg] === "min" ||
				args[focusArg] === "m") {
				delay = parseInt(args[focusArg - 1]) * 60000;
			}
			let banner = args.slice(focusArg + 1).join(" ") || "";

			window.setTimeout(() => {
				console.log("show nm!");
				nw.WorkSprite.lib['customActions'].exec('plainNotification', [
					'Attention:',
					banner,
					5000
				]);
			}, delay);
		}
	},
	{
		name: ["plainNotification"],
		action: (args) => {
			const ndg = new Notification(args[0], { 
				body: args[1],
				silent: true,
				requireInteraction: false
			});
			setTimeout(() => { ndg.close(); }, args[2]);
		}
	}
];

