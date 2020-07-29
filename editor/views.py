from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required

from .models import Document, Collection

import markdown
from .interactive_block import InlineInteractiveBlockExtension

MARKDOWN_EXTENSIONS = [
    InlineInteractiveBlockExtension()
]

def landing_page(request):
    return NotImplementedError

def index(request):
    # If user is not logged in, display a landing page
    if not request.user.is_authenticated:
        return landing_page(request)
    
    # Otherwise show them a list of collections and documents
    return render(request, 'user_page.html', {
        'user': request.user,
        'collections': Collection.objects.filter(owner=request.user),
        'documents': Document.objects.filter(owner=request.user)
    })

def render_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, pk=document_id)

    # Then check if user has permissions to access this document
    if not document.can_view(request.user):
        raise PermissionDenied

    rendered_markdown = markdown.markdown(document.content, extensions=MARKDOWN_EXTENSIONS)
    return render(request, 'document/document.html', {
        'document': document,
        'rendered_markdown': rendered_markdown
    })

@login_required
def create_document(request):
    # When creating a new document, first a new database object should be
    # inserted, then user should be redirected to edit document page
    document = Document.empty_document(request.user)
    document.save()
    # After the document has been saved, its id can be read and used to
    # construct the edit url
    return redirect(reverse('edit_document', args=(document.id, )))

@login_required
def edit_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, pk=document_id)

    # Then check if user has permissions to edit this document
    if not document.can_edit(request.user):
        raise PermissionDenied
    
    # TODO: If the document is public, allow user to fork it

    return render(request, 'document/edit_document.html', {
        'document': document,
    })

@login_required
def rename_document(request, document_id):
    document = get_object_or_404(Document, pk=document_id)

    if not document.can_edit(request.user):
        raise PermissionDenied

    raise PermissionDenied

@login_required
def set_document_visibility(request, document_id):
    raise PermissionDenied

def display_collection(request, collection_id):
    raise PermissionDenied

def create_collection(request):
    raise PermissionDenied