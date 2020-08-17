from django.shortcuts import render, get_object_or_404, redirect, reverse, HttpResponse
from django.core.exceptions import PermissionDenied
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Document, Collection, VisibilityMixin, DocumentStar, CollectionStar, UserProfile
from django.db.models import Count
from django.core.paginator import Paginator
from django.conf import settings

from django import forms
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth import update_session_auth_hash

def landing_page(request):
    return render(request, 'landing_page.html')

def help_center(request):
    return render(request, 'help_center.html')

def render_user_profile(request, user, is_own_page=False):
    tab = request.GET.get('tab', 'overview')
    page = int(request.GET.get('page', 1))

    context = {
        'user': user,
        'is_own_page': is_own_page,
        'tab': tab
    }

    if is_own_page:
        if tab == 'collections':
            collections = Paginator(Collection.objects.filter(owner=request.user), settings.COLLECTIONS_PER_PAGE)
            context['collections'] = collections.page(page)
        elif tab == 'documents':
            documents = Paginator(Document.objects.filter(owner=request.user), settings.DOCUMENTS_PER_PAGE)
            context['documents'] = documents.page(page)
        else:
            collections = Paginator(Collection.objects.filter(owner=request.user), settings.COLLECTIONS_PER_PAGE)
            documents = Paginator(Document.objects.filter(owner=request.user), settings.DOCUMENTS_PER_PAGE)
            context['collections'] = collections.page(1)
            context['documents'] = documents.page(1)
    else:
        if tab == 'collections':
            collections = Paginator(Collection.objects.filter(owner=user, visibility=Document.PUBLIC), settings.COLLECTIONS_PER_PAGE)
            context['collections'] = collections.page(page)
        elif tab == 'documents':
            documents = Paginator(Document.objects.filter(owner=user, visibility=Document.PUBLIC), settings.DOCUMENTS_PER_PAGE)
            context['documents'] = documents.page(page)
        else:
            collections = Paginator(Collection.objects.filter(owner=user, visibility=Document.PUBLIC), settings.COLLECTIONS_PER_PAGE)
            documents = Paginator(Document.objects.filter(owner=user, visibility=Document.PUBLIC), settings.DOCUMENTS_PER_PAGE)
            context['collections'] = collections.page(1)
            context['documents'] = documents.page(1)

    # Show user a list of collections and documents
    return render(request, 'user/user_profile.html', context)

@login_required
def documents(request):
    return redirect(reverse('user_profile', args=(request.user.username, )))

def user_profile(request, username):
    user = get_object_or_404(UserProfile, username=username)
    # The is_own_page variable is set to True only when user is viewing ther own
    # page. In this case, the create new buttons should be displayed and a list
    # of all documents and collection should be presented to them 
    is_own_page = request.user.is_authenticated and request.user == user
    return render_user_profile(request, user, is_own_page)

def render_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, uuid=document_id)

    # Then check if user has permissions to access this document
    if not document.can_view(request.user):
        raise PermissionDenied

    # If `action` argument is present, the user wants to perfom an action on
    # this document. Currently, there are 3 possible actions:
    #   * add - user wants to add document to collection
    #   * remove - user wants to remove document from collection
    #   * visibility - user wants to change the visibility of the document

    action = request.GET.get('action', '').lower()
    if action in ['add', 'remove', 'visibility']:

        # If user wants to change the visibility, there should also be a
        # visibilty string present
        if action == 'visibility':
            visibility = request.GET.get('visibility', None)
            if visibility in [VisibilityMixin.PRIVATE, VisibilityMixin.LINK, VisibilityMixin.PUBLIC]:
                document.visibility = visibility
                document.save()
        
        elif action in ['add', 'remove']:
            collection_id = request.GET.get('collection', None)
            if collection_id is not None:
                try:
                    collection = Collection.objects.get(uuid=collection_id)
                    if collection.can_edit(request.user):
                        if action == 'add':
                            if document not in list(collection.documents.all()):
                                collection.documents.add(document)
                                collection.save()
                                messages.success(request, 'Document "{}" added to collection "{}".'.format(document.title, collection.title))
                        elif action == 'remove':
                            if document in list(collection.documents.all()):
                                collection.documents.remove(document)
                                collection.save()
                                messages.success(request, 'Document "{}" removed from collection "{}".'.format(document.title, collection.title))
                except Exception:
                    pass
        
        # Redirect user back to render_document without GET parameters
        return redirect(reverse('render_document', args=(document_id, )))

    context = {
        'document': document,
        'user_can_edit': document.can_edit(request.user),
        'has_starred': document.has_starred(request.user),
    }

    # If user is logged in, allow them to add this document to collection
    if request.user.is_authenticated:
        collections = Collection.objects.filter(owner=request.user).all()
        contains_document = [document in collection.documents.all() for collection in collections]
        context['collections'] = zip(collections, contains_document)

    return render(request, 'document/document.html', context)

