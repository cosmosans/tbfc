import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
import {renderMarkup} from '../src/templates/renderMarkup.ts'
test('template replacement preserves literal dollars, trailing content and non-recursive values',()=>{
 assert.equal(renderMarkup('<b>{{label}}</b>{{suffix}}\n',{label:'$& $1 {{suffix}}',suffix:' · '}),'<b>$& $1 {{suffix}}</b> · ')
 assert.throws(()=>renderMarkup('{{missing}}',{}),/Missing template value/)
})
test('all live screen templates have bindings for their placeholders',()=>{
 let count=0
 for(const file of ['kickOff.ts','teamSelect.ts','lineup.ts','pauseMenu.ts','main.ts','sideSelect.ts','stadiumSelect.ts']){
  const url=new URL('../src/'+file,import.meta.url),text=readFileSync(url,'utf8'),ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true),imports=new Map()
  for(const n of ast.statements)if(ts.isImportDeclaration(n)&&n.importClause?.name&&n.moduleSpecifier.text.endsWith('.html?raw'))imports.set(n.importClause.name.text,n.moduleSpecifier.text.replace('?raw',''))
  function walk(n){
   if(ts.isCallExpression(n)&&n.expression.getText(ast)==='renderMarkup'){
    const [template,values]=n.arguments,path=imports.get(template.getText(ast));assert.ok(path)
    const html=readFileSync(new URL(path,url),'utf8'),keys=new Set(values.properties.map(p=>p.name.getText(ast)))
    for(const [,key]of html.matchAll(/\{\{([\w$]+)\}\}/g))assert.ok(keys.has(key),`${file}: ${path} missing ${key}`)
    count++
   }
   ts.forEachChild(n,walk)
  }walk(ast)
 }
 assert.ok(count>=25)
})
