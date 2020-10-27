# Getting Started

## High Level Overview

1. [Fork this repo](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) to have your own copy to work with
1. [Modify the HTML](docs/02-how-to-modify-the-html.md) to ask for the specific fields you need
1. Toss the CSS. Or modify it. Whatever makes it easiest to style the form to match your site
1. [Modify the JavaScript](docs/03-how-to-modify-the-javascript.md) to build HTML customized to your site's claims
1. Host the modified JS file. Recommendation: Upload it to your site's ACP using [the file manager](https://jcink.com/main/wiki/jfb-filemanager)
1. Update the `<script>` link in the HTML to point to the hosted JS file
1. Add the modified HTML to your site as the content of a post

## Background

The questions asked and general processing steps in Vogsphere are the same here as they were on [The Breach](https://breached.jcink.net), where the original version lived, to give you a better feel for how this thing works in a real scenario. With that in mind, a quick overview of the way things worked on The Breach would probably be helpful context.

On The Breach, we used a profile application, and had members let us know their application was ready for review by posting their claims. We also had a policy of getting a thumbs up from the requester before accepting requested characters. This is why Vogsphere, in addition to asking claims related questions, also asks for information about whether the character is meant to fill a request. Vogsphere doesn't generate a member directory claim because on The Breach our member directory consisted of a thread that members posted in themselves, where each reply was their directory entry. Vogsphere could, however, definitely be updated to handle member directory claims as well (or whichever other types of claims you need for your site).

## Next Steps

1. [Modify the HTML](docs/02-how-to-modify-the-html.md)
1. [Modify the JavaScript](docs/03-how-to-modify-the-javascript.md)
