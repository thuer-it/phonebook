const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8090;
const DATA_FILE = '/data/contacts.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load contacts
function loadContacts() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

// Save contacts
function saveContacts(contacts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(contacts, null, 2));
}

// Generate next ID
function nextId(contacts) {
  return contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
}

// --- REST API ---

app.get('/api/contacts', (req, res) => {
  res.json(loadContacts());
});

app.post('/api/contacts', (req, res) => {
  const contacts = loadContacts();
  const contact = { id: nextId(contacts), ...req.body };
  contacts.push(contact);
  saveContacts(contacts);
  res.status(201).json(contact);
});

app.put('/api/contacts/:id', (req, res) => {
  const contacts = loadContacts();
  const idx = contacts.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  contacts[idx] = { id: parseInt(req.params.id), ...req.body };
  saveContacts(contacts);
  res.json(contacts[idx]);
});

app.delete('/api/contacts/:id', (req, res) => {
  const contacts = loadContacts();
  const filtered = contacts.filter(c => c.id !== parseInt(req.params.id));
  saveContacts(filtered);
  res.status(204).end();
});

// --- Grandstream XML ---
app.get('/phonebook.xml', (req, res) => {
  const contacts = loadContacts();
  const sorted = [...contacts].sort((a, b) =>
    `${a.lastname}${a.firstname}`.localeCompare(`${b.lastname}${b.firstname}`)
  );

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<AddressBook>\n`;
  for (const c of sorted) {
    xml += `  <Contact>\n`;
    xml += `    <FirstName>${esc(c.firstname)}</FirstName>\n`;
    xml += `    <LastName>${esc(c.lastname)}</LastName>\n`;
    xml += `    <Company>${esc(c.company)}</Company>\n`;
    if (c.phone)  xml += `    <Phone><phonenumber>${esc(c.phone)}</phonenumber><accountindex>0</accountindex></Phone>\n`;
    if (c.mobile) xml += `    <Phone><phonenumber>${esc(c.mobile)}</phonenumber><accountindex>0</accountindex></Phone>\n`;
    xml += `  </Contact>\n`;
  }
  xml += `</AddressBook>`;

  res.set('Content-Type', 'application/xml');
  res.send(xml);
});

// --- UniFi Talk CSV ---
app.get('/phonebook.csv', (req, res) => {
  const contacts = loadContacts();
  const sorted = [...contacts].sort((a, b) =>
    `${a.lastname}${a.firstname}`.localeCompare(`${b.lastname}${b.firstname}`)
  );

  let csv = 'first_name,last_name,company,job_title,email,mobile_number,home_number,work_number,fax_number,other_number\n';
  for (const c of sorted) {
    csv += `"${c.firstname || ''}","${c.lastname || ''}","${c.company || ''}","","","${c.mobile || ''}","","${c.phone || ''}","",""\n`;
  }

  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="phonebook.csv"');
  res.send(csv);
});

function esc(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

app.listen(PORT, () => console.log(`Phonebook running on port ${PORT}`));
