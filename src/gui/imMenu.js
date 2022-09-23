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
        menuButtons: null
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
        console.log("init");
        this.RegisterShortcut();
        this.layout = nw.WorkSprite.config.guiOptions.components['im-menu'].layout;
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
      ShowMenu() {
        console.log("ShowMenu");
        nw.WorkSprite.lib['customActions'].exec('getMousePos', [(result) => {
            this.curX = result[0] - 223;
            this.curY = result[1] - 120;
            console.log("SHOW");
            this.iconClicked = false;
            this.menuVisible = true;
          //  this.imCenterMenu.focus();
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
      }
    },
    template: `
    <div id='immediateMenu' class='imMenuBase' v-show='menuVisible' :onload='Initialize' >
      <div id='imCenterBase' class='imCenterHoverBase' :onmouseleave="LeaveBase" :onmouseenter="EnterBase">
        <im-button :button-pos="layout.centerButton.buttonPos" button-title="LALALA" ></im-button>
        <template v-for="b in layout.menuButtons">
          <im-button :button-id="b.id" :button-title="b.id" :button-pos="b.buttonPos"></im-button>
        </template>
      </div>
    </div>
    `
  }
  