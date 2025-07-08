### **Documento di Onboarding Tecnico: Agile Business Vision Builder**

**Versione:** 1.0
**Data:** 8 Luglio 2025
**Autore:** Gemini

---

#### **1. Introduzione**

Questo documento fornisce una panoramica tecnica completa del progetto **Agile Business Vision Builder**. È destinato agli sviluppatori che si uniscono al team e ha lo scopo di accelerare il processo di onboarding, descrivendo l'architettura, lo stack tecnologico, la struttura del codice e le convenzioni adottate.

L'obiettivo è fornire una base di conoscenza chiara e condivisa per facilitare future implementazioni, manutenzioni e miglioramenti.

---

#### **2. Panoramica del Prodotto e Architettura**

L'Agile Business Vision Builder è una **Single Page Application (SPA)** costruita con **React** e **TypeScript**. L'applicazione è interamente **client-side**: tutta la logica di calcolo finanziario e la gestione dei dati avvengono nel browser dell'utente. Questo approccio garantisce la massima privacy (nessun dato viene inviato a un server) e un'esperienza utente reattiva.

**Architettura Logica:**

1.  **UI Layer (Componenti React):** Responsabile della presentazione dei dati e della cattura dell'input dell'utente.
2.  **State Management Layer (Hook `usePlanData`):** Un custom hook centrale che agisce come "source of truth" per l'intero piano finanziario. Gestisce lo stato e fornisce i metodi per aggiornarlo.
3.  **Business Logic Layer (Calcolatori):** Funzioni TypeScript pure e isolate che contengono tutta la logica di calcolo finanziario. Ricevono lo stato come input e restituiscono i risultati calcolati.

Questa netta separazione delle responsabilità è il pilastro dell'architettura e deve essere mantenuta.

---

#### **3. Stack Tecnologico**

