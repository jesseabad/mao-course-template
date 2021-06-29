/*
Description: JS functions for OSD-DIO training website
Author: Jabad - TLG
Filename: custom-dio.js
*
*
*/


var crsProgress = [];
var lcData;

jQuery(document).ready(function ($) {

	/*/
	=======================================
		  Click handler for course menu
	======================================
	/*/
	$("#course-menu a.list-group-item").click(function (event) {
		var link = $(this).attr("href");
		var self = $(this);
		$.ajax({
			url: link
		})
			.done(function (html) {
				//emptys the main div and adds the ajax html
				$("#main-cont")
					.empty()
					.append(html)
					.ready(function (event) {
						addPager();
						saveLink(link);
						focusOnTitle();
						addAttrKCQuestion(event);
						markCompletedPages();
						showCertificate();//init
						saveCourseProgress();//init
						setPageTitle();
						getStringQuery();
						clearQueryString();
						updateChangeLangUrl()

					})

				//functions
				addCheckIcon(self);
				toggleShowPrevNextBtn();
				showDefinitionBubble();
				loadAudioNarration($("#navData"));
				removeNoScrollClass();
				updateAriaState(self);
				closeOverlay();
				initToggleMedia();



			})
			.fail(function () {
				console.log("error");
			})
			.always(function () {
				console.log("Ajax load complete");
			});

		//IMPORTANT!: Dont delete. It will break.
		event.preventDefault();
	});

	/*=======================================
	   Check My Answer button interaction
	======================================*/

	//radio button interaction: change the href value of check-my-answer button to currosponding #question feedback
	$("input[type=radio]").click(function () {
		let ariaStr = $(this).parents().eq(2).children('section').attr("id");
		let hrefStr = "#" + ariaStr;
		updateKCPageDataCounter($(this));
		$(this).parents().eq(2).attr("data-overlayid", hrefStr);


	});

	//text area interaction: shows the "check my answer" button
	$("#txtarea").change(function () {
		let ariaStr = $(this).parents().eq(0).children('section').attr("id");
		let hrefStr = "#" + ariaStr;
		updateKCPageDataCounter($(this))
		$(this).parents().eq(0).attr("data-overlayid", hrefStr)
	});

	//cma-button interaction:
	$(".cma-button").click(function () {
		let overlayid = $(this).parents().eq(0).attr("data-overlayid");
		if (overlayid) {
			$(overlayid).trigger("open.wb-overlay")
		} else {
			$("#no-answer").trigger("open.wb-overlay");
		}
	})
	loadGlossarySection();
	addSecMenuToHamburger();
	//reloadJsOnAjax();
	//getStringQuery();
	//showResumeOptions()
})

/*/
=================================================
Loads initial ajax pages (left menu & current/page 1)
=================================================
/*/

$(window).load(function () {
	initAjax();
});

/*/
===============================================
Browsers Back/Forward button event handler
===============================================
/*/
window.addEventListener('popstate', (event) => {
	if (event) {
	} else {
		initAjax();
	}
	event.stopImmediatePropagation();
});
/*/
===================================
CUSTOM FUNCTIONS
===================================
/*/
function addPager() {
	var navbtn_html = "<p>&nbsp</p><hr><div class='pager clear-both'><button class='prevBtn' >Previous</button><button class='nextBtn'>Next</button></div>";
	var index = $("#navData").attr("data-index");
	var startIndex = 0; //index of first page
	var lastIndex = 38 //index of last page

	$("#main-cont").append(navbtn_html)
		.ready(function () {
			if (index <= startIndex) {
				$(".prevBtn").addClass("hidden");
			} else if (index >= lastIndex) {
				$(".nextBtn").addClass("hidden");
			}
		});
	//
	$(".prevBtn").on('click', function () {
		let el = "[data-pageindex=" + (parseInt(index) - 1) + "]";
		$(el).trigger("click");
		$(el).siblings("summary").trigger("click");
	})
	$(".nextBtn").on('click', function () {
		let el = "[data-pageindex=" + (parseInt(index) + 1) + "]";
		$(el).trigger("click");
		$(el).siblings("summary").trigger("click");
	});
}

/*/
===================================
Save/Retreive current url in session
===================================
/*/
function saveLink(link_) {
	window.sessionStorage.clear();
	window.sessionStorage.setItem('link', link_)
}

function getLink() {
	let pageurl = window.sessionStorage.getItem('link')
	return pageurl
}
/*/
===================================
Trigger menu item of retrieved page
===================================
/*/
function triggerMenuItem() {
	let index = $("#navData").attr("data-index");
	let el = $("[data-pageindex=" + index + "]");
	$(el).trigger("click");
	$(el).siblings("summary").trigger("click");
}