@login_required
def create_document(request):
    # When creating a new document, first a new database object should be
    # inserted, then user should be redirected to edit document page
    document = Document.empty_document(request.user)
    document.save()
    # After the document has been saved, its id can be read and used to
    # construct the edit url
    return redirect(reverse('edit_document', args=(document.uuid, )))

@login_required
def edit_document(request, document_id):
    # First, get document by its id or display an error
    document = get_object_or_404(Document, uuid=document_id)

    # Then check if user has permissions to edit this document
    if not document.can_edit(request.user):
        raise PermissionDenied

    if request.method == 'POST':
        new_content = request.POST.get('document_content', None)
        new_title = request.POST.get('document_name', None)
        new_visibility = request.POST.get('document_visibility', None)
        
        # If no new document content was received, don't update it.
        if new_content is not None:
            document.content = new_content
        if new_title is not None:
            document.title = new_title
        if new_visibility is not None:
            document.visibility = new_visibility
        
        document.save()
        
        return redirect(reverse('render_document', args=(document.uuid, )))

    return render(request, 'document/edit_document.html', {
        'document': document,
    })

@login_required
def delete_document(request, document_id):
    document = get_object_or_404(Document, uuid=document_id)

    if not document.can_edit(request.user):
        raise PermissionDenied

    # Delete the document from database
    document.delete()

    return redirect(reverse('documents'))

