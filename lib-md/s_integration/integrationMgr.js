window.integrationMgr = scOnLoads[scOnLoads.length] = scOnPageHides[scOnPageHides.length] = {

	fSaveIndexes: false,

	save: function (pForce) {
		try {
			// Enregistrement des scores
			const vScores = scServices.integration.fScores;
			if (vScores["raw"] && vScores["min"] && vScores["max"]){
				const vRaw = topazeMgr.getIndexVal(vScores["raw"].id, vScores["raw"].type.slice(1));
				const vMin = typeof vScores["min"].val === 'number' ? vScores["min"].val : topazeMgr.getIndexVal(vScores["min"].id, vScores["min"].type.slice(1));
				const vMax = typeof vScores["max"].val === 'number' ? vScores["max"].val : topazeMgr.getIndexVal(vScores["max"].id, vScores["max"].type.slice(1));
				scServices.integration.setScore(vRaw, vMin, vMax);
			}

			// Enregistrement des indexes
			for(const vId in scServices.integration.fIndexes) {
				const vIsVar = scServices.integration.fIndexes[vId].indexOf("v") !== -1;
				const vType = scServices.integration.fIndexes[vId].slice(1);
				const vValue = vIsVar ? topazeMgr.getVarVal(vId, vType) : topazeMgr.getIndexVal(vId, vType);
				scServices.integration.setIndex(vId, vValue, topazeMgr.fSessKey);
			}

			if (pForce) scServices.dataSync.commit();
		} catch (e) {
			console.error("scServices.integrationMgr.save : " + e);
		}
	},

	onLoad: function () {
		if (this.fSaveIndexes) this.save();
	},
	loadSortKey: "ZintegrationMgr",

	onPageHide: function () {
		if (this.fSaveIndexes) this.save();
	},
	pageHideSortKey: "3integrationMgr"
};
