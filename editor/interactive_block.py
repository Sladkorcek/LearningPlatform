from markdown.extensions import Extension
from markdown.inlinepatterns import InlineProcessor

import xml.etree.ElementTree as etree

class InteractiveBlockProcessor(InlineProcessor):

    def __init__(self, pattern, md=None):
        super().__init__(pattern, md=md)
        self.interactive_block_number = 0

    def generate_attributes(self):
        self.interactive_block_number += 1
        return {
            'class': 'interactive-block',
            'id': 'interactive-block-{}'.format(self.interactive_block_number)
        }

    def handleMatch(self, m, data):
        div = etree.Element('div', attrib=self.generate_attributes())
        interactive_block = etree.SubElement(div, 'interactive')
        interactive_block.text = m.group(1)
        return div, m.start(0), m.end(0)

class InlineInteractiveBlockExtension(Extension):

    INTERACTIVE_BLOCK_PATTERN = r'{\s*:(.*?):\s*}'

    def extendMarkdown(self, md):
        md.inlinePatterns.register(InteractiveBlockProcessor(InlineInteractiveBlockExtension.INTERACTIVE_BLOCK_PATTERN, md), 'interactive_block', 175)
