# Security Policy

## Reporting

If you find a security problem, please don't open a public issue for anything
sensitive. Instead, open a private
[security advisory](https://github.com/JHC56/token-kkakgi/security/advisories/new).
For low-risk stuff a normal issue is fine.

I'll acknowledge it as soon as I can and keep you in the loop on the fix.

## Why the surface is small

Worth knowing how the extension is built, because it rules out a lot of common
concerns:

- It runs entirely in your browser. There are no network requests and nothing
  you type is sent anywhere.
- It only activates on chatgpt.com, chat.openai.com, claude.ai, and claude.com.
- The tokenizer (js-tiktoken) is bundled in the extension — no remote code is
  ever fetched or executed.

So the main things worth scrutinizing are the content-script permissions and the
bundled tokenizer file. If something there looks off, I'd like to hear about it.
