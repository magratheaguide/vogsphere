/* CLAIM CODE GENERATOR
Purpose: Convert member-provided answers from the associated form into the code admins need to update the various claims lists. 
*/
(function () {
    "use strict";

    const runBtn = document.getElementById("js-claim-generator-run");

    // get a handle on the place the code needs to go
    const resultBox = document
    .getElementById("js-claim-generator-result")
    .querySelector("code"); // demo version, comment out when actually using
    // .querySelector("td#code"); // real version

    const formId = runBtn.getAttribute("form");
    const form = document.getElementById(formId);

    const indent1 = "    ";
    const newline = "\n";
    const newlineDouble = "\n\n";
    const leftBracket = "&#91;";
    const rightBracket = "&#93;";

    let fields = {
        text: [
            "writer-alias",
            "face-claim",
            "member-group",
            "character-name",
            "lab-description",
            "lab-name",
            "occupation",
            "requester",
            "request-location",
            "profile-url",
        ],
        bool: ["is-lab-lead", "is-new-lab"],
    };
    let input = {};
    let errors = [];

    class claimText {
        constructor(name) {
            this.value = form.elements[name].value;
            this.required = form.elements[name].required;
            this.prettyName = name.replace(/-/g, " ");
        }
    }

    function isInForm(name) {
        return !!form.elements[name];
    }

    function getInput() {
        for (const type in fields) {
            const list = fields[type];

            for (const name of list) {
                if (!isInForm(name)) {
                    errors.push(
                        `ERROR: Could not find field with name "${name}" in form. Contact admin`
                    );
                } else {
                    switch (type) {
                        case "text":
                            input[name] = new claimText(name);
                            break;
                        case "bool":
                            input[name] = (form.elements[name].value == "true");
                            break;
                        default:
                            errors.push(
                                `ERROR: Form field type "${type}" is unsupported. Contact admin`
                            );
                            break;
                    }
                }
            }
        }
    }

    function validateInput() {
        // clear past errors
        errors = [];

        // check that required input is present
        for (const x in input) {
            if (input[x].required && !input[x].value) {
                errors.push(`ERROR: Missing ${input[x].prettyName}`);
            }
        }

        // check for context-sensitive errors
        if (
            input["member-group"].value == "scientist"
            && input["is-new-lab"]
            && !input["lab-description"].value
        ) {
            errors.push(
                `ERROR: Missing ${input["lab-description"].prettyName}`
            );
        }

        if (
            input["member-group"].value == "scientist"
            && !input["lab-name"].value
        ) {
            errors.push(`ERROR: Missing ${input["lab-name"].prettyName}`);
        }
    }

    function generateClaimCode() {
        // clear any past results
        resultBox.innerHTML = "";

        // pull input from form
        getInput();

        validateInput();

        // stop if input errors were found
        if (errors.length > 0) {
            errors.forEach(element => resultBox.textContent += element + newline);
            return;
        }

        console.log(input);

        // process claims
        let faceClaim = `<div class="claim-row">
        <span class="detail-alitus"><b>${input["face-claim"].value}</b></span> as 
        <span class="detail-alitus no-bg text-color-${input["member-group"].value}"><a href="${input["profile-url"].value}" title="played by ${input["writer-alias"].value}">${input["character-name"].value}</a></span>
    </div>`;

        let occupationClaim = `<div class="list-item level-3">
        <span class="list-taken-by text-color-${
            input["member-group"].value
        }"><a href="${input["profile-url"].value}">${
            input["character-name"].value
        }</a></span>${
            input["occupation"].value === ""
                ? ""
                : `
        <span class="list-aside">(${input["occupation"].value})</span>`
        }
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

    ${input["is-lab-lead"] ? occupationClaim : ""}

    <div class="list-item level-2">
        <span class="heading-dollfus">Staff</span>
    </div>

    ${input["is-lab-lead"] ? "" : occupationClaim}`;
        }

        console.log(faceClaim);
        console.log(occupationClaim);
        console.log(labClaim);

        let postBbcodeName = "pathfinder";
        let postBbcodeOpen = leftBracket + postBbcodeName + rightBracket;
        let postBbcodeClose = leftBracket + "/" + postBbcodeName + rightBracket;

        let codeBbcodeOpen = leftBracket + "code" + rightBracket;
        let codeBbcodeClose = leftBracket + "/code" + rightBracket;

        let code = `${postBbcodeOpen}
    Face claim: 
    ${codeBbcodeOpen} ${faceClaim} ${codeBbcodeClose}

    Occupation claim: ${
        input["member-group"].value == "scientist"
            ? `
    Add to ${input["lab-name"].value} as ${
                  input["is-lab-lead"] ? "Lead" : "Staff"
              }`
            : ""
    }
    ${codeBbcodeOpen} ${
            input["is-new-lab"] ? labClaim : occupationClaim
        } ${codeBbcodeClose}

    ${
        input["requester"].value || input["request-location"].value
            ? `${leftBracket}b${rightBracket}REQUESTED CHARACTER${leftBracket}/b${rightBracket}
    ${
        input["requester"].value
            ? `Requested by: ${input["requester"].value}`
            : ""
    }`
            : ""
    } 
    ${
        input["request-location"].value
            ? `Request location: ${
                  input["request-location"].value &&
                  /^http/.test(input["request-location"].value)
                      ? `${leftBracket}url="${input["request-location"].value}"${rightBracket}${input["request-location"].value}${leftBracket}/url${rightBracket}`
                      : input["request-location"].value
              }`
            : ""
    }
    ${postBbcodeClose}`;

        // put code in the code box for use
        resultBox.textContent = code;
        return;
    }

    runBtn.addEventListener("click", generateClaimCode, false);
})();
