To run backend:

go to the directory /backend and type in the cmd


python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000


Connect postgresql db:
downaload postgresql17, then run 

 Get-Service | Where-Object {$_.Name -like "*postgres*" -or $_.DisplayName -like "*postgres*"}

 in the powershell, if nothing is returned, then run

 .\pg_ctl.exe -D "C:\Program Files\PostgreSQL\17\data" start

