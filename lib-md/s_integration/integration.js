scServices.integration = {
	fScores : {},
	fIndexes : {},

	registerScore: function(pRaw, pMin, pMax){
		try {
			this.fScores["raw"] = pRaw;
			this.fScores["min"] = pMin;
			this.fScores["max"] = pMax;
		} catch (e) {
			console.error("scServices.integration.registerScore : " + e);
		}
	},

	registerIndex: function(pId, pType){
		try {
			this.fIndexes[pId] = pType;
		} catch (e) {
			console.error("scServices.integration.registerIndex : " + e);
		}
	},

	setScore : function(pRaw, pMin, pMax){
		let vApi;
		try {
			const vMinPts = pMin;
			const vMaxPts = pMax;
			const vScorePts = pRaw;
			const vScore = Math.round((vScorePts - vMinPts) / (vMaxPts - vMinPts) * 100);
			if(scServices.scorm2k4 && scServices.scorm2k4.isScorm2k4Active()) {
				vApi = scServices.scorm2k4.getScorm2k4API();
				vApi.SetValue("cmi.score.scaled", vScore/100 );
				vApi.SetValue("cmi.score.raw", vScorePts );
				vApi.SetValue("cmi.score.min", vMinPts );
				vApi.SetValue("cmi.score.max", vMaxPts );
				const vPassingScore = vApi.GetValue("cmi.scaled_passing_score") || 1;
				vApi.SetValue("cmi.success_status", vScore/100>=vPassingScore ? "passed" : "failed");
			} else if(scServices.scorm12 && scServices.scorm12.isScorm12Active()) {
				vApi = scServices.scorm12.getScorm12API();
				vApi.LMSSetValue("cmi.core.score.raw", vScorePts);
				vApi.LMSSetValue("cmi.core.score.min", vMinPts );
				vApi.LMSSetValue("cmi.core.score.max", vMaxPts );
			} else if(scServices.distribRecords && scServices.distribRecords.isDistribRecordsActive()){
				scServices.distribRecords.setMainScore(vScorePts, vMinPts, vMaxPts);
			}
		} catch (e) {
			console.error("scServices.integration.setScore : " + e);
		}
	},

	setIndex : function(pId, pVal, pSessionKey){
		try {
			scServices.assmntMgr.setResponse(pId, pSessionKey, "val", pVal);
		} catch (e) {
			console.error("scServices.integration.setData : " + e);
		}
	}
}