/*/
=======================================================
Loads ajax pages of course (shell,left menu & content)
=======================================================
/*/

function initAjax() {
	let pageurl = getLink();
	$.ajax({
		url: "./ajax/cs/cs-course-content.html",
		success: function (result) {
			$("#init-content").html(result);
		}
	}).done(function () {
		$.ajax({
			url: "./ajax/cs/cs-left-menu.html",
			success: function (result) {
				$("#wb-sec").html(result);
				pressEnterSpacebarHandler();
				addDescribedByOnToggle();
			}
		});
	}).done(function () {
		let html = "./ajax/cs/s1-p1-key-features.html";
		if (pageurl) {
			html = pageurl;
		}
		$.ajax({
			url: html,
			success: function (result) {
				$("#main-cont").html(result);
				addPager();
				triggerMenuItem();
			}
		})
	});
}

/*/
=============================
Adds check icon on menu item
==============================
/*/
function addCheckIcon(self) {
	//adds a check symbol to the menu item if there's none yet
	if (!self.attr("hasCheck") && self.attr("id") != "prevBtn" && self.attr("id") != "nextBtn") {
		$("<span class='glyphicon glyphicon-ok'></span>").appendTo(self);
		self.attr("hasCheck", true);
	};
}

/*/
==============================
Glossary bubble definitions
==============================
/*/

function showDefinitionBubble() {
	$(document).on("ajaxComplete", function () {

		$(".terms").off().on('click', function () {
			var data_terms = $(this).attr("data-terms");
			var class_ = "bubble";
			var selector = "#" + data_terms + "." + class_; // i.e., $("#acessibility.bubble");
			var selector_text = $(".dfn-" + data_terms);
			var text_content = $(selector_text).html();
			var title = data_terms.replaceAll("-", " ");
			var termObj = $("[data-terms='" + data_terms + "']");
			var termObjOffset = termObj.offset();

			switch (title) {
				case "The Accessibility for Manitobans Act":
					title = "The Accessibility for Manitobans Act (AMA)";
					break;
				case "disability people with disabilities":
					title = "Disability (People with Disabilities)";
					break;
				case "accommodations reasonable accommodations":
					title = "Accommodations (Reasonable Accommodations)";
					break;
			}

			var html_ = "<span tabindex='0' id='" + data_terms + "' class='" + class_ + "' aria-label='Glossary term' role='dialog'><button href='#' class='bubble-close-btn' aria-label='close button'></button><p class='term-title' tabindex='0'>" + title + "</p><p>" + text_content + "</p><a tabindex=0 class='close-btn-link' aria-label='close button' href='javascript:void(0)' onclick='return false' style='color: white'>close</a></span>"
			let focused = $(document.activeElement)

			$(".bubble").remove();

			if (!$(this).hasClass('visible')) {
				$(html_).appendTo($("[data-terms='" + data_terms + "']").parents().eq(0)).ready(function () {
					var tabHandle = ally.maintain.tabFocus({ context: $("span.bubble") })
					setTimeout(function () {
						$(".term-title").parents().eq(0).attr("tabindex", "0");
						$(".term-title").parents().eq(0).addClass("no-outline");
						$(".term-title").parents().eq(0).focus();
					}, 500);

					$("[aria-label='close button']").click(function () {
						setTimeout(function () {
							$(".terms").removeClass("visible");
						}, 10);

						$(this).parent().remove();
						tabHandle.disengage();
						focused.focus();
					})

				});

				//defines the position of popup/bubble relative to the term link
				$("#" + data_terms).offset({
					top: termObjOffset.top + 30,
					left: termObjOffset.left + 20
				})
			}

			escKeyToClose();
		});
	})

}



/*/
==========
Load audio links from ajax page
====================
/*/

function loadAudioNarration(obj) {
	let element = obj
	let audioLink = element.attr("data-audio-link");
	$("#playListener").attr("href", audioLink);
	$("#playListener").attr('style', 'display:inline-block')
	$("#jPlayerForReader").attr("src", audioLink);
	$("#jp_audio_0").attr("src", audioLink);
	$("#pauseListener").attr("style", "display:none");
	$("img#jp_poster_0").attr("alt", "audio");

}


/*/
============================================
Focus to H1 of main-cont after ajax
scrollToTop
============================================
/*/

function focusOnTitle() {
	$("#main-cont>section>h1").attr("tabindex", "-1");
	setTimeout(function () {
		$("#main-cont>section>h1").focus();
	}, 500)
}

