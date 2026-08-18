const fs = require('fs');
const path = 'c:/Users/IPK Computers/Desktop/medi front/src/pages/pharmacist/PharmacistPatients.jsx';
let content = fs.readFileSync(path, 'utf8');

const brokenRegex = /<\/table>\s*<\/div>\s*<\/div>\s*<div className="mb-4">\s*<label className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2">Note Content<\/label>/;

const correctBlock = '</table>\n               </div>\n             </div>\n\n             {/* Clinical Notes (Takes 1 column) */}\n             <div className="space-y-4">\n               <div className="flex justify-between items-center">\n                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">\n                   <div className="bg-amber-600 text-white p-2.5 rounded-lg"><ClipboardList className="w-5 h-5" /></div>\n                   Notes\n                 </h3>\n                 <button \n                   onClick={() => setIsAddingNote(!isAddingNote)}\n                   className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-lg transition-all shadow-md"\n                   title="Add new note"\n                 >\n                   <Plus className="w-5 h-5" />\n                 </button>\n               </div>\n\n               <div className="space-y-3">\n                 \n                 {isAddingNote && (\n                   <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 shadow-sm">\n                      <div className="mb-4">\n                        <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2">Note Type</label>\n                        <select \n                          value={newNote.type}\n                          onChange={e => setNewNote({...newNote, type: e.target.value})}\n                          className="w-full bg-white border-2 border-amber-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 font-medium outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-100 transition-all"\n                        >\n                          <option value="Counseling">Counseling Note</option>\n                          <option value="Allergy">Allergy Warning</option>\n                          <option value="General">General Note</option>\n                        </select>\n                      </div>\n                      <div className="mb-4">\n                        <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-2">Note Content</label>';

if (content.match(brokenRegex)) {
    content = content.replace(brokenRegex, correctBlock);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Fixed syntax error!');
} else {
    console.log('Could not find the exact broken block. Regex failed.');
}
