# Manuale Utente: Agile Business Vision Builder

**Versione:** 1.0
**Data:** 9 Luglio 2025

---

## 1. Introduzione

Benvenuto in **Agile Business Vision Builder**!

Questo strumento è un'applicazione web interattiva progettata per aiutare imprenditori, startupper e manager a costruire, analizzare e visualizzare la visione finanziaria del proprio business in modo agile e dinamico.

A differenza dei tradizionali e rigidi fogli di calcolo, questa applicazione trasforma la pianificazione finanziaria in un processo intuitivo, visivo e flessibile. Ti permette di prendere decisioni strategiche basate su dati solidi e proiezioni che si aggiornano in tempo reale.

**Caratteristiche principali:**
*   **Pianificazione Finanziaria Completa:** Definisci assunzioni, costi, modello di acquisizione clienti e investimenti.
*   **Dashboard Esecutiva:** Visualizza i KPI e i grafici principali del tuo business plan in una singola schermata.
*   **Report Automatici:** Genera automaticamente Conto Economico e Rendiconto Finanziario.
*   **Analisi di Sensibilità:** Testa la robustezza del tuo piano al variare delle ipotesi chiave (analisi "what-if").
*   **Esportazione Semplice:** Esporta il tuo piano in formato PDF o CSV.
*   **Privacy Garantita:** Tutti i dati inseriti vengono processati e salvati unicamente nel tuo browser. Nessuna informazione viene inviata a server esterni.

---

## 2. Primi Passi: Installazione e Avvio

Per utilizzare l'applicazione sul tuo computer, devi avere installato **Node.js** e **npm**.

Segui questi semplici passaggi:

1.  **Clona il Repository**
    Apri un terminale o prompt dei comandi e clona il progetto usando Git:
    ```bash
    git clone https://github.com/krea424/agile-business-vision-builder.git
    ```

2.  **Entra nella Cartella del Progetto**
    ```bash
    cd agile-business-vision-builder
    ```

3.  **Installa le Dipendenze**
    Esegui questo comando per installare tutti i pacchetti necessari:
    ```bash
    npm install
    ```

4.  **Avvia l'Applicazione**
    Una volta completata l'installazione, avvia il server di sviluppo:
    ```bash
    npm run dev
    ```
    L'applicazione sarà ora accessibile nel tuo browser all'indirizzo **http://localhost:5173**.

---

## 3. Guida all'Interfaccia

L'applicazione è divisa in sezioni, ognuna dedicata a un aspetto specifico della pianificazione finanziaria.

### 3.1. Dashboard Esecutiva (`Executive Dashboard`)

Questa è la schermata principale che ti fornisce una sintesi visiva della salute finanziaria del tuo piano. Qui troverai:
*   **KPI Principali:** Ricavi Totali, Costi Totali, Utile Netto e Flusso di Cassa.
*   **Grafici Interattivi:** Andamento mensile di ricavi, costi e profittabilità.
*   **Punto di Pareggio (Break-Even Point):** Il momento in cui i ricavi coprono i costi.

Ogni dato in questa dashboard si aggiorna istantaneamente mentre modifichi le altre sezioni del piano.

### 3.2. Modulo di Pianificazione

Questa è l'area di lavoro dove inserirai tutti i dati del tuo business. È organizzata in diverse schede.

#### a. Assunzioni Generali (`General Assumptions`)
Qui imposti i parametri di base del tuo piano:
*   **Periodo di Proiezione:** La durata della tua analisi (es. 36 mesi).
*   **Valuta:** La valuta utilizzata per tutti i calcoli.
*   **Aliquota Fiscale:** La percentuale di tasse applicata ai profitti.

