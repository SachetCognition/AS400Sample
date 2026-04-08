# AS400Sample

AS400 Synon-generated RPG sample program for displaying college data.

## Files

- **MOB1CPP.pf** — Physical File DDS defining the `CollegeDL` database table (Account ID, CName, CCity, CState, CPinCode)
- **MODYDFR.dspf** — Display File DDS with subfile layout for browsing college records
- **MODYDFR.pnlgrp** — UIM Help Panel Group source with field-level and context-sensitive help
- **MODYDFR.rpgle** — Main RPG ILE program with subfile load/display/process logic

## Program Overview

The program (`MODYDFR`) displays records from the `CollegeDL` database file as a subfile (paginated list). Users can:

- **Position** the list by entering an Account ID
- **Page** through records using Roll Up / F8
- **Select** a record with option `5` to zoom into detail (calls `MODXD1R`)
- **Exit** with F3
- **Reset** with F5
- **Prompt** with F4

## Build Commands

```
CRTPF      FILE(MOB1CPP) SRCMBR(MOB1CPP)
CRTDSPF    FILE(MODYDFR) SRCMBR(MODYDFR) RSTDSP(*YES)
CRTPNLGRP  PNLGRP(MODYDFR) SRCMBR(MODYDFR)
CRTBNDRPG  PGM(MODYDFR) SRCMBR(MODYDFR) DFTACTGRP(*NO) BNDDIR(YBNDDIR) DBGVIEW(*SOURCE)
```
