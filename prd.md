### **Documento dei Requisiti di Prodotto (PRD): Agile Business Vision Builder**

**Versione:** 1.0
**Data:** 8 Luglio 2025
**Autore:** Gemini

---

#### **1. Introduzione e Visione del Prodotto**

L'**Agile Business Vision Builder** è un'applicazione web interattiva progettata per consentire a imprenditori, startupper e manager di costruire, analizzare e visualizzare la visione finanziaria del proprio business in modo agile e dinamico.

Il problema principale che il prodotto risolve è la rigidità e la complessità dei tradizionali piani finanziari basati su fogli di calcolo. Tali strumenti sono spesso statici, difficili da aggiornare, e non permettono di testare rapidamente diverse ipotesi (analisi "what-if"). L'Agile Business Vision Builder trasforma la pianificazione finanziaria in un processo intuitivo, visivo e flessibile, permettendo agli utenti di prendere decisioni strategiche basate su dati solidi e proiezioni dinamiche.

La visione è quella di diventare lo strumento di riferimento per la pianificazione e la validazione di idee di business, accessibile sia a chi ha competenze finanziarie avanzate sia a chi si avvicina per la prima volta alla creazione di un business plan.

---

#### **2. Pubblico di Riferimento (Target Audience)**

Il prodotto si rivolge principalmente a:

*   **Fondatori di Startup e Imprenditori:** Per validare la sostenibilità finanziaria di una nuova idea di business, creare proiezioni da presentare a investitori e pianificare la crescita.
*   **Manager e Analisti Finanziari:** Per creare budget, previsioni e analizzare la performance finanziaria di progetti o dipartimenti in modo più efficiente.
*   **Product Manager:** Per valutare la fattibilità economica di nuovi prodotti o funzionalità.
*   **Consulenti di Business:** Per assistere i propri clienti nella creazione di piani aziendali solidi e flessibili.

---

#### **3. Obiettivi Strategici e Metriche di Successo (KPI)**

| Obiettivo Strategico | Metriche Chiave di Successo (KPI) |
| :--- | :--- |
| **Semplificare la pianificazione finanziaria** | - **Task Completion Rate:** % di utenti che completano la creazione di un piano finanziario (dall'inizio all'export).<br>- **Time to Complete:** Tempo medio per creare la prima versione di un piano. |
| **Aumentare la fiducia decisionale degli utenti** | - **Feature Adoption Rate:** % di utenti che utilizzano l'Analisi di Sensibilità.<br>- **User Satisfaction (NPS/CSAT):** Punteggio di soddisfazione raccolto tramite survey in-app. |
| **Diventare uno strumento di riferimento nel settore** | - **Daily/Monthly Active Users (DAU/MAU):** Numero di utenti attivi.<br>- **Retention Rate:** % di utenti che ritornano sulla piattaforma dopo la prima settimana/mese. |
| **Garantire accuratezza e affidabilità** | - **Error Rate:** Numero di errori di calcolo segnalati dagli utenti (obiettivo < 0.1%).<br>- **Performance:** Tempo di caricamento della pagina e di ricalcolo del piano (< 2 secondi). |

---

#### **4. Requisiti Funzionali**

##### **4.1 Dashboard Esecutivo (`ExecutiveDashboard.tsx`)**
Il dashboard è la vista principale che riassume la salute finanziaria del piano.
*   **FR-1.1:** Visualizzazione dei KPI principali: Ricavi Totali, Costi Totali, Utile Netto, Flusso di Cassa Operativo.
*   **FR-1.2:** Grafici interattivi per visualizzare l'andamento mensile/annuale di ricavi, costi e profittabilità.
*   **FR-1.3:** Riepilogo del punto di pareggio (Break-Even Point).
*   **FR-1.4:** I dati e i grafici si aggiornano in tempo reale al variare degli input nel piano.

##### **4.2 Modulo di Pianificazione (`PlanPage.tsx`)**
Questa è l'area di lavoro dove l'utente inserisce tutti i dati del piano. È strutturata in sezioni navigabili.
*   **FR-2.1: Assunzioni Generali (`GeneralAssumptions.tsx`)**
    *   Input per il periodo di proiezione (es. 36 mesi).
    *   Selezione della valuta.
    *   Input per l'aliquota fiscale media.
*   **FR-2.2: Modello di Acquisizione Clienti**
    *   **Nuovi Clienti (`NewClients.tsx`):** Input per canali di marketing (es. organico, a pagamento), con parametri come budget, CPC/CPA, e tassi di conversione.
    *   **Clienti Acquisiti Direttamente (`DirectlyAcquiredClients.tsx`):** Input per clienti ottenuti tramite vendite dirette o partnership.
    *   **Clienti di Ritorno (`RecoverableClients.tsx`):** Modello per il tasso di fidelizzazione e riacquisto.
