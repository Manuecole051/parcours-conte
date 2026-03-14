/* ========== Resize manager ================================================ */
window.scResizerMgr = scOnLoads[scOnLoads.length] = {
	fResourcesPath : "des:img|iframe",
	fResourcesDatas : [],
	fIsIframeBtn : null,
	fIsMobileOnly : null,
	fMediaWebCls : null,
	loadSortKey : "ZZZ",
	fListeners : {resized:[]},
	fStrings: 	[
	/*0*/		"Ouvrir l\'iframe", "Ouvrir l\'iframe à sa taille d\'origine (nouvelle fenêtre)",
	/*2*/		"Agrandir", "Agrandir la map",
	/*4*/		"Réduire", "Réduire la map"
				]
}

/**
** opts::type : string -> 'content','quiz','map', 'free'
** opts::zoom: bool-> false par défaut -> valable seulement pour les map
** A définir ici ou dans le skin.js :
** scResizerMgr.fIsMobileOnly : bool -> false par défaut -> valable seulement pour les quiz
** scResizerMgr.fIsIframeBtn : bool -> true par défaut
** scResizerMgr.fMediaWebCls : string -> 'mediaWeb' par défaut
** scResizerMgr.freeResizer : function -> to override
**/
scResizerMgr.registerResources = function(pPath, pOpts) {
	const vResourceDatas = {};
	vResourceDatas.fPath = pPath;
	vResourceDatas.fOpts = (typeof pOpts == "undefined" ? {type:"content", zoom:false} : pOpts);
	vResourceDatas.fOpts.type = (typeof vResourceDatas.fOpts.type == "undefined" ? "content" : vResourceDatas.fOpts.type);
	vResourceDatas.fOpts.zoom = (typeof vResourceDatas.fOpts.zoom == "undefined" ? false : vResourceDatas.fOpts.zoom);
	this.fIsMobileOnly = this.fIsMobileOnly != null ? this.fIsMobileOnly : false;
	this.fIsIframeBtn = this.fIsIframeBtn != null ? this.fIsIframeBtn : true;
	this.fMediaWebCls = this.fMediaWebCls != null ? this.fMediaWebCls : "mediaWeb";
	this.fResourcesDatas[this.fResourcesDatas.length] = vResourceDatas;
}

scResizerMgr.onLoad = function() {		
	try {
		this.fScreenTouch = "ontouchstart" in window && ((/iphone|ipad/gi).test(navigator.appVersion) || (/android/gi).test(navigator.appVersion));
		this.fIsIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
		// Set tooltip callback functions.
		if ("scTooltipMgr" in window) {
			scTooltipMgr.addShowListener(this.sTtShow);
			scTooltipMgr.addHideListener(this.sTtHide);
		}
		this.xInit();
	}
	catch(e){
		console.error("scResizerMgr.onLoad::Error: "+e);
	}
}

scResizerMgr.freeResizer = function(pRes, pOpts) {
}

scResizerMgr.addListener = function(pKey, pFunc) {
	if (!this.fListeners[pKey]) return console.error("scResizerMgr.addListener ERROR : "+pKey+" is not a valid listener");
	this.fListeners[pKey].push(pFunc);
}

scResizerMgr.notifyListener = function(pKey, pParam) {
	try{
		for (let i=0; i<this.fListeners[pKey].length; i++){
			this.fListeners[pKey][i](pParam);
		}
	} catch(e){
		console.error("scResizerMgr.xNotifyListener("+pKey+") - ERROR : "+e);
	}
},

scResizerMgr.sTtShow = function(pNode) {
	if (scResizerMgr.fIsIOS) scTooltipMgr.hideTooltip(true);;
	const vClsBtn = scPaLib.findNode("des:a.tooltip_x", scTooltipMgr.fCurrTt);
	if (vClsBtn) window.setTimeout(function(){vClsBtn.focus();}, pNode.fOpt.DELAY + 10);
	else if (!pNode.onblur) pNode.onblur = function(){scTooltipMgr.hideTooltip(true);};
}

scResizerMgr.sTtHide = function(pNode) {
	if (pNode) pNode.focus();
}

