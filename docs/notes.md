
## Prototipo 1
Cookie (sicuro) + sessione.
Alla login viene creata una sessione volatile (2 settimane) su redis e viene generato un cookie di sessione sicuro della durata di 6 mesi.
Quest'ultimo non può essere maneggiato dal client (opzioni di sicurezza) e viene rimandato al server ad ogni richiesta automaticamente.


Tutte le rotte (esclusa la login) passano attraverso un hook di validazione che controlla il cookie (presenza, validità, data di scadenza, ecc), la presenza della sessione e la presenza dell'utente a db.

Ogni volta che un api passa tutti i check di autenticazione, il TTL della sessione redis viene ripristinato.
Questo fa si che se l'utente non usi il sistema per più di 2 settimane, la sessione verrà cancellata e occorrerà rifare il login.
Se invece l'utente utilizza continuamente il sistema, dopo max 6 mesi il cookie scadrà e quindi occorrerà rifare la login