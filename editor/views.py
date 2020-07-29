from django.shortcuts import render, get_object_or_404, redirect, reverse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Document, Collection

import markdown
from .interactive_block import InlineInteractiveBlockExtension

MARKDOWN_EXTENSIONS = [
    InlineInteractiveBlockExtension()
]

def landing_page(request):
    return render(request, 'landing_page.html')

def login(request):
    return render(request, 'login.html')

@login_required
def documents(request):    
    # Show user a list of collections and documents
    return render(request, 'documents.html', {
        'user': request.user,
        'collections': Collection.objects.filter(owner=request.user),
        'documents': Document.objects.filter(owner=request.user)
    })

def user_profile(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    return render(request, 'user_profile.html', {
        'user': user,
        'collections': Collection.objects.filter(owner=user, visibility=Document.PUBLIC),
        'documents': Document.objects.filter(owner=user, visibility=Document.PUBLIC)
    })
    raise NotImplementedError

def render_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, pk=document_id)

    # Then check if user has permissions to access this document
    if not document.can_view(request.user):
        raise PermissionDenied

    rendered_markdown = markdown.markdown(document.content, extensions=MARKDOWN_EXTENSIONS)
    return render(request, 'document/document.html', {
        'document': document,
        'user_can_edit': document.can_edit(request.user),
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

    if request.method == 'POST':
        new_content = request.POST.get('document_content', None)
        
        # If no new document content was received, don't update it.
        if new_content is not None:
            document.content = new_content
            document.save()
        
        return redirect(reverse('render_document', args=(document.id, )))
    
    # TODO: If the document is public, allow user to fork it

    return render(request, 'document/edit_document.html', {
        'document': document,
    })

@login_required
def rename_document(request, document_id):
    if request.method != "POST":
        raise PermissionDenied

    document = get_object_or_404(Document, pk=document_id)

    if not document.can_edit(request.user):
        raise PermissionDenied

    new_name = request.POST.get('document_name', None)
    if new_name is None or len(new_name) <= 0:
        raise PermissionDenied

    document.title = new_name
    document.save()
    return redirect(reverse('edit_document', args=(document.id, )))

@login_required
def set_document_visibility(request, document_id):
    if request.method != "POST":
        raise PermissionDenied

    document = get_object_or_404(Document, pk=document_id)

    if not document.can_edit(request.user):
        raise PermissionDenied

    new_visibility = request.POST.get('document_visibility', None)
    if new_visibility is None or len(new_visibility) <= 0:
        raise PermissionDenied

    if new_visibility not in [Document.PRIVATE, Document.LINK, Document.PUBLIC]:
        raise PermissionDenied

    document.visibility = new_visibility
    document.save()

    return redirect(reverse('edit_document', args=(document.id, )))

def display_collection(request, collection_id):
    raise PermissionDenied

def create_collection(request):
    raise PermissionDenied