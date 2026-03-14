/* ========== Res manager ================================================ */
window.resMgr = {
	fRespRoot : null,
	fResNodes : null,
	fGlosNodes : null,
	fHistMgr : null,
	fResRootPath : "des:div.subFra_co",
	fEnLnkClass : "enabled_entry",
	fDisLnkClass : "disabled_entry",
	init : function(){
		try {
			this.fResRoot = scPaLib.findNode(this.fResRootPath);
			if (this.fResRoot) this.fResNodes = scPaLib.findNodes("des:dd.idxFra", this.fResRoot);
			scOnLoads[scOnLoads.length] = this;
		} catch(e){
			console.error("resMgr.init::Error: "+e);
		}
	},
	onLoad : function(){
		try {
			const vRef = this.fResNodes;
			if (!HistMgr) return;
			this.fHistMgr = new HistMgr;
			for (let i in vRef) {
				this.fIdxEntryCallers = scPaLib.findNodes("des:.idxEntryCallerLnk",vRef[i]);
				const vTitle = scPaLib.findNode("psi:.idxEntryTi", vRef[i]);
				for (let j in this.fIdxEntryCallers) {
					const vLnk = this.fIdxEntryCallers[j];
					vLnk.href = vLnk.href.lastIndexOf("#")!=-1?vLnk.href.substring(0, vLnk.href.indexOf("#")):vLnk.href;
					vLnk.className = vLnk.className + this.fEnLnkClass;
					if (!this.fHistMgr.isInHistory(vLnk.href)){
						vLnk.href = "#";
						vLnk.onclick = function() {return false;}
						vLnk.className = vLnk.className.replace(this.fEnLnkClass, this.fDisLnkClass);
					}
				}
				if(scPaLib.findNode("des:a."+this.fEnLnkClass+"",vRef[i])) {
					vRef[i].className = vRef[i].className.replace(this.fDisLnkClass, this.fEnLnkClass);
					if (vTitle) vTitle.className = vTitle.className.replace(this.fDisLnkClass, this.fEnLnkClass);
				}
			}
		} catch(e){
			console.error("resMgr.onLoad::Error: "+e);
		}
	},
	loadSortKey : "ZResMgr"
}
