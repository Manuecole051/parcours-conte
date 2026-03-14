/* ========== Map manager ================================================ */
window.mapMgr = {
	fHistMgr : null,
	fMapRootPath : "ide:map",
	fImgClass : "visualMap_img",
	fEnLnkClass : "enabled_entry",
	fDisLnkClass : "disabled_entry",
	init : function(){
		scOnLoads[scOnLoads.length] = this;
	},
	onLoad : function(){
		try {
			const vMapRoot = scPaLib.findNode(this.fMapRootPath);
			const vMapNodes = scPaLib.findNodes("des:area." + this.fEnLnkClass, vMapRoot);
			this.fImg = scPaLib.findNode("des:."+this.fImgClass);
			if(this.fImg) {
				if (!HistMgr) return;
				this.fHistMgr = new HistMgr;
				for (let i in vMapNodes) {
					const vLnk = vMapNodes[i];
					vLnk.setAttribute('data-maphighlight','{"strokeColor":"00be00"}');
					if (vLnk.className.indexOf("area")>0) vMapRoot.removeChild(vLnk);
					if (vLnk.className.indexOf("click")>0 && !this.fHistMgr.isInHistory(vLnk.href)){
						vLnk.href = "#";
						vLnk.onclick = function() {return false;}
						vLnk.setAttribute('data-maphighlight','{"strokeColor":"ff0000"}');
						vLnk.className = vLnk.className.replace(this.fEnLnkClass, this.fDisLnkClass);
					}
				}
				scMapMgr.maphighlight(mapMgr.fImg, scMapMgr.extend({shadow:true}));
			}
		} catch(e){
			console.error("mapMgr.init::Error: "+e);
		}
	},
	xAddEvent: function(elt, event, fctn, capture) {
		return document.addEventListener ? elt.addEventListener(event, fctn, capture): elt.attachEvent ? elt.attachEvent('on' + event, fctn): false;
	},
	loadSortKey : "ZMapMgr"
}