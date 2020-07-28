from django.db import models
from django.conf import settings
from django.utils import timezone

# TimeStampMixin object has been copied from
# https://stackoverflow.com/questions/3429878/automatic-creation-date-for-django-model-form-objects
# This mixin is abstract, so any model that needs to have created_at and
# updated_at fields can extend it
class TimeStampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Document(TimeStampMixin):
    # Each document has a title and a content. Document title must not be empty.
    # The content is the markdown that the user has saved into this document.
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)

    # If the document is forked, the forked_from ForeignKey will point the
    # original document. If the original document is deleted, the forked_from
    # property should be set to None.
    forked_from = models.ForeignKey("Document", null=True, blank=True, on_delete=models.SET_NULL)

    # The owner of the file, it should never be empty
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Each document also has three possible visiblity options:
    #   * private - only the document owner has access
    #   * link - everybody with link has access to document
    #   * public - everybody has access to document
    # Only documents that are public can be searched. 
    PRIVATE = 'pr'
    LINK = 'li'
    PUBLIC = 'pu'
    VISIBILTY_CHOICES = [
        (PRIVATE, 'Private'),
        (LINK, 'Access with link'),
        (PUBLIC, 'Public'),
    ]
    visibility = models.CharField(max_length=2, choices=VISIBILTY_CHOICES, default=PRIVATE)

class Collection(TimeStampMixin):
    # Each collection has a title, short description and and image. Only the
    # title is necessary. If no image is provided, a gray image is displayed
    # instead.
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(blank=True, null=True)
    
    # The creator of this collection, it should never be empty
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    # Each collection contains a list of documents
    documents = models.ManyToManyField(Document)