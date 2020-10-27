# How to Modify the HTML

## Quick Tips

1.  Look for comments that say `TODO`. These are things that you need to address when using Vogsphere.
1.  Don't forget to remove all `<!-- comments -->` before posting the HTML; Jcink can't handle HTML comments in posts.

## The Details

Let's work our way through the HTML bit by bit.

```html
<link rel="stylesheet" href="vogsphere.css" />
<script defer src="vogsphere.js"></script>
```

These two lines tell Vogsphere where to find the CSS and the JavaScript it uses. You can most likely get rid of the CSS (and this `<link>` to it). For the other, be sure to update the `src` to point to wherever you wind up hosting the JavaScript. Make sure not to remove `defer` from the `<script>` tag; this is what tells the browser not to let the JavaScript run until all of the HTML is loaded.

More information about `defer`:

-   [MDN: Script Loading Strategies](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript#Script_loading_strategies)
-   [MDN: The `<script>` Element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script)

```html
<form id="js-vogsphere__form" class="magrathea-tool vogsphere"></form>
```

You may not need to make any changes here. The `id` is used by the JavaScript to find the Vogsphere form, so if you change it, be sure to update the JavaScript as well. (Note: For consistency and clarity, all IDs that the Vogsphere JavaScript hooks into start with `js-`.)

The classes are used to keep all of the provided CSS contained to just Vogsphere, so it doesn't leak out and affect other parts of your site.

```html
<section>
    <h3>Basics</h3>
</section>
```

Each of the sections of the form ("Basics," "For Scientists," and "Requested Character?") are contained in their own `<section>` tag, [per MDN's suggestion](https://developer.mozilla.org/en-US/docs/Learn/Forms/How_to_structure_a_web_form#Common_HTML_structures_used_with_forms). This is meant to help make the form more accessible for folks using screen readers.

```html
<label for="vogsphere__character-name">Character Name</label>
<input
    id="vogsphere__character-name"
    name="characterName"
    type="text"
    required
/>
```

[Every `input` should have an associated `label`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label), linked using the `for` and `id` attributes. Labelling not only improves accessibility for folks using screen readers, but also means that you can click the label to activate the input. This is also why every input in Vogsphere has an ID. (Quick reminder: [IDs in HTML are meant to be unique](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id) within the entire page. Breaking this rule can cause you grief with, for a couple of examples, [JavaScript selectors](https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementById) and [linking to elements on the same page](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Linking_to_an_element_on_the_same_page).)

```html
<input
    id="vogsphere__character-name"
    name="characterName"
    type="text"
    required
/>
<input
    id="vogsphere__is-requested"
    type="radio"
    name="isRequested"
    value="true"
    checked
/>
<textarea
    id="vogsphere__lab-desc"
    name="labDescription"
    class="--full"
    rows="5"
    aria-describedby="vogsphere__lab-desc-help"
></textarea>
```

The form provided makes uses of two different types of [`<input>` elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input), [`type="text"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/text) and [`type="radio"`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio), as well as [`<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea) elements. There are lots of other types available if you need them.

You'll also notice that some of the form fields include the `required` attribute. Any field in the form that must always be filled out should have this attribute because this is both the [standard way to mark form fields as required](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required) and is used by the Vogsphere JavaScript to enforce that requirement.

The [`name`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname) attributes on the form fields are also used by Vogsphere's JavaScript, as well as in the error messages members see when they don't fill out the form correctly, so each name should be unique and clear. You should format all of these with [camelCase](https://en.wikipedia.org/wiki/Camel_case) to make them easier to work with in the JavaScript (this means getting to use `input.characterName` versus `input.["character-name"]`).

```html
<fieldset>
    <legend>Is this character part of a request?</legend>
    <ul class="--minimal">
        <li>
            <label for="vogsphere__is-not-requested">
                <input
                    id="vogsphere__is-not-requested"
                    type="radio"
                    name="isRequested"
                    value="false"
                />
                No
            </label>
        </li>
        <li>
            <label for="vogsphere__is-requested">
                <input
                    id="vogsphere__is-requested"
                    type="radio"
                    name="isRequested"
                    value="true"
                    checked
                />
                Yes
            </label>
        </li>
    </ul>
</fieldset>
```

All of the [radio fields](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio) are wrapped in [`<fieldset>` elements to improve accessibility](https://developer.mozilla.org/en-US/docs/Learn/Forms/How_to_structure_a_web_form#The_%3Cfieldset%3E_and_%3Clegend%3E_elements).

The radio buttons themselves are wrapped in unordered lists (`<ul>`) based on [a recommendation from MDN](https://developer.mozilla.org/en-US/docs/Learn/Forms/How_to_structure_a_web_form#Common_HTML_structures_used_with_forms).

```html
<button id="js-vogsphere__run" form="js-vogsphere__form" type="button">
    Generate Code
</button>
```

Note that the button references the form it belongs to, which helps keep this button from trying to interact with any other form on the page (and gives us a way in the JavaScript to hook into the form when the button is clicked). It's also important that this `<button>` has `type="button"`. This [keeps the form from refreshing the page or trying to submit data to a server](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Notes) when we know we intend to process the form with JavaScript.

You may also notice that this button doesn't have an `onclick` attribute. Instead, we [attach the click handler from within the JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps/What_is_JavaScript#Inline_JavaScript_handlers), which makes the code more clean by keeping the HTML and JavaScript more in their own lanes.

```html
<section id="js-vogsphere__result">
    <h3>Result</h3>

    <!-- TODO: demo only, remove starting here... -->
    <pre><code>Claim code will be shown here.</code></pre>
    <!-- ...ending here -->

    <!-- TODO: uncomment following to use -->
    <!-- [/dohtml]
    [code]
    [/code]
    [dohtml] -->
</section>
```

To get the demo version of Vogsphere to work, we use the standard method for creating code blocks: [a `code` elements wrapped in a `pre` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/code#Notes). But Jcink has its own method for inserting code in posts, the `[code]` doHTML, which is converted to the following when used:

```html
<table
    id="CODE-WRAP"
    width="95%"
    cellspacing="1"
    cellpadding="3"
    border="0"
    align="center"
>
    <tbody>
        <tr>
            <td>
                <b>CODE</b>
            </td>
        </tr>
        <tr>
            <td id="CODE">
                <!--ec1--><br />code content winds up here<br /><!--c2-->
            </td>
        </tr>
    </tbody>
</table>
```

This method represents a non-compliant way of using the `id` attribute, since it's very possible and realistic to have multiple `[code]` blocks on the same page. Therefore, to make sure that Vogsphere's JavaScript grabs the correct code block to output its results to, Vogsphere specifically looks for an ID that _will_ be unique in the page: `js-vogsphere__result`.

Vogsphere can handle both the standard `<pre><code>` method and Jcink's doHTML `[code]` means of displaying code blocks. You need only follow the `<!-- TODO -->` comments in the Vogsphere HTML and JavaScript files to make your preferred method work.