@login_required
def clone_document(request, document_id):
    document = get_object_or_404(Document, uuid=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    # Create a copy of the document, set its owner and save it to database
    document_copy = Document.clone(document, request.user)
    document_copy.save()

    # Redirect user to document editor
    return redirect(reverse('edit_document', args=(document_copy.uuid, )))

def raw_document(request, document_id):
    document = get_object_or_404(Document, uuid=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    return HttpResponse(document.content)

def display_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    action = request.GET.get('action', '').lower()
    if action in ['visibility', 'remove_document']:

        if collection.can_edit(request.user):
            # If user wants to change the visibility, there should also be a
            # visibilty string present
            if action == 'visibility':
                visibility = request.GET.get('visibility', None)
                if visibility in [VisibilityMixin.PRIVATE, VisibilityMixin.LINK, VisibilityMixin.PUBLIC]:
                    collection.visibility = visibility
                    collection.save()
            
            elif action == 'remove_document':
                try:
                    document_id = request.GET.get('document', None)
                    if document_id is not None:
                        document = Document.objects.get(uuid=document_id)
                        if document.can_view(request.user):
                            collection.documents.remove(document)
                            collection.save()
                except Exception:
                    pass
        
        return redirect(reverse('display_collection', args=(collection.uuid, )))


    return render(request, 'collection/collection.html', {
        'has_starred': collection.has_starred(request.user),
        'user_can_edit': collection.can_edit(request.user),
        'collection': collection
    })

@login_required
def clone_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    # Create a copy of the document, set its owner and save it to database
    collection_copy = Collection.clone(collection, request.user)
    collection_copy.save()

    # Redirect user to document editor
    return redirect(reverse('edit_collection', args=(collection_copy.uuid, )))

@login_required
def delete_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

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
            return redirect(reverse('display_collection', args=(new_collection.uuid, )))
    
    # If the request method is not POST return an empty form
    return render(request, 'collection/create_collection.html', {
        'form': form,
        'documents': Document.objects.filter(owner=request.user)
    })

@login_required
def edit_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

    if not collection.can_edit(request.user):
        raise PermissionDenied

    form = CollectionForm(request.POST or None, request.FILES or None, instance=collection)
    if request.method == 'POST':
        if form.is_valid():
            form.save()
            return redirect(reverse('display_collection', args=(collection.uuid, )))
    
    all_documents = set(collection.documents.all())
    all_documents = all_documents.union(Document.objects.filter(owner=request.user).all())
    
    return render(request, 'collection/edit_collection.html', {
        'form': form,
        'documents': all_documents,
        'collection': collection
    })

@login_required
def star_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    # Create a new star and save it to database, then redirect user back to document view
    new_star = CollectionStar(user=request.user, collection=collection)
    new_star.save()

    next_page = request.GET.get('next', None)
    if next_page is not None:
        return redirect(next_page)

    return redirect(reverse('display_collection', args=(collection.uuid, )))

@login_required
def unstar_collection(request, collection_id):
    collection = get_object_or_404(Collection, uuid=collection_id)

    if not collection.can_view(request.user):
        raise PermissionDenied

    try:
        star = CollectionStar.objects.get(user=request.user, collection=collection)
        star.delete()
    except CollectionStar.DoesNotExist:
        pass

    next_page = request.GET.get('next', None)
    if next_page is not None:
        return redirect(next_page)

    return redirect(reverse('display_collection', args=(collection.uuid, )))


@login_required
def star_document(request, document_id):
    document = get_object_or_404(Document, uuid=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    # Create a new star and save it to database, then redirect user back to document view
    new_star = DocumentStar(user=request.user, document=document)
    new_star.save()

    next_page = request.GET.get('next', None)
    if next_page is not None:
        return redirect(next_page)

    return redirect(reverse('render_document', args=(document.uuid, )))

@login_required
def unstar_document(request, document_id):
    document = get_object_or_404(Document, uuid=document_id)

    if not document.can_view(request.user):
        raise PermissionDenied

    try:
        star = DocumentStar.objects.get(user=request.user, document=document)
        star.delete()
    except DocumentStar.DoesNotExist:
        pass

    next_page = request.GET.get('next', None)
    if next_page is not None:
        return redirect(next_page)

    return redirect(reverse('render_document', args=(document.uuid, )))

def explore(request):

    # TODO: Fix this to only count stars in certain time period

    # Find all PUBLIC documents that have at least 0 stars
    trending_documents = Document.objects.filter(visibility=VisibilityMixin.PUBLIC).annotate(total_stars=Count('stars')).filter(total_stars__gt=0)
    has_starred_documents = [document.has_starred(request.user) for document in trending_documents]

    # Find all PUBLIC collections that have at least 0 stars 
    trending_collections = Collection.objects.filter(visibility=VisibilityMixin.PUBLIC).annotate(total_stars=Count('stars')).filter(total_stars__gt=0)
    has_starred_collections = [collection.has_starred(request.user) for collection in trending_collections]

    return render(request, 'trending.html', {
        'trending_documents': zip(trending_documents, has_starred_documents),
        'trending_collections': zip(trending_collections, has_starred_collections)
    })

@login_required
def stars(request):
    tab = request.GET.get('tab', 'collections')
    page = int(request.GET.get('page', 1))

    context = {
        'tab': tab,
        'user': request.user,
        'is_own_page': True
    }

    if tab == 'collections':
        starred_collections = [star.collection for star in CollectionStar.objects.filter(user=request.user)]
        collections = Paginator(starred_collections, settings.COLLECTIONS_PER_PAGE)
        context['collections'] = collections.page(page)
    elif tab == 'documents':
        starred_documents = [star.document for star in DocumentStar.objects.filter(user=request.user)]
        documents = Paginator(starred_documents, settings.DOCUMENTS_PER_PAGE)
        context['documents'] = documents.page(page)

    return render(request, 'user/stars.html', context)

class EditProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['bio', 'image']

@login_required
def edit_user_profile(request, username):
    user = get_object_or_404(UserProfile, username=username)
    if request.user != user:
        raise PermissionDenied

    form = EditProfileForm(instance=request.user)
    password_change_form = PasswordChangeForm(request.user)

    if request.method == 'POST':
        received_form = request.POST.get('form', None)
        if received_form is not None and received_form in ['update_bio', 'change_password']:
            if received_form == 'update_bio':
                form = EditProfileForm(request.POST or None, request.FILES or None, instance=request.user)
                if form.is_valid():
                    form.save()
            elif received_form == 'change_password':
                password_change_form = PasswordChangeForm(request.user, request.POST or None)
                if password_change_form.is_valid():
                    password_change_form.save()
                    update_session_auth_hash(request, request.user)
    
    return render(request, 'user/user_profile_edit.html', {
        'form': form,
        'password_change_form': password_change_form
    })

@login_required
def upload_image(request):
    pass