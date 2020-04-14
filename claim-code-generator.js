const indent1 = "\n    ";
const newline = "\n";
const newlineDouble = "\n\n";
const leftBracket = "&#91;";
const rightBracket = "&#93;";

function generateClaimCode() {
    const formId = this.getAttribute("form");
    const form = document.getElementById(formId);

    // get a handle on the place the code needs to go
    const resultBox = document.getElementById("claim-generator-result").querySelector("code"); // demo version, comment out when actually using
    // const resultBox = document.getElementById("claim-generator-result").querySelector("td#code"); // real version

    // clear any past results
    resultBox.innerHTML = "";

    let errors = [];

    let fields = {
        text: [
            "writer-alias"
            , "face-claim"
            , "member-group"
            , "character-name"
            , "lab-description"
            , "lab-name"
            , "occupation"
            , "requester"
            , "request-location"
            , "profile-url"
        ], bool: [
            "is-lab-lead"
            , "is-new-lab"
        ]
    };

    let input = {};

    function isInForm(name) {
        return (!!form.elements[name]);
    }

    class claimText {
        constructor(name) {
            this.value = form.elements[name].value;
            this.required = form.elements[name].required;
            this.prettyName = name.replace(/-/g, " ");
        }
    }

    function claimBool(name) {
        return form.elements[name].value == "true";
    }

    // pull input from form
    for (const type in fields) {
        const list = fields[type];

        for (const name of list) {
            if (!isInForm(name)) {
                errors.push(`ERROR: Could not find field with name "${name}" in form. Contact admin`);
            } else {
                switch(type) {
                    case "text":
                        input[name] = new claimText(name);
                        break;
                    case "bool":
                        input[name] = claimBool(name);
                        break;
                    default:
                        errors.push(`ERROR: Form field type "${type}" is unsupported. Contact admin`);
                        break;
                }
            }
        }
    }

    // check that required input is present
    for (const x in input) {
        if (input[x].required && !input[x].value) {
            errors.push(`ERROR: Missing ${input[x].prettyName}`);
        }
    }

    // check for context-sensitive errors
    if (input["member-group"].value == "scientist" && input["is-new-lab"] && !input["lab-description"].value) {
        errors.push(`ERROR: Missing ${input["lab-description"].prettyName}`);
    }
    if (input["member-group"].value == "scientist" && !input["lab-name"].value) {
        errors.push(`ERROR: Missing ${input["lab-name"].prettyName}`);
    }

    // print errors for user
    for (const x of errors) {
        resultBox.textContent += x + newline;
    }
    
    // stop if input errors were found
    if (errors.length > 0) { return; }

    console.log(input);

    // process claims
    let faceClaim = `<div class="claim-row">
    <span class="detail-alitus"><b>${input["face-claim"].value}</b></span> as 
    <span class="detail-alitus no-bg text-color-${input["member-group"].value}"><a href="${input["profile-url"].value}" title="played by ${input["writer-alias"].value}">${input["character-name"].value}</a></span>
</div>`;

    let occupationClaim = `<div class="list-item level-3">
    <span class="list-taken-by text-color-${input["member-group"].value}"><a href="${input["profile-url"].value}">${input["character-name"].value}</a></span>${ input["occupation"].value === "" ? "" : `
    <span class="list-aside">(${input["occupation"].value})</span>` }
</div>`;

    let labClaim;

    // if adding a lab claim, then occupation claim needs to be inserted into lab claim
    if (input["is-new-lab"]) {
        labClaim = `<div class="list-item level-1">
    <span class="heading-dinorwic">${input["lab-name"].value}</span>
</div>

<div class="textblock-aniak left list-item level-2">
    ${input["lab-description"].value}
</div>

<div class="list-item level-2">
    <span class="heading-dollfus">Lead</span>
    <span class="pill-gusev">Limit 1</span>
</div>

${ input["is-lab-lead"] ? occupationClaim : "" }

<div class="list-item level-2">
    <span class="heading-dollfus">Staff</span>
</div>

${ input["is-lab-lead"] ? "" : occupationClaim }`
    }

    console.log(faceClaim);
    console.log(occupationClaim);
    console.log(labClaim);

    return;

    // add claims to final output code. note that []s (used here for bbcodes) need to be escaped
    // note that [pathfinder] is our default post bbcode
    code.innerHTML += "&#91;pathfinder&#93;\n";
    code.innerHTML += "Face claim: \n&#91;code&#93;\n";
    code.innerHTML += faceClaim;
    code.innerHTML += "\n&#91;/code&#93;\n\n";

    code.innerHTML += "Occupation claim:"
    if (input.group.value == "scientist" && input.isLead) {
        code.innerHTML += "\n(Add to " + input.labName.value + " as Lead)";
    } else if (input.group.value == "scientist" && !input.isLead) {
        code.innerHTML += "\n(Add to " + input.labName.value + " as Staff)";
    }
    code.innerHTML += "\n\n&#91;code&#93;\n";
    if (input.isNewLab) {
        code.innerHTML += occupationClaim.innerHTML;
    } else {
        code.appendChild(occupationClaim);
    }
    code.innerHTML += "\n&#91;/code&#93;";

    // add request details, if applicable
    if (input.requester.value || input.requestLocation.value) {
        code.innerHTML += "\n\n&#91;b&#93;REQUESTED CHARACTER&#91;/b&#93;\n";

        // add requester name, if available
        if (input.requester.value) {
            code.innerHTML += "Requested by: " + input.requester.value + newline;
        }

        // add request location, if available
        if (input.requestLocation.value) {
            // if it looks like a link, make it a link
            if (input.requestLocation.value && /^http/.test(input.requestLocation.value)) {
                var requestLink = "&#91;url=" + input.requestLocation.value + "&#93;" + input.requestLocation.value + "&#91;/url&#93;";
            }

            code.innerHTML += "Request location: ";
            if (requestLink) {
                code.innerHTML += requestLink;
            } else {
                code.innerHTML += input.requestLocation.value;
            }
        }
    }

    code.innerHTML += "\n&#91;/pathfinder&#93;";

    // put code in the code box for use
    resultBox.textContent = code.innerHTML;
    return;
}

(function(){
  "use strict";

  const runBtn = document.getElementById("claim-generator-run");
  runBtn.addEventListener("click", generateClaimCode, false);
})();
