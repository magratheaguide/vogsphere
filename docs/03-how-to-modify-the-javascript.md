# How to Modify the JavaScript

## Quick Tips

1. Look for comments that say `TODO`. These are things that you need to address when using Vogsphere on your site.
1. When you're making modifications, if clicking the button in the form doesn't seem to be doing anything, be sure to check [the console in your browser's dev tools (link is for Firefox)](https://developer.mozilla.org/en-US/docs/Tools/Web_Console/Opening_the_Web_Console) to see if the script is spitting out any errors.
1. If you haven't already read the [background info](https://github.com/rp-magrathea/vogsphere/wiki/Getting-Started#background) on the [[Getting Started wiki page]](Getting Started), do so now. It provides helpful context for the way things are processed in this script.

## The Details

The script is split out into a number of functions and variables, because [it's a very helpful programming best practice](https://www.w3.org/wiki/JavaScript_best_practices#Modularize_.E2.80.94_one_function_per_task) that makes it easier to maintain and to understand. The functions and variables should have (hopefully) sensible names, and there are comments inline for additional clarity.

As with the HTMl, let's work our way through the JavaScript bit by bit.

```javascript
(function () {
    // ...
})();
```

The first thing you'll notice about the JavaScript is that it's all wrapped in an [Immediately Invoked Function Expression (IIFE)](https://developer.mozilla.org/en-US/docs/Glossary/IIFE). Functions and variables without this sort of protection exist in the global scope, which means they can interact or interfere with other scripts on the page. [Avoiding unncessary globals is a JavaScript best practice.](https://www.w3.org/wiki/JavaScript_best_practices#Avoid_globals)

```javascript
"use strict";

```

This line opts all Vogsphere JavaScript into [strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode), which (among other things) tells JavaScript to yell at us instead of hemming and hawing over certain mistakes, helping us detect some problems more easily.

```javascript
// get a handle on the place the resulting code needs to go
const resultBox = document
    .getElementById("js-vogsphere__result")
    .querySelector("code"); // TODO: demo version, comment out when actually using
// .querySelector("td#code"); // TODO: real version, works with Jcink's [code] tags
```

Next we need to tell the script where to put the resulting claims codes. For the demo version, we'll drop the codes into the `<code>` tag. When used on your site, remove `.querySelector("code");` and replace it with `.querySelector("td#code");` (as mentioned by the `TODO` comments). This will instead drop the code inside the code block created by Jcink's `[code]` doHTML. (For more info on the way this is structured, see the [[How to Modify the HTML wiki page|Hot to Modifiy the HTML]]).)

```javascript
const postBbcodeName = "pathfinder"; // TODO: should be the bbcode name of your site's post template
```

The claims post we're building here is meant to be truly all-inclusive, meaning members don't even need to wrap it in the site's default post `BBCode` because even that's already in the output. On The Breach, our default BBCode was called `pathfinder`. Change this word to the name of whichever of your BBCodes you'd like to use to format the claims post (not the actual claims, just the reply from the members containing their claims codes). If you'd rather not wrap the reply in a BBCode, then you can just remove `postBbcodeName`, `postBbcodeOpen`, and `postBbcodeClose` and all their references.

You'll also notice that we have a number of variables at the top of this script declared using [`const`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const) instead of [`let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let). The values of these variables should never change, and making them constants enforces this (and maybe saves us from mistakes in the process).

```javascript
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
```

`expectedFormFields` is meant to be a list of all the fields we need to pull answers from in the HTML form. There are two types here: fields that return text and fields that return boolean (true/false) answers. Be sure to put the right fields in the right place here, since text and boolean fields are processed differently.

The words used here to describe the fields are the values from the fields' `name` attributes in the HTML. For example:

```html
<input
    id="vogsphere__character-name"
    name="characterName"
    type="text"
    required
/>
```

The character's name input has `name="characterName"`, so this is what we'll put into `expectedFormFields`.

```javascript
let input = {};
let errors = [];
```

The `input` variable is used to store the processed versions of all the answers from the form. The `errors` variable is used to collect all errors found while processing the input so we can show members everything they need to fix all at once.

```javascript
class textInput {
    // ...
}

class boolInput {
    // ...
}
```

Next up, classes. First we have `textInput` and `boolInput`, which define how the answers pulled from the form will be processed based on the type of answer, text or boolean. Data about whether the text field is required is also pulled for later use. The boolean fields, which are all in the form of yes/no questions in the form, are converted to JavaScript-recognizable `true`/`false`.

These two classes likely won't need any changes. If you need another type (for example, if you add radio buttons that don't boil down to true/false), you'll need to define that here as a new class.

```javascript
class faceClaim {
    // ...
}

class occupationClaim {
    // ...
}

class labClaim {
    // ...
}
```

The next few classes you will need to customize for your site. We'll start by looking at `faceClaim`, `occupationClaim`, and `labClaim`.

Each of these classes contain the bits of claim code we need to generate, meaning this is where you'll place your actual HTML claim codes. There are a number of different ways to build HTML in JavaScript, but we use [`template literals`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) here to help us avoid mistakes while keeping the code readable. You can copy and paste your claim codes here and then substitute in the answers in the form using `${expression}` syntax. This was basically the piece we were asking members to do by hand to submit claims. Instead, we do so here once and it's done for everybody.

Please note that, on The Breach, most characters just needed to be added to the occupation claim, plain and simple. But if their character was a scientist in a lab that wasn't already in the occupation claim, then both the character and the lab needed to be added. That meant putting the occupation claim _within_ the lab claim. You may or may not need something like the `labClaim` variable for your site.

A couple other things to watch out for here:

-   Template literals preserve _all_ whitespace (e.g. spaces and line breaks), hence the weird indentation. It's a lot easier to just get your claim code into this script, get it working, and then tweak the formatting
-   [Template literals can be nested to create conditional branching](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Nesting_templates). This works in conjuction with the [ternary operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator). This lets us do things like, "If this character is the lead scientist in a new lab, put them in the lead section, otherwise put them in the general staff section"

```javascript
class claimPost {
    // ...
}
```

Now to decide how to structure the post containing the codes so that it's easy for the site's staff to read and work with. This class looks a bit long for what it does, but really boils down to the following template:

```
[post]
Face claim:
[code] face claim code here [/code]

Occupation claim:
Add to X lab as lead/staff (if scientist)
[code] occupation claim code here [/code]

(If applicable) Requested Character:
Requester name
Request location
[/post]
```

Note: The things in square brackets are BBCodes. Also, a tip: It's helpful to write out your intended post like this before converting it into template literals.

You'll need to modify `claimPost` to suit.

```javascript
function isInForm(name) {
    // ...
}

function resetGenerator() {
    // ...
}

function getInput() {
    // ...
}
```

Next we move on to functions, starting with a few that probably won't need modifications.

The `isInForm` function double-checks that all the fields we put into `expectedFormFields` actually exist in the form.

The `resetGenerator` function clears out past results and errors, in case Vogsphere is run multiple times (such as when something isn't filled out correctly the first time and is then corrected).

And the `getInput` function is what actually goes and pulls all the answers from the form and processes them. It spits out errors for fields that can't be found or that can't be processed.

```javascript
function validateInput() {
    // ...
}
```

We've already checked that we can pull answers from the form for all the expected fields, now we need to make sure those answers make sense in the context of our site, and we'll use the `validateInput` function to do so. This function will need some attention, so let's walk through the pieces of it to see what's what.

```javascript
// check that required input is present
for (const x in input) {
    if (input[x].required && !input[x].value) {
        errors.push(`ERROR: Missing ${x}`);
    }
}
```

First we loop through and make sure that none of the required fields were left blank. This particular loop shouldn't require any changes.

```javascript
// check that information about requester or request location is provided for requested characters
if (
    input.isRequested &&
    !input.requester.value &&
    !input.requestLocation.value
) {
    errors.push(
        "ERROR: Requested character, need requester name or request location"
    );
}
```

Next, we start comparing fields to each other. In this particular form, if you say that the character is part of a request, then you must provide the alias of the member who requested the character or the location of the request (or both). If this is also true for your site, you can leave this piece be.

```javascript
// TODO: check for context-sensitive errors (e.g. if member group is A, need to also have provided B)
if (
    input.memberGroup.value == "scientist" &&
    input.isNewLab &&
    !input.labDescription.value
) {
    errors.push("ERROR: Missing lab description");
}

if (input.memberGroup.value == "scientist" && !input.labName.value) {
    errors.push("ERROR: Missing name of lab");
}
```

The last piece of the `validateInput` function definitely won't make sense without context. The Breach was set on a ship in space, wherein some characters worked as scientists in the ship's labs. Our occupation claim listed a couple of labs (with short descriptive blurbs), but members were invited to think up additional labs that might be on board. These were added to the occupation claim when the new character was accepted. Therefore, our claim codes needed to consider the following conditions:

-   If the character is in the Scientist member group, then we need the name of the lab in which they work
-   If the lab isn't already in the occupation claim, then we need a blurb describing it for the occupation claim

The above code snippet checks these particular conditions and most likely won't pertain to your site without some modification. It's left in to show how this type of condition checking works within Vogsphere using a real world case.

```javascript
function fillInClaims() {
    // ...

    return {
        faceClaim: completeFaceClaim,
        occupationClaim: completeOccupationClaim,
        labClaim: completeLabClaim,
    };
}
```

The subsequent `fillInClaims` function calls all those previously created claims classes, passing each the answers it needs to fill out the code. To wrap up, it returns each of the variables created. This makes those variables, which were previously only available to use within the `fillInClaims` function, available elsewhere in the script.

```javascript
function compileClaimPost(claims) {
    // ...
}
```

It's the job of the `compileClaimPost` function to call on the `claimPost` class, handing it everything needed. Note that this function takes as input the collection of claims codes returned by the previous `fillInClaims` function.

```javascript
function generateClaim() {
    let claims;
    let post;

    resetGenerator();

    getInput();

    validateInput();

    // stop if input errors were found
    if (errors.length > 0) {
        errors.forEach(
            (element) => (resultBox.textContent += element + newline)
        );
        return;
    }

    claims = fillInClaims();

    post = compileClaimPost(claims);

    resultBox.textContent = post;
    return;
}

runBtn.addEventListener("click", generateClaimPost, false);
```

Last but not least, we create the `generateClaim` function, which runs everything else, and attach it to the button in the form. This is what actually makes our form do something when the button is clicked. You probably won't need to make any modifications here.

And that's a wrap. If you get stuck or have any questions, feel free to give a shout via an [issue on this repo](https://github.com/rp-magrathea/vogsphere/issues) (or give the exisiting issues a search for other folks who've had the same question!).
