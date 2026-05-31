const fs = require('fs');
const { Parser } = require('htmlparser2');
const html = fs.readFileSync('index.html', 'utf8');
const stack = [];
const parser = new Parser({
  onopentag(name, attrs) {
    stack.push({ name, attrs });
  },
  onclosetag(name) {
    const top = stack[stack.length - 1];
    if (top && top.name === name) {
      stack.pop();
    } else {
      console.log('MISMATCH close', name, 'top', top && top.name, 'stack len', stack.length);
      const idx = stack.map(t => t.name).lastIndexOf(name);
      if (idx !== -1) stack.splice(idx);
    }
  }
}, { decodeEntities: true });
parser.write(html);
parser.end();
console.log('remaining', stack.length, stack.slice(-10).map((t, i) => ({ idx: i, name: t.name, attrs: t.attrs })));