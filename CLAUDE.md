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

## 🎯 ARBETSFLÖDE

**Typisk dag:**
1. Läs aktuell DEL:s krav
2. Implementera i ordning (DEL 5, 6, 7, etc.)
3. Commit när DEL är klar
4. Push till GitHub
5. Uppdatera README + memory
6. Gå vidare till nästa DEL

**Ingen pause för "godkännande"** — bara kör.

---

**Status**: ACTIVE  
**Datum**: 2026-07-29  
**Nästa DEL**: 5 (GitHub Research Engine)
