# Phonebook

A lightweight self-hosted phonebook for Grandstream IP phones and UniFi Talk.

## Features

- Web UI to manage contacts (first name, last name, company, phone, mobile)
- Grandstream XML phonebook endpoint (`/phonebook.xml`)
- UniFi Talk CSV export (`/phonebook.csv`)
- Contacts stored in a simple JSON file

## Deployment

```bash
docker compose up -d --build
```

The web UI is available at `http://<host>:8090`.

## Grandstream Remote Phonebook

Enter the following URL in your Grandstream device under **Phonebook → Remote Phonebook → URL**:

```
http://<host>:8090/phonebook.xml
```

## UniFi Talk

Download the CSV via the **CSV Export** button and import it in UniFi Talk under **Contacts → Import**.

## Development

```bash
npm install
node server.js
```

---

&copy; [Thür IT & Medienservices](https://thuer-it.com)
