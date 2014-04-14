var csv = require('csv');
var fs = require('fs');
var request = require('request');
var url = require('url');
var util = require('util');
var cheerio = require('cheerio');

//function to check if string contains number
function hasNumber(s) {
  return /\d/.test(s);
};



//scrapes info from page
var parsePage = function() {
	//var webPages = "T";
	var webPages = "5ABCDEFGHIJKLMNOPQRSTUVWXY";
	for (n=0; n <= webPages.length; n++) {
		var url = 'http://www.claimsconf.org/exhdirnew.cfm?EA=' + webPages[n];

		request(url, function(err, resp, body) {
			if (err)
				throw err;

		  $ = cheerio.load(body, {
			  normalizeWhitespace: true,
		    xmlMode: true
		  });

		  //get company name
		  var companyName = [];
		  $('h3').each(function(i) {
		  	companyName.push($(this).text().split(" (").shift());
		  });

		  //get contact last name
		  var contactLastName = [];
		  $('div[data-role=collapsible] p').each(function(i) {
		  	contactLastName.push($(this).html().split("<br>").shift().slice(9).split(" ").pop());
		  });

		  //get contact first name
		  var contactFirstName = [];
		  $('div[data-role=collapsible] p').each(function(i) {
		  	contactFirstName.push($(this).html().split("<br>").shift().slice(9).split(" ").shift());
		  });

		  //get company details to split further
		  var companyDetails = [];
		  $('div[data-role=collapsible] p').each(function(i) {
		  	companyDetails.push($(this).html().split("<br>"));
		  });

		  //get company street address
		  var companyAddress = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	companyAddress.push(companyDetails[i][1].trim());
		  };

		  //get company city and suite
		  var companySuite = [];
		  var companyCity = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (hasNumber(companyDetails[i][2].split(",").shift())) {
		  		companySuite.push(companyDetails[i][2]);
		  		companyCity.push(companyDetails[i][3].split(",").shift());
		  	} else {
		  		companySuite.push(" ")
		  		companyCity.push(companyDetails[i][2].split(",").shift());
		  	}
		  };
		  
		  //get company state
		  var companyState = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][2].split(", ").pop().split(" ").shift() == "") {
		  		companyState.push(companyDetails[i][3].split(", ").pop().split(" ").shift());
		  	} else {
		  		companyState.push(companyDetails[i][2].split(", ").pop().split(" ").shift());
		  	}
		  };

		  //get company zip
		  var companyZip = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][2].trim().split(" ").pop().length != 5 && companyDetails[i][2].trim().split(" ").pop().length != 10) {
		  		companyZip.push(companyDetails[i][3].trim().split(" ").pop());
		  	} else {
		  		companyZip.push(companyDetails[i][2].trim().split(" ").pop());
		  	}
		  };

		  //get company first phone number
		  var companyPhone1 = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][3].trim().length !== 12) {
		  		companyPhone1.push(companyDetails[i][4].trim());
		  	} else {
		  		companyPhone1.push(companyDetails[i][3].trim());
		  	}
		  };
		  //get company second phone number
		  var companyPhone2 = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][4].trim().length == 12 && companyDetails[i][4].trim() != companyPhone1[i]) {
		  		companyPhone2.push(companyDetails[i][4].trim());
		  	} else if (companyDetails[i][5].trim().length == 12 && companyDetails[i][5].trim() != companyPhone1[i]) {
		  		companyPhone2.push(companyDetails[i][5].trim());
		  	} else {
		  		companyPhone2.push(" ");
		  	}
		  };

		  //get company fax number
		  var companyFax = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][4].indexOf("Fax") != -1) {
		  		companyFax.push(companyDetails[i][4].trim().split(" ").pop());
		  	} else if (companyDetails[i][5].indexOf("Fax") != -1){
		  		companyFax.push(companyDetails[i][5].trim().split(" ").pop());
		  	} else if (companyDetails[i][6].indexOf("Fax") != -1){
		  		companyFax.push(companyDetails[i][6].trim().split(" ").pop());
		  	} else {
		  		companyFax.push(" ");
		  	}
		  };

		  //get company website
		  var companyWebsite = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][5].split("</a>").shift().split(">").pop().indexOf("www") != -1) {
		  		companyWebsite.push(companyDetails[i][5].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][6].split("</a>").shift().split(">").pop().indexOf("www") != -1) {
		  		companyWebsite.push(companyDetails[i][6].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][7].split("</a>").shift().split(">").pop().indexOf("www") != -1) {
		  		companyWebsite.push(companyDetails[i][7].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][4].split("</a>").shift().split(">").pop().indexOf("www") != -1) {
		  		companyWebsite.push(companyDetails[i][4].split("</a>").shift().split(">").pop());
		  	} else {
		  		companyWebsite.push(" ");
		  	}
		  };

		  var companyData = [];
		  $('div[data-role=collapsible] p').each(function(i) {
		  	companyData.push($(this).html().split(">"));
		  });

		  //get contact email
		  var contactEmail = [];
		  for (i=0; i<companyDetails.length; i++) {
		  	if (companyDetails[i][8] = "") {
		  		contactEmail.push(" ");
		  	} else if (companyDetails[i][5].split("</a>").shift().split(">").pop().indexOf('@') != -1) {
		  		contactEmail.push(companyDetails[i][5].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][6].split("</a>").shift().split(">").pop().indexOf('@') != -1) {
		  		contactEmail.push(companyDetails[i][6].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][7].split("</a>").shift().split(">").pop().indexOf('@') != -1) {
		  		contactEmail.push(companyDetails[i][7].split("</a>").shift().split(">").pop());
		  	} else if (companyDetails[i][8].split("</a>").shift().split(">").pop().indexOf('@') != -1) {
		  		contactEmail.push(companyDetails[i][8].split("</a>").shift().split(">").pop());
		  	} else {
		  		contactEmail.push(" ");
		  	}
		  };

		  //get company description 
		  


		  var companyDesc = [];
		  for (i=0; i<companyData.length; i++) {
		  	try {
			  	if (companyData[i][12].length > 50) {
			  		companyDesc.push(companyData[i][12].split("<").shift());
			  	} else if (companyData[i][13].length > 50) {
			  		companyDesc.push(companyData[i][13].split("<").shift());
			  	} else if (companyData[i][14].length > 50) {
			  		companyDesc.push(companyData[i][14].split("<").shift());
			  	} else if (companyData[i][15].length > 50) {
			  		companyDesc.push(companyData[i][15].split("<").shift());
			  	} else {
			  		companyDesc.push(" ");
			  	}
			  } catch(err) {
			  	companyDesc.push("ERROR");
			  }
		  };
			
		  //console.log(companyData);
		  //console.log(companyDesc.length);
		  //console.log(companyName.length);
		  //console.log(companyData);
		  //for (i=0;i<companyData.length; i++) {console.log(companyData[i][12].split("<").shift())}

		  //log info to array
		  var companyInfo = [];
		  for (i=0; i<companyName.length; i++) {
		  	companyInfo.push({
		  		"company_name": 		companyName[i], 
		  		"contact_l_name": 	contactLastName[i],
		  		"contact_f_name": 	contactFirstName[i],
		  		"contact_email": 		contactEmail[i],
		  		"company_address": 	companyAddress[i],
		  		"company_suite": 		companySuite[i],
		  		"company_city": 		companyCity[i],
		  		"company_state": 		companyState[i],
		  		"company_zip": 			companyZip[i],
		  		"phone_1": 					companyPhone1[i],
		  		"phone_2": 					companyPhone2[i],
		  		"fax": 							companyFax[i],
		  		"website":					companyWebsite[i],
		  		"description": 			companyDesc[i],
		  	});
		  	companyInfo.push('\r\n');
		  }
		  console.log(companyInfo);
		  
		  csv()
			.from(companyInfo)
			.to
			.stream(fs.createWriteStream('results.csv', {flags: 'a'}));
			
		});
	};
}();
