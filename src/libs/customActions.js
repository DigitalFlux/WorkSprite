class ActionPack {
    constructor() {
        // Where all the actions will live
        this.actions = [];
        this.actionList = [];
        // Do no-ops
        this.noops = [
            '::',
            '//',
            '/*',
            '*',
            '*/'
        ];
    }
    // Add a new action
    addAction(opts = { name: null, action: null, force: false, argNames: [] }) {
        if (!opts.name ||
            opts.name === undefined ||
            opts.name.length === 0 ||
            (opts.name.length === 1 && opts.name[0].trim() === "") ||
            !opts.action ||
            opts.action === undefined) {
            console.log("Unabled to register action with invalid name/function.", opts);
            return;
        }

        for (let n = 0; n < opts.name.length; n++) {
            if (!this.actions[opts.name[n]] ||
                (this.actions[opts.name[n]] && opts.force)) {
                this.actions[opts.name[n]] = opts.action;
                this.actionList.push({
                    name: opts.name[n], 
                    argNames: opts.argNames,
                    doc: opts.doc
                });
            } else {
                throw `Action: '${opts.name[n]}' is occupied`;
            }
        }
    }
    // Returns true if action exists, or false if it doesn't
    hasAction(name) {
        if (this.actions[name] && this.actions[name] !== undefined)
            return true;
        return false;
    }
    // Adds a bundle of actions
    addBundle(actions = []) {
        if(actions.length > 0) {
            for (let a = 0; a < actions.length; a++) {
                this.addAction(actions[a]);
            }
            return true;
        } 
        return false;
    }
    // Helper function to determine if args passed are asking for help
    isAskingForHelp(args = []) {
        if (//!args ||
            //args === undefined ||
            //args.length === 0 ||
            args[0] === "?" ||
            args[0] === "-?" ||
            args[0] === "/?" ||
            args[0] === "help" ||
            args[0] === "-help" ||
            args[0] === "/help") {
            return true;
        }
        return false;
    }
    tryReturn(fn, args = {}, cb = null) {
        if(fn && typeof fn === 'function') {
            try {
                return fn(args);
            } catch (e) {
                if(cb && typeof cb === 'function') {
                    return cb(e);
                }
                return { error: `Error: ${e}`, result: null };
            }
        }
        return { error: 'No function found', result: null };
    }
    // Execute an action given a name and optional arguments
    exec(name, args, cb = null) {            
        let err = "";

        if (this.actions[name]) {
            return this.tryReturn(this.actions[name], args, cb);
        } else {
            err = "name";
        }

        switch (err) {
            default:
                return { error: "Something went wrong, try again...", result: null };
            case 'name':
                return { error: `No appropriate '${name}' action found...`, result: null };
        }
    }
    getActionSig(name) {
        name = name.split(" ")[0];
        if(this.actions[name]) {
            return Object.entries(this.actions[name])[0][0];
        } else
            return "";
    }
    getActionArgNames(actionName) {
        if(!this.actions[actionName]) return [""];

        for(let i = 0; i < this.actionList.length; i++) {
            if(this.actionList[i].name === actionName) {
                return this.actionList[i].argNames ?? [""];
            }
        }        
    }
    getActionDoc(name) {
        name = name.split(" ")[0];
        if(this.actions[name]) {
            for(let i = 0; i < this.actionList.length; i++) {
                if(this.actionList[i].name === name) {
                    return this.actionList[i]?.doc ?? "";
                }
            }
        }
        return "";
    }
    // Dump Actions into table in console
    dumpActions() {
        let table = [];
        table.push("Actions:");
        let entry = "";
        for (let name in this.actions) {
            entry = "";
            entry += "Name: " + name + " | ";
            table.push(entry);
        }
        
        console.table(table);
    }
    isNoOpBlock(line) {
        for(let c = 0; c < this.noops.length; c++) {
            if(line.indexOf(this.noops[c]) === 0) {
                return true;
            }
        }
        return false;
    }
    compileTaskInfo(idx, tasks, trimArgs = false) {
        if(tasks && tasks[idx] && tasks[idx] !== undefined) {
            let ms = 0;
            let args = tasks[idx].trim().split(' ');
            if(trimArgs) {
                args.shift();
            }
            args.unshift(1);
            
            if(!args || 
                !args[1] || 
                (args[1] && args[1] === '') ||
                (args[1] && this.isNoOpBlock(args[1]))) {
                args = [0];
            } else {
                switch(args[1]) {
                    case 'wait':
                        args[0] = 0;
                        ms = args[2];
                        break;
                    case 'end':
                        return;
                    case 'iferr':
                        if(!trimArgs) {
                            args[0] = 0;
                        }
                        break;
                }
            }
            return [ms, args];
        } else {
            return [0, []];
        }
    }
    execList(numTasks = -1, idx = 0, tasks = [], prevRes = { error: null, result: null }) {
        if(numTasks === -1 && tasks.length > 0) {
            numTasks = tasks.length;
        } else if(numTasks === -1 && (!tasks || tasks.length === 0)) {
            return;
        }
        let taskInfo = this.compileTaskInfo(idx, tasks, (prevRes.error !== null));
        let that = this;
        if(!prevRes.error) {
            setTimeout((a) => {
                let res = { error: null, result: null };
                if(a && a[0] === 1) { // execute any no-op code
                    a.shift();
                    res = that.exec(a[0], a.slice(1));
                }               
                if(++idx < numTasks) {
                    that.execList(numTasks, idx, tasks, res);
                }
            }, taskInfo[0], taskInfo[1]); // [ms, task arg list]
        } else {
            let res = { error: null, result: null };
            if(taskInfo[1][0] === 1) {
                taskInfo[1].shift();
                res = this.exec(taskInfo[1][0], taskInfo[1].slice(1));
            } else {
                console.log("ERROR:", prevRes.error, taskInfo);
            }
            idx++;
            this.execList(numTasks, idx, tasks, res);
        }
    }
}

exports.customActions = new ActionPack();