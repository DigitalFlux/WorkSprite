function tryRequire(module) {
    const modResult = require(module) || false;
    return modResult;
}

class WorkSprite {
    constructor() {
        nw.WorkSprite = this;
        this.firstLoad = true;

        // Banner
        this.workSpriteVersion = '0.1.0';
        this.ReportVersions();

        // Prep module storage
        this.basePath = nw.App.startPath;
        this.configPath = "./src/config.json";
        this.quitShortcut;
        this.reloadShortcut;
        this.lib = {};
        this.guiComponents = {};
        this.config = {};

        // Load
        this.LoadCoreLibs();
        this.LoadConfig();
        this.InitShards();

        // Main window and flags
        this.work_area = {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        };
        nw.Screen.Init();
        this.UpdateTotalWorkArea();
        this.mainWin = nw.Window.get();
        this.PrepMainWindowCBs();

        // Set global shortcuts
        this.SetShortcuts();

        console.log(`%cWork%cSprite %cloaded. Enjoy!`, `color: #2672A2`, `color: #E86D00`, `color: #3B464C`);
    }

    ReportVersions() {
        console.log(`%cWork%cSpite %cv${this.workSpriteVersion}`, `color: #2672A2;`, `color: #E86D00;`, `color: #3B464C;`);
        console.log(`%cNWJS v${process.versions['node-webkit']}`, `color: #527FB4;`);
        console.log(`%cNode v${process.versions['node']}`, `color: #789C6A;`);
        console.log(' ');
    }

    // Doing this to get some semblance of singleton behavior out of requires,
    // since they will get called from various folders, and in places that have been
    // required as well, but with access to this class.
    LoadLibs(libs) {
        for(let l in libs) {
            this.LoadLib(libs[l].name, libs[l].member);
        }
    }

    LoadLib(libName, member = '') {
        let name = libName.split('/').at(-1);
        if(!this.lib[name]) {
            if(member === '') {
                this.lib[name] = tryRequire(libName);
            } else { 
                this.lib[name] = tryRequire(libName)[member];
            }
        }
    }

    LoadConfig() {
        // config file
        this.config = JSON.parse(this.lib['fs'].readFileSync(this.configPath));
    }

    SaveConfig(reloadGUI = false) {
        this.lib['fs'].writeFileSync(this.configPath, JSON.stringify(this.config, null, "\t"));
        if(reloadGUI === true) {
            this.ReloadGUI();
        }
    }   

    LoadCoreLibs() {
        this.LoadLib('fs'); 
        this.LoadLib('path');
        this.LoadLib('child_process');
        this.LoadLib('os');
        this.LoadLib('chokidar');
        this.LoadLib('open');
        this.LoadLib('windows-shortcuts');
        this.LoadLib('node-powershell');
        this.LoadLib('./libs/customActions', 'customActions');
    }

    // Custom action code shards
    InitShards() {
        this.LoadShards();

        nw.WorkSprite.lib['customActions'].exec('watchfolder', [this.config.shardOptions.shardPath, ['add'], (path, event) => {
            if(path.split('.')[1] === 'js') {
                this.LoadShard(path.split('\\').at(-1));
            } else {
                console.warn("Unable to load file:", path);
            }
        }]);
    }

    LoadShard(name) {
        console.log(`%cLoading shard: ${name}`, `color: #4936D8`);
        let success = this.lib['customActions'].addBundle(require(this.lib['path'].join(this.basePath, this.config.shardOptions.shardPath, name)).bundledActions);
        if(!success) {
			const ndg = new Notification('Shard Error', { 
				body: `Unable to load shard: ${name}.`,
				silent: true,
				requireInteraction: false
			});
			setTimeout(() => { ndg.close(); }, 5000);
        }
    }

    LoadShards() {
        console.log(`%cLoading function shards...`, `color: #4936D8`);
        // Get list of file names
        let dirobjs = this.lib['fs'].readdirSync(this.config.shardOptions.shardPath, { withFileTypes: true });
        // Iterate through and require each shard, then pump the bundle into the customActions object
        for (let f = 0; f < dirobjs.length; f++) {
            if (dirobjs[f].isFile() && dirobjs[f].name.endsWith(".js")) {
                this.LoadShard(dirobjs[f].name);
            }
        }
        console.log(' ');
    }

    LoadGUIs(win) {
        console.log(`%cLoading GUI...`, `color: #2CB22E`);
        this.InitVUE();

        const guiComponents = Object.keys(this.config.guiOptions.components);
        for(let g = 0; g < guiComponents.length; g++) {
            this.LoadGUIComponent(guiComponents[g], win);
        }
        console.log(' ');
    }

