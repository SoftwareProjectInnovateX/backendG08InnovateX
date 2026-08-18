const fs = require('fs');
const path = 'c:/Users/IPK Computers/Desktop/medi front/src/pages/pharmacist/PharmacistPatients.jsx';
let content = fs.readFileSync(path, 'utf8');

// I need to add one missing '</div>' before '{/* Clinical Notes'
content = content.replace(
    '               </div>\n             </div>\n\n             {/* Clinical Notes (Takes 1 column) */}',
    '               </div>\n             </div>\n             </div>\n\n             {/* Clinical Notes (Takes 1 column) */}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added missing closing div!');
