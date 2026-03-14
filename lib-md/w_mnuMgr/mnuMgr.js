/* ========== Menu manager ================================================ */
window.mnuMgr = {
	fMnuRoot : null,
	fMnuNodes : null,
	fHistMgr : null,
	fMnuRootPath : "ide:mnuFra",
	fProgFraPath : "des:div.progFra",
	fEnLnkClass : "enabled_entry",
	fDisLnkClass : "disabled_entry",
	init : function(){
		try {
			scOnLoads[scOnLoads.length] = this;
		} catch(e){
			console.error("mnuMgr.init::Error: "+e);
		}
	},
	onLoad : function(){
		let vLnk;
		try {
			let i;
			this.fMnuRoot = scPaLib.findNode(this.fMnuRootPath);
			if (!HistMgr || !this.fMnuRoot) return;
			this.fMnuNodes = scPaLib.findNodes("des:a." + this.fEnLnkClass, this.fMnuRoot);
			// Initialisation des "enabled_click"
			for (i = 0; i < this.fNodesClick.nds.length; i++) {
				const vNode = this.fNodesClick.nds[i];
				vLnk = scPaLib.findNode("des:."+vNode.id);
				if(vNode.nc) vLnk.className += " enabled_click";
			}
			this.fHistMgr = new HistMgr;
			for (i in this.fMnuNodes) {
				vLnk = this.fMnuNodes[i];
				if (!this.fHistMgr.isInHistory(vLnk.href)) {
					if (vLnk.className.indexOf("click")>0){
						vLnk.href = "#";
						vLnk.onclick = function() {return false;}
						vLnk.className = vLnk.className.replace(this.fEnLnkClass, this.fDisLnkClass);
					}
					vLnk.className = vLnk.className + " done";
				}
			}
			this.fProg = 10 * Math.round(10 - 10 * scPaLib.findNodes("des:a.done", this.fMnuRoot).length / this.fMnuNodes.length);
			this.fProgFra = scPaLib.findNode(this.fProgFraPath);
			this.fProgFra.classList.add("prog-" + this.fProg);
		} catch(e){
			console.error("mnuMgr.onLoad::Error: "+e);
		}
	},
	loadSortKey : "ZMnuMgr"
}
