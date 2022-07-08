import { parse } from "https://deno.land/x/cliffy@v0.24.2/keycode/mod.ts";

export default parse("\x1b[A\x1b[B\x1b[C\x1b[D\x1b[E\x1b[F\x1b[H",);