scResizerMgr.xInit = function(){
	if (!scServices.fQuizChoices) scServices.fQuizChoices = {};
	for(let i = 0; i < this.fResourcesDatas.length; i++) {
		const vResourceDatas = this.fResourcesDatas[i];
		const vOpts = vResourceDatas.fOpts;
		const vResContainers = scPaLib.findNodes(vResourceDatas.fPath);
		for(let j = 0; j < vResContainers.length; j++) {
			const vResContainer = vResContainers[j];
			const vResources = scPaLib.findNodes(this.fResourcesPath, vResContainer);
			for(let k = 0; k < vResources.length; k++) {
				const vResource = vResources[k];
				vResource.fContainer = vResContainer;
				switch(vOpts.type) {
				    case "content":
				        this.xContentResizer(vResource, vOpts);
				        break;
				    case "map":
				        this.xMapResizer(vResource, vOpts);
				        break;
			        case "quiz":			        	
				        if (this.fIsMobileOnly) {
				        	// Si le device-width est superieur à 750px (tablette par exemple) on garde le système de quiz habituel
									const vMediaQueries = window.matchMedia("(max-width: 750px)");
									if (vMediaQueries.matches) this.xQuizResizer(vResource, vOpts);
				        }
				        else this.xQuizResizer(vResource, vOpts);
				        break;
				    case "free":
				    	this.freeResizer(vResource, vOpts);
				    	break;
				}
				vResource.isResized = true;
			}
		}
	}
}

scResizerMgr.xContentResizer = function(pRes, pOpts){
	if(this.xGetParents(pRes, 2).className.indexOf(this.fMediaWebCls) != -1) return;
	if(pRes.nodeName == "OBJECT") {
		const vRszObjWidth = pRes.width;
		const vRszObjHeight = pRes.height;
		const vRszObjResizer = function () {
			const vContainerWidth = pRes.fContainer.offsetWidth;
			pRes.width = vRszObjWidth > vContainerWidth ? vContainerWidth : vRszObjWidth;
			pRes.height = vRszObjWidth > vContainerWidth ? (vContainerWidth * vRszObjHeight) / vRszObjWidth : vRszObjHeight;
		};
		vRszObjResizer();
		this.xAddEvent(window, 'resize', vRszObjResizer, false);
	}
	else if(pRes.nodeName == "IFRAME") return;
	else {
		pRes.fIsAdapted = pRes.parentNode.nodeName == "A" && this.fScreenTouch;
		if (pRes.naturalWidth) pRes.style.maxWidth = pRes.naturalWidth + "px";
		if (pRes.naturalHeight) pRes.style.maxHeight =  pRes.naturalHeight + "px";
		pRes.style.width = "100%";
		pRes.style.height = "auto";
	}
}

