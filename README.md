<h1 align="center"><b>WorkSprite</b></h1>

![GitHub issues](https://img.shields.io/github/issues/DigitalFlux/WorkSprite) ![GitHub](https://img.shields.io/github/license/DigitalFlux/WorkSprite)

<br/>
## What's it for?
---
WorkSprite is an NWJS-based app that groups commonly-used links and functionality into a small, extensible, quick-access menu system.

The need for WorkSprite grew from my own development efforts, as I don't like to navigate the vanilla Windows menu system. And though other systems like Rainmeter are very cool, I wanted a GUI that was able to do more than look pretty and show the metrics of my computer.

This project aims at generalizing that tool.
<br/><br/>
## So, what features does WorkSprite offer?
---
- A shortcut-driven quick-access menu that appears where your mouse cursor is. In that menu, you have a number of buttons to launch your most frequently-used apps. Using VueJS and the config files, you can also completely customize the GUI to do whatever you like.
- In addition to the menu buttons, there is a Command Palette that exposes an extensible library of command "shards" written in JS. You can add your own functions to this library as well, extending what WorkSprite can do for you.
- A scripting system that allows you to compile simple lists of functions you use in the Command Palette, and execute them via a "do" command. Do scripts are, like shards, written and dropped into their folders and called upon when needed.

The system is being built to be as flexible and easily extensible as possible for developers to take advantage of.
<br/><br/>
### For developing and extending it even further
---
Get the repo, then `npm install` it. Running `npm start` will start it up, and then hit the default shortcut of "Alt+`" (Alt + backtick) to toggle the menu. It runs on NWJS production, so you might want to fiddle if you want the sdk flavor.

NOTE: With the SDK flavor of NWJS, there's a bug where if you open the dev tools and the disconnect from them, the transparent portion of the screen will go white, and you'll be unable to click-through. For an app like this, that would suck, as you'd find your screen covered. This is why builds are non-SDK only. When I'm fiddling with parts that may cause this (like examining the GUI in dev tools), I usually shorten the height to ensure the taskbar is accessible or set the `always_on_top` in the package.json file to `false` so I can alt-tab to Task Manager, if the reload/quit shortcuts no longer work. I've tried to avoid SDK flavor so that this wasn't an issue, but it's been around in NWJS so long I have to put the warning up.
<br/><br/>
### How the Config file works
---
The config file is broken down into several sections that are easy editable, and it's even easier to add your own sections as well.

`"name"` (Default: `"WorkSprite"`): Reserved for now.

`"coreOptions"`: An Object with the following option.

- `"reloadShortcut"` (Default: `"Ctrl+Alt+R"`): Keyboard shortcut for reloading WorkSprite.

- `"quitShortcut"` (Default: `"Ctrl+Alt+Q"`): Keyboard shortcut for quitting WorkSprite.

`"shardOptions"`: An Object defining options for the code "shard" system used by the Command Palette.

- `"shardPath"` (Default: `"src/shards"`): Relative path where the .js shard files will be located. They will only be loaded from here.

- `"searchEngineCodes"`: An object containing many names and name variants of search engines to use with the `"?"` function. The list is not exhaustive, so add/remove your own as `"<name>": "<Query URL stub>"`.

- `"do"`: A configuration object for the "do" command system. 
    - `"doPath"` (Default: `"src/do"`): Path to the .do/.txt scripts. When you `"do <x>"`, it will look there.

    - `"noopList"`: A list of markers to identify script lines that are comments or other markers that are non-standard.

`"guiOptions"`: The guts of the GUI system.

- `"mainGUIXOffset"` (Default: 0): Basically the X location of the transparent WorkSprite window.

- `"mainGUIYOffset"` (Default: 0): Basically the Y location of the transparent WorkSprite window.

- `"mainGUIWidth"` (Default: ): The width of the transparent WorkSprite window.

- `"mainGUIHeight"` (Default: ): The height of the transparent WorkSprite window.

- `"sizeToMonitors"` (Default: true): When `"true"`, it will disregard the above offsets and width/height settings and detect all attached monitors and build one big rect for the accompanying ImmediateMenu to be displayed in. This will allow you to get WorkSprite on all monitors. When set to `"false"`, you specify the offset and width/height you want the transparent window to be, and WorkSprite's menus will show within that.

- `"shortcut"` (Default: "Alt+`"): The shortcut used to toggle the WorkSprite's ImmediateMenu on and off. (Note: NWJS supposedly allows you to use the Windows key, but in practice, I have never gotten it to work, likely because the OS itself grabs the shortcut back. If that ever changes, I'll redo the default shortcut in a heartbeat!).

