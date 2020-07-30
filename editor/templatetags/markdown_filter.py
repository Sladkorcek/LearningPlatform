from django import template
import markdown as md

from markdown.extensions import Extension
from markdown.inlinepatterns import InlineProcessor

import xml.etree.ElementTree as etree

class InteractiveBlockRemover(InlineProcessor):

    def __init__(self, pattern, md=None):
        super().__init__(pattern, md=md)

    def handleMatch(self, m, data):
        div = etree.Element('div')
        div.text = '...'
        return div, m.start(0), m.end(0)

class InlineInteractiveRemoverExtension(Extension):
    INTERACTIVE_BLOCK_PATTERN = r'{\s*:(.*?):\s*}'
    def extendMarkdown(self, md):
        md.inlinePatterns.register(InteractiveBlockRemover(InlineInteractiveRemoverExtension.INTERACTIVE_BLOCK_PATTERN, md), 'interactive_block', 175)


MARKDOWN_EXTENSIONS = [
    InlineInteractiveRemoverExtension()
]

register = template.Library()

@register.filter
def markdown(text):
    return md.markdown(text, extensions=MARKDOWN_EXTENSIONS)