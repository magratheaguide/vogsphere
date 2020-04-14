const indent1 = "\n    ";
const newline = "\n";
const newlineDouble = "\n\n";
const leftBracket = "&#91;";
const rightBracket = "&#93;";

/* HTML TO GENERATE:
<div class="list-item level-3">
    <span class="list-taken-by text-color-MEMBERGROUP"><a href="PROFILE_URL">CHARACTER_NAME</a></span>
    <span class="list-aside">(OCCUPATION)</span>
</div>
*/
function generateOccupationClaimCode(group, name, url, occupation) {
    // create containing element
    var claim = document.createElement("div");
    claim.className = "list-item level-3";

    // create character content
    var claimCharacter = document.createElement("span");
    claimCharacter.className = "list-taken-by text-color-" + group;
    var claimLink = document.createElement("a");
    claimLink.href = url;
    claimLink.innerHTML = name;
    claimCharacter.appendChild(claimLink);

    // create occupation content (if applicable, occupation is optional)
    if (occupation) {
        var claimOccupation = document.createElement("span");
        claimOccupation.className = "list-aside";
        claimOccupation.innerHTML += "(" + occupation + ")";
    }

    // put all the pieces together
    claim.innerHTML += indent1;
    claim.appendChild(claimCharacter);
    if (claimOccupation) {
        claim.innerHTML += indent1;
        claim.appendChild(claimOccupation);
    }
    claim.innerHTML += newline;

    return claim;
}

/* HTML TO GENERATE:
<div class="list-item level-1">
    <span class="heading-dinorwic">LAB_NAME</span>
</div>

<div class="textblock-aniak left list-item level-2">
    LAB_DESCRIPTION
</div>

<div class="list-item level-2">
    <span class="heading-dollfus">Lead</span>
    <span class="pill-gusev">Limit 1</span>
</div>

<div class="list-item level-2">
    <span class="heading-dollfus">Staff</span>
</div>
*/
function generateLabClaimCode(labName, labDesc) {
    // create containing element
    var claim = document.createElement("div")

    // lab name
    var nameContainer = document.createElement("div");
    nameContainer.className = "list-item level-1";
    nameContainer.innerHTML += indent1;

    var nameInner = document.createElement("span");
    nameInner.className = "heading-dinorwic";
    nameInner.innerHTML = labName;

    nameContainer.appendChild(nameInner);
    nameContainer.innerHTML += newline;

    // lab description
    var descContainer = document.createElement("div");
    descContainer.className = "list-item level-2 textblock-aniak";
    descContainer.innerHTML = indent1 + labDesc + newline;

    // lead header
    var leadContainer = document.createElement("div");
    leadContainer.className = "list-item level-2";

    var leadLabel = document.createElement("span");
    leadLabel.className = "heading-dollfus";
    leadLabel.innerHTML = "Lead";

    var limit = document.createElement("span");
    limit.className = "pill-gusev";
    limit.innerHTML = "Limit 1";

    leadContainer.innerHTML += indent1;
    leadContainer.appendChild(leadLabel);
    leadContainer.innerHTML += indent1;
    leadContainer.appendChild(limit);
    leadContainer.innerHTML += newline;

    // staff header
    var staffContainer = document.createElement("div");
    staffContainer.className = "list-item level-2";
    var staffInner = document.createElement("span");
    staffInner.className = "heading-dollfus";
    staffInner.innerHTML += "Staff";

    staffContainer.innerHTML += indent1;
    staffContainer.appendChild(staffInner);
    staffContainer.innerHTML += newline;

    // put all the pieces together
    claim.appendChild(nameContainer);
    claim.innerHTML += newlineDouble;
    claim.appendChild(descContainer);
    claim.innerHTML += newlineDouble;
    claim.appendChild(leadContainer);
    claim.innerHTML += newlineDouble;
    claim.appendChild(staffContainer);

    return claim;
}

function generateClaimCode() {
    const formId = this.getAttribute("form");
    const form = document.getElementById(formId);

    // get a handle on the place the code needs to go
    const resultBox = document.getElementById("claim-generator-result").querySelector("code"); // demo version, comment out when actually using
    // const resultBox = document.getElementById("claim-generator-result").querySelector("td#code"); // real version

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
            "is-lead-scientist"
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
    if (input["is-new-lab"] && !input["lab-description"].value) {
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


    // process claims
    if (!error) {
        let faceClaim = `<div class="claim-row">
    <span class="detail-alitus"><b>${input.face.value}</b></span> as <span class="detail-alitus no-bg text-color-${input.group.value}"><a href="${input.url.value}" title="played by ${input.alias.value}">${input.name.value}</a></span>
</div>`;
        var occupationClaim = generateOccupationClaimCode(
            input.group.value
            , input.name.value
            , input.url.value
            , input.occupation.value
        );
        if (input.isNewLab) {
            // the occupation claim needs to be inserted into the lab claim

            var labClaim = generateLabClaimCode(
                input.labName.value
                , input.labDesc.value
            );

            if (input.isLead) {
                var elementsAfter = 1;
            } else {
                var elementsAfter = 0;
            }

            var x = document.createElement("div");

            while (labClaim.children.length > 0) {
                x.appendChild(labClaim.children[0]);

                if (labClaim.children.length > 0) {
                    x.innerHTML += newlineDouble;
                }

                if (labClaim.children.length == elementsAfter) {
                    if (elementsAfter == 0) {
                        x.innerHTML += newlineDouble;
                    }

                    x.appendChild(occupationClaim);

                    if (elementsAfter > 0) {
                        x.innerHTML += newlineDouble;
                    }
                }
            }
            occupationClaim = x;
        }

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
    }

    // put code in the code box for use
    resultBox.textContent = code.innerHTML;
    return;
}

(function(){
  "use strict";

  const runBtn = document.getElementById("claim-generator-run");
  runBtn.addEventListener("click", generateClaimCode, false);
})();
