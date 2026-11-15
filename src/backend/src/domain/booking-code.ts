/**
 * Generación del código público de reserva (BR-03, ADR-002): `CY-` + 8 caracteres
 * de un alfabeto sin ambigüedades, con un generador criptográfico (CSPRNG).
 */
import { randomInt } from "node:crypto";
import { BOOKING_CODE_ALPHABET, BOOKING_CODE_LENGTH, BOOKING_CODE_PREFIX } from "@canchaya/shared";

export type RandomIndex = (maxExclusive: number) => number;

export function generateBookingCode(random: RandomIndex = randomInt): string {
  let code = BOOKING_CODE_PREFIX;
  for (let i = 0; i < BOOKING_CODE_LENGTH; i++) {
    code += BOOKING_CODE_ALPHABET[random(BOOKING_CODE_ALPHABET.length)];
  }
  return code;
}
