const fs = require('fs');

const file = fs.readFileSync('app/page.js', 'utf8');

const routes = [
  { func: 'renderContractsContent', folder: 'contracts', name: 'ContractsPage' },
  { func: 'renderClientsContent', folder: 'clients', name: 'ClientsPage' },
  { func: 'renderAnalyticsContent', folder: 'analytics', name: 'AnalyticsPage' },
  { func: 'renderReviewsContent', folder: 'reviews', name: 'ReviewsPage' },
  { func: 'renderUsersContent', folder: 'users', name: 'UsersPage' },
  { func: 'renderTicketsContent', folder: 'tickets', name: 'TicketsPage' }
];

routes.forEach(route => {
  // We look for: const renderXContent = () => { return ( ... ); };
  // Since some might have intermediate variables, we just match up to the end of the function.
  // Actually, wait, do any of them have variables?
  // Let's check `renderContractsContent`. It has no variables. Just return (...);
  const regex = new RegExp(`const ${route.func} = \\(\\) => {\\s*(?:return \\()?([\\s\\S]*?)(?:\\);)?\\s*};`);
  
  // A safer way since JS regex might struggle with nested braces is to just use standard string matching.
  const startStr = `const ${route.func} = () => {\n    return (\n`;
  const endStr = `\n    );\n  };\n`;
  let startIndex = file.indexOf(startStr);
  
  if(startIndex === -1) {
    // fallback if indentation differs
    startIndex = file.indexOf(`const ${route.func} = () => {\n    return (`);
  }
  
  if (startIndex !== -1) {
    const contentStart = startIndex + startStr.length;
    // We need to find the matching `);\n  };`
    // Actually, just indexOf the end string starting from contentStart
    const endIndex = file.indexOf(`\n    );\n  };`, contentStart);
    if(endIndex !== -1) {
       const jsx = file.substring(contentStart, endIndex);
       const content = `export default function ${route.name}() {\n  return (\n${jsx}\n  );\n}\n`;
       fs.writeFileSync(`app/${route.folder}/page.js`, content);
       console.log(`Created app/${route.folder}/page.js`);
    } else {
       console.log(`Failed to find end of ${route.func}`);
    }
  } else {
    console.log(`Failed to match ${route.func}`);
  }
});
