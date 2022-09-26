function tryRequire(module) {
    const modResult = require(module) || false;
    return modResult;
}

class WorkSprite {
    constructor() {
        nw.WorkSprite = this;

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
        this.LoadShards();

        // Main window and flags
        this.mainWin = nw.Window.get();
        this.PrepMainWindowCBs();
        this.firstLoad = true;

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
        for(let l = 0; l < libs.length; l++) {
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
    LoadShard(dirObj) {
        if (dirObj.isFile() && dirObj.name.endsWith(".js")) {
            console.log(`%cLoading shard: ${dirObj.name}`, `color: #4936D8`);
            this.lib['customActions'].addBundle(require(this.lib['path'].join(this.basePath, this.config.shardOptions.shardPath, dirObj.name)).bundledActions);
        }
    }

    LoadShards() {
        console.log(`%cLoading function shards...`, `color: #4936D8`);
        // Get list of file names
        let dirobjs = this.lib['fs'].readdirSync(this.config.shardOptions.shardPath, { withFileTypes: true });
        // Iterate through and require each shard, then pump the bundle into the customActions object
        for (let f = 0; f < dirobjs.length; f++) {
            this.LoadShard(dirobjs[f]);
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
        nw.WorkSprite.vueApp = Vue.createApp({});
        nw.WorkSprite.vueApp.mount('#mainBody');
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

    PrepMainWindowCBs() {
        let that = this;

        this.mainWin.on('loaded', () => {
            that.SetMainWindowPosSize();
        
            // Generate GUI components from config
            that.LoadGUIs(nw.WorkSprite.mainWin);
        
            that.firstLoad = false;
        });

        this.mainWin.on('move', (x, y) => { 
            that.mainWin.moveTo(that.config?.guiOptions?.guiXOffset ?? 0, that.config?.guiOptions?.guiYOffset ?? 0);
        });

        this.mainWin.on('resize', (w, h) => {
            that.firstLoad && that.gui.GenerateGUI();
        });
    }

    SetMainWindowPosSize() {
        this.mainWin.moveTo(this.config.guiOptions?.mainGUIXOffset ?? 0, this.config.guiOptions?.mainGUIYOffset ?? 0);
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