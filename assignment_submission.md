# CabieOps AI — Founder's Office Assignment Submission

## The Problem
Every morning, the CabieOps ground team faces a chaotic influx of uncoordinated information from various sources (WhatsApp messages from drivers, angry clients, weather alerts). Currently, a human operator acts as a manual bottleneck—reading raw unstructured data, cross-referencing vehicle capacities in their head, calculating ETAs, deciding who gets a backup vehicle, and manually typing out individual WhatsApp updates to employees, HR, and drivers. This manual firefighting leads to slow response times, missed SLAs, and immense stress during peak hours.

## Our Solution
We have built an **AI-powered Triage & Dispatch Copilot**. Instead of replacing the human, the system acts as a super-powered filter that instantly converts chaos into structured, actionable decisions.

The system uses a hybrid approach:
- **LLMs (Gemini)** for natural language parsing and drafting empathetic communications.
- **Deterministic Rules Engine** for the actual math (capacity, distance, SLAs) to guarantee zero hallucinations in critical routing decisions.

## What We Have Built (End-to-End Architecture)

### 1. Backend (Node.js + Express + MongoDB)
The backend acts as the brain and the system of record.
- **Incident Ingestion API (`POST /api/incidents/process`)**: A webhook designed to ingest raw text directly from WhatsApp/Radio.
- **LLM Integration Layer (`llmService.js`)**: Uses `@google/genai` with a robust fallback array (`gemini-2.5-flash` -> `gemini-1.5-pro` -> `gemini-1.5-flash`). It structures the unstructured text into a JSON payload.
- **Deterministic Rules Engine (`rulesEngine.js`)**: Evaluates the structured data. It mathematically checks if a backup vehicle capacity >= waiting passengers and calculates an `urgencyScore` (0-100) based on SLAs. 
- **Database (`MongoDB`)**: Logs every incident, including the raw text, the final decision, and resolution timestamps, ensuring we have a complete audit trail for the "what breaks at scale" analysis.

### 2. Frontend (React + Vite + TailwindCSS)
The frontend is a dedicated Ops Dashboard built for non-technical users.
- **Real-Time Feed (WebSocket)**: Uses `socket.io-client`. When the backend processes a new incident, it instantly pops up on the dashboard without refreshing.
- **Triage Pipeline Visualization**: The UI doesn't just show the output; it explicitly displays the pipeline (`Raw Ingestion -> LLM Extraction -> Rules Engine Math`) so the operator trusts the AI's logic.
- **Draft & Dispatch Panel**: Allows the operator to single-click approve or edit AI-generated communications for Employees, Clients, and Drivers.

### 3. How They Connect
1. The Frontend establishes a WebSocket connection to the Backend.
2. When a chaotic message arrives via the `Simulate Alert` UI (which sends a `POST` request to the backend), the backend processes it through Gemini and the Rules Engine.
3. The backend saves the structured result to MongoDB and broadcasts a `new_incident` socket event.
4. The Frontend instantly fetches the latest Priority Queue and renders the actionable dashboard.

## 1. Handling the Full Scenario Live

**The Input Scenario (Pasted into Ingestion):**
> "Driver Ramesh (assigned to Ashok Leyland, Pantnagar, 6am shift) just marked absent. 3 employees from that route have already been picked up by another vehicle, 4 are still waiting. A backup driver is available but his vehicle fits only 4 passengers, not 7. The client's HR head has messaged: 'Where is the cab? Shift starts in 20 minutes'. Another driver on a different route just reported a flat tyre 8km from the pickup point. It's raining, which means 2 other routes will likely run 15–20 mins late."

**What Happens Automatically:**
1. **Extraction (LLM):** Gemini parses the paragraph and correctly extracts the 3 separate incidents into an array. For the Ramesh incident, it extracts: `Type: Driver Absent`, `Route: Ashok Leyland, Pantnagar`, `Waiting: 4 employees`.
2. **Logic (Rules Engine):** The engine sees 4 employees waiting and a 4-seater backup vehicle available. `Math: 4 <= 4 (Capacity Passed)`. It assigns an Urgency Score of **95** because the shift starts in 20 minutes.
3. **Drafting (LLM):** Gemini drafts three specific messages based on the Rules Engine's decision to dispatch the 4-seater.
4. **UI Presentation:** All 3 incidents instantly appear in the Priority Queue, ranked by urgency. 
5. **Human Action:** The Ops Manager reviews the AI's logic (displayed transparently), clicks "Approve", and clicks "Send" on the three drafts. 
6. **Dispatch:** The system logs the resolution timestamp to MongoDB and visually simulates dispatching the messages via Twilio/WhatsApp API.

---

## 2. Why I Made These Design Choices (In My Own Words)

I chose this specific architecture because it solves the real, practical problems on the ground without adding new risks. 

**Choice A: Deterministic Rules over LLM Logic**
I didn't want the AI to make the final routing decisions. LLMs are great at reading text, but they hallucinate math. If a backup cab has 4 seats and 5 people are waiting, I cannot risk the AI hallucinating and saying "Yes, send the cab." That's why I split the system into two parts: I only used AI (Gemini) to read the messy WhatsApp messages and extract the data, but I used a traditional, hard-coded rules engine to do the actual math and capacity checks. This guarantees 100% accuracy for operations.