scResizerMgr.xMapResizer = function(pRes,pOpts){
	const vZoomMapBtn = this.xAddBtn(pRes.fContainer, "zoomMapBtn", this.fStrings[2], this.fStrings[3]);
	let i;

	pRes.fAreas = scPaLib.findNodes("des:area");
	pRes.fCoords = [];
	for (i in pRes.fAreas) pRes.fCoords[i] = pRes.fAreas[i].coords.split(",");
	pRes.style.maxWidth = pRes.naturalWidth + "px";
	pRes.style.maxHeight = pRes.naturalHeight + "px";
	pRes.fContainer.style.position = "relative";

	const vSizeElement = scDynUiMgr.addElement("div", pRes.fContainer.parentNode, null, pRes.fContainer);
	vSizeElement.style.top = pRes.fContainer.offsetTop + "px";
	vSizeElement.style.left = pRes.fContainer.offsetLeft + "px";
	vSizeElement.style.right = 0;
	const vNsibs = scPaLib.findNodes("nsi:", pRes.fContainer);
	let vBottom = 0;
	for (i = 0; i < vNsibs.length; i++) {
		const vNsib = vNsibs[i];
		vNsib.style.display = "inline-block";
		vBottom += vNsib.offsetHeight + 15;
	}
	vSizeElement.style.bottom = vBottom + "px";
	vSizeElement.style.position = "absolute";

	if (pOpts.zoom) {
		vZoomMapBtn.res = pRes;
		vZoomMapBtn.onclick = function() {
			this.isZoomed = !this.isZoomed;
			const vRes = this.res;
			if (this.isZoomed) {
				this.parentWidth = vRes.parentNode.offsetWidth;
				vRes.fContainer.style.position = "fixed";
				vRes.fContainer.style.top = "50%";
				vRes.fContainer.style.left = "50%";
				this.zoomMapOver = scDynUiMgr.addElement("div", document.body, "zoomMap_over");
				const vMaxHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
				const vMaxWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
				scResizerMgr.xResizeMapAreas(vRes, vMaxHeight, vMaxWidth);
				vRes.fContainer.style.marginTop = "-" + vRes.offsetHeight / 2 + "px";
				vRes.fContainer.style.marginLeft = "-" + vRes.offsetWidth / 2 + "px";			
			} else {
				vRes.fContainer.style.position = "relative";
				vRes.fContainer.style.top = "auto";
				vRes.fContainer.style.left = "auto";
				vRes.fContainer.style.marginTop = "auto";
				vRes.fContainer.style.marginLeft = "auto";
				document.body.removeChild(this.zoomMapOver);
				scResizerMgr.xResizeMapAreas(vRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
			}
			this.innerHTML = '<span>' + scResizerMgr.fStrings[(this.isZoomed ? 4 : 2)] + '</span>';
			this.title = scResizerMgr.fStrings[(this.isZoomed ? 5 : 3)];
			scResizerMgr.xSwitchClass(document.body, "zoomMap_"+!this.isZoomed||this.isZoomed, "zoomMap_"+this.isZoomed||!this.isZoomed, true);	
			scResizerMgr.xSwitchClass(this, "zoom_"+!this.isZoomed||this.isZoomed, "zoom_"+this.isZoomed||!this.isZoomed, true);
		};
	}
	this.addListener("resized", function(){
		scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
	});
	this.xAddEvent(window, 'resize', function(){
		if (pOpts.zoom && vZoomMapBtn.isZoomed) vZoomMapBtn.click();
		scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
	}, false);
	scResizerMgr.xResizeMapAreas(pRes, vSizeElement.offsetHeight, vSizeElement.offsetWidth);
}

scResizerMgr.xResizeMapAreas = function(pRes, pMaxHeight, pMaxWidth) {
	if (pMaxWidth >= pRes.naturalWidth && pMaxHeight >= pRes.naturalHeight) return;
	let vRatio = 0;
	let vHeight = Math.round(pRes.naturalHeight * pMaxWidth / pRes.naturalWidth);
	let vWidth = pMaxWidth;
	if (vHeight >= pMaxHeight) {
		vWidth = Math.round(vWidth*pMaxHeight/vHeight);
		vHeight = pMaxHeight;
	}
	pRes.parentNode.style.backgroundRepeat = "no-repeat";		
	pRes.parentNode.style.width = vWidth + "px";
	pRes.parentNode.style.height = vHeight + "px";
	pRes.parentNode.parentNode.style.height = vHeight + "px";
	scPaLib.findNode("psi:canvas", pRes).style.width = vWidth + "px";
	scPaLib.findNode("psi:canvas", pRes).style.height = vHeight + "px";
	pRes.style.width = vWidth + "px";
	pRes.style.height = vHeight + "px";
	pRes.width = vWidth;
	pRes.height = vHeight;
	vRatio = vWidth/pRes.naturalWidth;
	// Resize des areas
	for (let i in pRes.fAreas) {
		const vNewCoords = [];
		for(j = 0; j < pRes.fCoords[i].length; j++) vNewCoords[j] = pRes.fCoords[i][j]*vRatio;
		pRes.fAreas[i].coords = vNewCoords.join(",");
	}
	scMapMgr.maphighlight(pRes, scMapMgr.extend({shadow:true, alwaysOn:scResizerMgr.fScreenTouch}));
	pRes.parentNode.style.backgroundSize = vWidth + "px " + vHeight + "px";
}

scResizerMgr.xQuizResizer = function(pRes,pOpts){
	const vResizeAreas = function(event) {
		let i;
		for (i = 0; i < vClosedCollBks.length; i++) {
			let vClosedCollBk = vClosedCollBks[i];
			if (vClosedCollBk.style.display == "none") {
				if(event && event.type == "resize" || event == "resized") vClosedCollBk.isAlreadyOpened = false;
				vClosedCollBk.style.display = "";
			}
			else if(event && event.type == "resize" || event == "resized") vClosedCollBk.isAlreadyOpened = true;
		}

		pRes.parentNode.style.width = "100%";
		pRes.parentNode.style.height = "auto";
		const vNewWidth = pRes.width;
		const vNewHeight = pRes.offsetHeight;

		// Permet le réagrandissemnt des canvas et de l'image en empty -> pas encore nickel au réagrandissement
		if (vEmptyImg.length) {
			vEmptyImg[0].style.width = vNewWidth+"px";
			vEmptyImg[0].style.height = vNewHeight+"px";
			scMapMgr.maphighlight(vEmptyImg[0], scMapMgr.extend(scAssmntMgr.gmcqHighlightDefault, {shadow:true, alwaysOn:scResizerMgr.fScreenTouch, strokeColor:'cccccc'}));
		}

		const vRatio = vNewWidth / vOrigWidth;
		for (i = 0; i < vAreas.length; i++) {
			const vArea = vAreas[i];
			const vNewCoords = [];
			for(let j = 0; j < vCoords[i].length; j++) vNewCoords[j] = vCoords[i][j]*vRatio;
			vArea.coords = vNewCoords.join(",");

			// Update delta de scDragMgr
			vArea.topLeftDelta = scDragMgr.coordinates.create(scCoLib.toInt(vNewCoords[0]),scCoLib.toInt(vNewCoords[1]));
			vArea.bottomRightDelta = scDragMgr.coordinates.create(scCoLib.toInt(vNewCoords[2]),scCoLib.toInt(vNewCoords[3]));

			const vMarker = vMarkers[i];
			if (vMarker) {
				vMarker.style.width = vMarker.origwidth*vRatio+"px";
				vMarker.style.height = vMarker.origheight*vRatio+"px";
				vMarker.style.top = vMarker.origtop*vRatio+"px";
				vMarker.style.left = vMarker.origleft*vRatio+"px";
				if (vMarker.icon) {
					vMarker.icon.style.width = vMarker.icon.origwidth*vRatio+"px";
					vMarker.icon.style.height = vMarker.icon.origheight*vRatio+"px";
					vMarker.icon.style.backgroundSize = vMarker.icon.origwidth*vRatio+"px";
					vMarker.icon.style.marginLeft = -vMarker.icon.origwidth*vRatio/2+"px";
					vMarker.icon.style.marginTop = -vMarker.icon.origheight*vRatio/2+"px";
				}
			}
		}

		for (i = 0; i < vClosedCollBks.length; i++) {
			vClosedCollBk = vClosedCollBks[i]
			if (!vClosedCollBk.isAlreadyOpened) vClosedCollBk.style.display = "none";
		}

		pRes.parentNode.style.width = vNewWidth + "px";
		pRes.parentNode.style.height = vNewHeight + "px";
	};
	let i;
	if (pRes.src && pRes.src.indexOf("empty.gif")!=-1 || !this.fScreenTouch && this.fIsMobileOnly || pRes.isResized) return;

	const vDesBks = scPaLib.findNodes("des:div", pRes.fContainer);
	const vAncBks = scPaLib.findNodes("anc:div", pRes.fContainer);
	const vBks = vDesBks.concat(vAncBks);
	const vClosedCollBks = [];
	for (i = 0; i < vBks.length; i++) {
		const vBk = vBks[i];
		if (vBk.style.display == "none") {
			vClosedCollBks.push(vBk);
			vBk.style.display = "";
			vBk.isAlreadyOpened = false;
		}
	}

	const vOrigWidth = pRes.width;
	pRes.style.maxWidth = pRes.width + "px";
	pRes.style.maxHeight = pRes.height + "px";
	pRes.style.width = "100%";
	pRes.style.height = "auto";

	const vAreas = scPaLib.findNodes("des:map/chi:area", pRes.parentNode);
	const vMarkers = scPaLib.findNodes("nsi:div", pRes);
	const vCoords = [];
	for (i = 0; i < vAreas.length; i++) {
		const vArea = vAreas[i];
		vCoords[i] = vArea.coords.split(",");
		const vMarker = vMarkers[i];
		if (vMarker) {
			vMarker.origwidth = vMarker.offsetWidth;
			vMarker.origheight = vMarker.offsetHeight;
			vMarker.origleft = vMarker.offsetLeft;
			vMarker.origtop = vMarker.offsetTop;
			vMarker.icon = scPaLib.findNode("chi:span",vMarker);
			if (vMarker.icon) {
				vMarker.icon.origwidth = vMarker.icon.offsetWidth;
				vMarker.icon.origheight = vMarker.icon.offsetHeight;
			}
		}
	}

	const vEmptyImg = this.xGetEltsByAttribute("img", pRes.parentNode, "src", "empty");
	let resizeTimer;
	const sResize = function (event) {
		vResizeAreas(event);
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(vResizeAreas, 50);
	};
	this.addListener("resized", function(){sResize("resized");});
	this.xAddEvent(window, 'resize', sResize, false);
	vResizeAreas();
}

scResizerMgr.xAddEvent = function(elt, event, fctn, capture) {
	return document.addEventListener ? elt.addEventListener(event, fctn, capture): elt.attachEvent ? elt.attachEvent('on' + event, fctn): false;
}

scResizerMgr.xGetParents = function(pRoot, pNumber) {
	let vParent = pRoot;
	for (let i = 0; i < pNumber; i++) {
		vParent = vParent.parentNode;
	} 
	return vParent;
}

/** scResizerMgr.xAddBtn : Add a HTML button to a parent node. */
scResizerMgr.xAddBtn = function(pParent, pClassName, pCapt, pTitle, pNxtSib) {
	const vBtn = pParent.ownerDocument.createElement("a");
	vBtn.className = pClassName;
	vBtn.fName = pClassName;
	vBtn.href = "#";
	vBtn.target = "_self";
	if (pTitle) vBtn.setAttribute("title", pTitle);
	if (pCapt) vBtn.innerHTML = "<span>" + pCapt + "</span>"
	if (pNxtSib) pParent.insertBefore(vBtn,pNxtSib)
	else pParent.appendChild(vBtn);
	return vBtn;
}

scResizerMgr.xGetEltsByAttribute = function(pElt, pParent, pAttr, pValue) {
	const vElts = scPaLib.findNodes("des:" + pElt, pParent);
	const vTmpElts = [];
	for (let i = 0; i < vElts.length; i++) {
		const vElt = vElts[i];
		if (vElt.getAttribute(pAttr) && vElt.getAttribute(pAttr).indexOf(pValue) != -1) vTmpElts.push(vElt);
	}
	return vTmpElts;
}

scResizerMgr.xSwitchClass = function(pNode, pClassOld, pClassNew, pAddIfAbsent) {
	const vAddIfAbsent = pAddIfAbsent || false;
	if (pClassOld && pClassOld != "") {
		if (pNode.className.indexOf(pClassOld)==-1){
			if (!vAddIfAbsent) return;
			else if (pClassNew && pClassNew != '' && pNode.className.indexOf(pClassNew)==-1) pNode.className = pNode.className + " " + pClassNew;
		} else {
			const vCurrentClasses = pNode.className.split(' ');
			const vNewClasses = new Array();
			let i = 0;
			const n = vCurrentClasses.length;
			for (; i < n; i++) {
				if (vCurrentClasses[i] != pClassOld) {
					vNewClasses.push(vCurrentClasses[i]);
				} else {
					if (pClassNew && pClassNew != '') vNewClasses.push(pClassNew);
				}
			}
			pNode.className = vNewClasses.join(' ');
		}
	}
}
