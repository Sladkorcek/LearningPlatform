from django.shortcuts import render, get_object_or_404, redirect, reverse, HttpResponse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Document, Collection, VisibilityMixin

from django import forms

import markdown
from .interactive_block import InlineInteractiveBlockExtension

MARKDOWN_EXTENSIONS = [
    InlineInteractiveBlockExtension()
]

def landing_page(request):
    return render(request, 'landing_page.html')

def help_center(request):
    return render(request, 'help_center.html')

@login_required
def documents(request):    
    # Show user a list of collections and documents
    return render(request, 'documents.html', {
        'collections': Collection.objects.filter(owner=request.user),
        'documents': Document.objects.filter(owner=request.user)
    })

def user_profile(request, user_id):
    user = get_object_or_404(User, pk=user_id)

    if request.user.is_authenticated and request.user == user:
        return documents(request)

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

    # If request argument 'collection' is present, the user wants to add this
    # document to specific collection
    collection_id = request.GET.get('collection', None)
    if collection_id is not None:
        try:
            collection = Collection.objects.get(pk=int(collection_id))
            if collection.can_edit(request.user):
                if document not in list(collection.documents.all()):
                    collection.documents.add(document)
                    collection.save()
        finally:
            return redirect(reverse('render_document', args=(document_id, )))

    rendered_markdown = markdown.markdown(document.content, extensions=MARKDOWN_EXTENSIONS)

    context = {
        'document': document,
        'user_can_edit': document.can_edit(request.user),
        'rendered_markdown': rendered_markdown
    }

    # If user is logged in, allow them to add this document to collection
    if request.user.is_authenticated:
        context['collections'] = Collection.objects.filter(owner=request.user)

    return render(request, 'document/document.html', context)

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

@login_required
def delete_document(request, document_id):
    document = get_object_or_404(Document, pk=document_id)

    if not document.can_edit(request.user):
        raise PermissionDenied

    # Delete the document from database
    document.delete()

    return redirect(reverse('documents'))

@login_required
def clone_document(request, document_id):
    document = get_object_or_404(Document, pk=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    # Create a copy of the document, set its owner and save it to database
    document_copy = Document.clone(document, request.user)
    document_copy.save()

    # Redirect user to document editor
    return redirect(reverse('edit_document', args=(document_copy.id, )))

def raw_document(request, document_id):
    document = get_object_or_404(Document, pk=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    return HttpResponse(document.content)

def display_collection(request, collection_id):
    collection = get_object_or_404(Collection, pk=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    return render(request, 'collection/collection.html', {
        'user_can_edit': collection.can_edit(request.user),
        'collection': collection
    })

@login_required
def clone_collection(request, collection_id):
    collection = get_object_or_404(Collection, pk=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    # Create a copy of the document, set its owner and save it to database
    collection_copy = Collection.clone(collection, request.user)
    collection_copy.save()

    # Redirect user to document editor
    return redirect(reverse('edit_collection', args=(collection_copy.id, )))

@login_required
def delete_collection(request, collection_id):
    collection = get_object_or_404(Collection, pk=collection_id)

    if not collection.can_edit(request.user):
        raise PermissionDenied

    # Delete the collection object
    collection.delete()

    return redirect(reverse('documents'))

class CollectionForm(forms.ModelForm):
    class Meta:
        model = Collection
        fields = ['title', 'description', 'image', 'visibility', 'documents']

@login_required
def create_collection(request):
    form = CollectionForm(request.POST or None, request.FILES or None, initial={'documents': []})
    if request.method == 'POST':
        if form.is_valid():
            new_collection = form.save(commit=False)
            new_collection.owner = request.user
            new_collection.save()
            form.save_m2m()
            return redirect(reverse('display_collection', args=(new_collection.id, )))
    
    # If the request method is not POST return an empty form
    return render(request, 'collection/create_collection.html', {
        'form': form,
        'documents': Document.objects.filter(owner=request.user)
    })

@login_required
def edit_collection(request, collection_id):
    collection = get_object_or_404(Collection, pk=collection_id)

    if not collection.can_edit(request.user):
        raise PermissionDenied

    form = CollectionForm(request.POST or None, request.FILES or None, instance=collection)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            return redirect(reverse('display_collection', args=(collection.id, )))
    
    all_documents = set(collection.documents.all())
    all_documents = all_documents.union(Document.objects.filter(owner=request.user).all())
    
    return render(request, 'collection/edit_collection.html', {
        'form': form,
        'documents': all_documents,
        'collection': collection
    })