function loadGlossarySection() {
	$("#glossary-menu-button").click(function (e) {
		e.stopImmediatePropagation();
		$("#glossary-container").attr("data-ajax-replace", "./ajax/cs/cs-glossary.html");
		setTimeout(function () {
			$("[data-ajax-replace]").trigger("wb-init.wb-data-ajax")
		}, 0);

		$("#right-panel.wb-overlay").trigger("open.wb-overlay");
		//$(document.body).addClass("noscroll");

		$("mfp-close.overlay-close").click(function () {
			removeNoScrollClass();
		})
	})
}

function addSecMenuToHamburger() {
	$(window).resize(function (e) {
		if (this.innerWidth <= 990) {
			$("#sec-pnl").attr("data-ajax-replace", "./ajax/cs/cs-left-menu.html");
			setTimeout(function () {
				$("[data-ajax-prepend]").trigger("wb-init.wb-data-ajax");
			}, 1000);
		}
	})
}

function removeNoScrollClass() {
	$(document).on("closed.wb-overlay", ".wb-overlay", function () {
		$(document.body).removeClass("noscroll");
	});

}

function closeOverlay() {
	$(".wb-overlay").trigger("close.wb-overlay");
}

function escKeyToClose() {
	$(document).keyup(function (evt) {
		if (evt.keyCode === 27 || evt.which === 27 || evt.key === "Escape") {
			$(".bubble-close-btn").click()
		}
	})
}

function trapFocus() {
	$(document).keyup(function (evt) {
		let actvEl = document.activeElement;
		let classList = actvEl.classList;
		if (evt.keyCode === 9 || evt.which === 9 || evt.key === "Tab") {
			if (classList.toString() === "close-btn-link") {
				$("button.bubble-close-btn").focus();
			} else if (evt.shiftKey && classList.toString() === "bubble-close-btn") {
				$("a.close-btn-link").focus();
			}
		}
	})
}

function pressEnterSpacebarHandler() {
	$(document).keyup(function (evt) {
		let actvElement = $(document.activeElement);
		let localName = actvElement[0].localName;
		//let actvClass = actvElement.attr("class");
		//let actvId = actvElement.attr("id");
		let actvParent = actvElement.parent();
		//let pageIndex = actvElement.attr("data-pageIndex");

		if (evt.key === "Enter" || evt.which === 13 || evt.keyCode === 13 || evt.code === "Enter" ||
			evt.key === "Space" || evt.which === 32 || evt.keyCode === 32 || evt.code === "Space") {
			if (localName === "li" && actvParent.hasClass("accordion")) {
				actvElement.find(".wb-toggle").trigger("click")
			}
		}
	})
}

function addDescribedByOnToggle() {
	$(".wb-toggle").on("toggle.wb-toggle", function (event) {
		//$(event.target).attr("aria-describedby", "tabon");
	});
}

function toggleShowPrevNextBtn() {
	//hides the Previous button when on the 1st page
	if ($("#navData").attr("data-index") == 0) {
		$("#prevBtn").addClass("hidden");
	} else {
		$("#prevBtn").removeClass("hidden");
	}
	//hides the Next button when on the last page 
	if ($("#navData").attr("data-index") == 38) {
		$("#nextBtn").addClass("hidden");
	} else {
		$("#nextBtn").removeClass("hidden");
	}
}

function updateAriaState(obj) {
	let siblings_ = obj.parent().children("[aria-selected]:not('summary')");
	let children = obj.parents().eq(2).find("a.list-group-item");
	children.removeAttr("aria-selected");
	obj.attr("aria-selected", "true");
}

function resetCert() {
	$("#resetCert").click(() => {
		sessionStorage.setItem("certStatus", '')
	})
}

function updateKCPageDataCounter(el) {
	var counter;

	switch (el[0].localName) {
		case "textarea":
			counter = parseInt(el.parents().eq(1).attr("data-counter"));
			if (!el.parents().eq(0).attr("data-overlayid")) {
				counter = counter + 1;
				el.parents().eq(1).attr("data-counter", counter);
			}
			break;
		case "input":
			counter = parseInt(el.parents().eq(3).attr("data-counter"));
			if (!el.parents().eq(2).attr("data-overlayid")) {
				counter = counter + 1;
				el.parents().eq(3).attr("data-counter", counter);
			}
			break;
	}
}


function addAttrKCQuestion() {
	let sectionEl = $("#main-cont>section[data-counter]");
	let qstnNum = sectionEl.find(".cma-button").length;
	sectionEl.attr("qstn-num", qstnNum);
}


