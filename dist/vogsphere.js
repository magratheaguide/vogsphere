/*
==========
VOGSPHERE
The Claim Code Generator
A Magrathea project
https://github.com/rp-magrathea/vogsphere
-----
Purpose:
Convert member-provided answers from the associated form into the code admins need to update the various claims lists.

How To Guide:
https://github.com/rp-magrathea/vogsphere/docs/01-getting-started.md
==========
*/
(function () {
    "use strict";

    const runBtn = document.getElementById("js-vogsphere__run");
    const resultParent = document.getElementById("js-vogsphere__result-parent");

    // get a handle on the place the resulting code needs to go
    const resultBox = resultParent
        .querySelector("code"); // TODO: demo version, comment out when actually using
    // .querySelector("td#code"); // TODO: real version, works with Jcink's [code] tags

    const formId = runBtn.getAttribute("form");
    const form = document.getElementById(formId);
    const elements = form.elements;
    const answers = new FormData(form);

    const newline = "\n";

    // doHTML codes
    // square brackets must be escaped or else they get processed right away by Jcink
    const leftBracket = "&#91;";
    const rightBracket = "&#93;";

    // returns [tag]
    function openDohtml(tag) {
        return `${leftBracket}${tag}${rightBracket}`;
    }

    // returns [tag=param]
    function openEqualsDohtml(tag, param) {
        return `${leftBracket}${tag}="${param}"${rightBracket}`;
    }

    // returns [/tag]
    function closeDohtml(tag) {
        return `${leftBracket}/${tag}${rightBracket}`;
    }

    const postBbcodeName = "pathfinder"; // TODO: should be the name of your site's default bbcode for posting

    const postBbcodeOpen = openDohtml(postBbcodeName);
    const postBbcodeClose = closeDohtml(postBbcodeName);

    const codeBbcodeOpen = openDohtml("code");
    const codeBbcodeClose = closeDohtml("code");

    // returns [b]content[/b]
    function formatBold(content) {
        return `${openDohtml("b")}${content}${closeDohtml("b")}`;
    }

    // returns [url=address]address[/url]
    function formatUrl(address) {
        return `${openEqualsDohtml("url", `${address}`)}${address}${closeDohtml(
            "url"
        )}`;
    }

    // TODO: names of form fields (as specified by the "name" attribute in the html)
    const expectedFormFields = {
        text: [
            "characterName",
            "faceClaim",
            "labDescription",
            "labName",
            "memberGroup",
            "occupation",
            "profileUrl",
            "requester",
            "requestLocation",
            "writerAlias",
        ],
        bool: ["isLabLead", "isNewLab", "isRequested"],
    };
    let errors = [];

    // TODO: update/create classes to match the actual claim codes needed for the site
    class faceClaim {
        constructor(
            characterName,
            faceClaim,
            memberGroup,
            profileUrl,
            writerAlias
        ) {
            this.code = `<div class="claim-row">
    <span class="detail-alitus"><b>${faceClaim}</b></span> as
    <span class="detail-alitus no-bg text-color-${memberGroup}">
        <a href="${profileUrl}" title="played by ${writerAlias}">${characterName}</a>
    </span>
</div>`;
        }
    }

    class occupationClaim {
        constructor(characterName, memberGroup, occupation, profileUrl) {
            this.code = `<div class="list-item level-3">
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
            this.code = `<div class="list-item level-1">
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
            faceClaim,
            labClaim,
            occupationClaim,

            labName,
            memberGroup,
            requester,
            requestLocation,

            isLabLead,
            isNewLab,
            isRequested
        ) {
            // prettier-ignore
            this.content = `${postBbcodeOpen}
Face claim:
${codeBbcodeOpen}${faceClaim.code}${codeBbcodeClose}

Occupation claim: ${
                memberGroup == "scientist"
                    ? `
Add to ${labName} as ${isLabLead ? "Lead" : "Staff"}`
                    : ""
            }
${codeBbcodeOpen}${
                isNewLab ? labClaim.code : occupationClaim.code
            }${codeBbcodeClose} ${
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
                                requestLocation &&
                                /^http/.test(requestLocation)
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

    function getAnswers() {
        for (const type in expectedFormFields) {
            expectedFormFields[type].forEach((fieldName) => {
                if (!isInForm(fieldName)) {
                    errors.push(
                        `ERROR: Could not find field with name "${fieldName}" in form. Contact admin`
                    );
                } else {
                    switch (type) {
                        case "text":
                            break;
                        case "bool":
                            if (answers.has(fieldName)) {
                                answers.set(fieldName, answers.get(fieldName) === "true");
                            }
                            break;
                        default:
                            errors.push(
                                `ERROR: Form field type "${type}" is unsupported. Contact admin`
                            );
                            break;
                    }
                }
            });
        }
    }

    function validateAnswers() {
        // check for basic input errors
        for (let i = 0; i < elements.length; i++) {
            if (!elements[i].validity.valid) {
                // FIXME: showError();
                console.log("FIXME: write showError()");
            }
        }

        // check that information about requester or request location is provided for requested characters
        if (
            answers.get("isRequested") &&
            !answers.has("requester") &&
            !answers.has("requestLocation")
        ) {
            errors.push(
                "ERROR: Requested character, need requester name or request location"
            );
        }

        // TODO: check for context-sensitive errors (e.g. if member group is A, need to also have provided B)
        if (
            answers.get("memberGroup") == "scientist" &&
            answers.get("isNewLab") &&
            !answers.get("labDescription")
        ) {
            errors.push("ERROR: Missing lab description");
        }

        if (answers.get("memberGroup") == "scientist" && !answers.get("labName")) {
            errors.push("ERROR: Missing name of lab");
        }
    }

    // TODO: list all the different claims you need and the pieces they need to be filled in
    function fillInClaims() {
        let completeFaceClaim = new faceClaim(
            answers.get("characterName"),
            answers.get("faceClaim"),
            answers.get("memberGroup"),
            answers.get("profileUrl"),
            answers.get("writerAlias")
        );

        let completeOccupationClaim = new occupationClaim(
            answers.get("characterName"),
            answers.get("memberGroup"),
            answers.get("occupation"),
            answers.get("profileUrl")
        );

        // note that the labClaim needs to be handed the occupationClaim
        let completeLabClaim = new labClaim(
            answers.get("isLabLead"),
            answers.get("labName"),
            answers.get("labDescription"),
            completeOccupationClaim
        );

        return {
            faceClaim: completeFaceClaim,
            occupationClaim: completeOccupationClaim,
            labClaim: completeLabClaim,
        };
    }

    // TODO: Update to match class claimPost
    function compileClaimPost(claims) {
        let post = new claimPost(
            claims.faceClaim,
            claims.labClaim,
            claims.occupationClaim,

            answers.get("labName"),
            answers.get("memberGroup"),
            answers.get("requester"),
            answers.get("requestLocation"),

            answers.get("isLabLead"),
            answers.get("isNewLab"),
            answers.get("isRequested")
        );

        return post.content;
    }

    function generateClaim() {
        let claims;
        let post;

        resetGenerator();

        getAnswers();

        validateAnswers();

        // stop if input errors were found
        if (errors.length > 0) {
            errors.forEach(
                (element) => (resultBox.textContent += element + newline)
            );
            return;
        }

        claims = fillInClaims();

        post = compileClaimPost(claims);

        // FIXME: Does focus need to be changed/set here?
        resultBox.textContent = post;
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        generateClaim();
    });
})();