#### b. Costi (`Costs`)
In questa sezione puoi definire la struttura dei costi della tua attività.
*   **Costi Fissi (`Fixed Costs`):** Inserisci i costi che non variano con la produzione o le vendite, come affitto, stipendi amministrativi, abbonamenti software. Puoi aggiungere o rimuovere voci liberamente.
*   **Costi del Personale (`Personnel Costs`):** Dettaglia i costi legati ai dipendenti, specificando ruolo, stipendio lordo e data di assunzione prevista.
*   **Costi Variabili (`Variable Costs`):** Definisci i costi direttamente legati alle vendite, come il costo delle merci vendute (COGS) o le commissioni.

#### c. Clienti (`Clients`)
Modella come la tua azienda acquisisce clienti e genera ricavi.
*   **Nuovi Clienti (`New Clients`):** Imposta i canali di marketing (es. campagne a pagamento, traffico organico) con i relativi parametri (budget, costo per clic, tassi di conversione).
*   **Clienti Acquisiti Direttamente (`Directly Acquired Clients`):** Aggiungi clienti derivanti da vendite dirette o partnership.
*   **Clienti di Ritorno (`Recoverable Clients`):** Definisci il tasso di fidelizzazione dei clienti e la frequenza di riacquisto.

#### d. Investimenti (`Investments`)
Registra gli investimenti una tantum o i finanziamenti ricevuti, come l'acquisto di attrezzature o un round di finanziamento da investitori.

### 3.3. Report Finanziari

L'applicazione genera automaticamente i due principali report finanziari basandosi sui dati che hai inserito.
*   **Conto Economico (`Income Statement`):** Mostra la performance economica (ricavi, costi, utile/perdita) su base mensile o annuale.
*   **Rendiconto Finanziario (`Cash Flow Statement`):** Traccia i flussi di cassa in entrata e in uscita, mostrando la liquidità effettiva dell'azienda.

---

## 4. Funzionalità Avanzate

### 4.1. Analisi di Sensibilità (`Sensitivity Analysis`)

Questa potente funzionalità ti permette di testare la solidità del tuo piano. Puoi simulare come cambierebbero i tuoi risultati finanziari al variare delle tue assunzioni più critiche.

**Come usarla:**
1.  **Vai alla pagina `Sensitivity Analysis`**.
2.  **Seleziona le Variabili Chiave:** Scegli una o più variabili da analizzare (es. tasso di conversione, costo per acquisizione cliente, prezzo del prodotto).
3.  **Definisci un Intervallo di Variazione:** Imposta di quanto vuoi far variare le variabili selezionate (es. da -20% a +20% rispetto al valore del tuo piano).
4.  **Analizza i Risultati:** Il sistema ti mostrerà l'impatto di queste variazioni sui tuoi KPI principali (come Utile Netto e Flusso di Cassa) attraverso tabelle e grafici di facile lettura.

### 4.2. Esportazione del Piano

Puoi esportare il tuo lavoro in qualsiasi momento.
1.  Clicca sul pulsante di esportazione.
2.  Scegli il formato desiderato:
    *   **PDF:** Ideale per creare un report pulito e professionale da condividere.
    *   **CSV:** Utile per esportare i dati grezzi e analizzarli ulteriormente con altri software come Excel o Google Sheets.

---

## 5. Domande Frequenti (FAQ)

**D: I miei dati sono al sicuro?**
**R:** Sì. Tutti i dati che inserisci vengono gestiti e salvati esclusivamente all'interno del tuo browser. Nessuna informazione finanziaria viene inviata o memorizzata su server esterni, garantendo la massima privacy e confidenzialità.

**D: Posso salvare il mio lavoro e riprenderlo in seguito?**
**R:** L'applicazione salva automaticamente lo stato attuale nel `localStorage` del tuo browser. Se chiudi la scheda e la riapri, dovresti ritrovare i dati che hai inserito. Tuttavia, per la massima sicurezza, si consiglia di completare e esportare il piano in una singola sessione.

**D: L'applicazione sembra lenta. Cosa posso fare?**
**R:** I calcoli sono quasi istantanei. Se noti lentezza, assicurati di utilizzare una versione aggiornata di un browser moderno (Chrome, Firefox, Safari, Edge) e che non ci siano altre schede o estensioni che consumano eccessive risorse del computer.
