"""Rebuild Portuguese pages after editing English HTML or pt-br.json. No dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json,re
ROOT=Path(__file__).resolve().parent.parent
translations=json.loads((ROOT/'scripts/pt-br.json').read_text())
PAGES=['index.html','appredesign.html','admissionredesign.html','gamification.html','404.html']
class Translator(HTMLParser):
 def __init__(self,page):super().__init__(convert_charrefs=False);self.output=[];self.raw=False;self.page=page
 def handle_starttag(self,tag,attrs):
  if tag in ['script','style']:self.raw=True
  out=[]
  for key,value in attrs:
   if value is None:out.append(key);continue
   if key in ['alt','aria-label','title','content']:value=translations.get(value,value)
   if tag=='html' and key=='lang':value='pt-BR'
   # Base keeps shared assets in the repository root; local page links use PT paths.
   if key=='href' and value.split('#')[0] in PAGES:value='pt-br/'+value
   elif key=='href' and value.startswith('#'):value='pt-br/'+self.page+value
   out.append(f'{key}="{escape(value,quote=True)}"')
  self.output.append('<'+tag+(' '+' '.join(out) if out else '')+'>')
  if tag=='head':self.output.append('\n<base href="../">')
 def handle_endtag(self,tag):
  self.output.append('</'+tag+'>')
  if tag in ['script','style']:self.raw=False
 def handle_data(self,data):
  if self.raw:self.output.append(data);return
  normalized=' '.join(data.split())
  if not normalized:self.output.append(data);return
  translated=translations.get(normalized)
  if translated is None:raise ValueError('Missing translation: '+normalized)
  self.output.append((' ' if data[:1].isspace() else '')+escape(translated)+(' ' if data[-1:].isspace() else ''))
 def handle_entityref(self,name):self.output.append('&'+name+';')
 def handle_charref(self,name):self.output.append('&#'+name+';')
 def handle_comment(self,data):self.output.append('<!--'+data+'-->')
 def handle_decl(self,data):self.output.append('<!'+data+'>')
for name in PAGES:
 src=(ROOT/name).read_text()
 src=re.sub(r'<div class="language-switch"[^>]*>.*?</div>', '', src, flags=re.S)
 parser=Translator(name);parser.convert_charrefs=True;parser.feed(src)
 s=''.join(parser.output)
 switch=f'<div class="language-switch" aria-label="Idioma"><a href="{name}" data-language="en" lang="en">EN</a><a href="pt-br/{name}" data-language="pt-BR" lang="pt-BR" aria-current="page">PT-BR</a></div>'
 s=s.replace('<button type="button" id="toggleTheme"',switch+'<button type="button" id="toggleTheme"',1)
 (ROOT/'pt-br'/name).write_text(s)
print('Built',len(PAGES),'Portuguese pages')