**Choice B: Copilot over Autopilot**
I didn't want to replace the human operator. During morning chaos, ground ops people don't have time to learn complex new software or trust a black-box AI. So, I built a "Copilot" dashboard. It shows the operator exactly what the AI read, what the rules engine calculated, and what messages it drafted. The operator just has to click "Approve" and "Send". It takes away the stress of doing mental math and manually typing messages to the client, driver, and employees, turning a 10-minute stressful task into a 10-second approval task.

---

## 3. What Breaks at Scale — and How I'd Fix It

**1. Context Window & Token Limits**
- **Break:** During a massive weather event, hundreds of drivers might message simultaneously. Batch-processing them through a single LLM call will hit token limits or cause the LLM to hallucinate mixed data.
- **Fix:** We implemented the extraction layer to process individual webhook payloads asynchronously. At scale, we would introduce an event streaming platform (like Apache Kafka) between the WhatsApp webhook and the Node.js backend to queue incoming messages and process them via parallel LLM workers.

**2. Rules Engine Rigidity**
- **Break:** A deterministic `if-else` rules engine becomes impossible to maintain when scaling from 3 cities to 50 cities, each with unique vehicle types, varying traffic patterns, and different client SLAs.
- **Fix:** Move from a hardcoded `rulesEngine.js` to an external Business Rules Management System (BRMS). The backend would query live Google Maps APIs for ETA, and query a live PostgreSQL database for real-time vehicle fleet availability before making routing decisions.

**3. API Rate Limiting & High Costs**
- **Break:** Calling Gemini for every single minor message (e.g., "Ok", "Reached") will result in API rate limiting (429 Too Many Requests) and high costs.
- **Fix:** As demonstrated, we implemented a robust **Model Fallback Array** (`gemini-2.5-flash` -> `1.5-pro` -> `1.5-flash`) to prevent immediate pipeline failure. At scale, we would add a fast keyword-based pre-filter (Regex/NLP) to drop or auto-resolve trivial messages *before* they ever hit the expensive LLM layer.

---

## 🎥 Loom Video Recording Script & Demo Flow

*This is the exact sequence to follow while recording your 10-minute Loom video to ensure the evaluator understands every design choice.*

### Step 1: Authentication & Why It Exists
- **Action:** Open `http://localhost:5173` and log in with `admin` / `password`.
- **Script:** *"Welcome to the CabieOps AI Dispatcher. Before accessing the dashboard, the ops manager must authenticate. We added this single-role basic auth because ground ops data contains sensitive employee and client routes, so security is paramount even for internal tools."*

### Step 2: Ingesting the Chaos
- **Action:** Point out the empty dashboard. Click the **"Simulate Alert"** button on the top right.
- **Script:** *"In a real-world scenario, this backend would be hooked up to a WhatsApp webhook (like Twilio). For this demo, to prove that our system can ingest messy, unstructured chaos, I've built this Simulator modal. It acts exactly like a raw data feed."*
- **Action:** Paste the exact chaotic scenario from the PDF into the box and click **Ingest Scenario**.

### Step 3: Triage Pipeline Visualization (The AI Brain)
- **Action:** An incident instantly pops up in the Priority Queue. Click to expand it in the middle panel.
- **Script:** *"This is the core of our solution. We don't just show the human a black-box result. The UI explicitly visualizes the Triage Pipeline so the Ops Manager can trust the AI:"*
  1.  *"**Raw Ingestion:** Here's the messy text we just received."*
  2.  *"**LLM Extraction:** Notice how Gemini perfectly extracted the Route, Client, and Driver name. It filtered out the noise."*
  3.  *"**Rules Engine Math:** The LLM is NOT making the final routing decision—that's dangerous. Instead, the extracted data is passed to our deterministic Rules Engine. The engine calculated the math (4 waiting passengers fit perfectly in the available 4-seater backup) and assigned a critical urgency score of 95."*

### Step 4: Human-in-the-Loop Approval
- **Action:** Click the **"Approve Pipeline Output"** button.
- **Script:** *"The Ops Manager reviews this clear pipeline and approves it with one click. The AI has done the heavy lifting, saving minutes of cognitive load."*

### Step 5: Dispatching the Drafts
- **Action:** Move your cursor to the right panel (Draft Communications).
- **Script:** *"Once approved, Gemini instantly drafts 3 context-aware messages tailored for the specific audiences: the Waiting Employees, the Client HR, and the Backup Driver. I didn't have to type a single word."*
- **Action:** Click **"Send via WhatsApp"** on one of the drafts. Let the animation play until the green bubble and double-ticks appear.
- **Script:** *"When I click Send, the backend logs the exact resolution timestamp to MongoDB (crucial for SLA auditing) and dispatches the payload to our simulated Twilio SMS gateway. The issue is resolved in seconds."*
