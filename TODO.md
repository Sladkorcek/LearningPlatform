## stvari.si TODO

Here is a list of to-do suggestions regarding the `stvari.si` platform and not directly `smirk` library.

- including the libraries
- document specifying what do you need installed on your computer to use this (if anything)
- fix weird behaviour on mobile devices, where space button doubles the text instead of inserting space
- make documentation more fun to read
- add photos to collection to reference them in a document instead of posting them on third party platform and using the link to there (or at least suggest the user a few ways to upload images)
- Add metadata (image, title and description) to all pages so that it displays a beautiful card on Facebook and Twitter

### Bugs
- Fix bug where empty collection can be added
- Save button in document editor should save document in background
- Documents should auto-save in background every 10 seconds 

### Features
- When in *lightning mode*, enable code completition and code formatting

### Documents
- add feedback when document is added to a collection

### Collections

- change the overview of the collectin to display the hierarchy
- add preview of the uploaded image to the page where you create a collection
- display the image of the collection next to it's name also in the overview of that particular collection
- make it easy to remove a document from a collection. It is not clear whether the delete button above the document (when you open document) will delete this document from all collections or will it remove the document from a collection
- make it clear whether adding a document to a collection just link it there or creates a new instance of it
- previews of documents in collection are pretty weird - they show raw text, you can see the \$ signs and the special figures (graphs, flashcards...) are ommited.
- add default image for collections without an image, blank is weird

### Profile

- password reset is at django -> might want to style it a little
- errors at creating a new profile should also highlight the field's that contributed to the error
- does a list of documents show the creation dates or last-edited dates next to each document? it is not clear
- starred and profile buttons lead to the same page
- rethink the layout. If I have 10 collections, my documents are very far down. Maybe have two tabs between user can switch to either see the collections or the documents

### Landing page

- replace stock shapes with our own
- create logo
- learn more page
- footer
- change punctuaion in "They say a picture is worth a thousand words, imagine what an interactive one can do." to ""They say a picture is worth a thousand words ... Imagine what an interactive one can do!"

### Explore page

- display star/unstar according to whether a user has starred a document/collection or no. This will prevent the debug page popup and the error caused by trying to star the thing you have starred before.
- rethink the layout, when many collections are trending, you have to scroll and scroll and scroll to get to the documents. Maybe limit it to 3 collections and then add button "see more" that redirects to a site that only contains trending collections. Same for documents.