## stvari.si TODO

A list of bugs and features for [stvari.si](http://stvari.si) note-taking platform.

### Bugs
- Fix bug where empty collection can be added
- Collection images all have different widths
- Make documentation more fun to read
- Fix weird behaviour on mobile devices, where space button doubles the text instead of inserting space

### Features
- When in *lightning mode*, enable code completition and code formatting
- Add metadata (image, title and description) to all pages so that it displays a beautiful card on Facebook and Twitter
- Including different libraries (like `smirk-math`, `smirk-geography`, etc.)
- Add photos to collection to reference them in a document instead of posting them on third party platform and using the link to there (or at least suggest the user a few ways to upload images)

### Documents
- Add feedback when document is added to a collection

### Collections
- change the overview of the collectin to display the hierarchy
- add preview of the uploaded image to the page where you create a collection
- make it clear whether adding a document to a collection just link it there or creates a new instance of it
- previews of documents in collection are pretty weird - they show raw text, you can see the \$ signs and the special figures (graphs, flashcards...) are ommited.

### Profile
- Update endpoint for user profiles to `/user/<username>`
- Add an email field to registration page
- Enable password reset and change the default Django styling
- Display error if there was an error while creating profile below the input field

- does a list of documents show the creation dates or last-edited dates next to each document? it is not clear
- starred and profile buttons lead to the same page
- rethink the layout. If I have 10 collections, my documents are very far down. Maybe have two tabs between user can switch to either see the collections or the documents

### Landing page
- Draw stock shapes and use them for the landing page call-to-action background
- Design a logo
- Write interactive elements reference
- Write a tutorial (easier to follow than a reference)
- Change footer - add links, `About us`, ...

### Explore page
- Rethink the layout, when many collections are trending, you have to scroll and scroll and scroll to get to the documents. Maybe limit it to 3 collections and then add button "see more" that redirects to a site that only contains trending collections. Same for documents.