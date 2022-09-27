exports.bundledActions = [
	{
		name: ["testaction1"],
		argNames: ["int", "float", "bool"],
		doc: "testaction1:<br>This is an action for just testing stuff. Here, everything is true and nothing is forbidden...",
		action: () => {
			console.log("testaction");
		}
	},
	{
		name: ["caniuse"],
		doc: "caniuse:<br>caniuse x to search the caniuse.com website for x",
		action: (args) => {
			nw.WorkSprite.lib['open']("https://caniuse.com/#search=" + args.join(" "));
		}
	},
	{
		name: ["?"],
		doc: "? and search term(s) will open the search engine of your choice for that query",
		action: (args) => {
			let focusArg = 0;
			let searchEngine = nw.WorkSprite.config.shardOptions.searchEngineCodes[args[focusArg]];

			if (nw.WorkSprite.config.shardOptions.searchEngineCodes[args[focusArg]]) {
				searchEngine = nw.WorkSprite.config.shardOptions.searchEngineCodes[args[focusArg]];
				focusArg++;
			}
			if(!searchEngine) {
				searchEngine = nw.WorkSprite.config.shardOptions.searchEngineCodes[nw.WorkSprite.config.shardOptions.searchEngineCodes["default"]];
			}

			nw.WorkSprite.lib['open'](searchEngine + args.slice(focusArg).join(" "));
		}
	},
	{
		name: ["emptytrash"],
		doc: "emptytrash:<br>This will empty the Recycle Bin",
		action: (args) => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/k', 'del /s /q %systemdrive%\$Recycle.bin'], { cwd: '%systemdrive%', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["echo"],
		action: (args) => {
			console.log(`Echo: ${args.join(' ')}`);
		}
	},
	{
		name: ["setResponse"],
		action: (args) => {
			if(args) {
				console.log(`${args}`);
			}
		}
	},
	{
		name: ["do"],
		action: (args) => {
			let file = null;
			let doName = nw.WorkSprite.lib['path'].join(nw.WorkSprite.basePath, nw.WorkSprite.config.shardOptions.do.doPath, args[0]);
			if(args[0].indexOf(".do") === -1 && args[0].indexOf(".txt") === -1) {
				if(nw.WorkSprite.lib['fs'].existsSync(`${doName}.do`)) {
					file = nw.WorkSprite.lib['fs'].readFileSync(`${doName}.do`, { encoding: 'utf8' });
				} else if(nw.WorkSprite.lib['fs'].existsSync(`${doName}.txt`)) {
					file = nw.WorkSprite.lib['fs'].readFileSync(`${doName}.txt`, { encoding: 'utf8' });
				} else {
					return `File not found1: ${doName}`;
				}
			} else {
				if(nw.WorkSprite.lib['fs'].existsSync(`${doName}`)) {
					file = nw.WorkSprite.lib['fs'].readFileSync(`${doName}`, { encoding: 'utf8' });
				} else {
					return `File not found2: ${doName}`;
				}
			}

			if(file) {
				let lines = file.split(this.lib['os'].EOL);
				let doType = 'seq';
				let lineArgs = [];
				lineArgs = lines[0].split(" ");
				if(lineArgs[0] === "type:") {
					doType = lineArgs[1];
				}
				switch(doType) {
					case 'seq': // sequential execution
						nw.WorkSprite.lib['customActions'].execList(-1, 0, lines.slice(1));
						break;
					case 'rnd': // random execution
						let newLines = [];
						for(let l = 1; l < lines.length; l++) {
							let rl = nw.WorkSprite.lib['customActions'].exec('randinrange', [1, lines.length]);
							if(newLines.includes(rl)) {
								l--;
							} else {
								newLines.push(rl);
							}
						}

						for(let n = 0; n < newLines.length; n++) {
							lineArgs = lines[newLines[n]].split(" ");
							nw.WorkSprite.lib['customActions'].exec('setResponse', nw.WorkSprite.lib['customActions'].exec(lineArgs[0], lineArgs.slice(1)));
						}
						break;
					case 'pick1': // randomly pick 1 from list and execute
						let rl = nw.WorkSprite.lib['customActions'].exec('randinrange', [1, lines.length]);
						lineArgs = lines[rl].split(" ");
						nw.WorkSprite.lib['customActions'].exec('setResponse', nw.WorkSprite.lib['customActions'].exec(lineArgs[0], lineArgs.slice(1)));
						break;
				}
			}
		}
	},
	{
		name: ["open"],
		argNames: ["string"],
		doc: "open shortcut|workspace|exe|url in default app",
		action: (args) => {
			let name = args[0]?.trim();
			try {
				nw.WorkSprite.lib['open'](name);
			} catch(err) {
				return `Cannot open ${name} as a shortcut, file, or workspace: ${err}`;
			}
		}
	},
	{
		name: ["cmd", "cmdaction"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/k'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["watchfolder", "folderwatch"],
		argNames: ["string", "function"],
		doc: "Watchfolder/folderwatch: <br>Watches a path, and executes callback upon changes in that path.<br>Args: <string> pathname, <function> callback",
		action: (args) => {
			if(args[0] && args[1] && typeof args[1] === "function") {
				const opts = {
					persistent: true,
					ignoreInitial: false,
					usePolling: true,
					interval: 100,
					binaryInterval: 300
				};

				const watcher = nw.WorkSprite.lib['chokidar'].watch(args[0], opts);

				watcher.on('all', path => { setTimeout(() => { args[1](path); }, 1500); });
			} else {
				return `One or both arguments for watching are incorrect.`;
			}
		}
	},
	{
		name: ['openTaskView'],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'explorer', 'shell:::{3080F90E-D7AD-11D9-BD98-0000947B0257}'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ['getMousePos'],
		argNames: ["function"],
		doc: "get the mouse position, and execute an optional callback with the result",
		action: (args) => {
			// PS command to get the open windows and return them in an array
			const ps = new nw.WorkSprite.lib['node-powershell'].PowerShell({
				executableOptions: {
					'-ExecutionPolicy': 'Bypass',
					'-NoProfile': true,
					'-NoExit': false
				}
			});
			const cmd = nw.WorkSprite.lib['node-powershell'].PowerShell.command`
			Add-Type -AssemblyName System.Windows.Forms
			$X = [System.Windows.Forms.Cursor]::Position.X
			$Y = [System.Windows.Forms.Cursor]::Position.Y
			Write-Output "$X,$Y"`;

			ps.invoke(cmd).then(output => {
				let result = output.raw.split(','[0]);
				if(args && typeof args[0] === 'function') {
					args[0](result);
				}
			}).catch(err => {
				console.log(`getMousePos Error: ${err}`);
			});
		}
	},
	{
		name: ['getOpenApps'],
		argNames: ["function"],
		doc: "get the open app names and ids, and execute an optional callback",
		action: (args) => {
			// PS command to get the open windows and return them in an array
			const ps = new nw.WorkSprite.lib['node-powershell'].PowerShell({
				executableOptions: {
					'-ExecutionPolicy': 'Bypass',
					'-NoProfile': true,
					'-NoExit': false
				}
			});
			const cmd = nw.WorkSprite.lib['node-powershell'].PowerShell.command`gps | ? {$_.mainwindowtitle.length -ne 0} | Format-List name, id`;
			ps.invoke(cmd).then(output => {
				let raw = output.raw.split(this.lib['os'].EOL);
				let result = [];
				let app = {};
				let a = [];
				for(let r = 0; r < raw.length; r++) {
					if(raw[r].trim() !== '') {
						a = raw[r].split(":"[0]);
						if(a[0].trim() === 'Name') {
							app.name = a[1].trim();
						} else if(a[0].trim() === "Id") {
							app.id = a[1].trim();
						}
						if(app.name && app.name.trim() !== '' && app.id && app.id.trim() !== '') {
							if(app.name.toLowerCase() !== nw.WorkSprite.config.name.toLowerCase() &&
							!nw.WorkSprite.config.guiOptions.components.cornerMenu.excludedBarAppTitles.includes(app.name)) {
								result.push(app);
								app = {};
							} else {
								app = {};
							}
						}
					}
				}

				if(args && typeof args[0] === 'function') {
					args[0](result);
				}
			}).catch(err => {
				console.error(`getOpenApps Error: ${err}`);
			});
		}
	},
	{
		name: ['getForegroundApp'],
		action: () => {
			// PS command to get the foreground app
			const ps = new nw.WorkSprite.lib['node-powershell'].PowerShell({
				executableOptions: {
					'-ExecutionPolicy': 'Bypass',
					'-NoProfile': true,
					'-NoExit': false
				}
			});
			const cmd = nw.WorkSprite.lib['node-powershell'].PowerShell.command`
				Add-Type @"
				using System;
				using System.Runtime.InteropServices;
				public class WinUtils {
				[DllImport("user32.dll")]
				public static extern IntPtr GetForegroundWindow();
				}
				"@
				
				$a = [WinUtils]::GetForegroundWindow()
				get-process | ? { $_.mainwindowhandle -eq $a }
			`;
			ps.invoke(cmd).then(output => {
				console.log("done", output.raw);
			}).catch(err => {
				console.error(`getForegroundApp Error: ${err}`);
			});
		}
	},
	{
		name: ['setAppToForeground'],
		action: (args) => {
			console.log("setAppToForeground",args[0]);
			// PS command to bring the given app name to the foreground, restore if minimized
			const ps = new nw.WorkSprite.lib['node-powershell'].PowerShell({
				executableOptions: {
					'-ExecutionPolicy': 'Bypass',
					'-NoProfile': true,
					'-NoExit': false
				}
			});
			const cmd = nw.WorkSprite.lib['node-powershell'].PowerShell.command`
				$sig = '[DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);'
				Add-Type -MemberDefinition $sig -name NativeMethods -namespace Win32
				$hwnd = @(Get-Process -Id ${args[0]}).MainWindowHandle
				# Minimize window
				[Win32.NativeMethods]::ShowWindowAsync($hwnd, 11)
				# Restore window
				[Win32.NativeMethods]::ShowWindowAsync($hwnd, 9)
			`;
			ps.invoke(cmd).then(output => {
				console.log("done",output.raw);
			}).catch(err => {
				console.error(`setAppToForeground Error: ${err}`);
			});
		}
	},
	{
		name: ['isTaskbarVisible'],
		action: (args) => {
			let result = false;
			const ps = new nw.WorkSprite.lib['node-powershell'].PowerShell({
				executableOptions: {
					'-ExecutionPolicy': 'Bypass',
					'-NoProfile': true,
					'-NoExit': false
				}
			});
			const cmd = nw.WorkSprite.lib['node-powershell'].PowerShell.command`
				$p='HKCU:SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3';
				$v=(Get-ItemProperty -Path $p).Settings;
				$result = $v[8];
				Write-Output "$result";
			`;
			ps.invoke(cmd).then(output => {
				let val = +(output.raw.trim());
				if(val === 2) {
					result = true;
				} else if(val === 3) {
					result = false;
				}
				if(args && typeof args[0] === 'function') {
					args[0](result);
				}
			}).catch(err => {
				console.error(`isTaskbarVisible Error: ${err}`);
			});
		}
	},
	{
		name: ["launchComputerManagement"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'compmgmt.msc'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchDiskManagement"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'diskmgmt.msc'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchNetConnections"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'control', 'ncpa.cpl'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchDeviceManager"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'devmgmt.msc'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchSystem"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'control', '/name', 'Microsoft.System'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchEventViewer"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'eventvwr'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchPowerOptions"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'control', 'powercfg.cpl'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchMobilityCenter"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'mblctr'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchAppsFeatures"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'appwiz.cpl'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchAdminCMD"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'powershell', '-Command', 'Start-Process', 'cmd', '-Verb', 'RunAs'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchSettings"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'start', 'ms-settings:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchControlPanel"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'control'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchTaskManager"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'taskmgr'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchRunDialog"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'explorer', 'Shell:::{2559a1f3-21d7-11d4-bdaf-00c04f60b9f0}'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchSearchDialog"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'explorer', 'search-ms:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["doWinSleep"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'shutdown', '/h'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["doWinSignOut"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'shutdown', '/l'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["doWinRestart"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'shutdown', '/r'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["doWinShutdown"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'shutdown', '/s'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["doWinLock"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'rundll32.exe', 'user32.dll,LockWorkStation'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchActionCenter"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'wscui.cpl'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchTouchpad"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-virtualtouchpad:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchKeyboard"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'osk'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchInkSketch"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-screensketch:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchScreenclip"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-screenclip:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchWifiMenu"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-availablenetworks:'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchWinSecurity"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-settings:windowsdefender'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchWinBluetooth"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-settings:bluetooth'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchVolMixer"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'sndvol'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	},
	{
		name: ["launchUSBMenu"],
		action: () => {
			nw.WorkSprite.lib['child_process'].spawn(process.env.comspec, ['/c', 'launchwinapp.exe', 'ms-settings:usb'], { cwd: '%SystemRoot%\\system32\\', shell: true, windowsHide: false, detached: true });
		}
	}
];

