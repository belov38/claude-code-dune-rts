1) Backend: add public lobby + public room listing
- In apps/backend/src/index.ts
    - Enable realtime listing on the game room definition: define(...).enableRealtimeListing()
    - Define the built-in LobbyRoom (gameServer.define("lobby", LobbyRoom)).
- Result: frontend lobby can subscribe to room add/remove updates (no polling required).
2) Backend: define a dedicated 1v1 room type + minimal state
- Create/adjust room name to be explicit: e.g. game_1v1 (keep game_room if you prefer, but clarity helps).
- Set maxClients = 2.
- Extend GameState minimally for onboarding phase:
    - players: MapSchema<Player> already exists
    - add roomStatus ("waiting" | "running") and tick (already present)
    - add map metadata (see step 4)
3) Backend: enforce “one game per clientId” and reject duplicate joins
- Require join option { clientId: string, name?: string }
- On onAuth or onJoin:
    - Reject if clientId missing/invalid
    - Reject if clientId is already present in state.players (even if name same)
- Also enforce “only one game at a time” globally:
    - Maintain a process-level Map<clientId, roomId> registry (in-memory for MVP).
    - On join, if registry has clientId for a different room, reject.
    - On successful leave and reconnection finally fails, remove from registry.
4) Backend: implement indefinite reconnection + continuous ticks
- Add a server tick loop in the room:
    - Use Colyseus setSimulationInterval((dt) => { tick++ }) at a fixed timestep (e.g. 250ms/100ms) so the room progresses even if nobody is connected (as long as reserved seats exist).
- Implement onLeave:
    - If user disconnects unexpectedly, call allowReconnection(client, "manual")
    - Mark player as connected=false in state (add this field to Player schema).
    - If they successfully reconnect, set connected=true.
    - If reconnection is rejected (you likely won’t reject per “forever”), then cleanup player + registry entry.
- Important: with "manual" reconnection, the room will not auto-dispose because reservedSeats exists. That matches “reconnect forever”. If you ever want to force cleanup, you’ll need a policy (e.g., admin end-match) that calls reconnection.reject().
5) Backend: dispose empty rooms immediately (without breaking reconnection)
- Keep autoDispose = true (default).
- Do NOT set long seat reservation times globally; rely on Colyseus reserved seat logic.
- Room disposes when:
    - clients.length === 0 AND reservedSeats is empty.
- For “reconnect forever”, reserved seat stays, so room stays. That’s intended.
6) Frontend: add Lobby scene (name input + list rooms + create/join)
- Add a new LobbyScene before GameScene.
- UI (Phaser text + DOM overlay, or pure Phaser UI):
    - Name input (free text)
    - “Create 1v1 game” button
    - Public room list (from LobbyRoom), each with join button
- Join options sent:
    - name (as typed)
    - clientId (persistent UUID in localStorage)
7) Frontend: reconnect-on-refresh forever
- Persist these in localStorage:
    - clientId
    - reconnectionToken (from room.reconnectionToken) and roomId
- Startup flow:
    1. Create Client(COLYSEUS_URL)
    2. If there is a saved reconnection token, attempt client.reconnect(token)
    3. If reconnect succeeds, go straight to Game scene
    4. If it fails, clear token and show Lobby
- On room.onLeave / onError, keep token for retry; optionally implement exponential backoff retry loop (forever).
8) Wire Lobby -> Game view (no gameplay)
- In GameScene, don’t auto joinOrCreate anymore.
- Instead receive roomId (or room instance) from LobbyScene.
- Display:
    - Player list (names + connected flag)
    - Current tick
    - Map preview (simple grid render; no movement)
9) Validation (lightweight)
- Run pnpm typecheck for workspace.
- Add 1–2 Vitest tests in backend for:
    - duplicate clientId join rejection
    - room maxClients=2 enforcement (or join logic)
- Quick manual: open 2 browser tabs, create/join, refresh, confirm reconnection, confirm room listing updates.