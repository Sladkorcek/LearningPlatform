from django import template
from django.template.defaultfilters import stringfilter

import re
import mistune

INTERACTIVE_BOCK_PATTERN = re.compile('\{\s*\:([^:]*)\:\s*\}', flags=re.MULTILINE)

def parse_interactive_block(self, m, state):
    code = m.group(1)
    return { 'type': 'interactive_block', 'text': code }

def render_html_interactive_block(text):
    return f'<div class="interactive-block"><interactive>{text}</interactive></div>'

def render_html_remove_interactive_block(text):
    return ''

def plugin_interactive_block(md):
    md.block.register_rule('interactive_block', INTERACTIVE_BOCK_PATTERN, parse_interactive_block)
    md.block.rules.append('interactive_block')
    if md.renderer.NAME == 'html':
        md.renderer.register('interactive_block', render_html_interactive_block)

def plugin_remove_interactive_block(md):
    md.block.register_rule('interactive_block', INTERACTIVE_BOCK_PATTERN, parse_interactive_block)
    md.block.rules.append('interactive_block')
    if md.renderer.NAME == 'html':
        md.renderer.register('interactive_block', render_html_remove_interactive_block)

register = template.Library()

render_markdown = mistune.create_markdown(escape=False, plugins=[plugin_interactive_block])
render_markdown_excerpt = mistune.create_markdown(escape=False, plugins=[plugin_remove_interactive_block])

@register.filter(name='markdown_excerpt')
@stringfilter
def markdown_excerpt(text):
    return render_markdown_excerpt(text)

@register.filter(name='markdown')
@stringfilter
def markdown(text):
    return render_markdown(text)