*   **FR-2.3: Struttura dei Costi**
    *   **Costi Fissi (`FixedCosts.tsx`):** Inserimento di costi mensili ricorrenti (es. affitto, software, stipendi amministrativi). L'utente può aggiungere/rimuovere voci di costo.
    *   **Costi del Personale (`PersonnelCosts.tsx`):** Inserimento dettagliato del costo del personale, con possibilità di definire ruolo, stipendio lordo, e data di assunzione.
    *   **Costi Variabili (`VariableCosts.tsx`):** Inserimento di costi legati alle vendite o alla produzione (es. costo delle merci vendute, commissioni).
*   **FR-2.4: Investimenti (`Investments.tsx`)**
    *   Inserimento di investimenti una tantum (es. acquisto di attrezzature) o round di finanziamento.

##### **4.3 Report Finanziari (`ScenarioReport.tsx`)**
L'applicazione genera automaticamente i principali report finanziari.
*   **FR-3.1: Conto Economico (`IncomeStatement.tsx`):** Report mensile/annuale che mostra ricavi, costi e utile/perdita.
*   **FR-3.2: Rendiconto Finanziario (`CashFlowStatement.tsx`):** Report mensile/annuale che traccia le entrate e le uscite di cassa.

##### **4.4 Analisi di Sensibilità (`SensitivityAnalysisPage.tsx`)**
Una delle funzionalità chiave per testare la robustezza del piano.
*   **FR-4.1: Setup Analisi (`SensitivityAnalysisSetup.tsx`):** L'utente può selezionare una o più variabili chiave del proprio piano (es. tasso di conversione, costo per clic, prezzo di vendita).
*   **FR-4.2:** L'utente definisce un intervallo di variazione per le variabili selezionate (es. -20% a +20%).
*   **FR-4.3: Risultati (`SensitivityAnalysisResults.tsx`):** Il sistema mostra l'impatto delle variazioni su risultati chiave (es. Utile Netto, Flusso di Cassa) tramite tabelle e grafici a tornado.

##### **4.5 Esportazione del Piano (`export.ts`, `ExportDialog.tsx`)**
*   **FR-5.1:** L'utente può esportare l'intero piano finanziario o singoli report.
*   **FR-5.2:** Formati di esportazione supportati: PDF (per una presentazione pulita) e CSV (per ulteriori analisi su altri software).

---

#### **5. Requisiti Non Funzionali**

*   **Performance:** I calcoli finanziari (`financialCalculator.ts`, `cashFlowCalculator.ts`) devono essere eseguiti lato client e completati in meno di 500ms per garantire un'esperienza fluida.
*   **Usabilità:** L'interfaccia deve essere pulita, intuitiva e auto-esplicativa, minimizzando la necessità di documentazione. Il design deve essere responsive e accessibile da dispositivi mobili (`use-mobile.tsx`).
*   **Sicurezza:** Tutti i dati del piano sono gestiti localmente nel browser dell'utente per garantire la massima privacy. Non vengono inviati dati sensibili a server esterni.
*   **Manutenibilità:** Il codice deve seguire le best practice di React e TypeScript, con una chiara separazione tra logica di business (`calculator.ts`), stato (`usePlanData.ts`) e componenti UI.
*   **Compatibilità:** L'applicazione deve essere pienamente funzionante sulle ultime due versioni dei principali browser (Chrome, Firefox, Safari, Edge).

---

#### **6. Flusso Utente (User Journey)**

1.  **Landing Page (`Index.tsx`):** L'utente arriva sulla pagina principale e avvia la creazione di un nuovo piano.
2.  **Creazione Piano (`PlanPage.tsx`):** L'utente viene guidato attraverso le varie sezioni (Assunzioni, Clienti, Costi). L'interfaccia a schede (`Tabs.tsx`) o a fisarmonica (`Accordion.tsx`) facilita la navigazione.
3.  **Analisi in Tempo Reale (`ExecutiveDashboard.tsx`):** Mentre inserisce i dati, l'utente visualizza l'impatto in tempo reale sul dashboard.
4.  **Test Ipotesi (`SensitivityAnalysisPage.tsx`):** Una volta completato il piano, l'utente accede alla sezione di Analisi di Sensibilità per testare le sue assunzioni.
5.  **Esportazione (`ExportDialog.tsx`):** L'utente esporta il report finale in PDF per condividerlo o in CSV per un'analisi più approfondita.

---

#### **7. Fuori Scopo (Out of Scope per la v1.0)**

Le seguenti funzionalità non saranno incluse nella versione iniziale per concentrare gli sforzi sul core del prodotto:

*   Collaborazione multi-utente in tempo reale.
*   Autenticazione e salvataggio dei piani su un account cloud.
*   Integrazione con software di contabilità di terze parti (es. QuickBooks, Xero).
*   Gestione di più scenari o versioni dello stesso piano.
*   Localizzazione in più lingue.
