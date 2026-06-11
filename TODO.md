# TODO

- [ ] Update `src/lib/languages.ts` to include the full Google Translate language list, including `Dutch (Belgium)` as `nl-BE` (and any required regional variants), while keeping the existing `None — Native` sentinel.
- [ ] Ensure dropdowns in both pre-flight (`src/app/session/[id]/page.tsx`) and in-call (`LanguagePill.tsx`) use the updated list via `PICKER_LANGUAGES`.
- [ ] Run frontend (`pnpm run dev`) and verify the Language dropdown includes `nl-BE` and other expected entries.
- [ ] Smoke test routing: pick a listener language like `nl-BE` and confirm captions subscribe to `lk.translation` with `target_lang === nl-BE`.

