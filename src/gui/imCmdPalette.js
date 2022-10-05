module.exports = {
    props: [

    ],
    created() {

    },
    data() {
        return { 
            acIndex: 0,
            acShortList: [],
            showACList: false,
            cpHistory: [],
            convoHistory: [],
            historyIndex: 0,
    
            shortListFuncs: {
                "ArrowDown": this.IncrementShortlistAC,
                "ArrowUp": this.DecrementShortlistAC,
                "ArrowRight": this.CompleteInput,
                "Tab": this.CompleteInput,
                "Backspace": this.CheckForInputSpawn,
                "Enter": this.ProcessInput
            },
            historicalFuncs: {
                "ArrowDown": this.IncrementHistoricalAC,
                "ArrowUp": this.DecrementHistoricalAC,
                "ArrowRight": this.CompleteHistoricalAC,
                "Tab": this.CompleteHistoricalAC
            }
        }
    },
    methods: {
        Submit: function () {
            let fragment = this.$refs.cmdPaletteInput.value.trim();
            this.ProcessInput(fragment);
        },
        ProcessInput(query) {
            this.HideACFuncList();
            let response = "";
            if (query) {
                let args = query.toString().match((/(?:[^"']+|"[^']*")+/g));
                if (args.length === 1) {
                    args = args[0].split(",");
                }
                if(args[1] && args[1] !== "/?" || args[1] === undefined) {
                    response = this.ProcessQuery(args[0].trim(), args.slice(1));
                    this.CreateHistoryEntry(query, response);
                } else {
                    this.ShowDoc(args[0].trim());
                }
            }
            this.$refs.cmdPaletteInputAC.value = "";
            this.$refs.cmdPaletteInput.value = "";
        },
        ProcessQuery(cmd, args) {
            let response = "...";
            if (nw.WorkSprite.lib['customActions'].hasAction(cmd)) {
                let idx = args.indexOf("=>");
                let curArgs = args || [];
                if(idx >= 0) {
                    curArgs = args.slice(0, idx);
                }
    
                response = nw.WorkSprite.lib['customActions'].exec(cmd, curArgs);
    
                if(idx > -1 && args.length > idx + 1) {
                    let cargo = [...response.split(" "), ...args.slice(idx + 2)];
                    response = this.ProcessQuery(args[idx + 1], cargo);
                }
    
                if(!response || (response && response.toString().trim() === "")) {
                    response = "...";
                }
            } else {
                response = `Command ${cmd} not found...`;
            }
            return response;
        },        
        AutoComplete: function (event) {
            let untrimmedFragment = this.$refs.cmdPaletteInput.value.split(" ");
            let fragment = untrimmedFragment[0].trim();
    
            if(fragment === "") {
                this.$refs.cmdPaletteInputAC.value = "";
                this.$refs.cmdPaletteInput.value = "";
    
                this.historicalFuncs[event.key] && this.historicalFuncs[event.key]();
            } else {
                if(this.shortListFuncs[event.key]) {
                    if(untrimmedFragment.length > 1)
                        this.shortListFuncs[event.key](untrimmedFragment);
                    else
                        this.shortListFuncs[event.key](fragment);
                } else {
                    this.UpdateShortListAC(fragment);
                }
            }
        },
        CheckForInputSpawn(input) {
            let args = nw.WorkSprite.lib['customActions'].getActionArgNames(input[0]);

            if(args[0] === "") {
                this.$refs.cmdPaletteInputAC.value = input[0];
                this.UpdateShortListAC(input[0]);
            } else {
                let numArgsEntered = input.length-1;
                let newArgs = args;
                if(numArgsEntered > 1){
                    newArgs = args.slice(numArgsEntered);
                }
    
                this.$refs.cmdPaletteInputAC.value = input + " " + newArgs.join(" ");
            }
        },
        WipeAC() {
            this.$refs.cmdPaletteInputAC.value = "";
        },
        UpdateShortListAC(fragment) {
            this.acShortList = this.GetActionList(fragment);
            this.acIndex = 0;
            this.$refs.cmdPaletteInputAC.value = this.acShortList[this.acIndex];
            if(this.acShortList.length > 1) {
                this.ShowACFuncList();
                //nw.bbMain.guiComponents.immediateMenu.Pin();
            }
        },
        GetActionList(fragment) {
            let results = [];
    
            for(let i = 0; i < nw.WorkSprite.lib['customActions'].actionList.length; i++) {
                if(nw.WorkSprite.lib['customActions'].actionList[i].name.indexOf(fragment) === 0) {
                    results.push(nw.WorkSprite.lib['customActions'].actionList[i].name);
                }
            }
    
            return results;
        },    
        ShowACFuncList() {
            this.showACList = true;
        },
        HideACFuncList() {
            this.showACList = false;
            this.$refs.cmdPaletteInput.focus();
        },
        DecrementShortlistAC() {
            if(this.acShortList) { 
                this.acIndex--;
                if(this.acIndex <= 0) {
                    this.acIndex = 0;
                }
                this.$refs.cmdPaletteInputAC.value = this.acShortList[this.acIndex];
            }
        },
        IncrementShortlistAC() {
            if(this.acShortList) {
                this.acIndex++;
                if(this.acIndex >= this.acShortList.length-1) {
                    this.acIndex = this.acShortList.length-1;
                }
                this.$refs.cmdPaletteInputAC.value = this.acShortList[this.acIndex];
            }
        },
        CompleteInput(fullInput = null) {
            if(fullInput) {
                this.$refs.cmdPaletteInput.value = fullInput + " ";
            } else if (this.acShortList && this.acShortList[this.acIndex]) {
                this.$refs.cmdPaletteInput.value = this.acShortList[this.acIndex];
            }
            this.HideACFuncList();
        },
        ShowDoc(command) {
            let doc = nw.WorkSprite.lib['customActions'].getActionDoc(command);
            if(doc !== "") {
                this.CreateHistoryEntry(command, doc);
            }
        },
        CreateHistoryEntry(query, response) {
            this.convoHistory.push({
                q: query,
                r: response
            });
            this.historyIndex = this.convoHistory.length;
    
            let args = {};
            args.query = query;
            args.response = response;
            args.index = this.historyIndex-1;
    
            args.cpHistoryEntryStyle = 'cpHistoryEntryStyleOdd'
            if(this.convoHistory.length % 2 === 0) {
                args.cpHistoryEntryStyle = 'cpHistoryEntryStyleEven'
            }
    
            this.cpHistory.push(args);
        },
        CopyResult: function(index = -1) {
            let clipboard = nw.Clipboard.get();
            if(index === -1) {
                index = this.convoHistory.length-1;
            } 
            
            if(nw.bbMain.guiComponents.omniBox.convoHistory && this.convoHistory.length > 0 && this.convoHistory[index]) {
                clipboard.clear();
                clipboard.set(this.convoHistory[index].r);
            } 
        }
    },
    styles: [
        `.cpBox {
            position: absolute;
            left: 0px;
            top: 200px;
            width: 400px;
            height: 33px;
            border: 1px solid #837c9c;
            border-radius: 8px;
            background-color: rgba(31, 9, 51, 0.5);
        }
        .cpBox:hover {
            border-color: goldenrod;
        }
        .cpInput {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 395px;
            height: 30px;
            outline: none;
            border: none;
            background-color: transparent;
            color: gold;
        }
        
        .cpInputAC {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 395px;
            height: 30px;
            outline: none;
            border: none;
            background-color: transparent;
            color: rgba(255, 251, 227, 0.5);
        }
        .cpSubmitBtn {
            position: absolute;
            width: 28px;
            height: 28px;
            left: 365px;
            top: 1px;
            border: none;
            border-radius: 6px;
            background-color: transparent;
        }
        .cpSubmitBtn:hover {
            border: 1px solid goldenrod;
            background-color: rgba(190, 181, 127, 0.5);
        }
        .cpSubmitIcon {
            position: absolute;
            width: 26px;
            height: 26px;
            left: 0px;
            top: 1px;
            background-image: url('./gui/icons/submit.png');
            background-color: transparent;
            background-position: center;
            background-size: contain;
            background-repeat: no-repeat;
        }
        .cpHistoryBox {
            display: grid;
            position: absolute;
            left: 0px;
            top: 237px;
            width: 400px;
            height: 160px;
            border: 1px solid #837c9c;
            background-color: rgba(31, 9, 51, 0.5);
            border-radius: 5px;
            overflow-y: auto;
            overflow-x: hidden;
        }  
        .cpFuncList { 
            position: absolute;
            left: 0px;
            top: 20px;
            width: 140px;
            height: 130px;
            outline: none;
            border: 1px solid goldenrod;
            background-color: rgb(31 9 51 / 50%);
            color: rgb(255 251 227 / 85%);
            overflow-x: hidden;
            overflow-y: auto;
        }
        .cpACEntry {
            position: relative;
            left: 0px;
            width: 125px;
            height: 20px;
            outline: none;
            background-color: transparent;
            color: rgb(255 251 227 / 85%);
        }
        .cpACEntry:hover {
            position: relative;
            left: 0px;
            width: 125px;
            height: 20px;
            outline: none;
            background-color: rgba(210, 199, 221, 0.767);
            color: rgba(43, 8, 77, 0.85);
        }    
        .cpHistoryEntryStyle { 
            width: 100%; 
            padding: 5px; 
            background-color: rgba(0, 0, 0, 0);
        }
        .cpHistoryEntryStyleEven {
            width: 100%; 
            padding: 5px; 
            background-color: rgba(0, 0, 0, 0.1);
        }
        .cpHistoryEntryStyleOdd { 
            width: 100%; 
            padding: 5px; 
            background-color: rgba(0, 0, 0, 0); 
        }
        .cpQueryStyle { 
            text-align: left; 
            color: #ead560;
            border: 1px solid goldenrod;
            border-radius: 3px; 
            padding: 2px;
        }
        .cpResponseStyle { 
            text-align: left; 
            color: #ead560;
            border: 1px solid goldenrod;
            border-radius: 3px; 
            padding: 2px; 
            margin-right: 50px; 
            float: right; 
        }
        .cpHistoryCopyBtn { 
            width: 19px; 
            height: 22px; 
            border: 1px solid gold;
            border-radius: 5px; 
            right: 20px; 
            position: absolute; 
            margin-right: 3px; 
        }
        .cpHistoryCopyIcon { 
            position: absolute; 
            top: 2px; 
            left: 1px; 
            width: 18px; 
            height: 18px; 
            background-image: url('./gui/icons/copy.png');
            background-size: contain; 
            background-repeat: no-repeat; 
            background-position: center; 
        }
        }
        `],
    template: `
    <div id='cmdPalette' class='cpBox'>
        <input id='cmdPaletteInputAC' ref='cmdPaletteInputAC' type="text" class='cpInputAC' />
        <input id='cmdPaletteInput' ref='cmdPaletteInput' type="text" class='cpInput' @keyup='AutoComplete($event)'/>
        <div id='cmdPaletteSubmitBtn' class='cpSubmitBtn'>
            <div id='cmdPaletteSubmitIcon' class='cpSubmitIcon' @click='Submit'></div>
        </div>
    </div>
    <div id='cmdPaletteHistory' ref='cmdPaletteHistory' class='cpHistoryBox' v-show='cpHistory.length > 0'>
        <template v-for="h of cpHistory.slice().reverse()">
            <div :class='h.cpHistoryEntryStyle'>
                <span class='cpQueryStyle' >{{h.query}}</span>
            </div>
            <div :class='h.cpHistoryEntryStyle'>
                <span class='cpResponseStyle' >{{h.response}}</span>
                <div class='cpHistoryCopyBtn' @click='CopyResult(h.index)' title='Copy Result'>
                    <div class='cpHistoryCopyIcon'></div>
                </div>
            </div>
        </template>
    </div>
    <ul id='cmdPaletteFuncList' ref='cmdPaletteFuncList' class='cpFuncList' v-show="showACList">
        <template v-for="f in acShortList">
            <li class='cpACEntry' @click='CompleteInput(f)'>{{f}}</li>
        </template>
    </ul>

    `
}