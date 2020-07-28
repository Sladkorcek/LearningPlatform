from django.shortcuts import render, get_object_or_404
from django.core.exceptions import PermissionDenied
from .models import Document, Collection

import markdown
from .interactive_block import InlineInteractiveBlockExtension

MARKDOWN_EXTENSIONS = [
    InlineInteractiveBlockExtension()
]

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

def create_document(request):
    raise PermissionDenied

def edit_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, pk=document_id)

    # Then check if user has permissions to access this document
    if not document.can_view(request.user):
        return HttpResponseForbidden('The document you are trying to edit doesn\'t belong to you')
    
    # TODO: If the document is public, allow user to fork it

    return render(request, 'document/edit_document.html', {
        'document': document,
    })

def rename_document(request, document_id):
    raise PermissionDenied

def set_document_visibility(request, document_id):
    raise PermissionDenied