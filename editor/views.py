from django.shortcuts import render, get_object_or_404
from .models import Document, Collection

import markdown
from .interactive_block import InlineInteractiveBlockExtension

MARKDOWN_EXTENSIONS = [
    InlineInteractiveBlockExtension()
]

def render_document(request, document_id):
    document = get_object_or_404(Document, pk=document_id)
    rendered_markdown = markdown.markdown(document.content, extensions=MARKDOWN_EXTENSIONS)
    return render(request, 'document/document.html', {
        'document': document,
        'rendered_markdown': rendered_markdown
    })