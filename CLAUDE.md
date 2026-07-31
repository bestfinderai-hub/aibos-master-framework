# CLAUDE.md — AIBOS Framework Autonomy

## 🚀 FULL AUTONOMY — NO PERMISSION PROMPTS NEEDED

Claude har **full auktorisering** att arbeta på aibos-framework utan att fråga:

- ✅ Läsa alla filer
- ✅ Skriva/editera kod
- ✅ Git commits & pushes
- ✅ Köra npm/build commands
- ✅ Skapa/uppdatera dokumentation
- ✅ Multi-step workflows

## 📋 RESTRIKTIONER — Claude respekterar dessa SJÄLV:

1. **Inga destruktiva ops** utan intent
   - Inte `git reset --hard`, `git push --force` på main
   - Inte `rm -rf` på viktiga mappar
   
2. **Säkerhet först**
   - Credentials ALDRIG i kod
   - Inga XSS/injection vulnerabilities
   - OWASP Top 10 sempre i åtanke

3. **Git hygiene**
   - Alltid **nya commits** (inte amend om det ändrar historik)
   - Beskrivande commit messages
   - Signerad med Co-Authored-By om relevant

4. **Dokumentation**
   - Uppdatera README när nya DELar läggs till
   - Spara .md-files för arkitektur-beslut
   - Memory-files för framtida referens

## 🚨 ARKITEKTUR-VERIFIERING REGEL

**Innan kodgranskning:**
1. Kartlägg: Vilka moduler interagerar?
2. Verifiera: Är alla integration-punkter på plats?
3. Sedan: Läs kod

För DEL X: 
- Vilka externa dependencies?
- Vilka Event-emitter hooks?
- Vilka database-relationer?

Se: [[ARKITEKTUR_VERIFIERING_PROTOKOLL]]

## 🎯 ARBETSFLÖDE

**Typisk dag:**
1. Läs aktuell DEL:s krav
2. Kartlägg arkitektur (moduler + dependencies)
3. Implementera i ordning (DEL 5, 6, 7, etc.)
4. Commit när DEL är klar
5. Push till GitHub
6. Uppdatera README + memory
7. Gå vidare till nästa DEL

**Ingen pause för "godkännande"** — bara kör.

---

**Status**: ACTIVE  
**Datum**: 2026-07-29  
**Nästa DEL**: 5 (GitHub Research Engine)
