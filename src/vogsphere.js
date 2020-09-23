/* VOGSPHERE, THE CLAIM CODE GENERATOR (https://github.com/rp-magrathea/vogsphere)
* Purpose: Convert member-provided answers from the associated form into the code admins need to update the various claims lists.
*
* How To Guide: https://github.com/rp-magrathea/vogsphere/wiki/Getting-Started
*/
(function () {
    "use strict";

    const runBtn = document.getElementById("js-vogsphere__run");

    // get a handle on the place the resulting code needs to go
    const resultBox = document
        .getElementById("js-vogsphere__result")
        .querySelector("code"); // TODO: demo version, comment out when actually using
        // .querySelector("td#code"); // TODO: real version, works with Jcink's [code] tags

    const formId = runBtn.getAttribute("form");
    const form = document.getElementById(formId);

    const newline = "\n";

    // doHTML codes
    // square brackets must be escaped or else they get processed right away by Jcink
    const leftBracket = "&#91;";
    const rightBracket = "&#93;";

    function openDohtml(tag) { return `${leftBracket}${tag}${rightBracket}`; } // returns [tag]
    function openEqualsDohtml(tag, param) { return `${leftBracket}${tag}="${param}"${rightBracket}`; } // returns [tag=param]
    function closeDohtml(tag) { return `${leftBracket}/${tag}${rightBracket}`; } // returns [/tag]

    const postBbcodeName = "pathfinder"; // TODO: should be the name of your site's default bbcode for posting

    const postBbcodeOpen = openDohtml(postBbcodeName);
    const postBbcodeClose = closeDohtml(postBbcodeName);

    const codeBbcodeOpen = openDohtml("code");
    const codeBbcodeClose = closeDohtml("code");

    function formatBold(content) { return `${openDohtml("b")}${content}${closeDohtml("b")}`; }
    function formatUrl(address) { return `${openEqualsDohtml("url", `${address}`)}${address}${closeDohtml("url")}`; }

    // TODO: names of form fields (as specified by the "name" attribute in the html)
    const expectedFormFields = {
        text: [
            "characterName"
            , "faceClaim"
            , "labDescription"
            , "labName"
            , "memberGroup"
            , "occupation"
            , "profileUrl"
            , "requester"
            , "requestLocation"
            , "writerAlias"
        ],
        bool: [
            "isLabLead"
            , "isNewLab"
            , "isRequested"
        ]
    };
    let input = {};
    let errors = [];

    // how text fields are processed
    class textInput {
        constructor(name) {
            this.value = form.elements[name].value;
            this.required = form.elements[name].required;
        }
    }

    // how boolean fields are processed
    class boolInput {
        constructor(name) {
            this.value = (form.elements[name].value === "true");
        }
    }

    // TODO: update/create classes to match the actual claim codes needed for the site
    class faceClaim {
        constructor(
            characterName
            , faceClaim
            , memberGroup
            , profileUrl
            , writerAlias
        ) {
            this.code =
`<div class="claim-row">
    <span class="detail-alitus"><b>${faceClaim}</b></span> as
    <span class="detail-alitus no-bg text-color-${memberGroup}">
        <a href="${profileUrl}" title="played by ${writerAlias}">${characterName}</a>
    </span>
</div>`;
        }
    }

    class occupationClaim {
        constructor(characterName, memberGroup, occupation, profileUrl) {
            this.code =
`<div class="list-item level-3">
    <span class="list-taken-by text-color-${memberGroup}">
        <a href="${profileUrl}">${characterName}</a>
    </span> ${
            occupation === ""
                ? ""
                : `<span class="list-aside">(${occupation})</span>`
            }
</div>`;
        }
    }

    class labClaim {
        constructor(isLabLead, labName, labDescription, occupationClaim) {
            // labs are in the occupation claim list, so the occupation claim code is inserted into the lab claim
            this.code =
`<div class="list-item level-1">
    <span class="heading-dinorwic">${labName}</span>
</div>

<div class="textblock-aniak left list-item level-2">
    ${labDescription}
</div>

<div class="list-item level-2">
    <span class="heading-dollfus">Lead</span>
    <span class="pill-gusev">Limit 1</span>
</div>

${isLabLead ? occupationClaim.code : ""}

<div class="list-item level-2">
    <span class="heading-dollfus">Staff</span>
</div>

${isLabLead ? "" : occupationClaim.code}`;
        }
    }

    // TODO: update to create the post you want members to reply with
    class claimPost {
        constructor(
            faceClaim
            , labClaim
            , occupationClaim

            , labName
            , memberGroup
            , requester
            , requestLocation

            , isLabLead
            , isNewLab
            , isRequested
        ) {
            this.content =
`${postBbcodeOpen}
Face claim:
${codeBbcodeOpen}${faceClaim.code}${codeBbcodeClose}

Occupation claim: ${
            memberGroup == "scientist"
                ? `
Add to ${labName} as ${isLabLead ? "Lead" : "Staff"}`
                : ""
            }
${codeBbcodeOpen}${isNewLab ? labClaim.code : occupationClaim.code}${codeBbcodeClose} ${
            isRequested
                ? `

${formatBold("REQUESTED CHARACTER")} ${
                requester
                    ? `
Requested by: ${requester}`
                    : ""
                } ${
                requestLocation
                    ? `
Request location: ${
                    requestLocation
                    && /^http/.test(requestLocation)
                        ? formatUrl(requestLocation)
                        : requestLocation
                    }`
                    : ""
                }`
                : ""
            }
${postBbcodeClose}`;
        }
    }

    function isInForm(name) {
        return !!form.elements[name];
    }

    function resetGenerator() {
        // clear any past results
        resultBox.innerHTML = "";

        // clear past errors
        errors = [];
    }

    function getInput() {
        for (const type in expectedFormFields) {
            expectedFormFields[type].forEach(fieldName => {
                if (!isInForm(fieldName)) {
                    errors.push(`ERROR: Could not find field with name "${fieldName}" in form. Contact admin`);
                } else {
                    switch(type) {
                        case "text":
                            input[fieldName] = new textInput(fieldName);
                            break;
                        case "bool":
                            input[fieldName] = new boolInput(fieldName);
                            break;
                        default:
                            errors.push(`ERROR: Form field type "${type}" is unsupported. Contact admin`);
                            break;
                    }
                }
            });
        }
    }

    function validateInput() {
        // check that required input is present
        for (const x in input) {
            if (input[x].required && !input[x].value) {
                errors.push(`ERROR: Missing ${x}`);
            }
        }

        // check that information about requester or request location is provided for requested characters
        if (
            input.isRequested.value
            && !input.requester.value
            && !input.requestLocation.value
        ) {
            errors.push("ERROR: Requested character, need requester name or request location");
        }

        // TODO: check for context-sensitive errors (e.g. if member group is A, need to also have provided B)
        if (
            input.memberGroup.value == "scientist"
            && input.isNewLab.value
            && !input.labDescription.value
        ) {
            errors.push("ERROR: Missing lab description");
        }

        //Check for selection on Member group
        if (
            !input.memberGroup.value
        ) {
            errors.push("ERROR: Missing Member group selection");
        }

        if (
            input.memberGroup.value == "scientist"
            && !input.labName.value
        ) {
            errors.push("ERROR: Missing name of lab");
        }
    }

    // TODO: list all the different claims you need and the pieces they need to be filled in
    function fillInClaims() {
        let completeFaceClaim = new faceClaim(
            input.characterName.value
            , input.faceClaim.value
            , input.memberGroup.value
            , input.profileUrl.value
            , input.writerAlias.value
        );
        let completeOccupationClaim = new occupationClaim(
            input.characterName.value
            , input.memberGroup.value
            , input.occupation.value
            , input.profileUrl.value
        );
        // note that the labClaim needs to be handed the occupationClaim
        let completeLabClaim = new labClaim(
            input.isLabLead.value
            , input.labName.value
            , input.labDescription.value
            , completeOccupationClaim
        );

        return {
            faceClaim: completeFaceClaim
            , occupationClaim: completeOccupationClaim
            , labClaim: completeLabClaim
        };
    }

    // TODO: Update to match class claimPost
    function compileClaimPost(claims) {
        let post = new claimPost(
            claims.faceClaim
            , claims.labClaim
            , claims.occupationClaim

            , input.labName.value
            , input.memberGroup.value
            , input.requester.value
            , input.requestLocation.value

            , input.isLabLead.value
            , input.isNewLab.value
            , input.isRequested.value
        );

        return post.content;
    }

    function generateClaim() {
        let claims;
        let post;

        resetGenerator();

        getInput();

        validateInput();

        // stop if input errors were found
        if (errors.length > 0) {
            errors.forEach(element => resultBox.textContent += element + newline);
            return;
        }

        claims = fillInClaims();

        post = compileClaimPost(claims);

        resultBox.textContent = post;
        return;
    }

    runBtn.addEventListener("click", generateClaim, false);
})();