*   **Framework Frontend:** [React 18](https://react.dev/)
*   **Linguaggio:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool & Dev Server:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Componenti UI:** [shadcn/ui](https://ui.shadcn.com/) - Una collezione di componenti riutilizzabili costruiti su Radix UI e Tailwind CSS.
*   **Linting:** [ESLint](https://eslint.org/)
*   **Package Manager:** [Bun](https://bun.sh/) (ma compatibile con `npm` o `yarn`)

---

#### **4. Struttura del Progetto**

```
/
├─── public/              # Asset statici (favicon, immagini)
├─── src/
│    ├─── components/      # Componenti React riutilizzabili
│    │    ├─── FinancialPlan/ # Componenti specifici per la logica del business plan
│    │    │    ├─── Plan/
│    │    │    └─── SensitivityAnalysis/
│    │    └─── ui/          # Componenti UI generici (da shadcn/ui)
│    │
│    ├─── hooks/           # Custom Hooks React
│    │    └─── usePlanData.ts # HOOK CENTRALE per la gestione dello stato
│    │
│    ├─── lib/             # Funzioni di utilità e logica non-React
│    │    ├─── export.ts    # Logica per l'esportazione in PDF/CSV
│    │    └─── utils.ts     # Funzioni helper (es. cn per classi CSS)
│    │
│    ├─── pages/           # Componenti che rappresentano le pagine dell'app
│    │
│    ├─── App.tsx          # Componente root con il setup del router
│    ├─── main.tsx         # Entry point dell'applicazione
│    └─── index.css        # Stili globali e direttive Tailwind
│
├─── package.json         # Dipendenze e script del progetto
├─── tsconfig.json        # Configurazione di TypeScript
└─── vite.config.ts       # Configurazione di Vite
```

**Descrizione delle Cartelle Chiave:**

*   `src/components/ui`: Contiene componenti UI di base (Button, Card, Input, etc.). **NON modificare direttamente questi file** a meno che non si debba estendere un componente base per l'intero progetto. Sono stati generati da `shadcn/ui`.
*   `src/components/FinancialPlan`: È il cuore dell'interfaccia utente. Ogni file `.tsx` qui rappresenta una sezione del piano finanziario (es. `FixedCosts.tsx`, `PersonnelCosts.tsx`). Questi componenti leggono i dati dallo stato e usano le funzioni di aggiornamento fornite da `usePlanData`.
*   `src/hooks/usePlanData.ts`: **Questo è il file più importante per la gestione dello stato.** Utilizza `React.useState` (o `useReducer`) per mantenere l'intero oggetto del piano finanziario. Espone sia i dati del piano sia le funzioni per modificarli (es. `updateFixedCosts`, `addPersonnel`). Qualsiasi componente che necessita di leggere o scrivere dati del piano deve usare questo hook.
*   `src/components/FinancialPlan/*Calculator.ts`: Questi file contengono la **logica di business pura**. Sono funzioni TypeScript che non hanno dipendenze da React. Prendono parti dello stato del piano come argomenti e restituiscono i risultati calcolati (es. `calculateCashFlow`, `calculateIncomeStatement`). Questa separazione rende la logica testabile e riutilizzabile.
*   `src/pages`: Contiene i componenti di primo livello che assemblano i vari componenti `FinancialPlan` per costruire una pagina completa (es. `PlanPage.tsx`).

---

#### **5. Flusso dei Dati e Logica di Business**

Il flusso dei dati è unidirezionale e segue il pattern standard di React:

1.  **Inizializzazione:** Il componente `PlanPage` (o simile) invoca l'hook `usePlanData()`, che inizializza lo stato del piano (`initialPlanState.ts`).
2.  **Lettura:** I componenti figli (es. `FixedCosts`) ricevono i dati di cui hanno bisogno come props o direttamente dall'hook.
3.  **Calcolo:** I componenti "display" (es. `ExecutiveDashboard`) passano i dati di stato correnti alle funzioni calcolatrici (es. `dashboardCalculator`) e visualizzano i risultati.
4.  **Aggiornamento:** L'utente modifica un input (es. aggiunge un nuovo costo fisso).
5.  **Azione:** L'evento `onChange` o `onClick` nel componente `FixedCosts` chiama una funzione di aggiornamento esposta da `usePlanData` (es. `addFixedCost(newCost)`).
6.  **Update dello Stato:** La funzione `addFixedCost` aggiorna l'oggetto di stato all'interno dell'hook `usePlanData`.
7.  **Re-render:** React rileva il cambiamento di stato e ri-renderizza tutti i componenti che dipendono da quel dato. Il ciclo ricomincia dal punto 2.

Questo ciclo garantisce che l'interfaccia sia sempre una rappresentazione coerente dello stato attuale del piano.

---

#### **6. Ambiente di Sviluppo**

**Prerequisiti:**
*   Node.js (versione LTS)
*   Bun (consigliato, ma `npm` funziona)

**Setup:**

1.  Clonare il repository.
2.  Installare le dipendenze:
    ```bash
    bun install
    ```
    o
    ```bash
    npm install
    ```
3.  Avviare il server di sviluppo:
    ```bash
    bun run dev
    ```
    L'applicazione sarà disponibile su `http://localhost:5173`.

**Script Utili (`package.json`):**

*   `dev`: Avvia il server di sviluppo con hot-reloading.
*   `build`: Compila l'applicazione per la produzione nella cartella `dist/`.
*   `lint`: Esegue ESLint per controllare la qualità e lo stile del codice. **Eseguire sempre prima di un commit.**

---

#### **7. Convenzioni e Best Practice**

*   **TypeScript Ovunque:** Utilizzare la tipizzazione forte per tutti i componenti, le funzioni e gli oggetti di stato. I tipi principali relativi al piano sono in `src/components/FinancialPlan/types.ts`.
*   **Immutabilità:** Lo stato deve essere sempre trattato come immutabile. Quando si aggiorna lo stato in `usePlanData`, creare sempre nuovi oggetti/array invece di modificare quelli esistenti (es. usando l'operatore spread `...`).
*   **Componenti Funzionali e Hooks:** Utilizzare esclusivamente componenti funzionali e hooks.
*   **Separazione della Logica:** Mantenere la logica di business rigorosamente separata dai componenti UI nei file `*Calculator.ts`.
*   **Stile del Codice:** Seguire le regole definite in `.eslintrc.config.js`. Formattare il codice usando Prettier (se integrato) o le impostazioni dell'IDE.
*   **Naming:**
    *   Componenti: `PascalCase` (es. `FixedCosts.tsx`)
    *   Hooks: `useCamelCase` (es. `usePlanData.ts`)
    *   Funzioni di utilità/calcolo: `camelCase` (es. `calculateCashFlow`)

---

#### **8. Prossimi Passi per i Nuovi Sviluppatori**

1.  **Esplorare l'UI:** Avviare l'app e interagire con tutte le funzionalità per capire il prodotto dal punto di vista dell'utente.
2.  **Analizzare `usePlanData.ts`:** Comprendere a fondo la struttura dello stato e le funzioni di aggiornamento disponibili.
3.  **Tracciare un Flusso:** Scegliere un'azione semplice (es. cambiare il nome di un costo fisso) e seguire il flusso dei dati dal componente UI, attraverso l'hook, fino al re-render.
4.  **Leggere un Calcolatore:** Analizzare un file come `financialCalculator.ts` per capire come vengono eseguiti i calcoli in modo isolato.
5.  **Task Iniziale:** Un buon primo task potrebbe essere aggiungere un nuovo campo semplice a una sezione del piano, implementando il ciclo completo di lettura, aggiornamento e visualizzazione.

Questo documento dovrebbe fornire una solida base di partenza. Fare riferimento al codice esistente come guida principale per le convenzioni e i pattern da seguire.