exports.bundledActions = [
    {
		name: ["randinrange"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "randinrange(min, max): <br>return random number between min and max. <br>'randinrange 1 5' returns a number between 1 and 5";

			return Math.floor((Math.random() * (args[1] - args[0])) + args[0]);
		}
	},
	{
		name: ["headsortails"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "headsortails: <br>returns coin-flip heads < 50 or tails > 50";

			if (nw.WorkSprite.lib['customActions'].exec("randinrange", [1, 100]) < 50) {
				return 'heads';
			} else {
				return 'tails';
			}
		}
	},
	{
		name: ["lerpnums", "numlerp"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args) || args.length < 3)
				return "lerpnums (weight, start, end): <br>interpolate between start and end values (0-1) at weight";

			return (1 - args[0]) * args[1] + args[0] * args[2];
		}
	},
	{
		name: ["radtodeg", "rad2deg"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "radtodeg (rad): <br>convert radians to degrees";

			return (args[0] * 180 / Math.PI).toFixed(2);
		}
	},
	{
		name: ["degtorad", "deg2rad"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "degtorad (degrees): <br>convert degrees to radians";

			return (args[0] * Math.PI / 180).toFixed(2);
		}
	}
];