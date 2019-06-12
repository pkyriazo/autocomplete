var KEYUP_TIMEOUT = 1000; // Timeout after the user stops typing and the fetchResults function is triggered

var searchTimeout,
	searchInput = $('#search input'),
	resultsList = $('#results ul'),
	resultsHint = $('#results-hint'),
	stringIsCached,
	cachedResults,
	searchBtn = $('#search-btn a'),
	initialSearch,
	screenTarget;

function checkScreen() {
	$('#banner-left').css('display') == 'none' ? screenTarget = 0 : screenTarget = 1;
}

// Detect the search value language
function detectLanguage(s) {
	var lang = 'en';
	// Check every character in ste string
	// If at least one of them is greek then classify the language as Greek
	for (var i = 0; i < s.length; i++) {
		// charCode values as seen at https://www.w3schools.com/charsets/ref_utf_greek.asp
		if (s[i].charCodeAt(0) >= 880 && s[i].charCodeAt(0) <= 1023) {
			lang = 'el';
			break;
		}
	}
	return lang;
}

function saveToCookie(str, data) {
	var d = new Date();
	d.setTime(d.getTime() + (5*60*1000));
	document.cookie = str + '=' + JSON.stringify(data) + ';expires=' + d.toUTCString();
}

function checkForCookie(str) {
	var cookies = document.cookie.split(';');
	stringIsCached = false;
	for (var i = 0; i < cookies.length; i++) {
		var cookieName = $.trim(cookies[i].split('=')[0]);
		if (cookieName == str) {
			cachedResults = JSON.parse(cookies[i].split('=')[1]);
			stringIsCached = true;
			break;
		}
	}
}

function clearResults() {
	resultsList.html('');
}

function updateResults(results) {
	resultsHint.text('');
	for (var i = 0; i < results.length; i++) {
		resultsList.append('<li>' + results[i]['name'] + '</li>');
	}
	if (results.length == 0) {
		resultsHint.text('No results returned')
	}
	resultsList.find('li').click(function(event) {
		resultClicked(event);
	});
}

function resultClicked(e) {
	var resultText = $(e.target).text(),
		targetIsSelected = $(e.target).hasClass('selected');
	if (resultsList.find('li.selected').length == 0) {
		initialSearch = searchInput.val();
	}
	if (targetIsSelected) {
		searchInput.text(initialSearch);
		searchInput.val(initialSearch);
		searchBtn.removeClass('visible');
		$(e.target).removeClass('selected');
		searchInput.focus();
		searchBtn.attr('href', '#');
	} else {
		resultsList.find('li').each(function(index, el) {
			$(el).removeClass('selected');
		});
		$(e.target).addClass('selected');
		searchInput.text(resultText);
		searchInput.val(resultText);
		searchBtn.hasClass('visible') ? null : searchBtn.addClass('visible');
		searchBtn.attr('href', 'http://google.com/search?q=' + resultText);
	}
}

function fetchResults(inputString) {
	var resultsLimit;
	screenTarget == 0 ? resultsLimit = 10 : resultsLimit = 20;
	var inputLang = detectLanguage(inputString),
		searchString = 'http://35.180.182.8/search?keywords=' + inputString + '&language=' + inputLang + '&limit=' + resultsLimit;
	checkForCookie(inputString);
	if (stringIsCached) {
		updateResults(cachedResults);
		console.log(inputString, 'Cookie');
	} else {
		$.getJSON(searchString, function(data) {
			console.log(inputString, 'Fetch');
			saveToCookie(inputString, data.entries);
			updateResults(data.entries);
		});
	}
}

function search(inputString) {
	clearResults();
	fetchResults(inputString);
}

jQuery(document).ready(function($) {
	checkScreen();
	searchInput.keyup(function(event) {
		// Clear any previously initiated timeout
		clearTimeout(searchTimeout);

		var inputString = searchInput.val();

		clearResults();
		resultsHint.text('');
		if (inputString.length > 1) {
			resultsHint.text('Searching');
			searchTimeout = setTimeout(function() { search(inputString) }, KEYUP_TIMEOUT);
		} else if (inputString.length == 1) {
			resultsHint.text('Type at least 2 characters');
		}
	});
	$(window).resize(function(event) {
		checkScreen();
	});
});