function showCertificate() {
	let kcstatus = document.cookie;
	if (kcstatus) {
		$("#congrats-box").removeClass("hidden");
	}
	$(document).on("closed.wb-overlay", ".wb-overlay", function (evt) {
		let parentSection = $(evt.target).parents().closest("[data-counter]");
		let self = $(evt.target);
		let id = self.attr("id");
		if (id === "question-4" || id === "question-3" || id === "question-2" || id === "question-1") {
			if (parentSection.attr("data-counter") === parentSection.attr("qstn-num")) {
				$("#congrats-box").removeClass("hidden");
				document.cookie = "finalkc-status=completed";
			}
		}
	})
}

function initClearCourseProgress() {
	$("button[aria-label='Restart']").click(function () {
		localStorage.setItem("courseProgress", null);
		//console.log("progress data has been erased");
		$('.resumeDialogBox').remove();
		location.reload();
	})
}

function saveCourseProgress() {
	let pageIndex = parseInt($("#navData").attr("data-index"));
	let data = getCourseProgress();

	if (data) {
		crsProgress = data;
		//console.log("indexOf:" + pageIndex + "|" + crsProgress.indexOf(pageIndex))
		if (crsProgress.indexOf(pageIndex) == -1) {
			crsProgress.push(pageIndex);
			localStorage.setItem('courseProgress', JSON.stringify(crsProgress));
			//console.log("data has been addded");
		}
	} else {
		localStorage.setItem('courseProgress', "[" + pageIndex + "]");
		//console.log("getCourseProgress-else:" + getCourseProgress())
	}
}

function getCourseProgress() {
	if (localStorage.getItem("courseProgress")) {
		let data = localStorage.getItem("courseProgress");
		//console.log("data:" + data);
		return JSON.parse(data)
	} else {
		localStorage.setItem("courseProgress", "[]")
	}

}

function markCompletedPages() {
	let data = getCourseProgress();
	clearCheckIcon();
	if (data) {
		for (let i = 0; i < data.length; i++) {
			let selector = "[data-pageindex='" + data[i] + "']";
			setTimeout(addCheckIcon($(selector)), 2000)
		}
	}
}

function showResumeOptions() {
	let data = getCourseProgress();
	if (data) {
		//console.log("showResumeOptions:data:" + data);
		let restartBtn = "<button aria-label='Restart'>Restart</button>";
		let resumeBtn = "<button aria-label='Resume'>Resume</button>"
		let html = "<div class='resumeDialogBox'>" + resumeBtn + restartBtn + "</div>"

		if ($(".cs-page")) {
			//console.log("main.cs-page:" + $("main.cs-page"));
			$(".cs-page").append(html);
		}
	}
	//init restart and resume buttons
	initClearCourseProgress();
	initResumeCourse();
}

function initResumeCourse() {
	$(".resumeDialogBox>button[aria-label='Resume']").click(function () {
		$('.resumeDialogBox').remove();
		//console.log("course data preserved")
	})
}


function getStringQuery() {
	//index from str query;
	let url = window.location.href
	let index = url.split("=")[1];
	if (index) {
		let selector = "[data-pageindex='" + index + "']";
		$(selector).trigger("click");
		$(selector).siblings("summary").trigger("click");

		//console.log($(selector));
	}
}

function setQueryString() {
	var index = $("#navData").attr("data-index");
	history.pushState('', '', "?page=" + index + "")
}

function clearQueryString() {
	var uri = window.location.href.toString();
	if (uri.indexOf("?") > 0) {
		var clean_uri = uri.substring(0, uri.indexOf("?"));
		window.history.replaceState({}, document.title, clean_uri);
	}
}

function setPageTitle() {
	let title = $("H1").text();
	$("title").text(title)
	//console.log("title:" + title)
}

function clearCheckIcon() {
	//console.log("a length:" + $("#course-menu .list-group-item").length);
	//console.log("span length:" + $("#course-menu .list-group-item>span").length);
	$("#course-menu .list-group-item").removeAttr("hasCheck");
	$("#course-menu .list-group-item>span").remove();
}


function initToggleMedia() {
	if ($("#mv-video").length) {
		//console.log("has video");
		$("#mv-video").on("play", function () {
			//console.log("video playing");
			$("a#pauseListener").click();
		});

		$("a#playListener").click(function () {
			//console.log("sdds");
			var media = $("#mv-video").get(0);
			media.pause();
		});


	}
}

function updateChangeLangUrl() {

	$("#main-cont").ready(function () {
		var selector = $(".footer-nav>li:nth-child(2)>a");
		var index = $("#navData").data("index");

		if ($(".footer-nav>li:nth-child(2)>a").attr("href").indexOf("?") > -1) {
			var url = selector.attr("href").split("?")[0];
		} else {
			var url = selector.attr("href");
		}

		
		var href = url + "?page=" + index;
		selector.attr("href", "");
		selector.attr("href", href);
		console.log("updateChangeLang")
	})
}