- `"components"`: Possibly the currently most janky section of the config file. Here, you can list every component you want registered to VueJS to use in building out the components displayed. There's almost definitely better ways to do this, but part of this iteration of WorkSprite is that I'm learning VueJS, so bear with me.

In any event, here's the component format that is required, and as components are customizable, you can add whatever else you need in this config, and then use that information as you see fit:

`"<name-in-kebab-case>": { "addOnLoad": false, "src": "./path/to/file" }`

The `"addOnLoad"`, when set to `true`, will add the component directly to the window, whereas set to `false`, it will simply be defined as a custom element, ready to be referenced by other components without them having to do the imports.

The `"src"` field is the relative path to the .js file of the Single File Component, which will then be required, be passed to Vue.defineCustomElement(), and if added immediately, have its Style field applied (this, too, can be done better).

`"im-menu"`: The only component loaded into the GUI on load, the ImmediateMenu contains the menu buttons and Command Palette and as such, it carries some extra options.

- `"addOnLoad"` (Default: true): Set to true to load the component, which references other components, such `im-button` and `im-cmd-palette`, which are child components of `im-menu`.

- `"src"` (Default: "./gui/immenu"): The immenu.js SFC for the ImmediateMenu.
  
- `"iconPath"` (Default: "./src/gui/shortcuts"): The folder we're getting both .lnk files and .png files with the same name that serve as their icons.

- `"defaultIcon"` (Default: "worksprite"): The name of the default .png icon to use if no matching icon can be found for a shortcut. For an icon to be used, it must match the name of the shortcut file.

- `"layout"`: This object contains the layout of the menu buttons. 

    - `"detectMenuButtonShortcuts"` (Default: true): With this set to `true`, WorkSprite will look at in `iconPath` and, for each shortcut present, will create a menu button, until the given menu buttons are used. Extra shortcuts will be ignored. When set to `false`, you can choose with shortcut is used with which menu button.

    - `"menuButtons"`: An array of menu button configuration objects. For manually specifying the buttons (when `"detectMenuButtonShortcuts"` is set to `false`), use the following:

        `{ "id": "<unique id>", "buttonPos": "left: <X>px; top: <Y>px;", "shortcut": "<name for shortcut/png icon without extension>" }`

        If you set `"detectMenuButtonsShortcuts"` to `true`, then WorkSprite will ignore the `shortcut` field when it discovers and loads shortcuts automatically.
<br/><br/>
### How the GUI system works
---
I'm using VueJS to build out the GUI for this version. It is used to create Custom Elements using the Single File Component API in .js files which are then required in and converted to Custom Elements as they're read in from the config file.

The SFC's will usually have their logic encapsulated in their methods, but using the `nw.WorkSprite` object, you can access all of WorkSprite's functionality, such as the Custom Actions system (`nw.WorkSprite.lib['customActions'].exec(cmdName, cmdArgs)`) which underlies the Command Palette. You can also access NWJS functionality via the `nw` object and NodeJS functionality.

