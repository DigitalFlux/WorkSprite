module.exports = {
    props: [

    ],
    created() {
      this.Initialize();
    },
    data() {
      return { 
        toggleShortcut: null,
        leaveHideTimer: null,
        shortLeaveTimerMS: 500,
        longLeaveTimerMS: 1000,
        omniBoxOpen: false,
        curX: 446,
        curY: 710,
        iconClicked: false,
        isPinned: false,
        menuVisible: true,
        drawComponent: true,
        currentMenuButtons: {}
      }
    },
    styles: [
      `.imMenuBase {
        position: absolute;
        width: 500px;
        height: 500px;
        top: 446px; 
        left: 710px;
        display: block;
      }`,
      `.imCenterHoverBase {
        position: absolute;
        top: -89px;
        left: -25px;        
        width: 401px;
        height: 401px;
        border-radius: 50% 50% 5% 5% ;
        background-color: hsla(272, 16%, 18%, 0.05);
      }`
    ],
    methods: {
      Initialize() {
        this.RegisterShortcut();
        this.layout = nw.WorkSprite.config.guiOptions.components['im-menu'].layout;

        if(this.layout.detectMenuButtonShortcuts) {
          this.SetShortcutWatch();
          this.GetMenuButtonsByDetect();
        } else {
          this.GetMenuButtonsFromConfig();
        }
      },
      RegisterShortcut() {
        if(nw.WorkSprite.config.guiOptions.shortcut) {
            let that = this;
            this.toggleShortcut = new nw.Shortcut({ 
                key: nw.WorkSprite.config.guiOptions.shortcut,
                active: function() {
                    that.ToggleMenu();
                },
                failed: function(err) {
                    console.log(`Failed to register reload shortcut ${err}`);
                }
            });
            nw.App.registerGlobalHotKey(this.toggleShortcut);
        }
      },
      SetShortcutWatch() {
        nw.WorkSprite.lib['customActions'].exec('watchfolder', [nw.WorkSprite.config.guiOptions.components['im-menu'].iconPath, (path) => {
          var cmp = this;
          cmp.drawComponent = false;
          this.GetMenuButtonsByDetect();
          Vue.nextTick(() => {
            cmp.drawComponent = true; ;
          });
        }]);
      },
      GetMenuButtonsByDetect() {
        let dirobjs = nw.WorkSprite.lib['fs'].readdirSync(nw.WorkSprite.config.guiOptions.components['im-menu'].iconPath, { withFileTypes: true });
        let temp = {};
        let btnIdx = 0;
        let args, name, ext;
        this.currentMenuButtons = {};

        // We're looping through and trying to find both a png and a lnk for each shortcut, named the same.
        // If we only find a shortcut, the default WorkSprite icon is used.
        // For those shortcuts found, we will assign them button properties from the config file on first-come-first-served.
        // If you want to specify which button goes where, set the detectMenuButtonShortcuts flag to false in the config and
        // set up the buttons manually in order to guarantee your layout.
        for (let f = 0; f < dirobjs.length; f++) {
          if(dirobjs[f].isFile()) {
            args = dirobjs[f].name.split('.');
            name = args[0].toLowerCase();
            ext = args.at(-1);

            if(!temp[name]) {
              temp[name] = {
                title: name,
                icon: '',
                shortcut: ''
              }
            }
            if(ext === "lnk") {
              temp[name].shortcut = name;
            } else if(ext === "png") {
              temp[name].icon = name;
            }
          }
        }

        let tempCount = 0;
        for(let t in temp) {
          if(temp[t].shortcut !== '' && tempCount < this.layout.menuButtons.length) {
            this.currentMenuButtons[t] = temp[t];
            this.currentMenuButtons[t].id = this.layout.menuButtons[btnIdx].id;
            this.currentMenuButtons[t].buttonPos = this.layout.menuButtons[btnIdx].buttonPos;
            this.currentMenuButtons[t].buttonTitle = this.layout.menuButtons[btnIdx].title || t;
            if(temp[t].icon === '') {
              this.currentMenuButtons[t].icon = nw.WorkSprite.config.guiOptions.components['im-menu'].defaultIcon;
            }
            btnIdx++;
            tempCount++;
          }
        }
      },
      GetMenuButtonsFromConfig() {
          // For manual layouts coming from the config.
          // If you want to have the app load the shortcuts automagically, then set detectMenuButtonShortcuts to true
          // and then kick back and let it assign shortcuts to buttons.
          for(let b in this.layout.menuButtons) {
            if(this.layout.menuButtons[b].shortcut) {
              this.currentMenuButtons.push(this.layout.menuButtons[b]);
            }
          }
      },
      ShowMenu() {
        nw.WorkSprite.lib['customActions'].exec('getMousePos', [(result) => {
            this.curX = result[0] - 223;
            this.curY = result[1] - 120;
            this.iconClicked = false;
            this.menuVisible = true;
        }]);
      },
      HideMenu() {
        this.menuVisible = false;
      },
      ToggleMenu() {
        if(this.menuVisible) {
            this.HideMenu();
        } else {
            this.ShowMenu();
        }
      },
      Pin() {
        this.isPinned = true;
        this.imPinButton.style.backgroundImage = `url('./images/icons/unpin.png')`;
      },
      UnPin() {
          this.isPinned = false;
          this.imPinButton.style.backgroundImage = `url('./images/icons/pin.png')`;
      },
      DoPinToggle() {
          if(this.isPinned === true) {
              this.isPinned = false;
              this.imPinButton.style.backgroundImage = `url('./images/icons/pin.png')`;
          } else {
              this.isPinned = true;
              this.imPinButton.style.backgroundImage = `url('./images/icons/unpin.png')`;
          }
      },
      TogglePin(e) {
          e.preventDefault();
          e.stopPropagation();
          this.DoPinToggle();
      },
      LeaveBase() {
        if(this.isPinned === true) {
          return;
        }
        let timer = this.shortLeaveTimerMS;
        if(this.iconClicked === true) {
            timer = this.longLeaveTimerMS;
        }
        this.leaveHideTimer = setTimeout(() => {
            this.HideMenu();
        }, timer);
      },
      EnterBase() {
        clearTimeout(this.leaveHideTimer);
        this.leaveHideTimer = null;
      },
      GetButtonIconURL(button) {
        let url = "";
        if(button.icon && button.icon !== undefined) {
          url = `./gui/shortcuts/${button.icon}.png`;
        }
        return url;
      },
      ClickHandler: (shortcut) => {
        let path = nw.WorkSprite.lib['path'].join(nw.WorkSprite.config.guiOptions.components['im-menu'].iconPath, shortcut);
        this.iconClicked = true;
        nw.WorkSprite.lib['open'](path);
      }
    },
    template: `
    <div v-if="drawComponent" id='immediateMenu' class='imMenuBase' v-show='menuVisible' :onload='Initialize' >
      <div id='imCenterBase' class='imCenterHoverBase' :onmouseleave="LeaveBase" :onmouseenter="EnterBase">
        <im-center-button :button-id="layout.centerButton.id" :button-pos="layout.centerButton.buttonPos" :icon-image="GetButtonIconURL(layout.centerButton)" button-title="WorkSprite" @click="ToggleMenu" ></im-center-button>
        <template v-for="b in currentMenuButtons">
          <im-button :button-id="b.id" :button-title="b.title" :button-pos="b.buttonPos" :icon-image="GetButtonIconURL(b)" :button-link="b.shortcut" @click='ClickHandler(b.shortcut)'></im-button>
        </template>
      </div>
    </div>
    `
  }
  