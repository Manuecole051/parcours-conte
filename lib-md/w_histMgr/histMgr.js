/* ========== History manager ================================================ */
function HistMgr() {
	this.fHst = new Object();   // History data object
	this.fHst.sk = new Array(); // History stack
	this.fHst.pt = 0;           // Pointer to current page
	this.fHst.md = "";          // Init mode (normal or subsequent to next or back)
	const vHistItem = scServices.suspendDataStorage.getVal(["hist"]);
	if(vHistItem && vHistItem.sk) this.fHst = vHistItem;
}
/**
 * HistMgr.init() - Init : add current page to history.
 * @param pIncludeInNav : Flag, include the URL in navigation (back() & next()).
 */
HistMgr.prototype.init = function(pIncludeInNav) {
	if (this.fHst.md == "") this.add(window.location.href, pIncludeInNav);
	this.fHst.md = "";
	this.xSave();
}

/**
 * HistMgr.add() - Add current page to history.
 * If the pointer is not at the end of the stack then reorganize the stack
 * @param pUrl : URL to add.
 * @param pIncludeInNav : Flag, include the URL in navigation (back() & next()).
 */
HistMgr.prototype.add = function(pUrl, pIncludeInNav) {
	const vEntry = new Object();
	vEntry.lk = scServices.scLoad.getUrlFromRoot(pUrl);
	vEntry.nv = pIncludeInNav;
	if (this.fHst.sk.length == 0 || vEntry.lk != this.fHst.sk[this.fHst.sk.length-1]){
		if (this.fHst.sk.length == 0 || this.fHst.pt == this.fHst.sk.length-1){
			this.fHst.sk[this.fHst.sk.length] = vEntry;
		} else {
			const vBaseHist = this.fHst.sk.slice(0, this.fHst.pt);
			const vNewHist = vBaseHist.concat(this.fHst.sk.slice(this.fHst.pt, this.fHst.sk.length).reverse(), vEntry);
			this.fHst.sk = vNewHist;
		}
		this.fHst.pt = this.fHst.sk.length - 1;
		this.fHst.md = "";
	}
}

/**
 * HistMgr.back() - Set history manager for moving back one page.
 * @returns URL of page to move to.
 */
HistMgr.prototype.back = function() {
	if (this.hasBack()){
		this.fHst.md = "b";
		this.fHst.pt--;
		while (!this.fHst.sk[this.fHst.pt].nv) this.fHst.pt--;
		this.xSave();
		return scServices.scLoad.getRootUrl()+"/"+this.fHst.sk[this.fHst.pt].lk;
	}
}

/**
 * HistMgr.next() - Set history manager for moving foward one page.
 * @returns URL of page to move to.
 */
HistMgr.prototype.next = function() {
	if (this.hasNext()){
		this.fHst.md = "n";
		this.fHst.pt++;
		while (!this.fHst.sk[this.fHst.pt].nv) this.fHst.pt++;
		this.xSave();
		return scServices.scLoad.getRootUrl()+"/"+this.fHst.sk[this.fHst.pt].lk;
	}
}

/**
 * HistMgr.hasNext() - determines if a next page is available.
 * @returns true if next page available.
 */
HistMgr.prototype.hasNext = function() {
	if (this.fHst.pt >= this.fHst.sk.length-1) return false;
	for (let i = this.fHst.pt+1; i < this.fHst.sk.length; i++) if (this.fHst.sk[i].nv) return true;
	return false;
}

/**
 * HistMgr.hasBack() - determines if a previous page is available.
 * @returns true if previous page available.
 */
HistMgr.prototype.hasBack = function() {
	if (this.fHst.pt <= 0) return false;
	for (let i = this.fHst.pt-1; i >= 0; i--) if (this.fHst.sk[i].nv) return true;
	return false;
}

/**
 * HistMgr.isInHistory() - determines if a given URL is in the stack.
 * @param pUrl : URL to check.
 * @returns true if URL is in the stack.
 */
HistMgr.prototype.isInHistory = function(pUrl) {
	const vUrl = scServices.scLoad.getUrlFromRoot(pUrl);
	let vFound = false;
	for (let i in this.fHst.sk) {
		if (this.fHst.sk[i].lk == vUrl) {
			vFound = true;
			break;
		}
	}
	return vFound;
}

/**
 * HistMgr.xSave() - Saves the history data using the storage API.
 */
HistMgr.prototype.xSave = function() {
	scServices.suspendDataStorage.setVal(["hist"], scServices.dataUtil.deserialiseObjJs(scServices.dataUtil.serialiseObjJs(this.fHst))); // clone object before commit otherwise commit does not work because suspendData not dirty
	scServices.suspendDataStorage.commit();
}