Within the config file, there's a `guiOptions.components` object which contains a list of SFC's to load. Here, you can register all of your SFC's, whether they are top-level or not. For those components that are loaded and displayed immediately, set that component's `addOnLoad` to `true`. For child components that are used only by other components, set it to `false` and load them first (you can load components in your SFC's still, of course).
<br/><br/>
### How the shard system works
---
In WorkSprite, when you call up the ImmediateMenu, you also get access to a Command Palette which allows you to execute commands, and which will display those results to you in a history window beneath it.

This system is very extensible using what I call a "shard" system. Basically, you use the format below to create a .js file that contains an array of functions (a shard), that is then loaded and appended to the already present list. Once loaded, you may execute the functions there, allowing you to do most anything you can do within NodeJS. The resulting data will be displayed in the history window, and the copy button next to those results will copy it to the clipboard for you to paste, if need be.

`exports.bundledActions = [
    {
		name: ["example"],
		doc: "example:<br>This is where you put docs that show if you type example /?",
		action: (args) => {
			console.log('This example would print args ${rgs[0]}, ${args[1]}, and ${args[2]}');
		}
	}
];
`

Each shard must export an array of one or more functions to `bundledActions`, like above, in order for them to be imported correctly. Once a shard is dropped into the `shardPath`, then the system will detect it and load it automatically.

Of the above, only `name` and `action` are required. 

- `name` is an array that allows for one or more function names to be applied to a single function (ie ['rgbtohex', 'rgb2hex'] would be passed in `name` and both would call the same function). 
  
- `action` is an arrow function that may or may not have args passed into it. Args are parsed and passed as an array, so be aware of that.

- `doc` is documentation shown in results in html format. Keep it pithy unless you want to troubleshoot broken history window formatting.

### NOTE: It should go without saying that this system can be very dangerous, so if you're getting shards from somewhere or someone else, look it over before you execute something that deletes your life's work. I'm not responsible for any damage to your computer, physical being, relationships, financial status, reputation, soul, or anything else that such scripts provided by anyone (including me) do. It's executing JS locally in NodeJS, so it can do anything. Be mindful...
<br/><br/>
### How the do system works
---
A .do file (or just a .txt file placed in the `doPath`) is a script with a single Command Palette command per line. There's some simple scripting you can do within that, such as:

- `"type: <seq|rnd|pick1>"` When the first line in a script, you can use the supplied types to:

    - `"type: seq"`: Run through the script sequentially. This is the default script behavior.

    - `"type: rnd"`: Start the script at a random point.

    - `"type: pick1"`: Randomly pick one from the list of commands and execute that choice.

The commands should be written as they would be in the Command Palette.

To execute a "do script", in the Command Palette, type `"do <name of do-script>"`.
<br/><br/>
### Future Work
---
Some of the things that I'd like to do with this project over time to make it even more useful I've noted, but it's not an exhaustve list:

- Persistent history for the Command Palette: Right now, it's just per-session, but I have a version of the Command Palette working with named variables which are stored, so instead of executing the command again, or scrolling, you can give it a meaningful name and then reference that, and it will give you the data. That object will also have context such as timestamps and the command and args input to get that data.
  
- Searching the Command Palette: Depends on getting the above functionality implemented, but once actions taken have timestamps and context, you can sort and search them. You can even extend the context objects with versioning and step back through histories of named objects or command results. Handy for when your doing things for a project and need to go back and reference a command you ran an hour ago.

- Chaining commands in the Command Palette: Technically, this works now, but it needs more testing and maybe some revisions to other Command Palette features to be very useful.

- More shards: I've stripped out some shards I've had for personal use, but I realize that the samples here may not be the best. For usefulness, I'd like to do more. Maybe shards that interact with certain APIs and display the results asynchronously (like that stable diffusion API- sounds like fun). But also more useful stuff like generating passwords on the fly, or UUIDs, or things like that, where you don't want to have to open yet another tab in the browser.

- Paste: I'd like to make a direct Paste button, so that instead of clicking copy and then having to Alt+V, you could click the button and the result would get pasted into the last active window. That would take a bit of Powershell knowledge to do, I'm sure. Maybe tracking the last active window when you hit the shortcut to show the ImmediateMenu. But it would streamline things for sure.

- Menu Buttons that execute Command Palette commands: Not that hard to do, honestly, but I just need to make a new component for that button, and maybe extend the config layout to specify button type.

- Dynamic GUIs for functions: Another feature that had worked (somewhat) elsewhere, but when you type a function in the Command Palette and hit `spacebar`, it would pop-up a small GUI with input boxes for the arguments passed, with optional validation. This requires a field called `argNames` in the exported action objects inside `bundledActions`. It needed a bit more love, so the feature got cut for now.

That's all for off the top of my head for now. I'll get these ticketed soonish...

### Enjoy!
