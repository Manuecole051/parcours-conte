/* ========== Countdown manager ================================================ */
window.countDownMgr = {
	fRgtPath : 'des:.stepTools',
	fArcPath : 'ide:arc',
	fTopPath : 'ide:header',
	fCoachPath : 'ide:coachBk',
	fCountDownImgPath : 'ide:countDownImg',
	fStrings : ['Fin','Vous avez atteint la fin du parcours.'],

	init : function(){
		// Delete tous les timers à chaque loading car le preload fait passer l'init de la page courante avant le pageHide de la page précédente
		scServices.clock.deleteTimers();
		if(!this.fTime) return;

		// Init variables
		let vDurationVisibility, vIntervalVisibility;
		const vRgt = scPaLib.findNode(this.fRgtPath);
		const vCoach = scPaLib.findNode(this.fCoachPath);
		const vArc = scPaLib.findNode(this.fArcPath, vRgt);
		const vTop = scPaLib.findNode(this.fTopPath);
		let vCounter = 1;
		const vPosition = !this.fDisplay || this.fDisplay === "top" ? vTop : vRgt;

		// Set Class
		const vIsCoachClass = scPaLib.findNode("chi:img", vCoach) ? " isCoach" : "";
		const vCountDownPositionClass = !this.fDisplay ? " top" : " " + this.fDisplay;
		const vCoutDownVisibilityClass = (!this.fVisibility || this.fVisibility === "visible") && !this.fCustomVisibility ? " display_yes" : " display_no";
		const vCountDownAppearanceClass = !this.fAppearance ? " discreet" : " " + this.fAppearance;
		const vCountDownBk = scDynUiMgr.addElement("div", vPosition, "countDownBk" + vCountDownPositionClass + vCountDownAppearanceClass + vIsCoachClass + vCoutDownVisibilityClass);
		let vProgressBar;
		if(this.fAppearance === "progressBar") {
			vProgressBar = scDynUiMgr.addElement("div", vCountDownBk, "progress");
			vProgressBar.setAttribute("data-max", 100);
		}
		const vCountDownDiv = scDynUiMgr.addElement("div", vCountDownBk, "countDownDiv");

		// Set CountDownImg Blocks
		if(this.fImages && this.fImages.length) {
			const vCountDownImgBk = scPaLib.findNode(this.fCountDownImgPath);
			vCountDownImgBk.className = vIsCoachClass;
			if (vArc) {
				vArc.style.bottom = "136px";
				vArc.style.borderBottomStyle = "dotted";
				vArc.style.borderBottomWidth = "1px";
			} else vCountDownImgBk.className += " isHome";
			scDynUiMgr.addElement("div", vCountDownImgBk);
		}

		// Set countdown
		this.fClock = scServices.clock.init(vCountDownDiv, {
			countdown: true,
			reset: this.fReset,
			time: this.fTime,
			id: topazeMgr.fNodeId,
			autostart: topazeMgr.fNodeType === "case" ? this.fReset : true,
			callbacks: {
				stop: function () {
					if (countDownMgr.fActionAfterCountDown === 'end') {
						const vBarClassName = vRgt.className.indexOf("Open") !== -1 ? "barOpened" : "barClosed";
						vRgt.className = vBarClassName + " endArcFra";
						vArc.innerHTML = '<div class="arcBk endArc"><h1 class="arcBk_ti"><span>' + countDownMgr.fStrings[0] + '</span></h1><div class="arcBk_co "><div class="endMsg">' + countDownMgr.fStrings[1] + '</div></div></div>';
					} else if (!isNaN(countDownMgr.fActionAfterCountDown) && countDownMgr.fClock) {
						if (vCounter < countDownMgr.fActionAfterCountDown || countDownMgr.fActionAfterCountDown === 0) {
							countDownMgr.fClock.reset();
							countDownMgr.fClock.start();
							vCounter++;
						}
					} else if (scServices.scPreload) scServices.scPreload.goTo(scServices.scLoad.resolveDestUri("/co/" + countDownMgr.fActionAfterCountDown));
					else window.location.href = scServices.scLoad.resolveDestUri("/co/" + countDownMgr.fActionAfterCountDown);
				},
				interval: function () {
					if (countDownMgr.fClock) {
						// Progress bar
						if (vProgressBar) {
							const vProgressBarValue = Math.round(countDownMgr.fClock.getPassedTime("percent") * 100) / 100;
							vProgressBar.setAttribute("data-value", vProgressBarValue);
							vProgressBar.style.setProperty("--width", vProgressBarValue + "%");
						}
						// Progressive
						if (countDownMgr.fAppearance === "progressive") vCountDownDiv.style.fontSize = Math.round((100 - countDownMgr.fClock.getRemainingTime("percent")) * 100) / 100 + 135 + "%";
						// Custom visibility
						const vTime = Math.round(countDownMgr.fClock.getRemainingTime("second"));
						if (countDownMgr.fCustomVisibility && vTime === countDownMgr.fCustomVisibility.firstappearance) {
							countDownMgr.xSwitchClass(vCountDownBk, "display_no", "display_yes", true);
						}
						if (!vDurationVisibility && countDownMgr.fCustomVisibility && countDownMgr.fCustomVisibility.durationvisibility && vCountDownBk.className.indexOf("display_yes") !== -1) {
							if (vIntervalVisibility) {
								clearInterval(vIntervalVisibility);
								vIntervalVisibility = false;
							}
							vDurationVisibility = setInterval(function () {
								countDownMgr.xSwitchClass(vCountDownBk, "display_yes", "display_no", true);
							}, countDownMgr.fCustomVisibility.durationvisibility * 1000);
						}
						if (vDurationVisibility && !vIntervalVisibility && countDownMgr.fCustomVisibility && countDownMgr.fCustomVisibility.intervalvisibility && vCountDownBk.className.indexOf("display_no") !== -1) {
							clearInterval(vDurationVisibility);
							vDurationVisibility = false;
							vIntervalVisibility = setInterval(function () {
								countDownMgr.xSwitchClass(vCountDownBk, "display_no", "display_yes", true);
							}, countDownMgr.fCustomVisibility.intervalvisibility * 1000);
						}
						if (vTime === 0) {
							if (vDurationVisibility) clearInterval(vDurationVisibility);
							if (vIntervalVisibility) clearInterval(vIntervalVisibility);
						}
						// Set CountDownImg Images - et surtout remettre le choix heure seconde etc sur le model ... !!!! voir pour améliorer avec une comparaison sur la source
						if (countDownMgr.fImages && countDownMgr.fImages.length) {
							for (let i = 0; i < countDownMgr.fImages.length; i++) {
								const vImg = countDownMgr.fImages[i];
								if (vTime <= vImg.time && !vImg.seen) {
									vCountDownImgDiv.innerHTML = "";
									scDynUiMgr.addElement("img", vCountDownImgDiv).src = vImg.src;
									vImg.seen = true;
								}
							}
						}
					}
				}
			}
		});

		scCoLib.addEventsHandler(countDownMgr);
	},

	onPageHide : function(){
		this.fClock.pause();
	},

	/* === Utilities ============================================================ */
	/** countDownMgr.xSwitchClass - replace a class name. */
	xSwitchClass : function(pNode, pClassOld, pClassNew, pAddIfAbsent, pMatchExact) {
		const vAddIfAbsent = typeof pAddIfAbsent == "undefined" ? false : pAddIfAbsent;
		const vMatchExact = typeof pMatchExact == "undefined" ? true : pMatchExact;
		const vClassName = pNode.className;
		const vReg = new RegExp("\\b" + pClassNew + "\\b");
		if (vMatchExact && vClassName.match(vReg)) return;
		let vClassFound = false;
		if (pClassOld && pClassOld !== "") {
			if (vClassName.indexOf(pClassOld)===-1){
				if (!vAddIfAbsent) return;
				else if (pClassNew && pClassNew !== '') pNode.className = vClassName + " " + pClassNew;
			} else {
				const vCurrentClasses = vClassName.split(' ');
				const vNewClasses = [];
				let i = 0;
				const n = vCurrentClasses.length;
				for (; i < n; i++) {
					const vCurrentClass = vCurrentClasses[i];
					if (vMatchExact && vCurrentClass !== pClassOld || !vMatchExact && vCurrentClass.indexOf(pClassOld) !== 0) {
						vNewClasses.push(vCurrentClasses[i]);
					} else {
						if (pClassNew && pClassNew !== '') vNewClasses.push(pClassNew);
						vClassFound = true;
					}
				}
				pNode.className = vNewClasses.join(' ');
			}
		}
		return vClassFound;
	},

}