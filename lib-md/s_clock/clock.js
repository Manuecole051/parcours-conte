scServices.clock = scOnUnloads[scOnUnloads.length] = {
	fStartTime : new Date(),
	fClocks : {},

	/* === Public API =========================================================== */
	// format : counter, shorttime, longtime, date
	init : function(pElt, pOpts) {
		var vClocks = pOpts.initClock ? pOpts.initClock() : scServices.suspendDataStorage.getVal(["clocks"]);
		if (vClocks) this.fClocks = vClocks;

		var vOpts = {
			format 		        : "shorttime",
			countdown	        : false,
			time 		        : 0,
			autostart	        : true,
			date 		        : null,
			reset		        : false,
			id 			        : 0,
			overwriteSaveClock : null,
			// Attention : si false pas de rappel du temps possible quand on revient sur la page
			saveonunload : true,
			callbacks	: {
				init : function() {},
				start : function() {},
				stop : function() {},
				pause : function() {},
				reset : function() {},
				interval : function() {}
			}
		};
		if (typeof pOpts != "undefined") {
			if (typeof pOpts.saveonunload != "undefined") vOpts.saveonunload = pOpts.saveonunload;
			if (typeof pOpts.format != "undefined") vOpts.format = pOpts.format;
			if (typeof pOpts.countdown != "undefined") vOpts.countdown = pOpts.countdown;
			if (typeof pOpts.time != "undefined") vOpts.time = pOpts.time;
			if (typeof pOpts.date != "undefined") vOpts.date = pOpts.date;
			if (typeof pOpts.autostart != "undefined") vOpts.autostart = pOpts.autostart;
			if (typeof pOpts.reset != "undefined") vOpts.reset = pOpts.reset;
			if (typeof pOpts.id != "undefined") vOpts.id = pOpts.id;
			if (typeof pOpts.overwriteSaveClock != "undefined") vOpts.overwriteSaveClock = pOpts.overwriteSaveClock;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.init != "undefined") vOpts.callbacks.init = pOpts.callbacks.init;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.start != "undefined") vOpts.callbacks.start = pOpts.callbacks.start;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.stop != "undefined") vOpts.callbacks.stop = pOpts.callbacks.stop;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.pause != "undefined") vOpts.callbacks.pause = pOpts.callbacks.pause;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.reset != "undefined") vOpts.callbacks.reset = pOpts.callbacks.reset;
			if (typeof pOpts.callbacks != "undefined" && typeof pOpts.callbacks.interval != "undefined") vOpts.callbacks.interval = pOpts.callbacks.interval;
		}
		this.fSaveOnUnload = vOpts.saveonunload;
		this.fOverwriteSaveClock = vOpts.overwriteSaveClock;

		if(!this.fClocks[vOpts.id]) this.fClocks[vOpts.id] = {};
		this.fClock = this.fClocks[vOpts.id];

		this.fClock.fOpts = vOpts;
		this.fClock.fElt = pElt;

		this.fClock.reset = function(pCallBack) {
			scServices.clock.fStartTime = new Date();
			this.fOpts.callbacks.reset();
			if (pCallBack) pCallBack();
		};

		this.fClock.start = function(pCallBack) {
			scServices.clock.deleteTimers();
			if(!scServices.scPreload) scServices.clock.xTick();
			if (this.fOpts.autostart) {
				this.fTimer = setInterval(function() {
					scServices.clock.xTick();
				}, 1000);
			}
			this.fOpts.callbacks.start();
			if (pCallBack) pCallBack();
		};

		this.fClock.interval = function(pCallBack) {
			this.fPassedTime = this.getPassedTime("millisecond");
			this.fRemainingTime = this.getRemainingTime("millisecond");
			this.fOpts.callbacks.interval();
			if (pCallBack) pCallBack();
		};

		this.fClock.stop = function(pCallBack) {
			this.fOpts.callbacks.stop();
			if (pCallBack) pCallBack();
		};

		this.fClock.pause = function(pCallBack) {
			this.fPausedTime = this.fPassedTime;
			this.fOpts.callbacks.pause();
			if(scServices.scPreload) scServices.clock.xTick();
			if (pCallBack) pCallBack();
		};

		this.fClock.setElement = function(pElt) {
			this.fElt = pElt;
			this.fElt.innerHTML = scServices.clock.fFormatTime;
		};

		this.fClock.setTime = function(pTime) {
			this.fOpts.time = pTime;
		};

		this.fClock.setCountDown = function(pIsCountDown) {
			this.fOpts.countdown = pIsCountDown;
		};

		this.fClock.setDate = function(date) {
			this.fOpts.date = date;
		};

		this.fClock.setFormat = function(pFormat) {
			this.fOpts.format = pFormat;
		};

		this.fClock.getRemainingTime = function(pFormat) {
			var vTime;
			switch(pFormat) {
			case "millisecond":
				if(scServices.clock.fTime) vTime = scServices.clock.fTime.getTime();
				break;
			case "second":
				if(scServices.clock.fTime) vTime = scServices.clock.fTime.getTime() / 1000;
				break;
			case "percent":
				if(scServices.clock.fTime) vTime = (scServices.clock.fTime.getTime() / 1000) * 100 / this.fOpts.time;
				break;
			case "longtime":
				if(scServices.clock.fTime) vTime = scServices.clock.xFormatTime(scServices.clock.fTime, "longtime", this.fOpts.date);
				break;
			default:
				vTime = scServices.clock.fFormatTime;
			}
			return vTime;
		};

		this.fClock.getPassedTime = function(pFormat) {
			var vTime;
			switch(pFormat) {
			case "millisecond":
				vTime = this.fOpts.time * 1000 - this.getRemainingTime("millisecond");
				break;
			case "second":
				vTime = this.fOpts.time - this.getRemainingTime("second");
				break;
			case "percent":
				vTime = 100 - this.getRemainingTime("percent");
				break;
			default:
				vTime = 0;
			}
			return vTime;
		};

		this.fClock.reset();
		this.fClock.start();
		this.fClock.fOpts.callbacks.init();

		return this.fClock;
	},

	// En secondes
	getPassedTimeById : function(pId) {
		var vPassedTime = 0;
		if(pId) vPassedTime = this.fClocks[pId] ? this.fClocks[pId].fPassedTime : 0;
		else {
			var vPassedTimeTemp = 0;
			for (var i in this.fClocks) {
				var vClock = this.fClocks[i];
				if(vClock.fPassedTime > vPassedTimeTemp) vPassedTime = vClock.fPassedTime;
				vPassedTimeTemp = vClock.fPassedTime;
			}
		}
		return Math.round(vPassedTime / 1000);
	},

	// En secondes
	getRemainingTimeById : function(pId) {
		var vRemainingTime = 0;
		if(pId) vRemainingTime = this.fClocks[pId] ? this.fClocks[pId].fRemainingTime : 0;
		else {
			var vRemainingTimeTemp = 0;
			for (var i in this.fClocks) {
				var vClock = this.fClocks[i];
				if(vClock.fRemainingTime > vRemainingTimeTemp) vRemainingTime = vClock.fRemainingTime;
				vRemainingTimeTemp = vClock.fRemainingTime;
			}
		}
		return Math.round(vRemainingTime / 1000);
	},

	// Delete all timers
	deleteTimers : function() {
		for (var i in this.fClocks) {
			var vClock = this.fClocks[i];
			if (vClock.fTimer) {
				clearInterval(vClock.fTimer);
				vClock.fTimer = false;
			}
		}
	},

	resetAll : function() {
		this.fClocks = {};
		this.fStartTime = new Date();
	},

	save : function() {
		this.fClock.pause();
		if (this.fOverwriteSaveClock) this.fOverwriteSaveClock();
		else if(scServices.suspendDataStorage && scServices.storage.isStorageActive()) {
			scServices.suspendDataStorage.setVal(["clocks"], scServices.dataUtil.deserialiseObjJs(scServices.dataUtil.serialiseObjJs(this.fClocks)));
			scServices.suspendDataStorage.commit();
		}
	},


	/* === Private =========================================================== */
	xGetLastPausedTime : function() {
		var vAllPausedTimes = [];

		for (var i in this.fClocks) {
			var vClock = this.fClocks[i];
			if (vClock.fPausedTime) vAllPausedTimes.push(vClock.fPausedTime);
		}
		return vAllPausedTimes.length ? Math.max.apply(Math, vAllPausedTimes) : 0;
	},

	xTick : function() {
		var vTime = new Date();
		var vPassedTime = vTime - this.fStartTime + (this.fClock.fOpts.reset && this.fClock.fPausedTime ? this.fClock.fPausedTime : !this.fClock.fOpts.reset ? this.xGetLastPausedTime() : 0);
		var vAddTime = this.fClock.fOpts.time * 1000;
		vTime.setTime(!this.fClock.fOpts.countdown ? vAddTime + vPassedTime : vAddTime - vPassedTime);
		if(this.fClock.fOpts.date) vTime.setTime(this.fClock.fOpts.date.getTime() + vTime.getTime());
		if(vTime.getTime() > 0) {
			this.fTime = vTime;
			this.fFormatTime = this.xFormatTime(vTime, this.fClock.fOpts.format, this.fClock.fOpts.date);
			if (this.fClock.fElt) this.fClock.fElt.innerHTML = this.fFormatTime;
			this.fClock.interval();
		}
		else this.fClock.stop();
		if(!this.fClock.fOpts.autostart) this.deleteTimers();
	},

	xFormatTime : function(pTime, pFormat, pIsClock) {
		// var vY = pTime.getUTCFullYear();
		// var vMo = pTime.getUTCMonth() + 1;
		// var vD = pTime.getUTCDate();
		var vStr;
		var vH = pIsClock ? pTime.getUTCHours() + 1 : pTime.getUTCHours();
		var vM = pTime.getUTCMinutes();
		var vS = pTime.getUTCSeconds();
		if(pFormat=="shorttime") vStr = (vH > 0 ? (vH > 9 ? "<span class='hour_span'>" : "<span class='hour_span'>0") + vH + "</span>:" : "") + (vM > 9 ? "<span class='min_span'>" : "<span class='min_span'>0") + vM + (vS > 9 ? "</span>:<span class='sec_span'>" : "</span>:<span class='sec_span'>0") + vS + "</span>";
		else if(pFormat=="longtime") vStr = (vH > 0 ? (vH > 9 ? "<span class='hour_span'>" : "<span class='hour_span'>0") + vH + " heures</span> " : "") + (vM > 0 ? (vM > 9 ? "<span class='min_span'>" : "<span class='min_span'>0") + vM + " minutes</span> " : "") + (vS > 0 ? (vS > 9 ? "<span class='sec_span'>" : "<span class='sec_span'>0") + vS + " secondes</span> " : "");
		else if(pFormat=="date") vStr = pTime.toLocaleDateString();
		else if(pFormat=="counter") vStr = Math.round(pTime.getTime()/1000);
		return(vStr);
	},

	loadSortKey: "1clock"
};

window.addEventListener("beforeunload", function() {
	if (scServices.clock.fSaveOnUnload) {
		scServices.clock.save();
	}
});