exports.bundledActions = [
	{
		name: ["rgbtohex", "rgb2hex"],
		doc: "rgbtohex(r, g, b): <br>converts rgb triple to hex: 'rgbtohex 255 255 255' returns '0xFFFFFF'",
		action: (args) => {
			if(args[0].indexOf("rgb") === 0) {
				let t = args[0].replace("rgb(", "").replace("rgba(").replace(")", "").split(",");
				args[0] = t[0];
				args[1] = t[1];
				args[2] = t[2];
			}

			let rh = parseInt(args[0]).toString(16).toUpperCase();
			if (rh.length === 1)
				rh = "0" + rh;
			let gh = parseInt(args[1]).toString(16).toUpperCase();
			if (gh.length === 1)
				gh = "0" + gh;
			let bh = parseInt(args[2]).toString(16).toUpperCase();
			if (bh.length === 1)
				bh = "0" + bh;
			return "#" + rh + gh + bh;
		}
	},
	{
		name: ["hextorgb", "hex2rgb"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args) || (args[0].length < 3 && args[0] > 8))
				return "hextorgb(hex): <br>converts hex to css formatted rgb. <br>'hextorgb fff' returns 'rgb(255,255,255)'";

			let color = [];
			if (args[0].indexOf("#") === 0)
				args[0] = args[0].substr(1);
			if (args[0].indexOf("0x") === 0)
				args[0] = args[0].substr(2);
			if (args[0].length === 3) {
				color[0] = args[0].substr(0, 1) + args[0].substr(0, 1);
				color[1] = args[0].substr(1, 1) + args[0].substr(1, 1);
				color[2] = args[0].substr(2, 1) + args[0].substr(2, 1);
			}
			if (args[0].length === 6)
				color = [args[0].substr(0, 2), args[0].substr(2, 2), args[0].substr(4, 2)];

			let r = parseInt(color[0], 16);
			let g = parseInt(color[1], 16);
			let b = parseInt(color[2], 16);

			return "rgb(" + r + "," + g + "," + b + ")";
		}
	},
	{
		name: ["swatch"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "swatch (r, g, b)/(hex): <br>displays a swatch of the given rgb or hex values";

			let type = "rgb";
			for (let a = 0; a < args.length; a++) {
				if (args[a].indexOf("#") === 0 ||
					args[a].indexOf("0x") === 0 ||
					args[a].length === 6) {
					type = "hex";
					break;
				}
			}
			if (type === "hex")
				return nw.WorkSprite.lib['customActions'].exec("hexswatch", args);
			else
				return nw.WorkSprite.lib['customActions'].exec("rgbswatch", args);
		}
	},
	{
		name: ["rgbswatch"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "rgbswatch (r, g, b): <br>displays a swatch of the given rgb values";

			return `Swatch: <div style='width: 20px; height: 20px; background-color: rgb(${parseInt(args[0])},${parseInt(args[1])},${parseInt(args[2])});'></div>`;
		}
	},
	{
		name: ["hexswatch"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "rgbswatch (hex): <br>displays a swatch of the given hex value";

			return `Swatch: <div style='width: 20px; height: 20px; background-color: ${args[0].replace('0x', '#')};></div>`;
		}
	},
	{
		name: ["lerprgb", "rgblerp"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args))
				return "lerprgb (weight, r1, g1, b1, r2, g2, b2): <br>interpolate between rgb1 and rgb2 values (0-1) at weight";

			return `rgb(${parseInt((1 - args[0]) * args[1] + args[0] * args[4])},${parseInt((1 - args[0]) * args[2] + args[0] * args[5])},${parseInt((1 - args[0]) * args[3] + args[0] * args[6])})`;
		}
	},
	{
		name: ["lerphex", "hexlerp"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args) || args.length < 3)
				return "lerphex (weight, hex1, hex2): <br>interpolate between hex1 and hex2 values (0-1) at weight";

			let w = args[0];

			if (args[1].indexOf("#") === 0)
				args[1] = args[1].substr(1);
			if (args[1].indexOf("0x") === 0)
				args[1] = args[1].substr(2);

			let color = [];
			if (args[1].length === 3) {
				color[0] = args[1].substr(0, 1) + args[1].substr(0, 1);
				color[1] = args[1].substr(1, 1) + args[1].substr(1, 1);
				color[2] = args[1].substr(2, 1) + args[1].substr(2, 1);
			}
			if (args[1].length === 6)
				color = [args[1].substr(0, 2), args[1].substr(2, 2), args[1].substr(4, 2)];

			let r1 = parseInt(color[0], 16);
			let g1 = parseInt(color[1], 16);
			let b1 = parseInt(color[2], 16);

			if (args[2].indexOf("#") === 0)
				args[2] = args[2].substr(1);
			if (args[2].indexOf("0x") === 0)
				args[2] = args[2].substr(2);

			color = [];
			if (args[2].length === 3) {
				color[0] = args[2].substr(0, 1) + args[2].substr(0, 1);
				color[1] = args[2].substr(1, 1) + args[2].substr(1, 1);
				color[2] = args[2].substr(2, 1) + args[2].substr(2, 1);
			}
			if (args[2].length === 6)
				color = [args[2].substr(0, 2), args[2].substr(2, 2), args[2].substr(4, 2)];

			let r2 = parseInt(color[0], 16);
			let g2 = parseInt(color[1], 16);
			let b2 = parseInt(color[2], 16);

			let rh = parseInt((1 - w) * r1 + w * r2).toString(16).toUpperCase();
			if (rh.length === 1)
				rh = "0" + rh;
			let gh = parseInt((1 - w) * g1 + w * g2).toString(16).toUpperCase();
			if (gh.length === 1)
				gh = "0" + gh;
			let bh = parseInt((1 - w) * b1 + w * b2).toString(16).toUpperCase();
			if (bh.length === 1)
				bh = "0" + bh;

			return `#${rh}${gh}${bh}`;
		}
	},
	{
		name: ["rgb2cmyk", "rgbtocmyk"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args) || args.length < 3)
				return "rgb2cmyk (r, g, b): <br>convert from rgb values to cmyk values";
			
			let rp = parseInt(args[0]) / 255;
			let gp = parseInt(args[1]) / 255;
			let bp = parseInt(args[2]) / 255;

			if (rp === 0 && gp === 0 && bp === 0)
				return "cmyk(0, 0, 0, 1)";

			let k = 1 - Math.max(rp, gp, bp);
			let c = (1 - rp - k) / (1 - k);
			let m = (1 - gp - k) / (1 - k);
			let y = (1 - bp - k) / (1 - k);

			return `cmyk(${c.toFixed(2)}, ${m.toFixed(2)}, ${y.toFixed(2)}, ${k.toFixed(2)})`;
		}
	},
	{
		name: ["cmyk2rgb", "cmyktorgb"],
		action: (args) => {
			if (nw.WorkSprite.lib['customActions'].isAskingForHelp(args) || args.length < 4)
				return "cmyk2rgb (c, m, y, k): <br>convert from cmyk values to rgb values";

			let r = parseInt(255 * (1 - parseInt(args[0])) * (1 - parseInt(args[3])));
			let g = parseInt(255 * (1 - parseInt(args[1])) * (1 - parseInt(args[3])));
			let b = parseInt(255 * (1 - parseInt(args[2])) * (1 - parseInt(args[3])));

			return `rgb(${r}, ${g}, ${b})`;
		}
	}
];