    InitVUE() {
        nw.WorkSprite.vueApp = Vue.createApp({}).mount('#mainBody');
    }

    LoadGUIComponent(componentName, win) {
        let componentObject = require(this.config.guiOptions.components[componentName].src);
        this.guiComponents[componentName] = Vue.defineCustomElement(componentObject);
        if(this.guiComponents[componentName]) {
            customElements.define(componentName, this.guiComponents[componentName]);

            if(win && this.config.guiOptions.components[componentName].addOnLoad === true) {
                let el = new this.guiComponents[componentName]();
                el.style.cssText = componentObject.styles[0];
                win.window.document.getElementById('mainBody').appendChild(el);
            }
        } else {
            console.log(`Failed to load ${componentName}`);
        }
    }

    ReloadGUI() {
        nw.WorkSprite.mainWin.window.document.body.innerHTML = '';
        this.LoadGUIs();
    }

    // This sets up/updates a rect for the total work area encompassing one or more monitors.
    // You may need to check mouse pos against each screen's rect to be sure you can open the menu without going offscreen in some setups,
    // if that's what you want...
    UpdateTotalWorkArea() {
        this.work_area = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            xOffset: 0,
            yOffset: 0
        };

        let screens = nw.Screen.screens;
        screens.sort(function(a, b) {
            if(a.bounds.x < b.bounds.x) return -1;
            if(a.bounds.x > b.bounds.x) return 1;
            return 0;
        });

        let minX = 0, minY = 0, maxX = 0, maxY = 0;
        for(let s = 0; s < screens.length; s++) {
            if(screens[s].work_area.x <= minX) {
                minX = screens[s].work_area.x;
            }
            if(screens[s].work_area.y <= minY) {
                minY = screens[s].work_area.y;
            }
            if(screens[s].work_area.x + screens[s].work_area.width >= maxX) {
                maxX = screens[s].work_area.x + screens[s].work_area.width;
            }
            console.log("width", screens[s]);
            if((screens[s].work_area.y + screens[s].work_area.height) >= maxY) {
                maxY = screens[s].work_area.y + screens[s].work_area.height;
            }
        }
        
        this.work_area.xOffset = Math.abs(minX);
        this.work_area.yOffset = Math.abs(minY);
        this.work_area.x = minX;
        this.work_area.y = minY;
        this.work_area.width = Math.abs(minX) + maxX;
        this.work_area.height = Math.abs(minY) + maxY;
    }

    PrepMainWindowCBs() {
        let that = this;

        this.SetMainWindowBounds();
        this.mainWin.on('loaded', () => {
            that.LoadGUIs(nw.WorkSprite.mainWin);
            that.firstLoad = false;
        });
    }

    SetMainWindowBounds() {
        if(this.config.guiOptions?.sizeToMonitors) {
            console.log(nw.WorkSprite.work_area);
            this.mainWin.moveTo(nw.WorkSprite.work_area.x, nw.WorkSprite.work_area.y);
            this.mainWin.resizeTo(nw.WorkSprite.work_area.width, nw.WorkSprite.work_area.height);
        } else {
            this.mainWin.moveTo(this.config.guiOptions?.mainGUIXOffset ?? 0, this.config.guiOptions?.mainGUIYOffset ?? 0);
            this.mainWin.resizeTo(this.config.guiOptions?.mainGUIWidth ?? 1920, this.config.guiOptions?.mainGUIHeight ?? 1000);
        }
    }

    SetShortcuts() {
        let that = this;
        this.reloadShortcut = new nw.Shortcut({
            key: that.config.coreOptions.reloadShortcut,
            active: function() {
                that.ReloadAllWindows();
            },
            failed: function(err) {
                console.log(`Failed to register reload shortcut ${err}`);
            }
        });

        this.quitShortcut = new nw.Shortcut({
            key: that.config.coreOptions.quitShortcut,
            active: function() {
                that.Quit();
            },
            failed: function(err) {
                console.log(`Failed to register quit shortcut ${err}`);
            }
        });

        nw.App.registerGlobalHotKey(this.reloadShortcut);
        nw.App.registerGlobalHotKey(this.quitShortcut);
    }

    ReloadAllWindows() {
        if(this.mainWin) {
            console.log("Reloading!");
            chrome.runtime.reload();
        }
    }

    Quit() {
        console.log("Quitting");
        nw.App.closeAllWindows();
        nw.App.quit();    
    }
}

nw.WorkSprite = new WorkSprite();