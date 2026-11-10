백업은 `/Volumes/eyedisk/develop/cinewright/evidence/global-update-2026-11-05-224452-79c01a37/backup/files`에 있다. 기존 일반 파일 64개, 20,573,970바이트를 독립 복사본으로 보관했다. [백업 명세](backup/receipt.json)와 [설치 전 명세](installed-before.json)에 원래 해시와 파일 모드가 있다.

복구는 실행하지 않았다. [rollback.py](rollback.py)는 이번 설치의 45개 대상만 다룬다. 먼저 현재 파일 45개의 해시를 설치 직후 해시와 대조한다. 파일이나 경로가 바뀌면 복구를 중단한다. 교체한 4개 파일의 백업 해시도 확인한다.

검사만 실행하려면 다음 명령을 사용한다. 이 명령도 이번 작업에서는 실행하지 않았다.

```sh
python3 /Volumes/eyedisk/develop/cinewright/evidence/global-update-2026-11-05-224452-79c01a37/rollback.py
```

실제로 되돌리려면 다음 명령을 사용한다.

```sh
python3 /Volumes/eyedisk/develop/cinewright/evidence/global-update-2026-11-05-224452-79c01a37/rollback.py --apply
```

`--apply`는 기존 문서 4개를 임시 형제 파일과 원자적 교체로 복원한다. 이어서 이번에 추가한 파일 41개만 정확한 경로로 삭제한다. 각 대상의 현재 해시를 동작 직전에 다시 검사한다. 디렉터리 전체를 삭제하지 않는다. 기존의 다른 파일 60개, `node_modules`, 검증 산출물 `.direction/test-runs`는 보존한다. 복구 후 빈 디렉터리도 보존한다. 실행하면 별도 `rollback-executed-*.json`을 이 증거 디렉터리에 기록한다.

현재 설치 이후 편집한 파일이 있으면 자동 복구가 거부된다. 그 편집을 보존한 상태에서 필요한 파일만 별도로 조정해야 한다.
